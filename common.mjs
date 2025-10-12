// Common utility functions for AWS services and other project-wide functionality
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import { createGunzip } from 'zlib';
import { promisify } from 'util';
import mysql from 'mysql2/promise';
import { config } from './config.mjs';

// AWS clients
const s3Client = new S3Client({ region: 'us-east-1' });
const sqsClient = new SQSClient({ region: 'us-east-1' });

// Module-level variables for SEC Fair Use Policy
let recentSecRequest = false;
let secRequestTimer = null;

// Database connection pools
const connectionPools = {};

// Regex patterns for ID extraction (module-level constants)
const REGEX_PATTERNS = {
    CIK: /^(\d{10})$/,
    SERIES_ID: /^S(\d{9})$/,
    CLASS_ID: /^C(\d{9})$/,
    ACCESSION_NUMBER: /^(\d{10})-(\d{2})-(\d{6})$/
};

// S3 Functions
export const s3ReadString = async (bucket, key) => {
    try {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key
        });
        const response = await s3Client.send(command);
        const chunks = [];
        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks).toString('utf-8');
    } catch (error) {
        throw new Error(`S3 Read String Error: ${error.message}`);
    }
};

export const s3ReadStream = async (bucket, key) => {
    try {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key
        });
        const response = await s3Client.send(command);
        return response.Body;
    } catch (error) {
        throw new Error(`S3 Read Stream Error: ${error.message}`);
    }
};

export const s3ReadLine = async (bucket, key) => {
    try {
        const content = await s3ReadString(bucket, key);
        return content.split('\n');
    } catch (error) {
        throw new Error(`S3 Read Line Error: ${error.message}`);
    }
};

export const s3WriteString = async (bucket, key, body) => {
    try {
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: 'text/plain'
        });
        await s3Client.send(command);
        return { success: true, message: 'String written to S3 successfully' };
    } catch (error) {
        throw new Error(`S3 Write String Error: ${error.message}`);
    }
};

export const s3WriteStream = async (bucket, key, writeStream) => {
    try {
        const chunks = [];
        for await (const chunk of writeStream) {
            chunks.push(chunk);
        }
        const body = Buffer.concat(chunks);
        
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: 'application/octet-stream'
        });
        await s3Client.send(command);
        return { success: true, message: 'Stream written to S3 successfully' };
    } catch (error) {
        throw new Error(`S3 Write Stream Error: ${error.message}`);
    }
};

// SQS Functions
export const sqsWriteMessage = async (queue, message) => {
    try {
        const command = new SendMessageCommand({
            QueueUrl: queue,
            MessageBody: JSON.stringify(message)
        });
        const response = await sqsClient.send(command);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        throw new Error(`SQS Write Message Error: ${error.message}`);
    }
};

// Web Fetch Function with SEC Fair Use Policy compliance
export const webFetchFair = async (url) => {
    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    // Check if this is a SEC.gov request
    const isSec = url.includes('.sec.gov');
    
    // SEC Fair Use Policy compliance
    if (isSec) {
        if (recentSecRequest) {
            throw new Error('Violation of SEC Fair Use Policy: Request too soon after previous SEC request');
        }
        
        recentSecRequest = true;
        secRequestTimer = setTimeout(() => {
            recentSecRequest = false;
            secRequestTimer = null;
        }, config.SEC_REQUEST_DELAY);
    }
    
    try {
        // Prepare headers
        const headers = {
            'Accept-Encoding': 'gzip'
        };
        
        if (isSec) {
            headers['User-Agent'] = config.SEC_USER_AGENT;
            headers['Host'] = config.SEC_HOST;
        }
        
        // Make the request
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        
        // Get response body
        let body = await response.arrayBuffer();
        let text = Buffer.from(body).toString('utf-8');
        
        // Check if response is gzip compressed
        const contentEncoding = response.headers.get('content-encoding');
        if (contentEncoding && contentEncoding.includes('gzip')) {
            try {
                const gunzip = createGunzip();
                const buffer = Buffer.from(body);
                const decompressed = await new Promise((resolve, reject) => {
                    const chunks = [];
                    gunzip.on('data', chunk => chunks.push(chunk));
                    gunzip.on('end', () => resolve(Buffer.concat(chunks)));
                    gunzip.on('error', reject);
                    gunzip.write(buffer);
                    gunzip.end();
                });
                text = decompressed.toString('utf-8');
            } catch (decompressError) {
                console.warn('Failed to decompress gzip response, returning raw content:', decompressError.message);
            }
        }
        
        return text;
    } catch (error) {
        throw new Error(`Web Fetch Error: ${error.message}`);
    }
};

