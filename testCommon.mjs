// Test script for common.mjs functions
import { common } from './common.mjs';

// Parse command line arguments
const args = process.argv.slice(2);
let testToRun = null;

if (args.length > 0 && args[0].startsWith('-')) {
    testToRun = parseInt(args[0].substring(1));
    console.log(`Running test ${testToRun} only...\n`);
} else {
    console.log('Starting all tests for common.mjs...\n');
}

// Helper function to check if a test should run
const shouldRunTest = (testNumber) => {
    return testToRun === null || testToRun === testNumber;
};
 
// Test 1: webFetchFair to SEC.gov
if (shouldRunTest(1)) {
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
}

// Test 2: runQuery to show databases
if (shouldRunTest(2)) {
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
}

// Test 3: s3ReadString
if (shouldRunTest(3)) {
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
}

// Test 4: s3ReadLine
if (shouldRunTest(4)) {
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
}

// Test 5: s3WriteString
if (shouldRunTest(5)) {
    console.log('Test 5: s3WriteString to create hi_test.txt');
    try {
        const result = await common.s3WriteString('test.publicdata.guru', 'hi_test.txt', 'hello world');
        console.log('Write result:', result);
        console.log('Status: OK\n');
    } catch (error) {
        console.log(`Status: ERROR - ${error.message}\n`);
    }
}

// Test 6: fetchSubmissionMetadata
if (shouldRunTest(6)) {
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
        if (filesProcessed >= 1000000) break;
        
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
}

// Test 7: validateXML
if (shouldRunTest(7)) {
    console.log('Test 7: validateXML - Validate XML file against XSD schemas');
    const sourceKeys = ['samples/form3/form3-10142025_021044.xml', 'samples/form3/form3-badState.xml', 'samples/form3/form3-badTag.xml'];
    for(var i = 0; i < sourceKeys.length; i++) {
        try {
            const startForm3 = Date.now();
            const validationResult = await common.validateXML(
                { "bucket": "test.publicdata.guru", "key": sourceKeys[i] },
                [
                    { "bucket": "test.publicdata.guru", "key": "xsd/ownership3Document.xsd.xml", "run": true },
                    { "bucket": "test.publicdata.guru", "key": "xsd/ownershipDocumentCommon.xsd.xml", "run": false }
                ]
            );
            console.log(`Validation Result for ${sourceKeys[i]} in ${Date.now()-startForm3}ms:`);
            console.log(JSON.stringify(validationResult, null, 2));
            console.log('Status: OK (no error thrown)\n');
        } catch (error) {
            console.log(`Status: ERROR - ${error.message}\n`);
        }
    }
    try {
        const bigNport = { "bucket": "test.publicdata.guru", "key": "samples/NPORT/0001145549-24-003877_355MB/primary_doc.corrected.xml" };
        const startNPort = Date.now();
        const validationResult = await common.validateXML(bigNport,
            [  //note sure if "eis_stateCodes.xsd" is needed
                { "bucket": "test.publicdata.guru", "key": "xsd/eis_Common.xsd", "run": false },
                { "bucket": "test.publicdata.guru", "key": "xsd/eis_ISO_StateCodes.xsd", "run": false },
                { "bucket": "test.publicdata.guru", "key": "xsd/eis_NPORT_common.xsd", "run": false },
                { "bucket": "test.publicdata.guru", "key": "xsd/eis_stateCodes.xsd", "run": false },
                { "bucket": "test.publicdata.guru", "key": "xsd/eis_NPORT_Filer.xsd", "run": true },
            ]
        );
        console.log(`Validation Result for ${bigNport.key} in ${Date.now() - startNPort}ms:`);
        console.log(JSON.stringify(validationResult, null, 2));
        console.log('Status: OK (no error thrown)\n');
    } catch (error) {
        console.log(`Status: ERROR - ${error.message}\n`);
    }
}

