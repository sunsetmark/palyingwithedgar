/*
 * analyze_345_xml_paths.js
 * 
 * Analyzes XML ownership forms (types 3, 3/A, 4, 4/A, 5, 5/A) to extract:
 * - XPath hierarchical and data nodes
 * - Attributes for each element
 * - minOccurances and maxOccurences for each path
 * 
 * Output: 345_xml_paths.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import mysql from 'mysql2/promise';
import { config } from '../server/config.mjs';

// AWS S3 Client
const s3Client = new S3Client({ region: 'us-east-1' });

// Database connection pool
let connectionPool = null;

/**
 * Initialize database connection pool
 */
function initDatabase() {
    const dbConfig = config.DATABASES.POC;
    connectionPool = mysql.createPool({
        host: dbConfig.SERVER,
        user: dbConfig.USER,
        password: dbConfig.PWD,
        database: dbConfig.DB_NAME,
        connectionLimit: 10,
        queueLimit: 0
    });
}

/**
 * Run a database query
 */
async function runQuery(sql, params = []) {
    try {
        const [rows] = await connectionPool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Database Query Error:', error.message);
        throw error;
    }
}

/**
 * Download file from S3
 */
async function downloadFromS3(bucket, key) {
    try {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key
        });
        const response = await s3Client.send(command);
        const stream = response.Body;
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks).toString('utf-8');
    } catch (error) {
        console.error(`Error downloading from S3 ${bucket}/${key}:`, error.message);
        return null;
    }
}

/**
 * Simple XML parser that extracts elements, their paths, attributes, and structure
 */
