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
    let processedByteCount = 0,
        submission = { //submission has module level scope to be able to report out when killed
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
                processedByteCount += doc.fileLength;
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
                doc.fileLength += line.length + 1;  //+1 for the newline character when joined
                if (processInfo.writeExtractedFiles) { //determined above to have a valid ext and be indexable (and not blank)
                    doc.lines.push(isBinaryFile ? uunencodePadding(line) : line);  
                }
            }
        }

        if (submission.readState == READ_STATES.DOC_HEADER) {
            if (tLine == '<DOCUMENT>') {  //fall though from decisions in INIT and DOC_FOOTER sections above
                submission.docs.push({
                    lengthRaw: 0,
                    fileLength: 0,
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
            if(processInfo.writeSgmlMetaDataFiles) {
                fileWritePromises.push(writeFile(docFilingFolder + processInfo.feedDate + '_' + processInfo.name + '.sgml', sgmlLines.join('\n'), 'utf-8'));
            }
            if(processInfo.writeJsonMetaDataFiles) {
                fileWritePromises.push(writeFile(docFilingFolder + processInfo.feedDate + '_' + processInfo.name + '.json', JSON.stringify(submissionMetadata, null, 2), 'utf-8'));
            }
            
            // Copy source file to filing folder if it's a correction
            if(submissionMetadata.submission.correction) {
                const sourceFile = processInfo.path + processInfo.name;
                const destFile = docFilingFolder + processInfo.name;
                fileWritePromises.push(copyFile(sourceFile, destFile));
            }
            
            // Write feeds metadata to database
            if (submissionMetadata && submissionMetadata.submission) {
                writeFeedsMetaData(submissionMetadata.submission, processInfo.feedDate, processInfo.name);
            }
            
            writeSubmissionHeaderRecords(submissionMetadata.submission, processInfo.feedDate, processInfo.name);  //insert queries run async and promises pushed onto dbPromises array
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
            const filingSize = submission.docs.reduce((total, doc) => total + (doc.fileLength || 0), 0);
            
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
                                series_name = VALUES(series_name)`;
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

            // Process series and classes from series_and_classes_contracts_data
            if (jsonMetaData.series_and_classes_contracts_data){
                let seriesData = jsonMetaData.series_and_classes_contracts_data;
                if(seriesData.existing_series_and_classes_contracts 
                    && seriesData.existing_series_and_classes_contracts.series 
                    && Array.isArray(seriesData.existing_series_and_classes_contracts.series)) 
                        processSeriesAndClasses(seriesData.existing_series_and_classes_contracts.series, 0, seriesData.existing_series_and_classes_contracts.owner_cik);
                if (seriesData.new_series_and_classes_contracts 
                    && seriesData.new_series_and_classes_contracts.new_series 
                    && Array.isArray(seriesData.new_series_and_classes_contracts.new_series)) 
                        processSeriesAndClasses(seriesData.new_series_and_classes_contracts.new_series, 1, seriesData.new_series_and_classes_contracts.owner_cik);
            }
            //END:  PROCESS SERIES AND CLASSES ASSOCIATED WITH SUBMISSION 
            
            
            //START:  PROCESS DOCUMENTS METADATA
            if (jsonMetaData.document && Array.isArray(jsonMetaData.document)) {
                jsonMetaData.document.forEach((doc, index) => {
                    if (doc.filename && doc.sequence) {
                        const feedsFileDocumentQuery = `
                            INSERT INTO feeds_file_document (
                                feeds_date, feeds_file, sequence, file_name, file_type, 
                                file_description, file_size, file_ext
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            ON DUPLICATE KEY UPDATE
                                file_type = VALUES(file_type),
                                file_description = VALUES(file_description),
                                file_size = VALUES(file_size),
                                file_ext = VALUES(file_ext)
                        `;           
                        const fileExt = doc.filename.split('.').pop() || '';
                        const fileSize = (
                            submission.docs && submission.docs[index] && submission.docs[index].fileSize 
                            ? submission.docs[index].fileSize
                            : null
                        );
                        dbPromises.push(common.runQuery('POC', feedsFileDocumentQuery, [
                            feedDate, filename, doc.sequence, doc.filename, doc.type || '',
                            doc.description || '', fileSize, fileExt
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
                    adsh, type, public, public_document_count, period, filing_date,
                    date_of_filing_date_change, effectiveness_date, acceptance_datetime,
                    file_number, film_number, is_paper
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    type = VALUES(type),
                    public_document_count = VALUES(public_document_count),
                    period = VALUES(period),
                    filing_date = VALUES(filing_date),
                    date_of_filing_date_change = VALUES(date_of_filing_date_change),
                    effectiveness_date = VALUES(effectiveness_date),
                    acceptance_datetime = VALUES(acceptance_datetime),
                    file_number = VALUES(file_number),
                    film_number = VALUES(film_number),
                    is_paper = VALUES(is_paper)
            `;
            
            // Execute submission insert first, then chain the dependent inserts
            const submissionPromise = common.runQuery('POC', submissionQuery, [
                adsh,
                jsonMetaData.type || '',
                1, // public flag - always 1 for public feeds
                jsonMetaData.public_document_count || null,
                jsonMetaData.period || null,
                jsonMetaData.filing_date || null,
                jsonMetaData.date_of_filing_date_change || null,
                jsonMetaData.effectiveness_date || null,
                jsonMetaData.acceptance_datetime || null,
                jsonMetaData.file_number || null,
                jsonMetaData.film_number || null,
                jsonMetaData.is_paper ? 1 : 0
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
                
                entityArray.forEach(entity => {
                    const entityData = entity.company_data || entity.owner_data;
                    if (!entityData || !entityData.cik) return;

                    const filingValues = entity.filing_values || {};
                    const businessAddr = entity.business_address || {};
                    const mailAddr = entity.mail_address || {};

                    const entityQuery = `
                        INSERT INTO submission_entity (
                            adsh, filer_code, cik, conformed_name, organization_name,
                            irs_number, state_of_incorporation, fiscal_year_end, assigned_sic,
                            filing_form_type, filing_act, filing_file_number, filing_film_number,
                            business_street1, business_street2, business_city, business_state,
                            business_zip, business_phone,
                            mail_street1, mail_street2, mail_city, mail_state, mail_zip
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
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
                        adsh, filerCode, entityData.cik, entityData.conformed_name || '',
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
                    if (entity.former_company && Array.isArray(entity.former_company)) {
                        entity.former_company.forEach(former => {
                            if (former.former_conformed_name && former.date_changed) {
                                const formerCompanyQuery = `
                                    INSERT INTO submission_former_company (adsh, cik, former_conformed_name, date_changed)
                                    VALUES (?, ?, ?, ?)
                                    ON DUPLICATE KEY UPDATE former_conformed_name = VALUES(former_conformed_name)
                                `;
                                dbPromises.push(common.runQuery('POC', formerCompanyQuery, [
                                    adsh, entityData.cik, former.former_conformed_name, former.date_changed
                                ]));
                            }
                        });
                    }

                    // Process former_name array (for reporting_owner)
                    if (entity.former_name && Array.isArray(entity.former_name)) {
                        entity.former_name.forEach(former => {
                            if (former.former_conformed_name && former.date_changed) {
                                const formerNameQuery = `
                                    INSERT INTO submission_former_name (adsh, cik, former_conformed_name, date_changed)
                                    VALUES (?, ?, ?, ?)
                                    ON DUPLICATE KEY UPDATE former_conformed_name = VALUES(former_conformed_name)
                                `;
                                dbPromises.push(common.runQuery('POC', formerNameQuery, [
                                    adsh, entityData.cik, former.former_conformed_name, former.date_changed
                                ]));
                            }
                        });
                    }
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
                
                const processSeries = (seriesArray, isNew, globalOwnerCik) => {
                    if (!seriesArray || !Array.isArray(seriesArray)) return;
                    
                    seriesArray.forEach(series => {
                        if (series.series_id && series.series_name) {
                            const seriesIdBigint = common.extractIntId(series.series_id);
                            const ownerCik = globalOwnerCik || series.owner_cik;
                            
                            const seriesQuery = `
                                INSERT INTO submission_series (adsh, series_id, owner_cik, series_name, is_new)
                                VALUES (?, ?, ?, ?, ?)
                                ON DUPLICATE KEY UPDATE
                                    owner_cik = VALUES(owner_cik),
                                    series_name = VALUES(series_name),
                                    is_new = VALUES(is_new)
                            `;
                            
                            // Insert series first, then insert class contracts
                            const seriesPromise = common.runQuery('POC', seriesQuery, [
                                adsh, seriesIdBigint, ownerCik, series.series_name, isNew ? 1 : 0
                            ]).then(() => {
                                // Process class contracts after series is inserted
                                if (series.class_contract && Array.isArray(series.class_contract)) {
                                    series.class_contract.forEach(classContract => {
                                        if (classContract.class_contract_id && classContract.class_contract_name) {
                                            const classIdBigint = common.extractIntId(classContract.class_contract_id);
                                            
                                            const classQuery = `
                                                INSERT INTO submission_class_contract (
                                                    adsh, series_id, class_contract_id, class_contract_name,
                                                    class_contract_ticker_symbol
                                                ) VALUES (?, ?, ?, ?, ?)
                                                ON DUPLICATE KEY UPDATE
                                                    class_contract_name = VALUES(class_contract_name),
                                                    class_contract_ticker_symbol = VALUES(class_contract_ticker_symbol)
                                            `;
                                            dbPromises.push(common.runQuery('POC', classQuery, [
                                                adsh, seriesIdBigint, classIdBigint,
                                                classContract.class_contract_name,
                                                classContract.class_contract_ticker_symbol || null
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
                        false,
                        seriesData.existing_series_and_classes_contracts.owner_cik
                    );
                }
                if (seriesData.new_series_and_classes_contracts) {
                    processSeries(
                        seriesData.new_series_and_classes_contracts.new_series,
                        true,
                        seriesData.new_series_and_classes_contracts.owner_cik
                    );
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

        } catch (error) {
            console.error('Error writing submission metadata:', error);
        }
    }


    async function messageParentFinished(status){
        //console.log(`submission complete; messaging parent`);
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
            processedByteCount: processedByteCount,
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