// Test 8: extractXbrlFromIxbrl
if (shouldRunTest(8)) {
    console.log('Test 8: extractXbrlFromIxbrl - Extract XBRL instances from iXBRL documents');
    
    const testCases = [
        {
            ixbrl: '/home/ec2-user/poc/samples/iXBRL/0001213900-25-099277/ea0261065-s1_pmgchold.htm',
            output: '/home/ec2-user/poc/samples/iXBRL/0001213900-25-099277/ea0261065-s1_pmgchold.htm.node.xml',
            secVersion: '/home/ec2-user/poc/samples/iXBRL/0001213900-25-099277/ea0261065-s1_pmgchold_htm.xml'
        },
        {
            ixbrl: '/home/ec2-user/poc/samples/iXBRL/0001213900-25-099277/ea026106501ex-fee_pmgchold.htm',
            output: '/home/ec2-user/poc/samples/iXBRL/0001213900-25-099277/ea026106501ex-fee_pmgchold.htm.node.xml',
            secVersion: '/home/ec2-user/poc/samples/iXBRL/0001213900-25-099277/ea026106501ex-fee_pmgchold_htm.xml'
        }
    ];
    
    for (const testCase of testCases) {
        try {
            console.log(`\n  Processing: ${testCase.ixbrl.split('/').pop()}`);
            
            // Extract XBRL from iXBRL
            const result = await common.extractXbrlFromIxbrl(testCase.ixbrl, testCase.output);
            
            if (result.success) {
                console.log(`  ✓ Extraction successful`);
                
                // Show file sizes
                const { stat } = await import('fs/promises');
                const secStat = await stat(testCase.secVersion);
                const nodeStat = await stat(testCase.output);
                console.log(`  File sizes: SEC=${secStat.size} bytes, Node=${nodeStat.size} bytes`);
                
                // Run diff against SEC's version
                const { exec } = await import('child_process');
                const { promisify } = await import('util');
                const execAsync = promisify(exec);
                
                try {
                    // Use wc to count differences
                    const { stdout: diffStats } = await execAsync(`diff ${testCase.secVersion} ${testCase.output} | wc -l`);
                    const diffLineCount = parseInt(diffStats.trim());
                    
                    if (diffLineCount === 0) {
                        console.log(`  ✓ No differences found with SEC version`);
                    } else {
                        console.log(`  Differences: ${diffLineCount} lines differ`);
                        
                        // Show first few lines of diff
                        try {
                            const { stdout: diffOutput } = await execAsync(`diff -u ${testCase.secVersion} ${testCase.output} | head -30`);
                            console.log(`  First differences:\n${diffOutput}`);
                        } catch (e) {
                            // diff returns non-zero when files differ, but that's expected
                            if (e.stdout) {
                                console.log(`  First differences:\n${e.stdout}`);
                            }
                        }
                    }
                } catch (diffError) {
                    console.log(`  Error running diff: ${diffError.message}`);
                }
            } else {
                console.log(`  ✗ Extraction failed: ${result.message}`);
                if (result.stdout) console.log(`  stdout: ${result.stdout.substring(0, 500)}`);
                if (result.stderr) console.log(`  stderr: ${result.stderr.substring(0, 500)}`);
            }
            
        } catch (error) {
            console.log(`  ✗ Error: ${error.message}`);
        }
    }
    
    console.log('\nStatus: OK\n');
}