// Database Query Function with Connection Pooling
export const runQuery = async (db, sql, params = []) => {
    try {
        // Get database configuration
        const dbConfig = config.DATABASES[db];
        if (!dbConfig) {
            throw new Error(`Database configuration not found for: ${db}`);
        }
        
        // Get or create connection pool for this database
        if (!connectionPools[db]) {
            connectionPools[db] = mysql.createPool({
                host: dbConfig.SERVER,
                user: dbConfig.USER,
                password: dbConfig.PWD,
                database: dbConfig.DB_NAME,
                connectionLimit: 10, // Maximum number of connections in the pool
                queueLimit: 0 // Maximum number of connection requests the pool will queue
            });
        }
        
        // Execute query using the pool
        const [rows] = await connectionPools[db].execute(sql, params);
        return rows;
    } catch (error) {
        console.log(sql, params);
        throw new Error(`Database Query Error: ${error.message}`);
    }
};

// Function to close all connection pools
export const closeAllPools = async () => {
    const closePromises = Object.values(connectionPools).map(pool => pool.end());
    await Promise.all(closePromises);
    Object.keys(connectionPools).forEach(key => delete connectionPools[key]);
};

//data helper functions
export const formatCIK = function(unpaddedCIK){ //accept int or string and return string with padded zero
    return formatIndexKey(unpaddedCIK, '');
}
export const formatSeriesId = function(intSeriesID){ //accept int or string and return string with padded zero
    return formatIndexKey(intSeriesID, 'S');
}
export const formatClassId = function(intClassID){ //accept int or string and return string with padded zero
    return formatIndexKey(intClassID, 'C');
}

/**
 * Formats an ID with optional prefix and left-pads with zeros to 10 characters
 * @param {number|string} id - The ID to format
 * @param {string} prefix - Optional prefix ('S' for Series, 'C' for Class, '' for default)
 * @returns {string} - Formatted ID string
 * @throws {Error} - If prefix is invalid
 */
export const formatIndexKey = function(id, prefix = '') {
    // Validate prefix
    if (prefix !== '' && prefix !== 'S' && prefix !== 'C') {
        throw new Error(`Invalid prefix '${prefix}'. Valid prefixes are '', 'S', or 'C'.`);
    }
    
    const idStr = id.toString();
    const totalLength = 10;
    const paddingLength = totalLength - prefix.length - idStr.length;
    
    if (paddingLength < 0) {
        throw new Error(`ID '${id}' with prefix '${prefix}' exceeds maximum length of ${totalLength} characters.`);
    }
    
    return prefix + '0'.repeat(paddingLength) + idStr;
};

/**
 * Formats an accession number from an integer
 * @param {number} accession_int - The accession number as integer
 * @returns {string} - Formatted accession number (e.g., "0000000000-24-000001")
 * @throws {Error} - If accession_int or components are <= 0
 */
export const formatAccessionNumber = function(accession_int) {
    if (accession_int <= 0) {
        throw new Error(`Accession number must be > 0, got: ${accession_int}`);
    }
    
    // Convert to 18-character string with leading zeros
    const accessionStr = accession_int.toString().padStart(18, '0');
    
    // Extract components
    const cik = accessionStr.substring(0, 10);
    const year = accessionStr.substring(10, 12);
    const filingCount = accessionStr.substring(12, 18);
    
    // Validate components
    const cikInt = parseInt(cik, 10);
    const filingCountInt = parseInt(filingCount, 10);
    
    if (cikInt <= 0) {
        throw new Error(`CIK component must be > 0, got: ${cikInt}`);
    }
    
    if (filingCountInt <= 0) {
        throw new Error(`Filing count component must be > 0, got: ${filingCountInt}`);
    }
    
    return `${cik}-${year}-${filingCount}`;
};

/**
 * Extracts integer ID from formatted string (CIK, Series ID, Class ID, or Accession Number)
 * @param {string} adshCikSeriesClassId - The formatted ID string
 * @returns {number} - The extracted integer ID
 * @throws {Error} - If input doesn't match any of the 4 formats
 */
