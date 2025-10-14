// Test script for common.mjs functions
import { common } from './common.mjs';

console.log('Starting tests for common.mjs...\n');
/* 
// Test 1: webFetchFair to SEC.gov
console.log('Test 1: webFetchFair to https://www.sec.gov/files/company_tickers.json');
try {
    const secData = await common.webFetchFair('https://www.sec.gov/files/company_tickers.json');
    const lines = secData.split('\n');
    console.log('First 5 lines:');
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        console.log(`  ${i + 1}: ${lines[i]}`);
    }
    console.log('Status: OK\n');
} catch (error) {
    console.log(`Status: ERROR - ${error.message}\n`);
}

// Test 2: runQuery to show databases
console.log('Test 2: runQuery execute "show databases;" against POC database');
try {
    const databases = await common.runQuery('POC', 'SHOW DATABASES;');
    console.log('Databases found:');
    databases.forEach((db, index) => {
        console.log(`  ${index + 1}: ${db.Database}`);
    });
    console.log('Status: OK\n');
} catch (error) {
    console.log(`Status: ERROR - ${error.message}\n`);
}

// Test 3: s3ReadString
console.log('Test 3: s3ReadString from test.publicdata.guru bucket');
try {
    const s3Content = await common.s3ReadString('test.publicdata.guru', 'samples/0001752724-25-192150/0001752724-25-192150.hdr.sgml');
    const lines = s3Content.split('\n');
    console.log('First 3 lines:');
    for (let i = 0; i < Math.min(3, lines.length); i++) {
        console.log(`  ${i + 1}: ${lines[i]}`);
    }
    console.log('Status: OK\n');
} catch (error) {
    console.log(`Status: ERROR - ${error.message}\n`);
}

// Test 4: s3ReadLine
console.log('Test 4: s3ReadLine from test.publicdata.guru bucket');
try {
    const s3Lines = await common.s3ReadLine('test.publicdata.guru', 'samples/0001752724-25-192150/0001752724-25-192150.txt');
    console.log('First 3 lines:');
    for (let i = 0; i < Math.min(3, s3Lines.length); i++) {
        console.log(`  ${i + 1}: ${s3Lines[i]}`);
    }
    console.log('Status: OK\n');
} catch (error) {
    console.log(`Status: ERROR - ${error.message}\n`);
}

// Test 5: s3WriteString
console.log('Test 5: s3WriteString to create hi_test.txt');
try {
    const result = await common.s3WriteString('test.publicdata.guru', 'hi_test.txt', 'hello world');
    console.log('Write result:', result);
    console.log('Status: OK\n');
} catch (error) {
    console.log(`Status: ERROR - ${error.message}\n`);
}
 */
// Test 6: fetchSubmissionMetadata
console.log('Test 6: fetchSubmissionMetadata - Compare metadata from file vs database');
try {
    const { readdir, readFile } = await import('fs/promises');
    const { join } = await import('path');
    
    const filingsDir = '/data/filings';
    const subfolders = await readdir(filingsDir, { withFileTypes: true });
    
    let filesProcessed = 0;
    let filesWithDifferences = 0;
    
    for (const subfolder of subfolders) {
        if (!subfolder.isDirectory()) continue;
        if (filesProcessed >= 10000) break;
        
        const subfolderPath = join(filingsDir, subfolder.name);
        const files = await readdir(subfolderPath);
        
        // Find .nc.json files in this subfolder
        const jsonFiles = files.filter(f => f.endsWith('.nc.json'));
        
        // Only process if there's exactly one .nc.json file
        if (files.length == 2 && jsonFiles.length === 1) {  //don't check folders with a correction as the DB values will be changed = false error
            const jsonFilePath = join(subfolderPath, jsonFiles[0]);
            
            try {
                // Read and parse the JSON file
                const jsonFileBody = await readFile(jsonFilePath, 'utf-8');
                const metadataFromFile = JSON.parse(jsonFileBody);
                
                // Get the accession number
                const accession_number = metadataFromFile.submission?.accession_number;
                
                if (!accession_number) {
                    console.log(`  Skipping ${jsonFiles[0]}: No accession_number found`);
                    continue;
                }
                
                // Fetch from database
                const metadataFromDb = await common.fetchSubmissionMetadata(accession_number);
                
                // Remove fields from file that are intentionally not stored in DB
                const cleanedFileMetadata = cleanMetadataForComparison(metadataFromFile);
                
                // Compare the two
                const differences = compareObjects(cleanedFileMetadata, metadataFromDb, '');
                
                if (differences.length > 0) {
                    console.log(`\n  File ${filesProcessed}: ${jsonFiles[0]}`);
                    console.log(`  Accession: ${accession_number} form ${metadataFromFile.submission?.type}`);
                    console.log(`  Differences found:`);
                    differences.forEach(diff => console.log(`    ${diff}`));
                    
                    // Show detailed diff for debugging (first file only)
                    if (filesProcessed === 0) {
                        console.log(`\n  Detailed comparison (first file):`);
                        console.log(`  File data:`, JSON.stringify(cleanedFileMetadata.submission, null, 2).substring(0, 1000));
                        console.log(`  DB data:`, JSON.stringify(metadataFromDb.submission, null, 2).substring(0, 1000));
                    }
                    
                    filesWithDifferences++;
                } else {
                    //console.log(`  ✓ ${accession_number} form ${metadataFromFile.submission?.type} - No differences`);
                }
                
                filesProcessed++;
                
            } catch (fileError) {
                console.log(`  Error processing ${jsonFiles[0]}: ${fileError.message}`);
            }
        }
    }
    
    console.log(`\n  Summary: Processed ${filesProcessed} files, ${filesWithDifferences} had differences`);
    console.log('Status: OK\n');
    
} catch (error) {
    console.log(`Status: ERROR - ${error.message}\n`);
}

