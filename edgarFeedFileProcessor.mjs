// EDGAR Feed File Processor - Processes individual EDGAR submission files
// Converted from edgarFullTextSearchSubmissionIngest.js to use common.mjs and modern Node.js

import { common } from './common.mjs';
import { sgmlToJson, tagToJson } from './sgmlToJson.mjs';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { writeFile, copyFile } from 'node:fs/promises';
import uuencode from 'uuencode';
import { promisify } from 'util';  
import { exec } from 'child_process';
import { fstat } from 'node:fs';
const execAsync = promisify(exec);

// Constants
const BINARY_EXT = [ 'pdf', 'gif', 'jpg', 'png', 'xlsx', 'zip', 'xls' ];

const READ_STATES = {
        INIT: 'INIT',
        DOC_HEADER: 'HEAD',
        DOC_BODY: 'BODY',
        DOC_FOOTER: 'FOOTER',
        READ_COMPLETE: 'READ_COMPLETE',
        MESSAGED_PARENT: 'MESSAGED_PARENT',
    };

const INDEX_STATES = {  //can't collide with READ_STATES!
        FREE: 'FREE',
        INDEXING: 'INDEXING',
        INDEXED: 'INDEXED',
        SKIPPED: 'SKIPPED',
        INDEX_FAILED: 'INDEX_FAILED',
    };



let processNum = false;
let submissionCount = 0;
let processStart = (new Date()).getTime();
let start;