// Test 9: createSgml - Generate and compare SGML from metadata
if (shouldRunTest(9)) {
    console.log('Test 9: createSgml - Generate and compare SGML from metadata');
    try {
        const { readdir, readFile } = await import('fs/promises');
        const { join } = await import('path');
        
        const filingsDir = '/data/filings';
        const subfolders = await readdir(filingsDir, { withFileTypes: true });
        
        let filesProcessed = 0;
        let filesWithDifferences = 0;
        const maxFiles = 1000000; // Test with 1000000 files
        
        for (const subfolder of subfolders) {
            if (!subfolder.isDirectory()) continue;
            if (filesProcessed >= maxFiles) break;
            
            const subfolderPath = join(filingsDir, subfolder.name);
            const files = await readdir(subfolderPath);
            
            // Find .nc.json and .nc.sgml files in this subfolder
            const jsonFiles = files.filter(f => f.endsWith('.nc.json'));
            const sgmlFiles = files.filter(f => f.endsWith('.nc.sgml'));
            
            // Only process if we have exactly one of each (no corrections)
            if (jsonFiles.length === 1 && sgmlFiles.length === 1) {
                const jsonFilePath = join(subfolderPath, jsonFiles[0]);
                const sgmlFilePath = join(subfolderPath, sgmlFiles[0]);
                
                try {
                    // Read and parse the JSON file
                    const jsonFileBody = await readFile(jsonFilePath, 'utf-8');
                    const metadata = JSON.parse(jsonFileBody);
                    
                    // Get the accession number
                    const accessionNumber = metadata.submission?.accession_number;
                    
                    if (!accessionNumber) {
                        console.log(`  Skipping ${jsonFiles[0]}: No accession_number found`);
                        continue;
                    }
                    
                    // Generate SGML from the metadata using createSgml
                    const normalizedGenerated = await common.createSgml(metadata);
                    
                    // Read the original SGML file
                    const originalSgml = await readFile(sgmlFilePath, 'utf-8');
                    
                    // Normalize the original for comparison
                    const normalizeString = (str) => {
                        return str
                            .replace(/\r\n/g, '\n')  // Normalize line endings
                            .replace(/\n+/g, '\n')   // Remove extra blank lines
                            .trim();
                    };
                    
                    const normalizedOriginal = normalizeString(originalSgml);
                    
                    // Compare the two
                    if (normalizedGenerated !== normalizedOriginal) {
                        console.log(`\n  File ${filesProcessed + 1}: ${jsonFiles[0]}`);
                        console.log(`  Accession: ${accessionNumber} form ${metadata.submission?.type}`);
                        console.log(`  Differences found!`);
                        
                        // Show a preview of the differences (first 500 chars of each)
                        console.log(`  \n  Generated (first 500 chars):`);
                        console.log(`  ${normalizedGenerated.substring(0, 500)}`);
                        console.log(`  \n  Original (first 500 chars):`);
                        console.log(`  ${normalizedOriginal.substring(0, 500)}`);
                        
                        // Show lengths
                        console.log(`  \n  Generated length: ${normalizedGenerated.length}`);
                        console.log(`  Original length: ${normalizedOriginal.length}`);
                        
                        // Find first difference
                        for (let i = 0; i < Math.min(normalizedGenerated.length, normalizedOriginal.length); i++) {
                            if (normalizedGenerated[i] !== normalizedOriginal[i]) {
                                const start = Math.max(0, i - 50);
                                const end = Math.min(i + 50, normalizedGenerated.length, normalizedOriginal.length);
                                console.log(`  \n  First difference at position ${i}:`);
                                console.log(`  Generated: ...${normalizedGenerated.substring(start, end)}...`);
                                console.log(`  Original:  ...${normalizedOriginal.substring(start, end)}...`);
                                break;
                            }
                        }
                        
                        filesWithDifferences++;
                    } else {
                        console.log(`  ✓ ${accessionNumber} form ${metadata.submission?.type} - Perfect match`);
                    }
                    
                    filesProcessed++;
                    
                } catch (fileError) {
                    console.log(`  Error processing ${jsonFiles[0]}: ${fileError.message}`);
                    console.error(fileError.stack);
                }
            }
        }
        
        console.log(`\n  Summary: Processed ${filesProcessed} files, ${filesWithDifferences} had differences`);
        console.log('Status: OK\n');
    } catch (error) {
        console.log(`Status: ERROR - ${error.message}\n`);
    }
}

