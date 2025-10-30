// Common utility functions for AWS services and other project-wide functionality
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { createReadStream, createWriteStream } from 'fs';
import { unlink, mkdtemp, readFile as fsReadFile } from 'fs/promises';
import { Readable } from 'stream';
import { createGunzip } from 'zlib';
import { promisify } from 'util';
import { pipeline } from 'stream/promises';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { validateXMLWithXSD } from 'validate-with-xmllint';
import mysql from 'mysql2/promise';
import { config } from './config.mjs';
import Handlebars from 'handlebars';
import { readFile } from 'fs/promises';
import uuencode from 'uuencode';
import { PassThrough } from 'stream';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// AWS clients
const s3Client = new S3Client({ region: 'us-east-1' });
const sqsClient = new SQSClient({ region: 'us-east-1' });

// Module-level variables for SEC Fair Use Policy
let recentSecRequest = false;
let secRequestTimer = null;

// Module-level variable for SGML template
let sgmlHandlebarsTemplate = null;

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

export const s3WriteString = async (bucket, key, body, contentType = 'text/plain') => {
    try {
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: contentType
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
        if (submissionRow.is_paper) submission.paper = true;
        
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
        // Convert confirming_copy from DB string "1" back to boolean true
        if (submissionRow.confirming_copy) submission.confirming_copy = true;
        // Convert private_to_public from DB string "1" back to boolean true  
        if (submissionRow.private_to_public) submission.private_to_public = true;
        
        // ABS fields
        if (submissionRow.abs_asset_class) submission.abs_asset_class = submissionRow.abs_asset_class;
        if (submissionRow.abs_sub_asset_class) {
            submission.abs_sub_asset_class = submissionRow.abs_sub_asset_class;
        }
        if (submissionRow.abs_rule) submission.abs_rule = submissionRow.abs_rule;
        
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
        if (submissionRow.depositor_cik) submission.depositor_cik = common.formatCIK(submissionRow.depositor_cik);
        if (submissionRow.sponsor_cik) submission.sponsor_cik = common.formatCIK(submissionRow.sponsor_cik);
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
            // Set to empty string if null to ensure the SGML template outputs <ORGANIZATION-NAME>
            entityData.organization_name = entityRow.organization_name || '';
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
                'SELECT * FROM submission_former_name WHERE adsh = ? AND cik = ? ORDER BY former_name_sequence',
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
            'SELECT * FROM submission_series WHERE adsh = ? ORDER BY series_source, owner_cik, series_id, series_sequence', [adsh]);
        
        if (seriesRows && seriesRows.length > 0) {
            const newSeries = [];
            const newClassesContracts = [];
            const existingSeries = [];
            let ownerCikForNew = null;
            let ownerCikForNewClasses = null;
            
            for (const seriesRow of seriesRows) {
                const series = {
                    series_id: formatSeriesId(seriesRow.series_id),
                    series_name: seriesRow.series_name
                };
                
                // Format owner_cik with leading zeros
                const ownerCikFormatted = seriesRow.owner_cik ? seriesRow.owner_cik.toString().padStart(10, '0') : null;
                
                // Query class contracts for this series (matching series_source and series_sequence)
                const classRows = await runQuery('POC',
                    `SELECT * FROM submission_class_contract 
                     WHERE adsh = ? AND series_source = ? AND series_id = ? AND series_sequence = ? 
                     ORDER BY class_sequence`,
                    [adsh, seriesRow.series_source, seriesRow.series_id, seriesRow.series_sequence]);
                
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
                
                // Determine which array to add to based on series_source
                if (seriesRow.series_source === 'new_series') {
                    newSeries.push(series);
                    if (ownerCikFormatted && !ownerCikForNew) {
                        ownerCikForNew = ownerCikFormatted;
                    }
                } else if (seriesRow.series_source === 'new_classes_contracts') {
                    newClassesContracts.push(series);
                    if (ownerCikFormatted && !ownerCikForNewClasses) {
                        ownerCikForNewClasses = ownerCikFormatted;
                    }
                } else {
                    // existing_series - owner_cik goes inside each series object
                    if (ownerCikFormatted) {
                        series.owner_cik = ownerCikFormatted;
                    }
                    existingSeries.push(series);
                }
            }
            
            if (newSeries.length > 0 || newClassesContracts.length > 0 || existingSeries.length > 0) {
                submission.series_and_classes_contracts_data = {};
                
                if (existingSeries.length > 0) {
                    submission.series_and_classes_contracts_data.existing_series_and_classes_contracts = {
                        series: existingSeries
                    };
                }
                
                // Handle new_series_and_classes_contracts - can contain both new_series and new_classes_contracts
                if (newSeries.length > 0 || newClassesContracts.length > 0) {
                    const newContract = {};
                    
                    // Add owner_cik if present (use from newSeries first, then newClassesContracts)
                    const ownerCik = ownerCikForNew || ownerCikForNewClasses;
                    if (ownerCik) {
                        newContract.owner_cik = ownerCik;
                    }
                    
                    // Add new_series if present
                    if (newSeries.length > 0) {
                        newContract.new_series = newSeries;
                    }
                    
                    // Add new_classes_contracts if present
                    if (newClassesContracts.length > 0) {
                        newContract.new_classes_contracts = newClassesContracts;
                    }
                    
                    submission.series_and_classes_contracts_data.new_series_and_classes_contracts = newContract;
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
        
        // Query merger data (N-14 forms)
        // Get distinct merger_sequence values from submission_merger_series
        const mergerRows = await runQuery('POC',
            'SELECT DISTINCT merger_sequence FROM submission_merger_series WHERE adsh = ? ORDER BY merger_sequence', 
            [adsh]);
        
        if (mergerRows && mergerRows.length > 0) {
            const mergers = [];
            
            for (const mergerRow of mergerRows) {
                const mergerSequence = mergerRow.merger_sequence;
                const merger = {};
                
                // Query acquiring series (series_type = 'A')
                const acquiringSeriesRows = await runQuery('POC',
                    `SELECT * FROM submission_merger_series 
                     WHERE adsh = ? AND merger_sequence = ? AND series_type = 'A'
                     ORDER BY series_sequence`, 
                    [adsh, mergerSequence]);
                
                if (acquiringSeriesRows && acquiringSeriesRows.length > 0) {
                    // Group by entity_cik (should only be one for acquiring)
                    const acquiringCik = acquiringSeriesRows[0].entity_cik.toString().padStart(10, '0');
                    const seriesArray = [];
                    
                    for (const seriesRow of acquiringSeriesRows) {
                        const series = {
                            series_id: formatSeriesId(seriesRow.series_id),
                            series_name: seriesRow.series_name
                        };
                        
                        // Query class contracts for this series
                        const classRows = await runQuery('POC',
                            `SELECT * FROM submission_merger_class_contract 
                             WHERE adsh = ? AND merger_sequence = ? AND series_type = 'A' 
                             AND entity_cik = ? AND entity_sequence = ? AND series_id = ? AND series_sequence = ?
                             ORDER BY class_sequence`,
                            [adsh, mergerSequence, seriesRow.entity_cik, seriesRow.entity_sequence, seriesRow.series_id, seriesRow.series_sequence]);
                        
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
                        
                        seriesArray.push(series);
                    }
                    
                    merger.acquiring_data = {
                        cik: acquiringCik,
                        series: seriesArray
                    };
                }
                
                // Query target series (series_type = 'T')
                const targetSeriesRows = await runQuery('POC',
                    `SELECT * FROM submission_merger_series 
                     WHERE adsh = ? AND merger_sequence = ? AND series_type = 'T'
                     ORDER BY entity_sequence, series_sequence`, 
                    [adsh, mergerSequence]);
                
                if (targetSeriesRows && targetSeriesRows.length > 0) {
                    // Group by entity_cik and entity_sequence
                    const targetDataMap = new Map();
                    
                    for (const seriesRow of targetSeriesRows) {
                        const key = `${seriesRow.entity_cik}_${seriesRow.entity_sequence}`;
                        
                        if (!targetDataMap.has(key)) {
                            targetDataMap.set(key, {
                                cik: seriesRow.entity_cik.toString().padStart(10, '0'),
                                entity_sequence: seriesRow.entity_sequence,
                                series: []
                            });
                        }
                        
                        // Check if this is a CIK-only entry (series_id is NULL)
                        if (seriesRow.series_id === null) {
                            // CIK-only entry, don't add series
                            continue;
                        }
                        
                        const series = {
                            series_id: formatSeriesId(seriesRow.series_id),
                            series_name: seriesRow.series_name
                        };
                        
                        // Query class contracts for this series
                        const classRows = await runQuery('POC',
                            `SELECT * FROM submission_merger_class_contract 
                             WHERE adsh = ? AND merger_sequence = ? AND series_type = 'T' 
                             AND entity_cik = ? AND entity_sequence = ? AND series_id = ? AND series_sequence = ?
                             ORDER BY class_sequence`,
                            [adsh, mergerSequence, seriesRow.entity_cik, seriesRow.entity_sequence, seriesRow.series_id, seriesRow.series_sequence]);
                        
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
                        
                        targetDataMap.get(key).series.push(series);
                    }
                    
                    // Convert map to array, sorted by entity_sequence
                    // Remove series array if empty (for CIK-only targets)
                    merger.target_data = Array.from(targetDataMap.values())
                        .sort((a, b) => a.entity_sequence - b.entity_sequence)
                        .map(({ cik, series }) => {
                            if (series.length === 0) {
                                return { cik };  // CIK-only target
                            }
                            return { cik, series };  // Target with series
                        });
                }
                
                mergers.push(merger);
            }
            
            // Add to series_and_classes_contracts_data if we have mergers
            if (mergers.length > 0) {
                if (!submission.series_and_classes_contracts_data) {
                    submission.series_and_classes_contracts_data = {};
                }
                submission.series_and_classes_contracts_data.merger_series_and_classes_contracts = {
                    merger: mergers
                };
            }
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

/**
 * Validate XML file from S3 against one or more XSD schemas
 * @param {Object} xmlS3Source - Object with bucket and key properties for XML file
 * @param {Array} xsdS3Sources - Array of objects with bucket, key, and run properties
 * @returns {Object} Validation results with validated, warningCount, errorCount, and validationDetails
 */
/**
 * Extract XBRL instance from iXBRL document using Arelle
 * @param {string} iXbrlPath - Path to input iXBRL HTML file
 * @param {string} outputXbrlPath - Path to save extracted XBRL instance
 * @returns {Object} Result with success status and message
 */
export const extractXbrlFromIxbrl = async (iXbrlPath, outputXbrlPath) => {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
        // Use arelleCmdLine with inlineXbrlDocumentSet plugin and saveInstance option
        // The saveInstance flag saves to <inputfile_basename>_extracted.xbrl
        const { basename } = await import('path');
        const inputBasename = basename(iXbrlPath);
        const inputWithoutExt = inputBasename.replace(/\.[^.]+$/, ''); // remove extension
        const { dirname } = await import('path');
        const inputDir = dirname(iXbrlPath);
        const defaultOutput = `${inputDir}/${inputWithoutExt}_extracted.xbrl`;
        
        // Run arelleCmdLine with online mode (needed for schema references)
        const command = `arelleCmdLine --plugins=inlineXbrlDocumentSet --internetConnectivity online --file "${iXbrlPath}" --saveInstance 2>&1`;
        const { stdout, stderr } = await execAsync(command);
        
        // Check if extraction produced output file
        const { access } = await import('fs/promises');
        try {
            await access(defaultOutput);
        } catch (accessError) {
            // File wasn't created - check for errors in output
            return {
                success: false,
                message: `Extraction failed - output file not created at ${defaultOutput}`,
                stdout,
                stderr,
                command
            };
        }
        
        // Move the extracted file to the desired output path
        const { rename } = await import('fs/promises');
        await rename(defaultOutput, outputXbrlPath);
        
        return { 
            success: true, 
            message: `Successfully extracted XBRL to: ${outputXbrlPath}`,
            stdout,
            stderr
        };
        
    } catch (error) {
        return { 
            success: false, 
            message: `Error extracting XBRL: ${error.message}`,
            error: error.message,
            stderr: error.stderr,
            stdout: error.stdout
        };
    }
};

export const validateXML = async (xmlS3Source, xsdS3Sources) => {
    let tempDir = null;
    const tempFiles = [];
    
    try {
        const startTime = Date.now();
        // Create a temporary directory for our files
        tempDir = await mkdtemp(join(tmpdir(), 'xml-validation-'));
        
        // Download XML file from S3 to temp directory (using stream for large files)

        const xmlPromise = s3ReadString(xmlS3Source.bucket, xmlS3Source.key); 
        
        // Download all XSD files to temp directory (they're smaller, so we can use strings)
        const { writeFile } = await import('fs/promises');
        const xsdPaths = [];
        const xsdFilePromises = [];
        for (const xsdSource of xsdS3Sources) {
            const xsdFileName = xsdSource.key.split('/').pop();
            const xsdTempPath = join(tempDir, xsdFileName); //console.debug('xsdTempPath', xsdTempPath);
            xsdFilePromises.push(writeFile(xsdTempPath, await s3ReadString(xsdSource.bucket, xsdSource.key)));
            tempFiles.push(xsdTempPath);
            xsdPaths.push({
                path: xsdTempPath,
                key: xsdSource.key,
                run: xsdSource.run !== false // Default to true if not specified
            });
        }
        await Promise.all(xsdFilePromises);
        
        // Read the XML file into memory
        // Note: For very large files (2GB), validate-with-xmllint pipes content to xmllint's stdin,
        // so it doesn't load the entire file into memory during validation
        const xmlContent = await xmlPromise;
        
        // Validate against each XSD where run=true
        const validationDetails = [];
        let totalWarnings = 0;
        let totalErrors = 0;
        let overallValid = true;
        
        //console.log(`loaded files in ${Date.now()-startTime}ms`);
        for (const xsdInfo of xsdPaths) {
            if (!xsdInfo.run) continue;
            
            const warnings = [];
            const errors = [];
            
            try {
                // Validate using the validate-with-xmllint package
                // This function takes XML content (string) and XSD file path
                await validateXMLWithXSD(xmlContent, xsdInfo.path);
                
                // If we reach here, validation passed (no errors)
                
            } catch (validationError) {
                // Parse the error message for warnings and errors
                // The error message contains the xmllint output
                const errorMessage = validationError.message || validationError.toString();
                const lines = errorMessage.split('\n');
                
                for (const line of lines) {
                    if (!line.trim()) continue;
                    
                    // Skip the error prefix line
                    if (line.startsWith('xmllint exited with code')) {
                        continue;
                    }
                    
                    // Skip success messages
                    if (line.includes('validates') && !line.includes('fails')) {
                        continue;
                    }
                    
                    // Categorize as warning or error
                    const lowerLine = line.toLowerCase();
                    if (lowerLine.includes('warning')) {
                        warnings.push(line.trim());
                        totalWarnings++;
                    } else if (lowerLine.includes('error') || 
                               lowerLine.includes('fails to validate') ||
                               (line.includes(':') && !lowerLine.includes('validates'))) {
                        errors.push(line.trim());
                        totalErrors++;
                        overallValid = false;
                    }
                }
            }
            
            validationDetails.push({
                xsd: xsdInfo.key,
                warnings: warnings,
                errors: errors
            });
        }
        return {
            validated: overallValid,
            warningCount: totalWarnings,
            errorCount: totalErrors,
            validationDetails: validationDetails
        };
        
    } catch (error) {
        throw new Error(`validateXML Error: ${error.message}`);
    } finally {
        // Clean up temporary files
        for (const tempFile of tempFiles) {
            try {
                await unlink(tempFile);
            } catch (cleanupError) {
                // Ignore cleanup errors
            }
        }
        
        // Clean up temporary directory
        if (tempDir) {
            try {
                const { rmdir } = await import('fs/promises');
                await rmdir(tempDir);
            } catch (cleanupError) {
                // Ignore cleanup errors
            }
        }
    }
};

/**
 * Generate SGML from filing metadata using Handlebars template
 * @param {Object} filingMetaData - The filing metadata object with submission property
 * @returns {string} - Normalized SGML string
 */
export const createSgml = async function(filingMetaData) {
    try {
        // Compile template if not already compiled
        if (!sgmlHandlebarsTemplate) {
            // Read and compile the Handlebars templates
            const templateSource = await readFile(join(__dirname, 'sgml_template.handlebars'), 'utf-8');
            const entityPartialSource = await readFile(join(__dirname, 'sgml_entity_partial.handlebars'), 'utf-8');
            
            // Register the entity partial
            Handlebars.registerPartial('entity', entityPartialSource);
            
            // Register a custom helper to check if a property exists (even if it's an empty string)
            Handlebars.registerHelper('hasProperty', function(obj, propName) {
                return obj && obj.hasOwnProperty(propName);
            });
            
            // Register helper to check if this is an investment company form (N-2, N-14, 486 series, etc.)
            Handlebars.registerHelper('isInvestmentCompanyForm', function(formType) {
                if (!formType) return false;
                const rootForm = formType.split('/')[0].trim();
                const investmentForms = ['N-2', 'N-14', '486APOS', '486BPOS', '486BXT', 'N-2ASR', 'POS 8C', 'N-14 8C', '485APOS', '485BPOS', '485BXT'];
                return investmentForms.includes(rootForm);
            });
            
            // Compile the main template
            sgmlHandlebarsTemplate = Handlebars.compile(templateSource);
        }
        
        // Generate SGML from the metadata using the template
        const generatedSgml = sgmlHandlebarsTemplate(filingMetaData.submission);
        
        // Normalize the generated SGML
        const normalizeString = (str) => {
            return str
                .replace(/\r\n/g, '\n')  // Normalize line endings
                .replace(/\n+/g, '\n')   // Remove extra blank lines
                .trim();
        };
        
        return normalizeString(generatedSgml);
        
    } catch (error) {
        throw new Error(`createSgml Error: ${error.message}`);
    }
};

/**
 * Create a dissemination file from filing metadata and document files
 * @param {Object} filingMetadata - The filing metadata object with submission property
 * @param {string} documentsBucket - S3 bucket containing document files
 * @param {string} documentsBucketFolder - S3 folder path for document files
 * @param {string} dissemBucket - S3 bucket for dissemination file output
 * @param {string} dissemFileKey - S3 key for dissemination file output
 * @returns {Promise<Object>} - Result object with success status
 * 
 * UUENCODE issues:  While the .DISSEM uuencoded binary files decode correctly, the text representation does not match SEC format due variation is the final linetermination character.
 *   This is due to use of 0x01 (instead of the standard 0x00) as the padding byte when final line's bytes count % 3 != 0 
 *   and by including the full 4 character encoding to the 3 byte triplet, even when the finally characters are not needed to decode (due ot line's byte length)
 *
 *   This encodeer (as do standard uuencoders) 100% matches EDGAR's uuencoding when bytes count % 3 == 0
 *   This variant 100% matches EDGAR's uuencoding when bytes count % 3 == 1 and 2 padding bytes = 0x01 ox01 are added
 *   This variant 91% matches EDGAR's uuencoding when bytes count % 3 == 2 and 1 padding byte = 0x01 is added.  
 *     The remaining 3% (1/3 of 9%) edge cases are addressed by test the last line's terminal characters and adjusting
 * 
 */

/**
 * EDGAR-compatible uuencode function
 * Encodes binary data in EDGAR's uuencode format with proper padding
 * 
 * @param {Buffer} binaryBuffer - The binary data to encode
 * @param {string} fileName - The filename to include in the begin line
 * @returns {string} - The uuencoded string
 */
export const uuEdgarEncode = function(binaryBuffer, fileName) {
    //const lines = [];
    let uuencodeBlock = `begin 644 ${fileName}\n`;
    
    // Add begin line
    //lines.push(`begin 644 ${fileName}`);
    
    // Encode 45 bytes per line
    const BYTES_PER_LINE = 45;
    let offset = 0;
    
    while (offset < binaryBuffer.length) {
        const remainingBytes = binaryBuffer.length - offset;
        const bytesToEncode = Math.min(remainingBytes, BYTES_PER_LINE);
        
        // Extract the bytes for this line
        let lineData = binaryBuffer.slice(offset, offset + bytesToEncode);
        const originalLength = lineData.length;
        
        // If this is the last line and not a multiple of 3, pad with 0x01
        if (offset + bytesToEncode === binaryBuffer.length && originalLength % 3 !== 0) {
            const paddingNeeded = 3 - (originalLength % 3);
            const paddingBuffer = Buffer.alloc(paddingNeeded, 0x01);
            lineData = Buffer.concat([lineData, paddingBuffer]);
        }
        
        // Encode the length byte (original length before padding)
        const lengthChar = String.fromCharCode((originalLength & 0x3f) + 32);
        
        // Encode the data
        let encodedData = '';
        for (let i = 0; i < lineData.length; i += 3) {
            const b1 = i < lineData.length ? lineData[i] : 0;
            const b2 = i + 1 < lineData.length ? lineData[i + 1] : 0;
            const b3 = i + 2 < lineData.length ? lineData[i + 2] : 0;
            
            // Convert 3 bytes to 4 6-bit values
            const c1 = (b1 >> 2) & 0x3f;
            const c2 = ((b1 & 0x03) << 4) | ((b2 >> 4) & 0x0f);
            const c3 = ((b2 & 0x0f) << 2) | ((b3 >> 6) & 0x03);
            const c4 = b3 & 0x3f;
            
            // Convert to printable characters
            encodedData += String.fromCharCode(c1 + 32);
            encodedData += String.fromCharCode(c2 + 32);
            encodedData += String.fromCharCode(c3 + 32);
            encodedData += String.fromCharCode(c4 + 32);
        }
        
        // Trim trailing spaces and add the line
        let trimmedLine = lengthChar + encodedData.trimEnd(); 
        if(lengthChar != 'M' && trimmedLine.endsWith('_]D')) { //side case affect 
            trimmedLine += '!';
        }
        if(lengthChar != 'M' && trimmedLine.endsWith('_\\!')) { //side case affect 
            console.log('side case "_\\!" found!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            trimmedLine = trimmedLine.slice(0,-3) + "_]D!";
        }
        uuencodeBlock += trimmedLine + '\n';
        //nes.push(fullLine.trimEnd());
        
        offset += bytesToEncode;
    }
    
    // Add end line
    uuencodeBlock += '\nend';
    //lines.push('');
    //lines.push('end');
    
    return uuencodeBlock;
    //return lines.join('\n');
};

export const makeDisseminationFile = async function(filingMetadata, documentsBucket, documentsBucketFolder, dissemBucket, dissemFileKey) {
    try {
        // Generate SGML metadata
        const sgmlString = await createSgml(filingMetadata);
        const sgmlLines = sgmlString.split('\n');
        
        // Create a PassThrough stream to collect all output
        const outputStream = new PassThrough();
        const chunks = [];
        
        outputStream.on('data', chunk => chunks.push(chunk));
        
        // Process SGML lines
        let thisFileName = null,
            sequenceNumber = null;
        
        for (const line of sgmlLines) {
            const trimmedLine = line.trim();
            
            // Check for <FILENAME>
            if (trimmedLine.startsWith('<FILENAME>')) {
                thisFileName = trimmedLine.substring('<FILENAME>'.length);
            }
            if (trimmedLine.startsWith('<SEQUENCE>')) {
                sequenceNumber = trimmedLine.substring('<SEQUENCE>'.length);
            }
            
            // Check for <DOCUMENT> tag
            if (trimmedLine === '<DOCUMENT>') {
                thisFileName = null;
            }
            
            // Check for </DOCUMENT> tag - insert document content before it
            if (trimmedLine === '</DOCUMENT>' && thisFileName) {
                // Insert <TEXT>, document content, and </TEXT> before </DOCUMENT>
                const documentKey = documentsBucketFolder + thisFileName;
                
                try {
                    // Get file extension
                    const fileExtension = thisFileName.split('.').pop().toLowerCase();
                    const isBinary = ['pdf', 'gif', 'jpg', 'png', 'xlsx', 'zip', 'xls', 'xlsx'].includes(fileExtension);
                    
                    // Write <TEXT> tag
                    outputStream.write('<TEXT>\n');
                    
                    // Open read stream for the document
                    const documentStream = await s3ReadStream(documentsBucket, documentKey);
                    if (isBinary) {
                        // For PDF files, write <PDF> tag before content
                        if (fileExtension === 'pdf') {
                            outputStream.write('<PDF>\n');
                        }

                        // Read the entire binary file into a buffer
                        const documentChunks = [];
                        for await (const chunk of documentStream) {
                            documentChunks.push(chunk);
                        }
                        const documentBuffer = Buffer.concat(documentChunks);
                        
                        // UUEncode using EDGAR-compatible encoding
                        //don't create another large string: const uuencodedContent = uuEdgarEncode(documentBuffer, thisFileName);
                        outputStream.write(uuEdgarEncode(documentBuffer, thisFileName));

                        // For PDF files, write </PDF> tag after content
                        if (fileExtension === 'pdf') {
                            outputStream.write('\n</PDF>');
                        }
                        console.log(`generated #${sequenceNumber} ${documentKey.split('.').pop()} `);

                    } else {
                        // For non-binary files, stream directly
                        for await (const chunk of documentStream) {
                            outputStream.write(chunk);
                        }
                    }
                    
                    // Write </TEXT> tag
                    outputStream.write('\n</TEXT>\n');
                    
                } catch (fileError) {
                    // File doesn't exist or error reading - write empty TEXT section
                    
                    console.log(fileError.message);
                    console.warn(`Warning: Could not read document file ${documentKey}: ${fileError.message}`);
                    outputStream.write('</TEXT>\n');
                }
                
                // Reset filename after processing
                thisFileName = null;
            }
            
            // Write the current SGML line
            outputStream.write(line + '\n');
        }
        
        // Close the output stream
        outputStream.end();
        
        // Wait for all chunks to be collected
        await new Promise((resolve) => outputStream.on('end', resolve));
        
        // Combine all chunks and write to S3
        const finalContent = Buffer.concat(chunks);
        await s3WriteString(dissemBucket, dissemFileKey, finalContent, 'text/plain');
        
        return { success: true, dissemKey: dissemFileKey, message: `Dissemination file created: ${dissemFileKey}` };
        
    } catch (error) {
        throw new Error(`makeDisseminationFile Error: ${error.message}`);
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
    fetchSubmissionMetadata,
    extractXbrlFromIxbrl,
    validateXML,
    createSgml,
    makeDisseminationFile,
    uuEdgarEncode
};
