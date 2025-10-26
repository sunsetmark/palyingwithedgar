// Utility to analyze UUENCODED last line padding by MOD 3 category
import { common } from '../server/common.mjs';

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
 * Decode a single uuencoded line
 */
function uudecodeLine(line) {
    const lengthChar = line.charCodeAt(0);
    const length = (lengthChar - 32) & 0x3f;
    const dataChars = line.substring(1);
    const buffer = Buffer.alloc(length);
    let bufferPos = 0;
    
    for (let j = 0; j < dataChars.length && bufferPos < length; j += 4) {
        const c1 = j < dataChars.length ? ((dataChars.charCodeAt(j) - 32) & 0x3f) : 0;
        const c2 = j + 1 < dataChars.length ? ((dataChars.charCodeAt(j + 1) - 32) & 0x3f) : 0;
        const c3 = j + 2 < dataChars.length ? ((dataChars.charCodeAt(j + 2) - 32) & 0x3f) : 0;
        const c4 = j + 3 < dataChars.length ? ((dataChars.charCodeAt(j + 3) - 32) & 0x3f) : 0;
        
        if (bufferPos < length) buffer[bufferPos++] = (c1 << 2) | (c2 >> 4);
        if (bufferPos < length) buffer[bufferPos++] = ((c2 & 0x0f) << 4) | (c3 >> 2);
        if (bufferPos < length) buffer[bufferPos++] = ((c3 & 0x03) << 6) | c4;
    }
    
    return buffer;
}

/**
 * Main function to analyze last line padding
 */