export const extractIntId = function(adshCikSeriesClassId) {
    if (!adshCikSeriesClassId || typeof adshCikSeriesClassId !== 'string') {
        throw new Error(`Invalid input: expected string, got ${typeof adshCikSeriesClassId}`);
    }
    
    // Try CIK format (10 digits)
    let match = adshCikSeriesClassId.match(REGEX_PATTERNS.CIK);
    if (match) {
        return parseInt(match[1], 10);
    }
    
    // Try Series ID format (S + 9 digits)
    match = adshCikSeriesClassId.match(REGEX_PATTERNS.SERIES_ID);
    if (match) {
        return parseInt(match[1], 10);
    }
    
    // Try Class ID format (C + 9 digits)
    match = adshCikSeriesClassId.match(REGEX_PATTERNS.CLASS_ID);
    if (match) {
        return parseInt(match[1], 10);
    }
    
    // Try Accession Number format (10-2-6 with dashes)
    match = adshCikSeriesClassId.match(REGEX_PATTERNS.ACCESSION_NUMBER);
    if (match) {
        const cik = match[1];
        const year = match[2];
        const filingCount = match[3];
        const accessionStr = cik + year + filingCount;
        return parseInt(accessionStr, 10);
    }
    
    throw new Error(`Input '${adshCikSeriesClassId}' does not match any of the 4 valid formats: CIK (10 digits), Series ID (S + 9 digits), Class ID (C + 9 digits), or Accession Number (10-2-6 with dashes)`);
};

/**
 * Fetches submission metadata from database and returns JSON matching the original metadata structure
 * @param {string} adsh - The accession number (e.g., "0000754811-24-000001")
 * @returns {Object} - JSON object matching the structure written by writeSubmissionHeaderRecords
 */