function parseXMLStructure(xmlContent, formType) {
    const paths = new Map(); // Map of path -> {formTypes: Set, attributes: Set, occurrences: Map}
    const elementStack = []; // Stack of {name, path, children: Map}
    
    // Remove XML declaration and comments
    xmlContent = xmlContent.replace(/<\?xml[^>]*\?>/g, '');
    xmlContent = xmlContent.replace(/<!--[\s\S]*?-->/g, '');
    
    // Regular expressions for parsing
    const openTagRegex = /<([a-zA-Z][a-zA-Z0-9:_-]*)((?:\s+[a-zA-Z][a-zA-Z0-9:_-]*\s*=\s*["'][^"']*["'])*)\s*(\/?)>/g;
    const closeTagRegex = /<\/([a-zA-Z][a-zA-Z0-9:_-]*)>/g;
    const attributeRegex = /([a-zA-Z][a-zA-Z0-9:_-]*)\s*=\s*["']([^"']*)["']/g;
    
    let match;
    let lastIndex = 0;
    
    while (true) {
        openTagRegex.lastIndex = lastIndex;
        closeTagRegex.lastIndex = lastIndex;
        
        const openMatch = openTagRegex.exec(xmlContent);
        const closeMatch = closeTagRegex.exec(xmlContent);
        
        // Determine which comes first
        let isOpen = false;
        if (openMatch && closeMatch) {
            isOpen = openMatch.index < closeMatch.index;
            match = isOpen ? openMatch : closeMatch;
        } else if (openMatch) {
            isOpen = true;
            match = openMatch;
        } else if (closeMatch) {
            isOpen = false;
            match = closeMatch;
        } else {
            break;
        }
        
        if (isOpen) {
            const tagName = match[1];
            const attributesStr = match[2] || '';
            const isSelfClosing = match[3] === '/';
            
            // Build path
            const parentPath = elementStack.length > 0 ? elementStack[elementStack.length - 1].path : '';
            const currentPath = parentPath ? `${parentPath} > ${tagName}` : tagName;
            
            // Extract attributes
            const attributes = new Set();
            if (attributesStr && attributesStr.trim()) {
                let attrMatch;
                const attrRegex = /([a-zA-Z][a-zA-Z0-9:_-]*)\s*=\s*["']([^"']*)["']/g;
                while ((attrMatch = attrRegex.exec(attributesStr)) !== null) {
                    attributes.add(attrMatch[1]);
                }
            }
            
            // Check if this is a data element (has text content and no child elements)
            // We'll determine this later by checking if it has children
            
            if (!isSelfClosing) {
                // Push to stack
                elementStack.push({
                    name: tagName,
                    path: currentPath,
                    children: new Map(),
                    attributes: attributes,
                    hasTextContent: false
                });
            } else {
                // Self-closing tag - treat as data element
                if (!paths.has(currentPath)) {
                    paths.set(currentPath, {
                        formTypes: new Set(),
                        attributes: new Set(),
                        occurrences: new Map(),
                        isDataElement: true
                    });
                }
                
                const pathData = paths.get(currentPath);
                pathData.formTypes.add(formType);
                attributes.forEach(attr => pathData.attributes.add(attr));
                
                // Update parent's children count
                if (elementStack.length > 0) {
                    const parent = elementStack[elementStack.length - 1];
                    const count = parent.children.get(tagName) || 0;
                    parent.children.set(tagName, count + 1);
                }
            }
            
            lastIndex = openTagRegex.lastIndex;
        } else {
            // Closing tag
            const tagName = match[1];
            
            if (elementStack.length > 0 && elementStack[elementStack.length - 1].name === tagName) {
                const element = elementStack.pop();
                
                // Determine if this is a data element or hierarchical element
                const isDataElement = element.children.size === 0;
                
                if (!paths.has(element.path)) {
                    paths.set(element.path, {
                        formTypes: new Set(),
                        attributes: new Set(),
                        occurrences: new Map(),
                        isDataElement: isDataElement
                    });
                }
                
                const pathData = paths.get(element.path);
                pathData.formTypes.add(formType);
                element.attributes.forEach(attr => pathData.attributes.add(attr));
                
                // Update parent's children count and track occurrence info
                if (elementStack.length > 0) {
                    const parent = elementStack[elementStack.length - 1];
                    const count = parent.children.get(tagName) || 0;
                    parent.children.set(tagName, count + 1);
                    
                    // Track occurrences: for this parent path, how many times does this child occur?
                    const parentPath = parent.path;
                    const occurrenceKey = `${parentPath} > ${tagName}`;
                    
                    if (occurrenceKey === element.path) {
                        // Track occurrence count for this specific document
                        const occurrenceMap = pathData.occurrences;
                        const docCount = count + 1; // This is the nth occurrence in this parent
                        
                        if (!occurrenceMap.has('counts')) {
                            occurrenceMap.set('counts', []);
                        }
                        // We'll aggregate this later
                    }
                }
                
                // When popping an element, update occurrence statistics for its children
                element.children.forEach((count, childName) => {
                    const childPath = `${element.path} > ${childName}`;
                    if (paths.has(childPath)) {
                        const childPathData = paths.get(childPath);
                        if (!childPathData.occurrences.has(element.path)) {
                            childPathData.occurrences.set(element.path, []);
                        }
                        childPathData.occurrences.get(element.path).push(count);
                    }
                });
            }
            
            lastIndex = closeTagRegex.lastIndex;
        }
    }
    
    return paths;
}

/**
 * Merge new path data into the global paths collection
 */
function mergePaths(globalPaths, newPaths) {
    newPaths.forEach((pathData, path) => {
        if (!globalPaths.has(path)) {
            globalPaths.set(path, {
                formTypes: new Set(),
                attributes: new Set(),
                occurrences: new Map(),
                isDataElement: pathData.isDataElement
            });
        }
        
        const global = globalPaths.get(path);
        
        // Merge form types
        pathData.formTypes.forEach(ft => global.formTypes.add(ft));
        
        // Merge attributes
        pathData.attributes.forEach(attr => global.attributes.add(attr));
        
        // Merge occurrences
        pathData.occurrences.forEach((counts, parentPath) => {
            if (!global.occurrences.has(parentPath)) {
                global.occurrences.set(parentPath, []);
            }
            global.occurrences.get(parentPath).push(...counts);
        });
    });
}

/**
 * Calculate min and max occurrences from the occurrence data
 */
function calculateOccurrenceStats(occurrenceMap) {
    let minOccurances = Infinity;
    let maxOccurences = 0;
    
    occurrenceMap.forEach((counts) => {
        counts.forEach(count => {
            minOccurances = Math.min(minOccurances, count);
            maxOccurences = Math.max(maxOccurences, count);
        });
    });
    
    if (minOccurances === Infinity) {
        minOccurances = 0;
    }
    
    return { minOccurances, maxOccurences };
}

/**
 * Main function
 */
async function main() {
    console.log('Starting analysis of ownership form XML paths...\n');
    const startTime = Date.now();
    
    try {
        // Initialize database
        initDatabase();
        
        // Query for ownership form XML files
        const query = `
            SELECT s.adsh, s.type, sd.filename 
            FROM submission s 
            INNER JOIN submission_document sd ON s.adsh = sd.adsh
            WHERE s.type IN ('3','3/A','4','4/A','5','5/A') 
                AND sd.sequence = 1 
                AND sd.filename LIKE '%.xml' 
                AND s.filing_date = '20240401'
            LIMIT 4000
        `;
        
        console.log('Querying database for ownership form XML files...');
        const rows = await runQuery(query);
        console.log(`Found ${rows.length} XML files to process\n`);
        
        // Global paths collection
        const globalPaths = new Map();
        
        // Process each file
        let processedCount = 0;
        let errorCount = 0;
        
        for (const row of rows) {
            const { adsh, type, filename } = row;
            const s3Key = `EdgarFileSystem/PublicFilings/${adsh}/${filename}`;
            
            try {
                // Download XML from S3
                const xmlContent = await downloadFromS3('test.publicdata.guru', s3Key);
                
                if (!xmlContent) {
                    console.error(`Failed to download: ${s3Key}`);
                    errorCount++;
                    continue;
                }
                
                // Parse XML and extract structure
                const paths = parseXMLStructure(xmlContent, type);
                
                // Merge into global paths
                mergePaths(globalPaths, paths);
                
                processedCount++;
                if (processedCount % 100 === 0) {
                    console.log(`Processed ${processedCount}/${rows.length} files...`);
                }
            } catch (error) {
                console.error(`Error processing ${adsh}/${filename}:`, error.message);
                errorCount++;
            }
        }
        
        console.log(`\nProcessing complete. Processed: ${processedCount}, Errors: ${errorCount}`);
        console.log('Generating output JSON...\n');
        
        // Convert to output format
        const output = [];
        
        globalPaths.forEach((pathData, path) => {
            const stats = calculateOccurrenceStats(pathData.occurrences);
            
            output.push({
                path: path,
                formTypes: Array.from(pathData.formTypes).sort(),
                attributes: Array.from(pathData.attributes).sort(),
                occurancesRange: `${stats.minOccurances}-${stats.maxOccurences}`,
                isDataElement: pathData.isDataElement
            });
        });
        
        // Sort by path
        output.sort((a, b) => a.path.localeCompare(b.path));
        
        // Custom JSON stringification to keep formTypes and attributes on single lines
        const jsonString = '[\n' + output.map(item => {
            return '  {\n' +
                `    "path": ${JSON.stringify(item.path)},\n` +
                `    "formTypes": ${JSON.stringify(item.formTypes)},\n` +
                `    "attributes": ${JSON.stringify(item.attributes)},\n` +
                `    "occurancesRange": ${JSON.stringify(item.occurancesRange)},\n` +
                `    "isDataElement": ${item.isDataElement}\n` +
                '  }';
        }).join(',\n') + '\n]';
        
        // Write to file
        writeFileSync('345_xml_paths.json', jsonString);
        
        // Print summary
        console.log('=== RESULTS ===');
        console.log(`Total unique paths: ${output.length}`);
        console.log(`Data elements: ${output.filter(p => p.isDataElement).length}`);
        console.log(`Hierarchical elements: ${output.filter(p => !p.isDataElement).length}`);
        console.log(`Execution time: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
        console.log(`\nOutput written to: 345_xml_paths.json`);
        
    } catch (error) {
        console.error('Error in main function:', error);
    } finally {
        // Close database connection
        if (connectionPool) {
            await connectionPool.end();
        }
    }
}

// Run the script
main().catch(console.error);