async function analyzeLastLinePadding() {
    try {
        // Query for 1000 filings
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
        
        // Track results by MOD category
        const mod0Results = {
            matched: {},
            total: {}
        };
        
        const mod1Results = {}; // Will store last 2 bytes by extension
        const mod2Results = {}; // Will store last byte by extension
        
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
                    continue;
                }
                
                for (let i = 0; i < ncSections.length; i++) {
                    const ncSection = ncSections[i];
                    const dissemSection = dissemSections[i];
                    const fileExtension = ncSection.filename.split('.').pop().toLowerCase();
                    
                    // Get the last data line
                    const ncLines = ncSection.uuencodedContent.trim().split('\n');
                    const dissemLines = dissemSection.uuencodedContent.trim().split('\n');
                    
                    let ncLastDataLine = null;
                    let dissemLastDataLine = null;
                    
                    for (let j = ncLines.length - 1; j >= 0; j--) {
                        const line = ncLines[j].trim();
                        if (line !== '' && line !== 'end' && line !== '`' && !line.startsWith('begin ')) {
                            ncLastDataLine = line;
                            break;
                        }
                    }
                    
                    for (let j = dissemLines.length - 1; j >= 0; j--) {
                        const line = dissemLines[j].trim();
                        if (line !== '' && line !== 'end' && line !== '`' && !line.startsWith('begin ')) {
                            dissemLastDataLine = line;
                            break;
                        }
                    }
                    
                    if (!ncLastDataLine || !dissemLastDataLine) continue;
                    
                    // Get length and MOD
                    const lengthChar = ncLastDataLine.charCodeAt(0);
                    const length = (lengthChar - 32) & 0x3f;
                    const mod = length % 3;
                    
                    // Initialize counters for this extension
                    if (!mod0Results.total[fileExtension]) {
                        mod0Results.total[fileExtension] = 0;
                        mod0Results.matched[fileExtension] = 0;
                    }
                    
                    if (mod === 0) {
                        // MOD 0: Check if last lines match exactly
                        mod0Results.total[fileExtension]++;
                        if (ncLastDataLine === dissemLastDataLine) {
                            mod0Results.matched[fileExtension]++;
                        }
                    } else if (mod === 1) {
                        // MOD 1: Add 2 bytes to length, decode, get last 2 bytes
                        const newLengthChar = String.fromCharCode(lengthChar + 2);
                        const modifiedLine = newLengthChar + ncLastDataLine.substring(1);
                        const decoded = uudecodeLine(modifiedLine);
                        const lastTwoBytes = decoded.slice(-2).toString('hex');
                        
                        if (!mod1Results[fileExtension]) {
                            mod1Results[fileExtension] = {};
                        }
                        if (!mod1Results[fileExtension][lastTwoBytes]) {
                            mod1Results[fileExtension][lastTwoBytes] = 0;
                        }
                        mod1Results[fileExtension][lastTwoBytes]++;
                    } else if (mod === 2) {
                        // MOD 2: Add 1 byte to length, decode, get last byte
                        const newLengthChar = String.fromCharCode(lengthChar + 1);
                        const modifiedLine = newLengthChar + ncLastDataLine.substring(1);
                        const decoded = uudecodeLine(modifiedLine);
                        const lastByte = decoded.slice(-1).toString('hex');
                        
                        if (!mod2Results[fileExtension]) {
                            mod2Results[fileExtension] = {};
                        }
                        if (!mod2Results[fileExtension][lastByte]) {
                            mod2Results[fileExtension][lastByte] = 0;
                        }
                        mod2Results[fileExtension][lastByte]++;
                    }
                }
                
            } catch (error) {
                // Skip files with errors
            }
        }
        
        // Report results
        console.log(`${'='.repeat(70)}`);
        console.log('MOD 0 ANALYSIS: Last Line Exact Match');
        console.log(`${'='.repeat(70)}\n`);
        
        const sortedMod0 = Object.entries(mod0Results.total)
            .sort((a, b) => b[1] - a[1]);
        
        for (const [ext, total] of sortedMod0) {
            const matched = mod0Results.matched[ext];
            const percentage = ((matched / total) * 100).toFixed(1);
            console.log(`  .${ext}: ${matched}/${total} matched (${percentage}%)`);
        }
        
        console.log(`\n${'='.repeat(70)}`);
        console.log('MOD 1 ANALYSIS: Last 2 Padding Bytes (added 2 bytes to length)');
        console.log(`${'='.repeat(70)}\n`);
        
        const sortedMod1Exts = Object.entries(mod1Results)
            .sort((a, b) => {
                const totalA = Object.values(a[1]).reduce((sum, c) => sum + c, 0);
                const totalB = Object.values(b[1]).reduce((sum, c) => sum + c, 0);
                return totalB - totalA;
            });
        
        for (const [ext, hexCounts] of sortedMod1Exts) {
            const total = Object.values(hexCounts).reduce((sum, c) => sum + c, 0);
            console.log(`File Type: .${ext} (${total} occurrences)`);
            
            const sortedHex = Object.entries(hexCounts)
                .sort((a, b) => b[1] - a[1]);
            
            for (const [hex, count] of sortedHex) {
                const percentage = ((count / total) * 100).toFixed(1);
                console.log(`  ${hex}: ${count} (${percentage}%)`);
            }
            console.log();
        }
        
        console.log(`${'='.repeat(70)}`);
        console.log('MOD 2 ANALYSIS: Last Padding Byte (added 1 byte to length)');
        console.log(`${'='.repeat(70)}\n`);
        
        const sortedMod2Exts = Object.entries(mod2Results)
            .sort((a, b) => {
                const totalA = Object.values(a[1]).reduce((sum, c) => sum + c, 0);
                const totalB = Object.values(b[1]).reduce((sum, c) => sum + c, 0);
                return totalB - totalA;
            });
        
        for (const [ext, hexCounts] of sortedMod2Exts) {
            const total = Object.values(hexCounts).reduce((sum, c) => sum + c, 0);
            console.log(`File Type: .${ext} (${total} occurrences)`);
            
            const sortedHex = Object.entries(hexCounts)
                .sort((a, b) => b[1] - a[1]);
            
            for (const [hex, count] of sortedHex) {
                const percentage = ((count / total) * 100).toFixed(1);
                console.log(`  ${hex}: ${count} (${percentage}%)`);
            }
            console.log();
        }
        
        console.log(`${'='.repeat(70)}\n`);
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.error(error.stack);
    }
}

// Run the analysis
analyzeLastLinePadding()
    .then(() => {
        console.log('Analysis complete.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
