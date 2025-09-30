// EDGAR Feed File Processor - Processes individual EDGAR submission files
// Converted from edgarFullTextSearchSubmissionIngest.js to use common.mjs and modern Node.js

import { common } from './common.mjs';
import { sgmlToJson, tagToJson } from './sgmlToJson.mjs';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { writeFile } from 'node:fs/promises';
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
    const docFilingFolder = processInfo.filingsDir + processInfo.name.split('.').shift() + '/';
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
    readInterface.on('line', async function(line) {
        let tLine = line.trim();
        if (submission.readState == READ_STATES.INIT) { //submission header prior to first <DOCUMENT>
            if(line.includes('DELET')||line.includes('CORRECTION')) console.log(line, processInfo.path + processInfo.name);
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
            if (tLine == '</SUBMISSION>') submission.readState = READ_STATES.READ_COMPLETE; //end of submission!
        }

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
                    //console.log('DOC_HEADER', line);
                    sgmlLines.push(line);
                }
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
            
            // Write feeds metadata to database
            if (submissionMetadata && submissionMetadata.submission) {
                writeFeedsMetaData(submissionMetadata.submission, processInfo.feedDate, processInfo.name);
            }
            
            //writeSubmissionHeaderRecords();  //insert queries run async and promises pushed onto dbPromises array
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
            const header1000 = sgmlLines.join('\n').substring(0, 1999);
            
            // Determine boolean flags based on metadata
            const isCorrespondence = jsonMetaData.correspondence ? 1 : 0;
            const isDeletion = jsonMetaData.correction === 'DELETION' ? 1 : 0;
            const isCorrection = jsonMetaData.correction === 'CORRECTION' ? 1 : 0;
            const isPrivateToPublic = jsonMetaData.private_to_public ? 1 : 0;
            
            // Insert/Update feeds_file table
            const accessionNumberInt = accessionNumber ? common.extractIntId(accessionNumber) : 0;
            const feedsFileQuery = `
                INSERT INTO feeds_file (
                    feeds_date, feeds_file, filing_size, header_1000, adsh, accession_number,
                    filing_date, form_type, is_correspondence, is_deletion, 
                    is_correction, is_private_to_public
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    filing_size = VALUES(filing_size),
                    header_1000 = VALUES(header_1000),
                    adsh = VALUES(adsh),
                    accession_number = VALUES(accession_number),
                    filing_date = VALUES(filing_date),
                    form_type = VALUES(form_type),
                    is_correspondence = VALUES(is_correspondence),
                    is_deletion = VALUES(is_deletion),
                    is_correction = VALUES(is_correction),
                    is_private_to_public = VALUES(is_private_to_public)
            `;
            
            dbPromises.push(common.runQuery('POC', feedsFileQuery, [
                feedDate, filename, filingSize, header1000, accessionNumber, accessionNumberInt,
                filingDate, formType, isCorrespondence, isDeletion, isCorrection, isPrivateToPublic
            ]));
            
            // Process filers (CIKs) - both filer and reporting_owner types
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

            // Process regular filers (type 'F')
            processFilers(jsonMetaData.filer, 'F');
            
            // Process reporting owners (type 'R')
            processFilers(jsonMetaData.reporting_owner, 'R');
            
            // Process issuers (type 'I')
            if(jsonMetaData.issuer) processFilers([jsonMetaData.issuer], 'I');
            

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
                
            
            
            // Process documents
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
            
        } catch (error) {
            console.error('Error writing feeds metadata:', error);
        }
    }

    function writeSubmissionHeaderRecords(){
        dbPromises.push(common.runQuery('POC', `insert into efts_submissions (adsh, form, filedt) 
            values(${q(submission.adsh)}, ${q(submission.type)}, ${q(submission.filingDate)})
            on duplicate key update last_indexed = null`));
        
            for(let i=0;i<submission.entities.length;i++){
            let e = submission.entities[i];
            //type field values: OC=operating co; IC=invest co, RP=reporting person
            dbPromises.push(common.runQuery('POC', `insert into efts_entities (cik,name,state_inc,type,updatedfromadsh) 
                values(${e.cik},${q(e.name)},${q(e.incorporationState)}, ${q(e.type)}, ${q(submission.adsh)})
                on duplicate key update name=${q(e.name)}`));
            dbPromises.push(common.runQuery('POC', `insert ignore into efts_submissions_entities (cik, adsh) 
                values(${e.cik},${q(submission.adsh)})`));
        }

        entityTickersPromise = common.runQuery('POC', `SELECT cik, group_concat(ticker order by length(ticker), ticker SEPARATOR ', ')  as tickers
            FROM efts_entity_tickers 
            WHERE cik in (${submission.ciks.join(',')}) 
            group by cik`);
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