// Test 10: makeDisseminationFile - Create dissemination files and compare with originals
if (shouldRunTest(10)) {
    console.log('Test 10: makeDisseminationFile - Create dissemination files and compare with originals');
    try {
        // Query for filings from 20240401 with .nc extension
        const filings = await common.runQuery(
            'POC',
            `SELECT feeds_date, feeds_file, adsh 
             FROM feeds_file 
             WHERE feeds_date = '20240401' 
             AND feeds_file LIKE '%.nc' 
             LIMIT 200`
        );
        
        console.log(`Found ${filings.length} filings to process\n`);
        
        let filesProcessed = 0;
        let filesWithDifferences = 0;
        let filesWithErrors = 0;
        
        for (const filing of filings) {
            try {
                const { feeds_date, feeds_file, adsh } = filing;
                const accessionNumber = adsh;
                
                console.log(`\nProcessing ${filesProcessed + 1}/${filings.length}: ${accessionNumber} (${feeds_file})`);
                
                // Fetch submission metadata from database
                const filingMetadata = await common.fetchSubmissionMetadata(accessionNumber);
                
                // Define S3 paths (matching edgarFeedsDownloader config)
                const documentsBucket = 'test.publicdata.guru';
                const documentsBucketFolder = `EdgarFileSystem/PublicFilings/${accessionNumber}/`;
                const dissemBucket = 'test.publicdata.guru';
                const dissemFileKey = `EdgarFileSystem/PublicFilings/${accessionNumber}/${accessionNumber}.dissem`;
                
                // Create dissemination file
                console.log(`  Creating dissemination file: ${dissemFileKey}`);
                const result = await common.makeDisseminationFile(
                    filingMetadata,
                    documentsBucket,
                    documentsBucketFolder,
                    dissemBucket,
                    dissemFileKey
                );
                
                console.log(`  ${result.message}`);
                
                // Read the generated .dissem file from S3
                const generatedContent = await common.s3ReadString(dissemBucket, dissemFileKey);
                
                // Read the original .nc file from local filesystem
                const { readFile } = await import('fs/promises');
                const originalPath = `/data/feeds/${feeds_date}/${feeds_file}`;
                const originalContent = await readFile(originalPath, 'utf-8');
                
                // Normalize both for comparison
                const normalizeString = (str) => {
                    return str
                        .replace(/\r\n/g, '\n')  // Normalize line endings
                        .replace(/\n+$/g, '\n')  // Remove trailing blank lines
                        .trim();
                };
                
                const normalizedGenerated = normalizeString(generatedContent);
                const normalizedOriginal = normalizeString(originalContent);
                
                // Compare the files
                if (normalizedGenerated === normalizedOriginal) {
                    console.log(`  ✓ Perfect match with original .nc file`);
                } else {
                    console.log(`  ✗ Differences found!`);
                    console.log(`  Generated length: ${normalizedGenerated.length} bytes`);
                    console.log(`  Original length: ${normalizedOriginal.length} bytes`);
                    
                    // Find first difference
                    const minLength = Math.min(normalizedGenerated.length, normalizedOriginal.length);
                    let firstDiffPos = -1;
                    for (let i = 0; i < minLength; i++) {
                        if (normalizedGenerated[i] !== normalizedOriginal[i]) {
                            firstDiffPos = i;
                            break;
                        }
                    }
                    
                    if (firstDiffPos !== -1) {
                        const start = Math.max(0, firstDiffPos - 100);
                        const end = Math.min(firstDiffPos + 100, minLength);
                        console.log(`  First difference at position ${firstDiffPos}:`);
                        console.log(`  Generated: ...${normalizedGenerated.substring(start, end)}...`);
                        console.log(`  Original:  ...${normalizedOriginal.substring(start, end)}...`);
                    } else if (normalizedGenerated.length !== normalizedOriginal.length) {
                        console.log(`  Files match up to position ${minLength}, but lengths differ`);
                    }
                    
                    filesWithDifferences++;
                }
                
                filesProcessed++;
                
            } catch (fileError) {
                console.log(`  ✗ Error processing filing: ${fileError.message}`);
                filesWithErrors++;
            }
        }
        
        console.log(`\n  Summary:`);
        console.log(`    Processed: ${filesProcessed} files`);
        console.log(`    Perfect matches: ${filesProcessed - filesWithDifferences} files`);
        console.log(`    With differences: ${filesWithDifferences} files`);
        console.log(`    With errors: ${filesWithErrors} files`);
        console.log('Status: OK\n');
        
    } catch (error) {
        console.log(`Status: ERROR - ${error.message}\n`);
        console.error(error.stack);
    }
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