export const fetchSubmissionMetadata = async function(adsh) {
    try {
        // Query main submission record
        const submissionRows = await runQuery('POC', 
            'SELECT * FROM submission WHERE adsh = ?', [adsh]);
        
        if (!submissionRows || submissionRows.length === 0) {
            throw new Error(`No submission found for adsh: ${adsh}`);
        }
        
        const submissionRow = submissionRows[0];
        
        // Build base submission object
        const submission = {
            accession_number: submissionRow.adsh,
            type: submissionRow.type
        };
        
        // Add optional fields if they exist
        if (submissionRow.public_document_count !== null) {
            submission.public_document_count = submissionRow.public_document_count.toString();
        }
        if (submissionRow.period) submission.period = submissionRow.period;
        if (submissionRow.period_start) submission.period_start = submissionRow.period_start;
        if (submissionRow.filing_date) submission.filing_date = submissionRow.filing_date;
        if (submissionRow.date_of_filing_date_change) {
            submission.date_of_filing_date_change = submissionRow.date_of_filing_date_change;
        }
        if (submissionRow.effectiveness_date) {
            submission.effectiveness_date = submissionRow.effectiveness_date;
        }
        if (submissionRow.acceptance_datetime) {
            submission.acceptance_datetime = submissionRow.acceptance_datetime;
        }
        if (submissionRow.received_date) submission.received_date = submissionRow.received_date;
        if (submissionRow.action_date) submission.action_date = submissionRow.action_date;
        if (submissionRow.public_rel_date) submission.public_rel_date = submissionRow.public_rel_date;
        if (submissionRow.file_number) submission.file_number = submissionRow.file_number;
        if (submissionRow.film_number) submission.film_number = submissionRow.film_number;
        if (submissionRow.is_paper) submission.is_paper = submissionRow.is_paper;
        
        // Additional metadata fields
        if (submissionRow.ma_i_individual) submission.ma_i_individual = submissionRow.ma_i_individual;
        if (submissionRow.previous_accession_number) {
            submission.previous_accession_number = submissionRow.previous_accession_number;
        }
        if (submissionRow.withdrawn_accession_number) {
            submission.withdrawn_accession_number = submissionRow.withdrawn_accession_number;
        }
        if (submissionRow.public_reference_acc) {
            submission.public_reference_acc = submissionRow.public_reference_acc;
        }
        if (submissionRow.reference_462b) submission.reference_462b = submissionRow.reference_462b;
        if (submissionRow.confirming_copy) submission.confirming_copy = submissionRow.confirming_copy;
        if (submissionRow.private_to_public) submission.private_to_public = submissionRow.private_to_public;
        
        // ABS fields
        if (submissionRow.abs_asset_class) submission.abs_asset_class = submissionRow.abs_asset_class;
        if (submissionRow.abs_sub_asset_class) {
            submission.abs_sub_asset_class = submissionRow.abs_sub_asset_class;
        }
        
        // Filer status fields
        if (submissionRow.is_filer_a_new_registrant) {
            submission.is_filer_a_new_registrant = submissionRow.is_filer_a_new_registrant;
        }
        if (submissionRow.is_filer_a_well_known_seasoned_issuer) {
            submission.is_filer_a_well_known_seasoned_issuer = submissionRow.is_filer_a_well_known_seasoned_issuer;
        }
        if (submissionRow.is_fund_24f2_eligible) {
            submission.is_fund_24f2_eligible = submissionRow.is_fund_24f2_eligible;
        }
        if (submissionRow.filed_pursuant_to_general_instruction_a2) {
            submission.filed_pursuant_to_general_instruction_a2 = submissionRow.filed_pursuant_to_general_instruction_a2;
        }
        if (submissionRow.registered_entity) submission.registered_entity = submissionRow.registered_entity;
        
        // Activity flags
        if (submissionRow.no_annual_activity) {
            submission.no_annual_activity = submissionRow.no_annual_activity;
        }
        if (submissionRow.no_initial_period_activity) {
            submission.no_initial_period_activity = submissionRow.no_initial_period_activity;
        }
        if (submissionRow.no_quarterly_activity) {
            submission.no_quarterly_activity = submissionRow.no_quarterly_activity;
        }
        
        // Other fields
        if (submissionRow.category) submission.category = submissionRow.category;
        if (submissionRow.calendar_year_ending) {
            submission.calendar_year_ending = submissionRow.calendar_year_ending;
        }
        if (submissionRow.depositor_cik) submission.depositor_cik = submissionRow.depositor_cik;
        if (submissionRow.sponsor_cik) submission.sponsor_cik = submissionRow.sponsor_cik;
        if (submissionRow.resource_ext_issuer) {
            submission.resource_ext_issuer = submissionRow.resource_ext_issuer;
        }
        if (submissionRow.timestamp) submission.timestamp = submissionRow.timestamp;
        
        // Query entities
        const entityRows = await runQuery('POC',
            'SELECT * FROM submission_entity WHERE adsh = ? ORDER BY filer_code, entity_sequence', [adsh]);
        
        // Map filer codes back to entity type names
        const filerCodeMap = {
            'F': 'filer',
            'RO': 'reporting_owner',
            'I': 'issuer',
            'SC': 'subject_company',
            'D': 'depositor',
            'S': 'securitizer',
            'FF': 'filed_for',
            'IE': 'issuing_entity',
            'FB': 'filed_by',
            'U': 'underwriter'
        };
        
        // Group entities by type
        const entitiesByType = {};
        for (const entityRow of entityRows) {
            const entityType = filerCodeMap[entityRow.filer_code];
            if (!entityType) continue;
            
            // Determine if this is owner_data or company_data based on entity type and form type
            // For form 144, reporting_owner uses company_data; for forms 3, 4, 5 it uses owner_data
            // Check root form type (strip /A amendment suffix)
            const rootFormType = submissionRow.type.replace(/\/A$/, '');
            const isOwnerType = entityType === 'reporting_owner' && ['3', '4', '5'].includes(rootFormType);
            const dataKey = isOwnerType ? 'owner_data' : 'company_data';
            
            const entity = {};
            
            // Build entity data
            const entityData = {
                conformed_name: entityRow.conformed_name,
                cik: entityRow.cik
            };
            
            if (entityRow.assigned_sic) entityData.assigned_sic = entityRow.assigned_sic;
            // Always include organization_name even if empty (matches writeSubmissionHeaderRecords behavior)
            if (entityRow.organization_name !== null) {
                entityData.organization_name = entityRow.organization_name;
            }
            if (entityRow.irs_number) entityData.irs_number = entityRow.irs_number;
            if (entityRow.state_of_incorporation) {
                entityData.state_of_incorporation = entityRow.state_of_incorporation;
            }
            if (entityRow.fiscal_year_end) entityData.fiscal_year_end = entityRow.fiscal_year_end;
            
            entity[dataKey] = entityData;
            
            // Add filing values if present
            if (entityRow.filing_form_type || entityRow.filing_act || 
                entityRow.filing_file_number || entityRow.filing_film_number) {
                const filingValues = {};
                if (entityRow.filing_form_type) filingValues.form_type = entityRow.filing_form_type;
                if (entityRow.filing_act) filingValues.act = entityRow.filing_act;
                if (entityRow.filing_file_number) filingValues.file_number = entityRow.filing_file_number;
                if (entityRow.filing_film_number) filingValues.film_number = entityRow.filing_film_number;
                entity.filing_values = filingValues;
            }
            
            // Add business address if present (check for any business address field)
            if (entityRow.business_street1 || entityRow.business_city || entityRow.business_phone) {
                const businessAddress = {};
                if (entityRow.business_street1) businessAddress.street1 = entityRow.business_street1;
                if (entityRow.business_street2) businessAddress.street2 = entityRow.business_street2;
                if (entityRow.business_city) businessAddress.city = entityRow.business_city;
                if (entityRow.business_state) businessAddress.state = entityRow.business_state;
                if (entityRow.business_zip) businessAddress.zip = entityRow.business_zip;
                if (entityRow.business_phone) businessAddress.phone = entityRow.business_phone;
                entity.business_address = businessAddress;
            }
            
            // Add mail address if present (check for any mail address field)
            if (entityRow.mail_street1 || entityRow.mail_city) {
                const mailAddress = {};
                if (entityRow.mail_street1) mailAddress.street1 = entityRow.mail_street1;
                if (entityRow.mail_street2) mailAddress.street2 = entityRow.mail_street2;
                if (entityRow.mail_city) mailAddress.city = entityRow.mail_city;
                if (entityRow.mail_state) mailAddress.state = entityRow.mail_state;
                if (entityRow.mail_zip) mailAddress.zip = entityRow.mail_zip;
                entity.mail_address = mailAddress;
            }
            
            // Query former names for this entity
            const formerNameRows = await runQuery('POC',
                'SELECT * FROM submission_former_name WHERE adsh = ? AND cik = ? ORDER BY former_name_sequence desc',
                [adsh, entityRow.cik]);
            
            if (formerNameRows && formerNameRows.length > 0) {
                const formerKey = isOwnerType ? 'former_name' : 'former_company';
                entity[formerKey] = formerNameRows.map(fn => ({
                    former_conformed_name: fn.former_conformed_name,
                    date_changed: fn.date_changed
                }));
            }
            
            // Add to entities by type
            if (!entitiesByType[entityType]) {
                entitiesByType[entityType] = [];
            }
            entitiesByType[entityType].push(entity);
        }
        
        // Add entities to submission (as array or single object based on type)
        for (const [entityType, entities] of Object.entries(entitiesByType)) {
            // reporting_owner and filer are typically arrays, others can be single objects
            if (['reporting_owner', 'filer'].includes(entityType) || entities.length > 1) {
                submission[entityType] = entities;
            } else {
                submission[entityType] = entities[0];
            }
        }
        
        // Query documents
        const documentRows = await runQuery('POC',
            'SELECT * FROM submission_document WHERE adsh = ? ORDER BY sequence', [adsh]);
        
        if (documentRows && documentRows.length > 0) {
            submission.document = documentRows.map(doc => {
                const docObj = {
                    type: doc.type,
                    sequence: doc.sequence.toString(),
                    filename: doc.filename
                };
                if (doc.description) docObj.description = doc.description;
                return docObj;
            });
        }
        
        // Query series and classes
        const seriesRows = await runQuery('POC',
            'SELECT * FROM submission_series WHERE adsh = ? ORDER BY owner_cik, series_id', [adsh]);
        
        if (seriesRows && seriesRows.length > 0) {
            const newSeries = [];
            const existingSeries = [];
            
            for (const seriesRow of seriesRows) {
                const series = {
                    series_id: formatSeriesId(seriesRow.series_id),
                    series_name: seriesRow.series_name
                };
                
                if (seriesRow.owner_cik) {
                    series.owner_cik = seriesRow.owner_cik;
                }
                
                // Query class contracts for this series
                const classRows = await runQuery('POC',
                    'SELECT * FROM submission_class_contract WHERE adsh = ? AND series_id = ? order by class_contract_id',
                    [adsh, seriesRow.series_id]);
                
                if (classRows && classRows.length > 0) {
                    series.class_contract = classRows.map(cc => {
                        const classObj = {
                            class_contract_id: formatClassId(cc.class_contract_id),
                            class_contract_name: cc.class_contract_name
                        };
                        if (cc.class_contract_ticker_symbol) {
                            classObj.class_contract_ticker_symbol = cc.class_contract_ticker_symbol;
                        }
                        return classObj;
                    });
                }
                
                if (seriesRow.is_new) {
                    newSeries.push(series);
                } else {
                    existingSeries.push(series);
                }
            }
            
            if (newSeries.length > 0 || existingSeries.length > 0) {
                submission.series_and_classes_contracts_data = {};
                
                if (existingSeries.length > 0) {
                    submission.series_and_classes_contracts_data.existing_series_and_classes_contracts = {
                        series: existingSeries
                    };
                }
                
                if (newSeries.length > 0) {
                    submission.series_and_classes_contracts_data.new_series_and_classes_contracts = {
                        new_series: newSeries
                    };
                }
            }
        }
        
        // Query items (naturally ordered by item_code)
        const itemRows = await runQuery('POC',
            'SELECT item_code FROM submission_item WHERE adsh = ? ORDER BY item_code', [adsh]);
        
        if (itemRows && itemRows.length > 0) {
            submission.item = itemRows.map(row => row.item_code);
        }
        
        // Query references_429
        const referencesRows = await runQuery('POC',
            'SELECT reference_429 FROM submission_references_429 WHERE adsh = ? ORDER BY reference_sequence', 
            [adsh]);
        
        if (referencesRows && referencesRows.length > 0) {
            submission.references_429 = referencesRows.map(row => row.reference_429);
        }
        
        // Query group_members
        const groupMembersRows = await runQuery('POC',
            'SELECT group_member FROM submission_group_members WHERE adsh = ? ORDER BY group_member_sequence', 
            [adsh]);
        
        if (groupMembersRows && groupMembersRows.length > 0) {
            submission.group_members = groupMembersRows.map(row => row.group_member);
        }
        
        // Query merger data
        const mergerRows = await runQuery('POC',
            'SELECT merger_data FROM submission_merger WHERE adsh = ? ORDER BY merger_sequence', 
            [adsh]);
        
        if (mergerRows && mergerRows.length > 0) {
            // Parse JSON strings back into objects
            submission.merger = mergerRows.map(row => JSON.parse(row.merger_data));
        }
        
        // Query target_data
        const targetRows = await runQuery('POC',
            'SELECT target_data FROM submission_target_data WHERE adsh = ? ORDER BY target_sequence', 
            [adsh]);
        
        if (targetRows && targetRows.length > 0) {
            // Parse JSON strings back into objects
            submission.target_data = targetRows.map(row => JSON.parse(row.target_data));
        }
        
        // Query rule data
        const ruleRows = await runQuery('POC',
            'SELECT * FROM submission_rule WHERE adsh = ?', 
            [adsh]);
        
        if (ruleRows && ruleRows.length > 0) {
            const ruleRow = ruleRows[0];
            submission.rule = {
                rule_name: ruleRow.rule_name
            };
            
            // Query rule items
            const ruleItemRows = await runQuery('POC',
                'SELECT item_number, item_period FROM submission_rule_item WHERE adsh = ? ORDER BY item_sequence', 
                [adsh]);
            
            if (ruleItemRows && ruleItemRows.length > 0) {
                submission.rule.item = ruleItemRows.map(row => ({
                    item_number: row.item_number,
                    item_period: row.item_period
                }));
            }
        }
        
        return { submission };
        
    } catch (error) {
        throw new Error(`fetchSubmissionMetadata Error: ${error.message}`);
    }
};

// Export common object with all functions
export const common = {
    s3ReadString,
    s3ReadStream,
    s3ReadLine,
    s3WriteString,
    s3WriteStream,
    sqsWriteMessage,
    webFetchFair,
    runQuery,
    closeAllPools,
    formatCIK,
    formatSeriesId,
    formatClassId,
    formatIndexKey,
    formatAccessionNumber,
    extractIntId,
    fetchSubmissionMetadata
};
