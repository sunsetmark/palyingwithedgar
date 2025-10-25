// Utility to uudecode and compare UUENCODED representations from .dissem and .nc files
import { common } from '../server/common.mjs';
import { createHash } from 'crypto';

/**
 * Decode a UUENCODED string to binary buffer
 * @param {string} uuencodedContent - The UUENCODED content (including begin/end lines)
 * @returns {Buffer} - The decoded binary buffer
 */
function uudecode(uuencodedContent) {
    const lines = uuencodedContent.split('\n');
    const chunks = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip begin line, end line, and empty lines
        if (line.startsWith('begin ') || line === 'end' || line === '' || line === '`') {
            continue;
        }
        
        // Get the length byte (first character)
        const lengthChar = line.charCodeAt(0);
        const length = (lengthChar - 32) & 0x3f;
        
        if (length === 0) {
            // This is the checksum/terminator line
            continue;
        }
        
        // Decode the rest of the line
        const dataChars = line.substring(1);
        const buffer = Buffer.alloc(length);
        let bufferPos = 0;
        
        // Process in groups of 4 encoded characters -> 3 decoded bytes
        for (let j = 0; j < dataChars.length && bufferPos < length; j += 4) {
            const c1 = j < dataChars.length ? ((dataChars.charCodeAt(j) - 32) & 0x3f) : 0;
            const c2 = j + 1 < dataChars.length ? ((dataChars.charCodeAt(j + 1) - 32) & 0x3f) : 0;
            const c3 = j + 2 < dataChars.length ? ((dataChars.charCodeAt(j + 2) - 32) & 0x3f) : 0;
            const c4 = j + 3 < dataChars.length ? ((dataChars.charCodeAt(j + 3) - 32) & 0x3f) : 0;
            
            if (bufferPos < length) {
                buffer[bufferPos++] = (c1 << 2) | (c2 >> 4);
            }
            if (bufferPos < length) {
                buffer[bufferPos++] = ((c2 & 0x0f) << 4) | (c3 >> 2);
            }
            if (bufferPos < length) {
                buffer[bufferPos++] = ((c3 & 0x03) << 6) | c4;
            }
        }
        
        chunks.push(buffer);
    }
    
    return Buffer.concat(chunks);
}

/**
 * Extract UUENCODED sections from a file content
 * @param {string} content - The file content
 * @returns {Array} - Array of objects with filename and uuencoded content
 */
function extractUuencodedSections(content) {
    const sections = [];
    const lines = content.split('\n');
    
    let inUuencodedSection = false;
    let currentSection = null;
    let currentFilename = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.startsWith('begin 644 ')) {
            inUuencodedSection = true;
            currentFilename = line.substring('begin 644 '.length).trim();
            currentSection = [line];
        } else if (inUuencodedSection) {
            currentSection.push(line);
            if (line.trim() === 'end') {
                inUuencodedSection = false;
                sections.push({
                    filename: currentFilename,
                    uuencodedContent: currentSection.join('\n')
                });
                currentSection = null;
                currentFilename = null;
            }
        }
    }
    
    return sections;
}

/**
 * Calculate MD5 hash of a buffer
 */
function getMD5(buffer) {
    return createHash('md5').update(buffer).digest('hex');
}

/**
 * Main function to compare UUENCODED representations
 */
