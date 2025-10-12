/*listUniqueSgmlPaths.mjs - list unique SGML paths from all SGML files in the /data/filings subdirectories (as extracted from feeds by edgarFeedDownloader.mjs).
The unique SGML paths found by this script are written to sgml_paths.json.

Analysis of results from 2024Q1 submissions:
1. seeminly abitrary use of <SEC-HEADER> vs. <SUBMISSION> root tags
2. 300 discrete paths to data, when ignoring the root tag differences between "SEC-HEADER" and "SUBMISSION"
3. 22 entity tags are children of the following 11 paths (226/300 = 74% of the data-bearing paths):
    a. SEC-HEADER > FILER (original reference)
    b. SUBMISSION > FILER
    c. SUBMISSION > REPORTING-OWNER
    d. SUBMISSION > SUBJECT-COMPANY
    e. SUBMISSION > DEPOSITOR (21/22) - Missing: FILING-VALUES > FILM-NUMBER
    f. SUBMISSION > SECURITIZER (21/22) - Missing: FILING-VALUES > FILM-NUMBER
    g. SUBMISSION > FILED-FOR (20/22) - Missing: FILING-VALUES > ACT, FILING-VALUES > FILM-NUMBER
    h. SUBMISSION > ISSUING_ENTITY (20/22) - Missing: FILING-VALUES > FILE-NUMBER, FILING-VALUES > FILM-NUMBER
    i. SUBMISSION > FILED-BY (19/22) - Missing: FILING-VALUES > ACT, FILING-VALUES > FILE-NUMBER, FILING-VALUES > FILM-NUMBER
    j. SUBMISSION > ISSUER (18/22) - Missing: FILING-VALUES > ACT, FILING-VALUES > FILE-NUMBER, FILING-VALUES > FILM-NUMBER, FILING-VALUES > FORM-TYPE
    k. SUBMISSION > UNDERWRITER (17/22) - Missing: BUSINESS-ADDRESS > STREET2, FILING-VALUES > FILE-NUMBER, FILING-VALUES > FILM-NUMBER, FORMER-COMPANY : DATE-CHANGED, FORMER-COMPANY : FORMER-CONFORMED-NAME

Another 45 paths reporesent properties of the submission (exclusive to the 22 entity tags).  (Together these can be persisted as 67 submission table fields).
Series and class contracts use 27 paths.

All toghter, these account for 226+45+27 = 298 of the 300 paths!
*/
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Import common.mjs
import { common } from './common.mjs';

// Module level constant for SGML array tags (from sgmlToJson.mjs)
const SGML_ARRAY_TAGS = [
    'FILER',
    'FILED-FOR', //0000000000-23-013828
    'REPORTING-OWNER',
    'FORMER-NAME',
    'ITEM',  //form SD  0000008063-24-000017
    'ITEMS',  //e.g.  8-K 0000008063-24-000017
    'REFERENCES-429', //0001437749-24-000360
    'GROUP-MEMBERS',
    'MERGER',
    'TARGET-DATA',
    'NEW-SERIES',
    'SERIES', 
    'CLASS-CONTRACT', 
    'NEW-CLASSES-CONTRACTS', //0001133228-24-000384
    'FORMER-COMPANY',
    'SUBJECT-COMPANY',  //'0001104659-24-038822', 
    'DOCUMENT'
];

// Variables to track processing
let processedSgmlFilesCount = 0;
let processedFoldersCount = 0;

// Read existing sgml_paths.json or initialize empty array
let sgmlPaths = [];
try {
    const existingPaths = readFileSync('sgml_paths.json', 'utf8');
    sgmlPaths = JSON.parse(existingPaths);
    console.log(`Loaded ${sgmlPaths.length} existing paths from sgml_paths.json`);
} catch (error) {
    console.log('sgml_paths.json not found, starting with empty array');
    sgmlPaths = [];
}

/**
 * Processes a single SGML file to extract unique tag paths
 * @param {string} filePath - Path to the SGML file
 */
function processSgmlFile(filePath) {
    try {
        const content = readFileSync(filePath, 'utf8');
        const lines = content.split(/\r\n|\n|\r/);
        
        // Find the <TYPE> line, get the form type, and extract root form type 
        const typeLine = lines.find(line => line.startsWith('<TYPE>'));
        let form = null, rootForm = null;
        if (typeLine) {
            form = typeLine.substring('<TYPE>'.length)
            rootForm = form.split('/A').shift();
            //console.log(`Found form type ${form} in ${filePath}`);
        }
        if(!typeLine || !rootForm) {
            console.log(`No <TYPE> line found in ${filePath}`);
            return;
        }
        
        // Start with empty tagsFromRoot for each SGML file
        const tagsFromRoot = []; // Stack to track current path
        const currentPaths = []; // Track paths found in this file with empty string info
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines
            if (!line) continue;
            
            // Check for opening tag
            if (line.startsWith('<') && !line.startsWith('</')) {
                const tagMatch = line.match(/^<([A-Z][A-Z0-9-_]*)>(.*)$/);
                if (tagMatch) {
                    const [, tagName, data] = tagMatch;
                    // For flag property detection, treat whitespace-only values as empty
                    const cleanData = data.replace(/<\/[^>]*>$/, '').trim();
                    
                    // Check if this is a hierarchical tag by looking for matching closing tag
                    let isHierarchical = false;
                    let j = i + 1;
                    
                    while (j < lines.length) {
                        const nextLine = lines[j].trim();
                        
                        if (nextLine === `</${tagName}>`) {
                            // Found our closing tag - this is a hierarchical tag
                            isHierarchical = true;
                            break;
                        }
                        
                        j++;
                    }
                    
                    if (isHierarchical) {
                        // This is a hierarchical tag - push to stack
                        tagsFromRoot.push(tagName);
                    } else {
                        // This is a data-bearing tag (no closing tag found)
                        // Create path string (don't push data-bearing tags to stack)
                        let pathString = '';
                        for (let k = 0; k < tagsFromRoot.length; k++) {
                            if (k > 0) {
                                // Check if previous tag is in SGML_ARRAY_TAGS
                                if (SGML_ARRAY_TAGS.includes(tagsFromRoot[k - 1])) {
                                    pathString += ' : ';
                                } else {
                                    pathString += ' > ';
                                }
                            }
                            pathString += tagsFromRoot[k];
                        }
                        
                        // Add the data-bearing tag to the path
                        if (tagsFromRoot.length > 0) {
                            // Check if previous tag is in SGML_ARRAY_TAGS
                            if (SGML_ARRAY_TAGS.includes(tagsFromRoot[tagsFromRoot.length - 1])) {
                                pathString += ' : ';
                            } else {
                                pathString += ' > ';
                            }
                        }
                        pathString += tagName;
                        
                        // Track whether this occurrence has an empty value
                        // cleanData is already trimmed, so whitespace-only values are now empty strings
                        currentPaths.push({
                            path: pathString,
                            isEmpty: cleanData === ''
                        });
                    }
                }
            }
            // Check for closing tag
            else if (line.startsWith('</')) {
                const closingTagMatch = line.match(/^<\/([A-Z][A-Z0-9-_]*)>$/);
                if (closingTagMatch) {
                    const [, tagName] = closingTagMatch;
                    
                    // Pop from current path if it matches
                    if (tagsFromRoot.length > 0 && tagsFromRoot[tagsFromRoot.length - 1] === tagName) {
                        tagsFromRoot.pop();
                    }
                }
            }
        }
        
        // Add new paths to global array with empty string tracking
        for (const pathInfo of currentPaths) {
            // Check if path already exists using some() to compare first item
            const existingPathIndex = sgmlPaths.findIndex(item => item.path === pathInfo.path);
            
            if (existingPathIndex === -1) {
                // Path doesn't exist, add new entry
                sgmlPaths.push({
                    path: pathInfo.path,
                    formTypes: [rootForm],
                    totalCount: 1,
                    emptyCount: pathInfo.isEmpty ? 1 : 0
                });
            } else {
                // Path exists, update counts and form types
                const existingPath = sgmlPaths[existingPathIndex];
                existingPath.totalCount++;
                if (pathInfo.isEmpty) {
                    existingPath.emptyCount++;
                }
                
                // Check if form type is already in the array
                if (!existingPath.formTypes.includes(rootForm)) {
                    existingPath.formTypes.push(rootForm);
                    // Keep form types sorted
                    existingPath.formTypes.sort();
                }
            }
        }
        
        processedSgmlFilesCount++;
        
    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error.message);
    }
}

/**
 * Main function to process all SGML files
 */
async function main() {
    const startTime = Date.now();
    
    try {
        // Use only /data/files directory
        const dataPath = '/data/filings';
        
        try {
            const stats = statSync(dataPath);
            if (!stats.isDirectory()) {
                console.log(`Error: ${dataPath} exists but is not a directory`);
                return;
            }
            console.log(`Using data directory: ${dataPath}`);
        } catch (error) {
            console.log(`Error: Directory ${dataPath} does not exist or is not accessible`);
            return;
        }
        
        // Process subfolders
        const subfolders = readdirSync(dataPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        
        //console.log(`Found ${subfolders.length} subfolders to process`);
        
        for (const subfolder of subfolders) {
            if (processedFoldersCount >= 1000 * 1000) {
                console.log('Reached limit of 1000,000 folders, breaking...');
                break;
            }
            
            const subfolderPath = join(dataPath, subfolder);
            //console.log(`Processing folder: ${subfolder}`);
            
            try {
                // Find all .sgml files in the subfolder
                const files = readdirSync(subfolderPath)
                    .filter(file => file.endsWith('.sgml'));
                
                //console.log(`  Found ${files.length} SGML files`);
                
                for (const file of files) {
                    const filePath = join(subfolderPath, file);
                    processSgmlFile(filePath);
                }
                
                processedFoldersCount++;
                
            } catch (error) {
                console.error(`Error processing folder ${subfolder}:`, error.message);
            }
        }
        
        // Sort paths alphabetically by path name
        sgmlPaths.sort((a, b) => a.path.localeCompare(b.path));
        
        // Mark paths as flag properties if they're always empty
        let flagPropertyCount = 0;
        sgmlPaths.forEach(pathObj => {
            if (pathObj.totalCount === pathObj.emptyCount && pathObj.totalCount > 0) {
                pathObj.flagProperty = true;
                flagPropertyCount++;
            }
            // Remove the tracking counts from the final output (keep only flagProperty if true)
            delete pathObj.totalCount;
            delete pathObj.emptyCount;
        });
        
        // Write results to file
        writeFileSync('sgml_paths.json', JSON.stringify(sgmlPaths, null, 2));
        
        // Log results
        console.log('\n=== RESULTS ===');
        console.log(`Total unique paths found: ${sgmlPaths.length}`);
        console.log(`Flag properties (always empty): ${flagPropertyCount}`);
        console.log(`Processed SGML files: ${processedSgmlFilesCount}`);
        console.log(`Processed folders: ${processedFoldersCount}`);
        console.log(`Execution time: ${(Date.now() - startTime)/1000}s`);
        
        // List flag properties
        if (flagPropertyCount > 0) {
            console.log('\n=== FLAG PROPERTIES (Always Empty) ===');
            sgmlPaths.filter(p => p.flagProperty).forEach((pathObj, index) => {
                console.log(`${index + 1}. ${pathObj.path}`);
                console.log(`   Form Types: ${pathObj.formTypes.join(', ')}`);
            });
        }
        
        /*
        console.log('\n=== ALL UNIQUE PATHS ===');
        sgmlPaths.forEach((item, index) => {
            console.log(`${index + 1}. ${item.path} (Form Types: ${item.formTypes.join(', ')})`);
        }); */
        
    } catch (error) {
        console.error('Error in main function:', error.message);
    }
}

// Run the main function
main().catch(console.error);