/**
 * Clean metadata from file to match what's stored in DB
 * (removes fields that writeSubmissionHeaderRecords doesn't insert)
 */
function cleanMetadataForComparison(metadata) {
    const cleaned = JSON.parse(JSON.stringify(metadata)); // Deep clone
    
    if (cleaned.submission) {
        
        // Handle items vs item (plural vs singular) - rename items to item if present
        if (cleaned.submission.items) {
            cleaned.submission.item = cleaned.submission.items;
            delete cleaned.submission.items;
        }
        
        // Remove lengthRaw and fileLength from documents (not stored in submission_document table)
        if (cleaned.submission.document && Array.isArray(cleaned.submission.document)) {
            cleaned.submission.document.forEach(doc => {
                delete doc.lengthRaw;
                delete doc.fileLength;
            });
        }
        
        // Normalize entities (no longer sorting former_company/former_name arrays 
        // since we now have sequence fields to preserve order)
        const normalizeEntity = (entity) => {
            // Convert empty organization_name to null (matches writeSubmissionHeaderRecords behavior)
            const entityData = entity.company_data || entity.owner_data;
            if (entityData && entityData.organization_name === '') {
                delete entityData.organization_name;
            }
        };
        
        // Apply normalization and sorting to all entity types
        ['filer', 'reporting_owner', 'issuer', 'subject_company', 'depositor', 
         'securitizer', 'filed_for', 'issuing_entity', 'filed_by', 'underwriter'].forEach(entityType => {
            if (cleaned.submission[entityType]) {
                if (Array.isArray(cleaned.submission[entityType])) {
                    cleaned.submission[entityType].forEach(normalizeEntity);
                } else {
                    normalizeEntity(cleaned.submission[entityType]);
                }
            }
        });
    }
    
    return cleaned;
}

/**
 * Compare two objects and return array of differences
 */
function compareObjects(obj1, obj2, path) {
    const differences = [];
    
    // Helper to check if value is an object (not array, not null)
    const isObject = (val) => val !== null && typeof val === 'object' && !Array.isArray(val);
    
    // Helper to format value for display (truncate if too long)
    const formatValue = (val, maxLength = 10000) => {
        const str = JSON.stringify(val);
        if (str.length > maxLength) {
            return str.substring(0, maxLength) + '...';
        }
        return str;
    };
    
    // Helper to check if arrays are equal (order matters for arrays)
    const arraysEqual = (arr1, arr2) => {
        if (arr1.length !== arr2.length) return false;
        // Deep compare each element, recursively checking objects
        for (let i = 0; i < arr1.length; i++) {
            if (!deepEqual(arr1[i], arr2[i])) {
                return false;
            }
        }
        return true;
    };
    
    // Deep equality check that ignores property order in objects
    const deepEqual = (val1, val2) => {
        // Handle null/undefined
        if (val1 === val2) return true;
        if (val1 == null || val2 == null) return false;
        
        // Handle arrays (order matters)
        if (Array.isArray(val1) && Array.isArray(val2)) {
            return arraysEqual(val1, val2);
        }
        
        // Handle objects (property order doesn't matter)
        if (isObject(val1) && isObject(val2)) {
            const keys1 = Object.keys(val1);
            const keys2 = Object.keys(val2);
            
            // Must have same number of keys
            if (keys1.length !== keys2.length) return false;
            
            // Check all keys in obj1 exist in obj2 with same values
            for (const key of keys1) {
                if (!(key in val2)) return false;
                if (!deepEqual(val1[key], val2[key])) return false;
            }
            
            return true;
        }
        
        // For primitives, do direct comparison
        return val1 === val2;
    };
    
    // Get all unique keys from both objects
    const allKeys = new Set([
        ...Object.keys(obj1 || {}),
        ...Object.keys(obj2 || {})
    ]);
    
    for (const key of allKeys) {
        const val1 = obj1?.[key];
        const val2 = obj2?.[key];
        const currentPath = path ? `${path}.${key}` : key;
        
        // Check if key exists in both
        if (!(key in (obj1 || {}))) {
            differences.push(`${currentPath}: missing in file (exists in DB with value: ${formatValue(val2)})`);
            continue;
        }
        if (!(key in (obj2 || {}))) {
            differences.push(`${currentPath}: missing in DB (exists in file with value: ${formatValue(val1)})`);
            continue;
        }
        
        // Check if types match
        if (typeof val1 !== typeof val2) {
            differences.push(`${currentPath}: type mismatch - file: ${typeof val1} (${formatValue(val1)}), DB: ${typeof val2} (${formatValue(val2)})`);
            continue;
        }
        
        // Compare based on type
        if (Array.isArray(val1) && Array.isArray(val2)) {
            if (!arraysEqual(val1, val2)) {
                differences.push(`${currentPath}: array values differ - \nfile: ${formatValue(val1)} \nDB: ${formatValue(val2)}`);
            }
        } else if (isObject(val1) && isObject(val2)) {
            // Recursively compare objects
            differences.push(...compareObjects(val1, val2, currentPath));
        } else if (val1 !== val2) {
            // For primitives, check if they're "effectively" equal (e.g., "1" vs 1)
            if (String(val1) !== String(val2)) {
                differences.push(`${currentPath}: value mismatch - file: ${formatValue(val1)}, DB: ${formatValue(val2)}`);
            }
        }
    }
    
    return differences;
}

console.log('All tests completed!');
process.exit(0);