async function compareUuencodedRepresentations() {
    try {
        // Query for 1000 filings to get robust statistics
        const filings = await common.runQuery(
            'POC',
            `SELECT feeds_date, feeds_file, adsh 
             FROM feeds_file 
             WHERE feeds_date = '20240401' 
             AND feeds_file LIKE '%.nc' 
             LIMIT 1000`
        );
        
        console.log(`Analyzing ${filings.length} filings...\n`);
        
        const { readFile } = await import('fs/promises');
        
        let totalSections = 0;
        let matchingSections = 0;
        let differingSections = 0;
        
        // Track ending patterns by file extension and (bytes MOD 3)
        const endingPatternsByBytesAndExtension = {
            0: {},  // bytes % 3 = 0 (evenly divisible)
            1: {},  // bytes % 3 = 1 (1 byte remainder)
            2: {}   // bytes % 3 = 2 (2 bytes remainder)
        };
        
        for (const filing of filings) {
            const { feeds_date, feeds_file, adsh } = filing;
            const accessionNumber = adsh;
            
            try {
                // Read the .nc file from local filesystem
                const ncPath = `/data/feeds/${feeds_date}/${feeds_file}`;
                const ncContent = await readFile(ncPath, 'utf-8');
                
                // Read the .dissem file from S3
                const dissemBucket = 'test.publicdata.guru';
                const dissemFileKey = `EdgarFileSystem/PublicFilings/${accessionNumber}/${accessionNumber}.dissem`;
                const dissemContent = await common.s3ReadString(dissemBucket, dissemFileKey);
                
                // Extract UUENCODED sections from both files
                const ncSections = extractUuencodedSections(ncContent);
                const dissemSections = extractUuencodedSections(dissemContent);
                
                if (ncSections.length !== dissemSections.length) {
                    console.log(`⚠ ${accessionNumber}: Different number of UUENCODED sections`);
                    console.log(`  .nc has ${ncSections.length}, .dissem has ${dissemSections.length}`);
                    continue;
                }
                
                let filingsHasDifferences = false;
                
                for (let i = 0; i < ncSections.length; i++) {
                    const ncSection = ncSections[i];
                    const dissemSection = dissemSections[i];
                    
                    totalSections++;
                    
                    // Track ending patterns for ALL sections based on actual byte count
                    const ncLines = ncSection.uuencodedContent.trim().split('\n');
                    // Find the last data line (skip 'end' and empty lines)
                    let lastDataLine = null;
                    for (let j = ncLines.length - 1; j >= 0; j--) {
                        const line = ncLines[j].trim();
                        if (line !== '' && line !== 'end' && line !== '`' && !line.startsWith('begin ')) {
                            lastDataLine = line;
                            break;
                        }
                    }
                    
                    if (lastDataLine && lastDataLine.length >= 2) {
                        const fileExtension = ncSection.filename.split('.').pop().toLowerCase();
                        
                        // Decode the length byte (first character)
                        const lengthChar = lastDataLine.charCodeAt(0);
                        const actualBytes = (lengthChar - 32) & 0x3f;
                        
                        // Determine pattern based on actualBytes MOD 3
                        const remainder = actualBytes % 3;
                        let bytesCategory;
                        let pattern;
                        
                        if (remainder === 1) {
                            bytesCategory = 1;
                            // For 1 byte remainder: get last 2 chars
                            pattern = lastDataLine.slice(-2);
                        } else if (remainder === 2) {
                            bytesCategory = 2;
                            // For 2 bytes remainder: get last 2 chars
                            pattern = lastDataLine.slice(-2);
                        } else {
                            // remainder === 0 (evenly divisible by 3)
                            bytesCategory = 0;
                            pattern = lastDataLine.slice(-2);
                        }
                        
                        if (!endingPatternsByBytesAndExtension[bytesCategory][pattern]) {
                            endingPatternsByBytesAndExtension[bytesCategory][pattern] = {};
                        }
                        if (!endingPatternsByBytesAndExtension[bytesCategory][pattern][fileExtension]) {
                            endingPatternsByBytesAndExtension[bytesCategory][pattern][fileExtension] = 0;
                        }
                        endingPatternsByBytesAndExtension[bytesCategory][pattern][fileExtension]++;
                    }
                    
                    // Check if the UUENCODED text matches exactly
                    const textMatches = ncSection.uuencodedContent === dissemSection.uuencodedContent;
                    
                    if (textMatches) {
                        matchingSections++;
                        continue;
                    }
                    
                    // UUENCODED text differs - decode both and compare
                    const ncDecoded = uudecode(ncSection.uuencodedContent);
                    const dissemDecoded = uudecode(dissemSection.uuencodedContent);
                    
                    const ncMD5 = getMD5(ncDecoded);
                    const dissemMD5 = getMD5(dissemDecoded);
                    
                    if (!filingsHasDifferences) {
                        console.log(`\n📋 ${accessionNumber}:`);
                        filingsHasDifferences = true;
                    }
                    
                    console.log(`\n  File: ${ncSection.filename}`);
                    console.log(`  UUENCODED text matches: NO`);
                    console.log(`  .nc decoded size: ${ncDecoded.length} bytes (MD5: ${ncMD5})`);
                    console.log(`  .dissem decoded size: ${dissemDecoded.length} bytes (MD5: ${dissemMD5})`);
                    
                    if (ncMD5 === dissemMD5) {
                        console.log(`  ✓ Decoded binaries MATCH exactly (same MD5)`);
                        matchingSections++;
                    } else {
                        console.log(`  ✗ Decoded binaries DIFFER`);
                        
                        // Find first difference in decoded binaries
                        const minLength = Math.min(ncDecoded.length, dissemDecoded.length);
                        let firstDiff = -1;
                        for (let j = 0; j < minLength; j++) {
                            if (ncDecoded[j] !== dissemDecoded[j]) {
                                firstDiff = j;
                                break;
                            }
                        }
                        
                        if (firstDiff !== -1) {
                            console.log(`  First binary difference at byte ${firstDiff}`);
                            const start = Math.max(0, firstDiff - 10);
                            const end = Math.min(firstDiff + 10, minLength);
                            console.log(`  .nc bytes [${start}:${end}]: ${ncDecoded.slice(start, end).toString('hex')}`);
                            console.log(`  .dissem bytes [${start}:${end}]: ${dissemDecoded.slice(start, end).toString('hex')}`);
                        } else {
                            console.log(`  Binaries match up to ${minLength} bytes, but lengths differ`);
                        }
                        
                        // Show the last few lines of UUENCODED text for comparison
                        const ncLines = ncSection.uuencodedContent.split('\n');
                        const dissemLines = dissemSection.uuencodedContent.split('\n');
                        
                        console.log(`\n  Last 3 lines of .nc UUENCODED:`);
                        ncLines.slice(-3).forEach((line, idx) => {
                            const displayLine = line.replace(/ /g, '·'); // Show spaces as dots
                            console.log(`    [${idx}] "${displayLine}" (${line.length} chars)`);
                        });
                        
                        console.log(`  Last 3 lines of .dissem UUENCODED:`);
                        dissemLines.slice(-3).forEach((line, idx) => {
                            const displayLine = line.replace(/ /g, '·'); // Show spaces as dots
                            console.log(`    [${idx}] "${displayLine}" (${line.length} chars)`);
                        });
                        
                        differingSections++;
                    }
                }
                
            } catch (error) {
                console.log(`✗ Error processing ${accessionNumber}: ${error.message}`);
            }
        }
        
        console.log(`\n${'='.repeat(70)}`);
        console.log('SUMMARY:');
        console.log(`  Total UUENCODED sections analyzed: ${totalSections}`);
        console.log(`  Sections with matching decoded binaries: ${matchingSections}`);
        console.log(`  Sections with differing decoded binaries: ${differingSections}`);
        console.log(`${'='.repeat(70)}`);
        
        // Report on ending patterns organized by (bytes MOD 3)
        console.log('\nENDING PATTERN ANALYSIS BY (LINE LENGTH MOD 3):');
        console.log(`${'='.repeat(70)}\n`);
        
        for (const bytesCategory of [0, 1, 2]) {
            const patterns = endingPatternsByBytesAndExtension[bytesCategory];
            
            if (Object.keys(patterns).length === 0) continue;
            
            const totalForCategory = Object.values(patterns)
                .reduce((sum, extensions) => 
                    sum + Object.values(extensions).reduce((s, c) => s + c, 0), 0);
            
            let categoryLabel;
            if (bytesCategory === 0) {
                categoryLabel = 'MOD 3 = 0 (evenly divisible by 3)';
            } else if (bytesCategory === 1) {
                categoryLabel = 'MOD 3 = 1 (1 byte remainder)';
            } else {
                categoryLabel = 'MOD 3 = 2 (2 bytes remainder)';
            }
            
            console.log(`━━━ ${categoryLabel} (${totalForCategory} occurrences) ━━━\n`);
            
            // Sort patterns by total count descending
            const patternCounts = Object.entries(patterns)
                .map(([pattern, extensions]) => ({
                    pattern,
                    extensions,
                    total: Object.values(extensions).reduce((sum, count) => sum + count, 0)
                }))
                .sort((a, b) => b.total - a.total);
            
            for (const { pattern, extensions, total } of patternCounts) {
                // Show pattern with visible spaces
                const displayPattern = pattern
                    .replace(/ /g, '·')
                    .replace(/\n/g, '\\n')
                    .replace(/\r/g, '\\r')
                    .replace(/\t/g, '\\t');
                
                console.log(`  Pattern "${displayPattern}": ${total} occurrences`);
                
                // Sort extensions by count descending
                const sortedExtensions = Object.entries(extensions)
                    .sort((a, b) => b[1] - a[1]);
                
                for (const [ext, count] of sortedExtensions) {
                    const percentage = ((count / total) * 100).toFixed(1);
                    console.log(`    .${ext}: ${count} (${percentage}%)`);
                }
            }
            console.log();
        }
        console.log(`${'='.repeat(70)}\n`);
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.error(error.stack);
    }
}

// Run the comparison
compareUuencodedRepresentations()
    .then(() => {
        console.log('Analysis complete.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });

