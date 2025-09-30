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
        
        // Start with empty tagsFromRoot for each SGML file
        const tagsFromRoot = []; // Stack to track current path
        const currentPaths = new Set(); // Track paths found in this file
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines
            if (!line) continue;
            
            // Check for opening tag
            if (line.startsWith('<') && !line.startsWith('</')) {
                const tagMatch = line.match(/^<([A-Z][A-Z0-9-_]*)>(.*)$/);
                if (tagMatch) {
                    const [, tagName, data] = tagMatch;
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
                        
                        currentPaths.add(pathString);
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
        
        // Add new paths to global array
        for (const path of currentPaths) {
            if (!sgmlPaths.includes(path)) {
                sgmlPaths.push(path);
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
            if (processedFoldersCount >= 1000* 1000) {
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
        
        // Sort paths alphabetically
        sgmlPaths.sort();
        
        // Write results to file
        writeFileSync('sgml_paths.json', JSON.stringify(sgmlPaths, null, 2));
        
        // Log results
        console.log('\n=== RESULTS ===');
        console.log(`Total unique paths found: ${sgmlPaths.length}`);
        console.log(`Processed SGML files: ${processedSgmlFilesCount}`);
        console.log(`Processed folders: ${processedFoldersCount}`);
        console.log(`Execution time: ${Date.now() - startTime}ms`);
        
        console.log('\n=== ALL UNIQUE PATHS ===');
        sgmlPaths.forEach((path, index) => {
            console.log(`${index + 1}. ${path}`);
        });
        
    } catch (error) {
        console.error('Error in main function:', error.message);
    }
}

// Run the main function
main().catch(console.error);