process.on('message', processFeedFile);
export async function processFeedFile(processInfo) {
    //debug: console.log('child get the message:', processInfo);
    const adhsFromFileName = processInfo.name.split('.').shift();
    const docFilingFolder = processInfo.filingsDir + adhsFromFileName + '/';
    if(processInfo.writeExtractedFiles || processInfo.writeSgmlMetaDataFiles || processInfo.writeJsonMetaDataFiles) {
        await execAsync("sudo mkdir -p -m 777 " + docFilingFolder);   //write the extracted SGML feed here
    }

    submissionCount++;
    start = (new Date()).getTime();
    //if(!processNum)console.log('starting up process '+processInfo.processNum);
    if(processNum && processNum != processInfo.processNum){
        console.log('changing process num from '+processNum + ' to ' + processInfo.processNum);
    }
    processNum = processInfo.processNum;
    const stream = createReadStream(processInfo.path + processInfo.name);
    const readInterface = createInterface({
        input: stream,
        console: false
    });
    const fileWritePromises = [],
        dbPromises = [],
        sgmlLines = [];
    let submission = { //submission has module level scope to be able to report out when killed
            docs: [],
            readState: READ_STATES.INIT,
            metadata: null
        };
    dbPromises.push(common.runQuery(  //create record, so that if processing fails, we can query on incomplete/failed processing
        'POC', 
        `insert IGNORE into feeds_file (feeds_date, feeds_file) values (?, ?)`, 
        [processInfo.feedDate, processInfo.name]
    ));
    
    readInterface.on('line', async function(line) {
        let tLine = line.trim();
        if (submission.readState == READ_STATES.INIT) { //submission header prior to first <DOCUMENT>
            if(line.startsWith('<DELETION>') || line.startsWith('<CORRECTION>')) {
                console.log(line, processInfo.path + processInfo.name);
            }
            sgmlLines.push(line);

/*             if (tLine == '<COMPANY-DATA>' || tLine == '<OWNER-DATA>') entity = {};
            if ((tLine == '</COMPANY-DATA>' || tLine == '</OWNER-DATA>') && entity.cik) {
                submission.entities.push(entity);
                if (entity.name) submission.names.push(entity.name);
                if (entity.incorporationState && entity.incorporationState.toString().length==2
                    && submission.incorporationStates.indexOf(entity.incorporationState)==-1) submission.incorporationStates.push(entity.incorporationState);
                if (entity.sic && submission.sics.indexOf(entity.sic)==-1) submission.sics.push(entity.sic);
                if(submission.ciks.indexOf(entity.cik) == -1) submission.ciks.push(entity.cik);
            }  //ignores <DEPOSITOR-CIK> && <OWNER-CIK> (see path analysis below)
            if (tLine.startsWith('<CIK>')) entity.cik = tLine.substr('<CIK>'.length);
            if (tLine.startsWith('<ASSIGNED-SIC>')) entity.sic = tLine.substr('<ASSIGNED-SIC>'.length);
            if (tLine.startsWith('<STATE-OF-INCORPORATION>')) entity.incorporationState = tLine.substr('<STATE-OF-INCORPORATION>'.length);
            if (tLine.startsWith('<CONFORMED-NAME>')) entity.name = tLine.substr('<CONFORMED-NAME>'.length);

            if (tLine == '<BUSINESS-ADDRESS>' || tLine == '<MAIL-ADDRESS>') address = {};
            if (tLine == '</BUSINESS-ADDRESS>') entity.mailingAddress = address;
            if (tLine == '</MAIL-ADDRESS>') entity.businessAddress = address;

            if (tLine.startsWith('<STATE>')) address.state = tLine.substr('<STATE>'.length);
            if (tLine.startsWith('<CITY>')) address.city = tLine.substr('<CITY>'.length);


            if (tLine.startsWith('<TYPE>')) submission.form = tLine.substr('<TYPE>'.length).toUpperCase();
            if (tLine.startsWith('<PERIOD>')) submission.periodEnding = tLine.substr('<PERIOD>'.length).toUpperCase();

            if (tLine.startsWith('<FILING-DATE>')) submission.filingDate = tLine.substr('<FILING-DATE>'.length);
            if (tLine.startsWith('<ACCEPTANCE-DATETIME>')) submission.acceptanceDateTime = tLine.substr('<ACCEPTANCE-DATETIME>'.length);
            if (tLine.startsWith('<ACCESSION-NUMBER>')) submission.adsh = tLine.substr('<ACCESSION-NUMBER>'.length);
            if (tLine.startsWith('<FILE-NUMBER>')) submission.fileNumber = tLine.substr('<FILE-NUMBER>'.length);
            if (tLine.startsWith('<FILM-NUMBER>')) submission.filmNumber = tLine.substr('<FILM-NUMBER>'.length); */
            if (tLine == '<DOCUMENT>') {
                submission.readState = READ_STATES.DOC_HEADER;
            }
        }

        if (submission.readState == READ_STATES.DOC_FOOTER) { //ordered above the DOC_HEADER processing section to add new submission.docs on new <DOCUMENT>
            //console.log('DOC_FOOTER', line);
            sgmlLines.push(line); //captures '</DOCUMENT>' line, but state stays in DOC_FOOTER until either of the following: 
            if (tLine == '<DOCUMENT>') submission.readState = READ_STATES.DOC_HEADER;  //another doc starting
        }
        if (submission.readState != READ_STATES.DOC_BODY && tLine == '</SUBMISSION>') submission.readState = READ_STATES.READ_COMPLETE;  //end of submission!

        if (submission.readState == READ_STATES.DOC_BODY) {  //ordered above the DOC_HEADER processing section to avoid fall through of <TEXT>
            const d = submission.docs.length - 1;
            const doc = submission.docs[d];
            const isBinaryFile = BINARY_EXT.includes(submission.docs[d].fileExtension);
            if (tLine == '</TEXT>') {
                submission.readState = READ_STATES.DOC_FOOTER;
                doc.state = READ_STATES.READ_COMPLETE;
                if(processInfo.writeExtractedFiles) {
                    if(doc.fileName) {
                        const docFileName = docFilingFolder + doc.fileName;
                        if (isBinaryFile) {
                            if(doc.fileExtension=='pdf'){
                                doc.lines.shift(); //<PDF>
                                doc.lines.pop();   //</PDF>
                            }
                            doc.lines.shift(); //begin 644 ex991to13da108016015_010219.ext
                            doc.lines.pop();  //end
                            fileWritePromises.push(writeFile(docFileName, uuencode.decode(doc.lines.join('\n')), 'binary')); 
                        } else {
                            fileWritePromises.push(writeFile(docFileName, doc.lines.join('\n'), 'utf-8')); 
                        } 
                    } else {
                        throw ('missing fileName for doc ' + d + ' in ' + processInfo.fileName);
                    }
                    delete doc.lines; //free up memory
                }
            } else {
                doc.lengthRaw += line.length + 1;  //+1 for the newline character when joined
                if (processInfo.writeExtractedFiles) { //determined above to have a valid ext and be indexable (and not blank)
                    doc.lines.push(isBinaryFile ? uunencodePadding(line) : line);  
                }
            }
        }

        if (submission.readState == READ_STATES.DOC_HEADER) {
            if (tLine == '<DOCUMENT>') {  //fall though from decisions in INIT and DOC_FOOTER sections above
                submission.docs.push({
                    lengthRaw: 0, //length of doc in dissem file between <TEXT> and </TEXT>
                    fileLength: null, //length of file on disk (after UUDECODE)
                    fileName: null,
                    fileDescription: null,
                    fileType: null,
                    fileExtension: null,
                    lines: []
                });
            } else {
                const d = submission.docs.length - 1;
                if (tLine.startsWith('<FILENAME>')) {  //can't wait for final SGML parse:  need to know if binary and what file name to save as
                    submission.docs[d].fileName = tLine.substr('<FILENAME>'.length);
                    submission.docs[d].fileExtension = submission.docs[d].fileName.split('.').pop().toLowerCase().trim();
                }
                if(tLine.startsWith('<SEQUENCE>')) { 
                    submission.docs[d].sequence = tLine.substr('<SEQUENCE>'.length);
                }
                if (tLine == '<TEXT>') {
                    submission.readState = READ_STATES.DOC_BODY;
                } else {
                    sgmlLines.push(line);
                }
                if (tLine == '</DOCUMENT>') submission.readState = READ_STATES.DOC_FOOTER;
            }
        }

        if (submission.readState == READ_STATES.READ_COMPLETE) {
            const submissionMetadata = sgmlToJson(sgmlLines);
            submission.metadata = submissionMetadata.submission;
            submission.docs.forEach((doc, index) => {
                if(submissionMetadata.submission     && submissionMetadata.submission.document && submissionMetadata.submission.document[index] 
                && doc.sequence == submissionMetadata.submission.document[index].sequence 
                && doc.fileName == submissionMetadata.submission.document[index].filename) { // these two properties are not in the SGML
                    submissionMetadata.submission.document[index].lengthRaw = doc.lengthRaw;
                    submissionMetadata.submission.document[index].fileLength = doc.fileLength;
                }
            });
            if(processInfo.writeSgmlMetaDataFiles) {
                fileWritePromises.push(writeFile(docFilingFolder + processInfo.feedDate + '_' + processInfo.name + '.sgml', sgmlLines.join('\n'), 'utf-8'));
            }
            if(processInfo.writeJsonMetaDataFiles) {
                fileWritePromises.push(writeFile(docFilingFolder + processInfo.feedDate + '_' + processInfo.name + '.json', JSON.stringify(submissionMetadata, null, 2), 'utf-8'));
            }
            
            // Copy source file to filing folder if it's a correction, which also covers deletions
            if(submissionMetadata.submission.correction) {
                const sourceFile = processInfo.path + processInfo.name;
                const destFile = docFilingFolder + processInfo.feedDate + '_' + processInfo.name;
                fileWritePromises.push(copyFile(sourceFile, destFile));
            }
            
            // Write feeds metadata to database
            if (submissionMetadata && submissionMetadata.submission) {
                writeFeedsMetaData(submissionMetadata.submission, processInfo.feedDate, processInfo.name);
                writeSubmissionHeaderRecords(submissionMetadata.submission, processInfo.feedDate, processInfo.name);  //insert queries run async and promises pushed onto dbPromises array
            }
            
             messageParentFinished('ok');
        }
    });

    /**
     * Writes feeds metadata to database tables
     * @param {Object} jsonMetaData - The JSON metadata object from SGML processing
     * @param {string} feedDate - The feed date (YYYYMMDD format)
     * @param {string} filename - The filename being processed
     */
    function writeFeedsMetaData(jsonMetaData, feedDate, filename) {
        try {
            
            // Extract basic filing information
            const accessionNumber = jsonMetaData.accession_number || '';
            const filingDate = jsonMetaData.filing_date || '';
            const formType = jsonMetaData.type || '';
            const filingSize = stream.bytesRead; 
            
            // Extract header information (first 100 characters of SGML)
            //const header1000 = sgmlLines.join('\n').substring(0, 1999);  rather than save to db, use grep file 
            
            // Determine boolean flags based on metadata
            const isCorrespondence = jsonMetaData.correspondence ? 1 : 0;
            const isDeletion = jsonMetaData.deletion ? 1 : 0;
            const isCorrection = jsonMetaData.correction ? 1 : 0;
            const isPrivateToPublic = jsonMetaData.private_to_public ? 1 : 0;
            
            // Insert/Update feeds_file table
            //const accessionNumberInt = accessionNumber ? common.extractIntId(accessionNumber) : 0;  too big int for node to handle!
            const feedsFileQuery = `
                INSERT INTO feeds_file (
                    feeds_date, feeds_file, filing_size, adsh,
                    filing_date, form_type, is_correspondence, is_deletion, 
                    is_correction, is_private_to_public
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    filing_size = VALUES(filing_size),
                    adsh = VALUES(adsh),
                    filing_date = VALUES(filing_date),
                    form_type = VALUES(form_type),
                    is_correspondence = VALUES(is_correspondence),
                    is_deletion = VALUES(is_deletion),
                    is_correction = VALUES(is_correction),
                    is_private_to_public = VALUES(is_private_to_public)
            `;
            
            dbPromises.push(common.runQuery('POC', feedsFileQuery, [
                feedDate, filename, filingSize, accessionNumber,
                filingDate, formType, isCorrespondence, isDeletion, isCorrection, isPrivateToPublic
            ]));
            
            //START:  PROCESS ENTITIES ASSOCIATED WITH SUBMISSION 
            const associatedEntityTypes = {  //all the sneaky properties / arrays where filer data is stored
                'filer': 'F',
                'reporting_owner': 'RO',
                'issuer': 'I',
                'subject_company': 'SC',
                'depositor': 'D',  //<DEPOSITOR>
                'securitizer': 'S',  //<SECURITIZER>
                'filed_for': 'FF',  //<FILED-FOR>
                'issuing_entity': 'IE',  //<ISSUING_ENTITY>
                'filed_by': 'FB',  //<FILED-BY>
                'underwriter': 'U'  //<UNDERWRITER>
            };

            const processFilers = (filers, filerType) => {
                if (filers && Array.isArray(filers)) {
                    filers.forEach((filer, index) => {
                        let entityData = filer.company_data || filer.owner_data;
                        if (entityData && entityData.cik && entityData.conformed_name) {
                            const feedsFileCikQuery = `
                                INSERT INTO feeds_file_cik (
                                    feeds_date, feeds_file, cik, filer_type, entity_name
                                ) VALUES (?, ?, ?, ?, ?)
                                ON DUPLICATE KEY UPDATE
                                    filer_type = VALUES(filer_type),
                                    entity_name = VALUES(entity_name)
                            `;
                            dbPromises.push(common.runQuery('POC', feedsFileCikQuery, [
                                feedDate, filename, entityData.cik, filerType, entityData.conformed_name
                            ]));
                        }
                    });
                }
            };

            for(const filerType in associatedEntityTypes){
                if(jsonMetaData[filerType]) {
                    if(Array.isArray(jsonMetaData[filerType])) {
                        processFilers(jsonMetaData[filerType], associatedEntityTypes[filerType]);
                    } else {
                        processFilers([jsonMetaData[filerType]], associatedEntityTypes[filerType]);
                    }
                }
            };
            //END:  PROCESS ENTITIES ASSOCIATED WITH SUBMISSION 

            //START:  PROCESS SERIES AND CLASSES ASSOCIATED WITH SUBMISSION 
            function processSeriesAndClasses(ContractsSeries, isNew, globalOwnerCik) {
                ContractsSeries.forEach(series => {
                    if (series.series_id && series.series_name) {
                        const feedsFileSeriesQuery = `
                            INSERT INTO feeds_file_series (
                                feeds_date, feeds_file, cik, is_new, series_id, series_name
                            ) VALUES (?, ?, ?, ?, ?, ?)
                            ON DUPLICATE KEY UPDATE
                                series_name = VALUES(series_name),
                                is_new = VALUES(is_new)`;
                        dbPromises.push(common.runQuery(
                            'POC', 
                            feedsFileSeriesQuery, 
                            [feedDate, filename, globalOwnerCik || series.owner_cik, isNew, common.extractIntId(series.series_id), series.series_name]
                        ));

                        // Process classes
                        if (series.class_contract && Array.isArray(series.class_contract)) {
                            series.class_contract.forEach(classContract => {
                                if (classContract.class_contract_id && classContract.class_contract_name) {
                                    const feedsFileClassQuery = `
                                        INSERT INTO feeds_file_class (
                                            feeds_date, feeds_file, cik, series_id, class_id, class_name
                                        ) VALUES (?, ?, ?, ?, ?, ?)
                                        ON DUPLICATE KEY UPDATE
                                            class_name = VALUES(class_name)`;
                                    dbPromises.push(common.runQuery(
                                        'POC', 
                                        feedsFileClassQuery, 
                                        [feedDate, filename, globalOwnerCik || series.owner_cik, common.extractIntId(series.series_id), common.extractIntId(classContract.class_contract_id), classContract.class_contract_name]
                                    ));
                                } else {
                                    console.error('missing class_id or class_name for class contract', classContract);
                                }
                            });
                        }
                    } else {
                        console.error('missing series_id or series_name for series', series);
                    }    
                });
            }

            // Note: Series processing has been moved to after writeSubmissionHeaderRecords (around line 688)
            // to properly handle new_series, new_classes_contracts, and existing_series with sequence fields
            
            //START:  PROCESS DOCUMENTS METADATA
            if (jsonMetaData.document && Array.isArray(jsonMetaData.document)) {
                jsonMetaData.document.forEach((doc, index) => {
                    if (doc.filename && doc.sequence) {
                        const feedsFileDocumentQuery = `
                            INSERT INTO feeds_file_document (
                                feeds_date, feeds_file, sequence, file_name, file_type, 
                                file_description, file_size, file_size_raw, file_ext
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ON DUPLICATE KEY UPDATE
                                file_name = VALUES(file_name),
                                file_type = VALUES(file_type),
                                file_description = VALUES(file_description),
                                file_size = VALUES(file_size),
                                file_size_raw = VALUES(file_size_raw),
                                file_ext = VALUES(file_ext)
                        `;           
                        const fileExt = doc.filename.split('.').pop() || '';
                        dbPromises.push(common.runQuery('POC', feedsFileDocumentQuery, [
                            feedDate, filename, doc.sequence, doc.filename, doc.type || '',
                            doc.description || '', doc.fileLength || null, doc.lengthRaw || null, fileExt
                        ]));
                    }
                });
            }
            //END:  PROCESS DOCUMENTS METADATA
            
        } catch (error) {
            console.error('Error writing feeds metadata:', error);
        }
    }

    /**
     * Writes submission metadata to submission_* tables
     * @param {Object} jsonMetaData - The JSON metadata object from SGML processing
     * @param {string} feedDate - The feed date (YYYYMMDD format)
     * @param {string} filename - The filename being processed
     */
    function writeSubmissionHeaderRecords(jsonMetaData, feedDate, filename) {
        try {
            const adsh = jsonMetaData.accession_number || '';
            if (!adsh) {
                console.error('Missing accession number in submission metadata');
                return;
            }

            // Insert main submission record FIRST (must complete before child records)
            const submissionQuery = `
                INSERT INTO submission (
                    adsh, type, public, public_document_count, period, period_start, filing_date,
                    date_of_filing_date_change, effectiveness_date, acceptance_datetime,
                    received_date, action_date, public_rel_date,
                    file_number, film_number, is_paper,
                    ma_i_individual, previous_accession_number, withdrawn_accession_number,
                    public_reference_acc, reference_462b, confirming_copy, private_to_public,
                    abs_asset_class, abs_sub_asset_class, abs_rule,
                    is_filer_a_new_registrant, is_filer_a_well_known_seasoned_issuer,
                    is_fund_24f2_eligible, filed_pursuant_to_general_instruction_a2,
                    registered_entity, no_annual_activity, no_initial_period_activity,
                    no_quarterly_activity, category, calendar_year_ending,
                    depositor_cik, sponsor_cik, resource_ext_issuer, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    type = VALUES(type),
                    public = VALUES(public),
                    public_document_count = VALUES(public_document_count),
                    period = VALUES(period),
                    period_start = VALUES(period_start),
                    filing_date = VALUES(filing_date),
                    date_of_filing_date_change = VALUES(date_of_filing_date_change),
                    effectiveness_date = VALUES(effectiveness_date),
                    acceptance_datetime = VALUES(acceptance_datetime),
                    received_date = VALUES(received_date),
                    action_date = VALUES(action_date),
                    public_rel_date = VALUES(public_rel_date),
                    file_number = VALUES(file_number),
                    film_number = VALUES(film_number),
                    is_paper = VALUES(is_paper),
                    ma_i_individual = VALUES(ma_i_individual),
                    previous_accession_number = VALUES(previous_accession_number),
                    withdrawn_accession_number = VALUES(withdrawn_accession_number),
                    public_reference_acc = VALUES(public_reference_acc),
                    reference_462b = VALUES(reference_462b),
                    confirming_copy = VALUES(confirming_copy),
                    private_to_public = VALUES(private_to_public),
                    abs_asset_class = VALUES(abs_asset_class),
                    abs_sub_asset_class = VALUES(abs_sub_asset_class),
                    abs_rule = VALUES(abs_rule),
                    is_filer_a_new_registrant = VALUES(is_filer_a_new_registrant),
                    is_filer_a_well_known_seasoned_issuer = VALUES(is_filer_a_well_known_seasoned_issuer),
                    is_fund_24f2_eligible = VALUES(is_fund_24f2_eligible),
                    filed_pursuant_to_general_instruction_a2 = VALUES(filed_pursuant_to_general_instruction_a2),
                    registered_entity = VALUES(registered_entity),
                    no_annual_activity = VALUES(no_annual_activity),
                    no_initial_period_activity = VALUES(no_initial_period_activity),
                    no_quarterly_activity = VALUES(no_quarterly_activity),
                    category = VALUES(category),
                    calendar_year_ending = VALUES(calendar_year_ending),
                    depositor_cik = VALUES(depositor_cik),
                    sponsor_cik = VALUES(sponsor_cik),
                    resource_ext_issuer = VALUES(resource_ext_issuer),
                    timestamp = VALUES(timestamp)
            `;
            
            // Execute submission insert first, then chain the dependent inserts
            const submissionPromise = common.runQuery('POC', submissionQuery, [
                adsh,
                jsonMetaData.type || '',
                1, // public flag - always 1 for public feeds
                jsonMetaData.public_document_count || null,
                jsonMetaData.period || null,
                jsonMetaData.period_start || null,
                jsonMetaData.filing_date || null,
                jsonMetaData.date_of_filing_date_change || null,
                jsonMetaData.effectiveness_date || null,
                jsonMetaData.acceptance_datetime || null,
                jsonMetaData.received_date || null,
                jsonMetaData.action_date || null,
                jsonMetaData.public_rel_date || null,
                jsonMetaData.file_number || null,
                jsonMetaData.film_number || null,
                jsonMetaData.paper ? 1 : 0,
                jsonMetaData.ma_i_individual || null,
                jsonMetaData.previous_accession_number || null,
                jsonMetaData.withdrawn_accession_number || null,
                jsonMetaData.public_reference_acc || null,
                jsonMetaData.reference_462b || null,
                jsonMetaData.confirming_copy || null,
                jsonMetaData.private_to_public || null,
                jsonMetaData.abs_asset_class || null,
                jsonMetaData.abs_sub_asset_class || null,
                jsonMetaData.abs_rule || null,
                jsonMetaData.is_filer_a_new_registrant || null,
                jsonMetaData.is_filer_a_well_known_seasoned_issuer || null,
                jsonMetaData.is_fund_24f2_eligible || null,
                jsonMetaData.filed_pursuant_to_general_instruction_a2 || null,
                jsonMetaData.registered_entity || null,
                jsonMetaData.no_annual_activity || null,
                jsonMetaData.no_initial_period_activity || null,
                jsonMetaData.no_quarterly_activity || null,
                jsonMetaData.category || null,
                jsonMetaData.calendar_year_ending || null,
                jsonMetaData.depositor_cik || null,
                jsonMetaData.sponsor_cik || null,
                jsonMetaData.resource_ext_issuer || null,
                jsonMetaData.timestamp || null
            ]).then(() => {
                // After submission is inserted, insert all dependent records
                insertDependentRecords(jsonMetaData, feedDate, filename, adsh);
            });
            
            dbPromises.push(submissionPromise);
            
        } catch (error) {
            console.error('Error writing submission metadata:', error);
        }
    }
    
    /**
     * Inserts dependent records after submission record is created
     * @param {Object} jsonMetaData - The JSON metadata object
     * @param {string} feedDate - The feed date
     * @param {string} filename - The filename
     * @param {string} adsh - The accession number
     */
    function insertDependentRecords(jsonMetaData, feedDate, filename, adsh) {
        try {

            // Process entities (filer, issuer, reporting_owner, subject_company, etc.)
            const associatedEntityTypes = {
                'filer': 'F',
                'reporting_owner': 'RO',
                'issuer': 'I',
                'subject_company': 'SC',
                'depositor': 'D',
                'securitizer': 'S',
                'filed_for': 'FF',
                'issuing_entity': 'IE',
                'filed_by': 'FB',
                'underwriter': 'U'
            };

            const processEntities = (entities, filerCode) => {
                if (!entities) return;
                const entityArray = Array.isArray(entities) ? entities : [entities];
                
                entityArray.forEach((entity, index) => {
                    const entityData = entity.company_data || entity.owner_data;
                    if (!entityData || !entityData.cik) return;

                    const filingValues = entity.filing_values || {};
                    const businessAddr = entity.business_address || {};
                    const mailAddr = entity.mail_address || {};

                    const entityQuery = `
                        INSERT INTO submission_entity (
                            adsh, filer_code, entity_sequence, cik, conformed_name, organization_name,
                            irs_number, state_of_incorporation, fiscal_year_end, assigned_sic,
                            filing_form_type, filing_act, filing_file_number, filing_film_number,
                            business_street1, business_street2, business_city, business_state,
                            business_zip, business_phone,
                            mail_street1, mail_street2, mail_city, mail_state, mail_zip
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                            entity_sequence = VALUES(entity_sequence),
                            conformed_name = VALUES(conformed_name),
                            organization_name = VALUES(organization_name),
                            irs_number = VALUES(irs_number),
                            state_of_incorporation = VALUES(state_of_incorporation),
                            fiscal_year_end = VALUES(fiscal_year_end),
                            assigned_sic = VALUES(assigned_sic),
                            filing_form_type = VALUES(filing_form_type),
                            filing_act = VALUES(filing_act),
                            filing_file_number = VALUES(filing_file_number),
                            filing_film_number = VALUES(filing_film_number),
                            business_street1 = VALUES(business_street1),
                            business_street2 = VALUES(business_street2),
                            business_city = VALUES(business_city),
                            business_state = VALUES(business_state),
                            business_zip = VALUES(business_zip),
                            business_phone = VALUES(business_phone),
                            mail_street1 = VALUES(mail_street1),
                            mail_street2 = VALUES(mail_street2),
                            mail_city = VALUES(mail_city),
                            mail_state = VALUES(mail_state),
                            mail_zip = VALUES(mail_zip)
                    `;

                    dbPromises.push(common.runQuery('POC', entityQuery, [
                        adsh, filerCode, index, entityData.cik, entityData.conformed_name || '',
                        entityData.organization_name || null,
                        entityData.irs_number || null,
                        entityData.state_of_incorporation || null,
                        entityData.fiscal_year_end || null,
                        entityData.assigned_sic || null,
                        filingValues.form_type || null,
                        filingValues.act || null,
                        filingValues.file_number || null,
                        filingValues.film_number || null,
                        businessAddr.street1 || null,
                        businessAddr.street2 || null,
                        businessAddr.city || null,
                        businessAddr.state || null,
                        businessAddr.zip || null,
                        businessAddr.phone || null,
                        mailAddr.street1 || null,
                        mailAddr.street2 || null,
                        mailAddr.city || null,
                        mailAddr.state || null,
                        mailAddr.zip || null
                    ]));

                    // Process former_company array
                    function processFormerCompany(formerNamesArray) {
                        if (formerNamesArray && Array.isArray(formerNamesArray)) {
                            formerNamesArray.forEach((former, formerIndex) => {
                                if (former.former_conformed_name && former.date_changed) {
                                    const formerCompanyQuery = `
                                        INSERT INTO submission_former_name (adsh, cik, former_conformed_name, date_changed, former_name_sequence)
                                        VALUES (?, ?, ?, ?, ?)
                                        ON DUPLICATE KEY UPDATE 
                                        former_conformed_name = VALUES(former_conformed_name),
                                        date_changed = VALUES(date_changed),
                                        former_name_sequence = VALUES(former_name_sequence)
                                    `;
                                    dbPromises.push(common.runQuery('POC', formerCompanyQuery, [
                                        adsh, entityData.cik, former.former_conformed_name, former.date_changed, formerIndex
                                    ]));
                                }
                            });
                        }
                    }
                    processFormerCompany(entity.former_company);
                    processFormerCompany(entity.former_name);  //form 3, 4, 5 for reporting_owner only
                });
            };

            // Process all entity types
            for (const [entityType, filerCode] of Object.entries(associatedEntityTypes)) {
                if (jsonMetaData[entityType]) {
                    processEntities(jsonMetaData[entityType], filerCode);
                }
            }

            // Process documents
            if (jsonMetaData.document && Array.isArray(jsonMetaData.document)) {
                jsonMetaData.document.forEach(doc => {
                    if (doc.filename && doc.sequence) {
                        const documentQuery = `
                            INSERT INTO submission_document (adsh, sequence, type, filename, description)
                            VALUES (?, ?, ?, ?, ?)
                            ON DUPLICATE KEY UPDATE
                                type = VALUES(type),
                                filename = VALUES(filename),
                                description = VALUES(description)
                        `;
                        dbPromises.push(common.runQuery('POC', documentQuery, [
                            adsh,
                            parseInt(doc.sequence),
                            doc.type || null,
                            doc.filename,
                            doc.description || null
                        ]));
                    }
                });
            }

            // Process series and classes
            if (jsonMetaData.series_and_classes_contracts_data) {
                const seriesData = jsonMetaData.series_and_classes_contracts_data;
                
                const processSeries = (seriesArray, globalOwnerCik, seriesSource) => {
                    if (!seriesArray || !Array.isArray(seriesArray)) return;
                    
                    seriesArray.forEach((series, seriesIndex) => {
                        if (series.series_id && series.series_name) {
                            const seriesIdBigint = common.extractIntId(series.series_id);
                            const ownerCik = globalOwnerCik || series.owner_cik;
                            
                            const seriesQuery = `
                                INSERT INTO submission_series (adsh, series_id, owner_cik, series_name, series_source, series_sequence)
                                VALUES (?, ?, ?, ?, ?, ?)
                                ON DUPLICATE KEY UPDATE
                                    owner_cik = VALUES(owner_cik),
                                    series_name = VALUES(series_name),
                                    series_source = VALUES(series_source),
                                    series_sequence = VALUES(series_sequence)
                            `;
                            
                            // Insert series first, then insert class contracts
                            const seriesPromise = common.runQuery('POC', seriesQuery, [
                                adsh, seriesIdBigint, ownerCik, series.series_name, seriesSource, seriesIndex
                            ]).then(() => {
                                // Process class contracts after series is inserted
                                if (series.class_contract && Array.isArray(series.class_contract)) {
                                    series.class_contract.forEach((classContract, classIndex) => {
                                        if (classContract.class_contract_id && classContract.class_contract_name) {
                                            const classIdBigint = common.extractIntId(classContract.class_contract_id);
                                            
                                            const classQuery = `
                                                INSERT INTO submission_class_contract (
                                                    adsh, series_source, series_id, series_sequence, class_contract_id, 
                                                    class_contract_name, class_contract_ticker_symbol, class_sequence
                                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                                                ON DUPLICATE KEY UPDATE
                                                    class_contract_name = VALUES(class_contract_name),
                                                    class_contract_ticker_symbol = VALUES(class_contract_ticker_symbol),
                                                    class_sequence = VALUES(class_sequence)
                                            `;
                                            dbPromises.push(common.runQuery('POC', classQuery, [
                                                adsh, seriesSource, seriesIdBigint, seriesIndex, classIdBigint,
                                                classContract.class_contract_name,
                                                classContract.class_contract_ticker_symbol || null,
                                                classIndex
                                            ]));
                                        }
                                    });
                                }
                            });
                            
                            dbPromises.push(seriesPromise);
                        }
                    });
                };

                // Process existing and new series
                if (seriesData.existing_series_and_classes_contracts) {
                    processSeries(
                        seriesData.existing_series_and_classes_contracts.series,
                        seriesData.existing_series_and_classes_contracts.owner_cik,
                        'existing_series'
                    );
                }
                if (seriesData.new_series_and_classes_contracts) {
                    // Handle new_series (N-1A, POS AMI forms)
                    if (seriesData.new_series_and_classes_contracts.new_series) {
                        processSeries(
                            seriesData.new_series_and_classes_contracts.new_series,
                            seriesData.new_series_and_classes_contracts.owner_cik,
                            'new_series'
                        );
                    }
                    // Handle new_classes_contracts (485APOS, 485BPOS, N-6 forms)
                    if (seriesData.new_series_and_classes_contracts.new_classes_contracts) {
                        processSeries(
                            seriesData.new_series_and_classes_contracts.new_classes_contracts,
                            seriesData.new_series_and_classes_contracts.owner_cik,
                            'new_classes_contracts'
                        );
                    }
                }
            }

            // Process items (for 8-K and other forms)
            if (jsonMetaData.item && Array.isArray(jsonMetaData.item)) {
                jsonMetaData.item.forEach(item => {
                    if (item) {
                        const itemQuery = `
                            INSERT INTO submission_item (adsh, item_code)
                            VALUES (?, ?)
                            ON DUPLICATE KEY UPDATE item_code = VALUES(item_code)
                        `;
                        dbPromises.push(common.runQuery('POC', itemQuery, [adsh, item]));
                    }
                });
            } else if (jsonMetaData.items && Array.isArray(jsonMetaData.items)) {
                // Handle ITEMS tag (plural)
                jsonMetaData.items.forEach(item => {
                    if (item) {
                        const itemQuery = `
                            INSERT INTO submission_item (adsh, item_code)
                            VALUES (?, ?)
                            ON DUPLICATE KEY UPDATE item_code = VALUES(item_code)
                        `;
                        dbPromises.push(common.runQuery('POC', itemQuery, [adsh, item]));
                    }
                });
            }

            // Process references_429
            if (jsonMetaData.references_429 && Array.isArray(jsonMetaData.references_429)) {
                jsonMetaData.references_429.forEach((reference, index) => {
                    if (reference) {
                        const referenceQuery = `
                            INSERT INTO submission_references_429 (adsh, reference_429, reference_sequence)
                            VALUES (?, ?, ?)
                            ON DUPLICATE KEY UPDATE 
                                reference_429 = VALUES(reference_429),
                                reference_sequence = VALUES(reference_sequence)
                        `;
                        dbPromises.push(common.runQuery('POC', referenceQuery, [adsh, reference, index]));
                    }
                });
            }

            // Process group_members
            if (jsonMetaData.group_members && Array.isArray(jsonMetaData.group_members)) {
                jsonMetaData.group_members.forEach((member, index) => {
                    if (member) {
                        const memberQuery = `
                            INSERT INTO submission_group_members (adsh, group_member, group_member_sequence)
                            VALUES (?, ?, ?)
                            ON DUPLICATE KEY UPDATE 
                                group_member = VALUES(group_member),
                                group_member_sequence = VALUES(group_member_sequence)
                        `;
                        dbPromises.push(common.runQuery('POC', memberQuery, [adsh, member, index]));
                    }
                });
            }

            // Process merger data from series_and_classes_contracts_data (N-14 forms)
            // Must be done sequentially: mergers -> series -> class_contracts (due to foreign keys)
            if (jsonMetaData.series_and_classes_contracts_data?.merger_series_and_classes_contracts?.merger) {
                const mergers = jsonMetaData.series_and_classes_contracts_data.merger_series_and_classes_contracts.merger;
                
                // Store query parameters (not promises) to delay execution
                const seriesQueries = [];
                const classQueries = [];
                
                mergers.forEach((merger, mergerIndex) => {
                    // Process acquiring_data (series_type = 'A')
                    if (merger.acquiring_data?.cik && merger.acquiring_data?.series) {
                        const acquiringCik = merger.acquiring_data.cik;
                        
                        merger.acquiring_data.series.forEach((series, seriesIndex) => {
                            if (series.series_id && series.series_name) {
                                const seriesIdInt = common.extractIntId(series.series_id);
                                
                                // Collect series query parameters
                                seriesQueries.push({
                                    query: `INSERT INTO submission_merger_series 
                                            (adsh, merger_sequence, series_type, entity_cik, entity_sequence, series_id, series_name, series_sequence)
                                            VALUES (?, ?, 'A', ?, 0, ?, ?, ?)
                                            ON DUPLICATE KEY UPDATE 
                                                series_name = VALUES(series_name),
                                                series_sequence = VALUES(series_sequence)`,
                                    params: [adsh, mergerIndex, acquiringCik, seriesIdInt, series.series_name, seriesIndex]
                                });
                                
                                // Collect class contract query parameters
                                if (series.class_contract && Array.isArray(series.class_contract)) {
                                    series.class_contract.forEach((classContract, classIndex) => {
                                        if (classContract.class_contract_id && classContract.class_contract_name) {
                                            const classIdInt = common.extractIntId(classContract.class_contract_id);
                                            
                                            classQueries.push({
                                                query: `INSERT INTO submission_merger_class_contract 
                                                        (adsh, merger_sequence, series_type, entity_cik, entity_sequence, series_id, series_sequence,
                                                         class_contract_id, class_contract_name, class_contract_ticker_symbol, class_sequence)
                                                        VALUES (?, ?, 'A', ?, 0, ?, ?, ?, ?, ?, ?)
                                                        ON DUPLICATE KEY UPDATE 
                                                            class_contract_name = VALUES(class_contract_name),
                                                            class_contract_ticker_symbol = VALUES(class_contract_ticker_symbol),
                                                            class_sequence = VALUES(class_sequence)`,
                                                params: [adsh, mergerIndex, acquiringCik, seriesIdInt, seriesIndex, classIdInt, 
                                                         classContract.class_contract_name, classContract.class_contract_ticker_symbol || null, classIndex]
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    }
                    
                    // Process target_data (series_type = 'T')
                    if (merger.target_data && Array.isArray(merger.target_data)) {
                        merger.target_data.forEach((target, targetIndex) => {
                            if (target.cik) {
                                const targetCik = target.cik;
                                
                                // Check if target has series data
                                if (target.series && Array.isArray(target.series) && target.series.length > 0) {
                                    // Target has series data - process normally
                                    target.series.forEach((series, seriesIndex) => {
                                        if (series.series_id && series.series_name) {
                                            const seriesIdInt = common.extractIntId(series.series_id);
                                            
                                            // Collect series query parameters
                                            seriesQueries.push({
                                                query: `INSERT INTO submission_merger_series 
                                                        (adsh, merger_sequence, series_type, entity_cik, entity_sequence, series_id, series_name, series_sequence)
                                                        VALUES (?, ?, 'T', ?, ?, ?, ?, ?)
                                                        ON DUPLICATE KEY UPDATE 
                                                            series_name = VALUES(series_name),
                                                            series_sequence = VALUES(series_sequence)`,
                                                params: [adsh, mergerIndex, targetCik, targetIndex, seriesIdInt, series.series_name, seriesIndex]
                                            });
                                            
                                            // Collect class contract query parameters
                                            if (series.class_contract && Array.isArray(series.class_contract)) {
                                                series.class_contract.forEach((classContract, classIndex) => {
                                                    if (classContract.class_contract_id && classContract.class_contract_name) {
                                                        const classIdInt = common.extractIntId(classContract.class_contract_id);
                                                        
                                                        classQueries.push({
                                                            query: `INSERT INTO submission_merger_class_contract 
                                                                    (adsh, merger_sequence, series_type, entity_cik, entity_sequence, series_id, series_sequence,
                                                                     class_contract_id, class_contract_name, class_contract_ticker_symbol, class_sequence)
                                                                    VALUES (?, ?, 'T', ?, ?, ?, ?, ?, ?, ?, ?)
                                                                    ON DUPLICATE KEY UPDATE 
                                                                        class_contract_name = VALUES(class_contract_name),
                                                                        class_contract_ticker_symbol = VALUES(class_contract_ticker_symbol),
                                                                        class_sequence = VALUES(class_sequence)`,
                                                            params: [adsh, mergerIndex, targetCik, targetIndex, seriesIdInt, seriesIndex, classIdInt, 
                                                                     classContract.class_contract_name, classContract.class_contract_ticker_symbol || null, classIndex]
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    });
                                } else {
                                    // Target has CIK only, no series data - use series_id = NULL
                                    seriesQueries.push({
                                        query: `INSERT INTO submission_merger_series 
                                                (adsh, merger_sequence, series_type, entity_cik, entity_sequence, series_id, series_name, series_sequence)
                                                VALUES (?, ?, 'T', ?, ?, NULL, '', 0)
                                                ON DUPLICATE KEY UPDATE 
                                                    series_name = VALUES(series_name),
                                                    series_sequence = VALUES(series_sequence)`,
                                        params: [adsh, mergerIndex, targetCik, targetIndex]
                                    });
                                }
                            }
                        });
                    }
                });
                
                // Execute in proper order with delayed promise creation
                // Execute queries in proper order to satisfy foreign key constraints:
                // 1. Series records, 2. Class contract records
                const mergerPromise = (async () => {
                    // Stage 1: Execute all series inserts
                    await Promise.all(seriesQueries.map(q => common.runQuery('POC', q.query, q.params)));
                    
                    // Stage 2: Execute all class contract inserts (only after series complete)
                    await Promise.all(classQueries.map(q => common.runQuery('POC', q.query, q.params)));
                })();
                
                dbPromises.push(mergerPromise);
            }

            // Process rule data (for SD and other forms)
            if (jsonMetaData.rule && jsonMetaData.rule.rule_name) {
                const ruleQuery = `
                    INSERT INTO submission_rule (adsh, rule_name)
                    VALUES (?, ?)
                    ON DUPLICATE KEY UPDATE rule_name = VALUES(rule_name)
                `;
                const rulePromise = common.runQuery('POC', ruleQuery, [
                    adsh, jsonMetaData.rule.rule_name
                ]).then(() => {
                    // After rule is inserted, insert rule items
                    if (jsonMetaData.rule.item && Array.isArray(jsonMetaData.rule.item)) {
                        jsonMetaData.rule.item.forEach((ruleItem, index) => {
                            if (ruleItem && ruleItem.item_number && ruleItem.item_period) {
                                const ruleItemQuery = `
                                    INSERT INTO submission_rule_item (adsh, item_number, item_period, item_sequence)
                                    VALUES (?, ?, ?, ?)
                                    ON DUPLICATE KEY UPDATE 
                                        item_number = VALUES(item_number),
                                        item_period = VALUES(item_period),
                                        item_sequence = VALUES(item_sequence)
                                `;
                                dbPromises.push(common.runQuery('POC', ruleItemQuery, [
                                    adsh, ruleItem.item_number, ruleItem.item_period, index
                                ]));
                            }
                        });
                    }
                });
                dbPromises.push(rulePromise);
            }

        } catch (error) {
            console.error('Error writing submission metadata:', error);
        }
    }


    async function messageParentFinished(status){
        //console.log(`submission complete; messaging parent`);
        const dissemFileSize = stream.bytesRead;   
        readInterface.close();
        stream.close();
        //console.log(`indexed form ${result.form} in ${result.processTime}ms`);
        //console.log(result);
        await Promise.all(fileWritePromises);
        await Promise.all(dbPromises);
/*         await common.runQuery('POC', `update efts_submissions
            set last_indexed=now(), 
            files_total=${submission.docs.length}, 
            files_indexed=${submission.docs.reduce((count, doc)=> {return count + (doc.lengthIndexed?1:0)}, 0)}, 
            bytes_index=${submission.docs.reduce((bytes, doc)=> {return bytes + (doc.lengthIndexed||0)}, 0)}
            where adsh = '${submission.adsh}'`); */
        let result = {
            status: status,
            filePath: processInfo.path,
            fileName: processInfo.name,
            entities: submission.entities,
            form: submission.metadata.type,
            adsh: submission.metadata.accession_number,
            processedDocumentCount: submission.docs.length,
            processedByteCount: dissemFileSize,
            processNum: processInfo.processNum,
            processTime: (new Date()).getTime()-start,
        };
        submission.readState = READ_STATES.MESSAGED_PARENT;
        process.send(result);
        //console.log('sent result to parent', result);
        return result;
    }
    
};

//used to analyze SGL path across all filing to ensure compliance
function findPaths(headerLines, partialPropertyTag, paths){
    headerLines.forEach((headerLine, index,)=>{
        if(headerLine.indexOf(partialPropertyTag) != -1 && headerLine.substr(0,2)!='</'){  //find path back to <SUBMISSION>
            let path = [headerLine.split('>')[0]+'>'];
            for(let i=index-1;i>=0;i--){
                if(headerLines[i].substr(headerLines[i].length-1)=='>'){ //section start or end tag
                    if(headerLines[i].substr(0,2)=='</'){
                        path.push(headerLines[i]);
                    } else {
                        if(headerLines[i].substr(1) == path[path.length-1].substr(2)){
                            path.pop(); //matching opening and closing tags
                        } else {
                            path.push(headerLines[i]);
                        }
                    }
                }
            }
            path = path.join(':');
            paths[path] = (paths[path] || 0) + 1;
        }
    });
}

// Process disconnect handler removed since this is no longer a child process

function runGarbageCollection(processInfo){
    if(global.gc) {
        console.log(process.memoryUsage());
        console.log(`low memory detected in P${processInfo.processNum} while ingesting ${processInfo.name} => collecting garbage...`);
        global.gc();
        console.log(process.memoryUsage());
    } else console.log('global.gc not set');
}


function uunencodePadding(text){  //critical to pad lines
    const UUENCODE_PADDED_LINE_LENGTH = 61;
    let paddingLength =  Math.max(0, UUENCODE_PADDED_LINE_LENGTH-text.length);
    return text + (paddingLength?' '.repeat(paddingLength):'');
}
