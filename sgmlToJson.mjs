import { readFileSync } from 'fs';


// Module level constant for SGML array tags
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
const SGML_FLAG_TAGS = [ //these do not have data so otherwise they would have value of "" which is falsey.  Tags is these array will be set to true.
    'correction',
    'deletion',
    'private_to_public',
];
/**
 * Converts SGML tag name to JSON property name (which is also the db field name) 
 * @param {string} tagName - The SGML tag name
 * @returns {string} - The camelCase JSON property name
 */
function tagToJson(tagName) {
    return tagName.toLowerCase().split('-').join('_');
}

function sgmlToJson(sgml) {
    // Split SGML into lines, handling different line endings
    let sgmlLines;
    let sgmlBody;
    if(Array.isArray(sgml)) {
        sgmlBody = sgml.join('\n'); 
        sgmlLines = sgml;
    } else {
        sgmlBody = sgml;
        sgmlLines = sgml.split(/\r\n|\n|\r/);
    }

    
    // Process SGML lines recursively
    const processLines = (startIndex, endIndex, currentDepth = 0) => {
        const obj = {};
        let i = startIndex;
        
        while (i < endIndex) {
            const line = sgmlLines[i].trim();
            
            // Skip empty lines
            if (!line) {
                i++;
                continue;
            }
            
            // Check if it's an opening tag
            if (line.startsWith('<') && !line.startsWith('</')) {
                const tagMatch = line.match(/^<([A-Z][A-Z0-9-_]*)>(.*)$/);
                if (!tagMatch) {
                    throw new Error(`Invalid SGML tag format at line ${i + 1}: ${line}`);
                }
                
                const [, tagName, data] = tagMatch;
                // Clean data by removing any closing tag that might be on the same line
                const cleanData = data.replace(/<\/[^>]*>$/, '').trim();
                
                
                // Check if this is a hierarchical tag by looking for matching closing tag
                let isHierarchical = false;
                let closingTagIndex = -1;
                
                // Simple approach: just look for the closing tag
                let j = i + 1;
                
                while (j < endIndex) {
                    const nextLine = sgmlLines[j].trim();
                    
                    if (nextLine === `</${tagName}>`) {
                        // Found our closing tag
                        isHierarchical = true;
                        closingTagIndex = j;
                        break;
                    }
                    
                    j++;
                }
                
                
                
                if (isHierarchical) {
                    // Check for data on the same line (only allowed for SEC-HEADER and SEC-DOCUMENT)
                    if (cleanData && tagName !== 'SEC-HEADER' && tagName !== 'SEC-DOCUMENT') {
                        const accessionMatch = sgmlBody.match(/<ACCESSION-NUMBER>([^<]*)/);
                        const accessionNumber = accessionMatch ? accessionMatch[1] : 'unknown';
                        throw new Error(`Hierarchical tag '${tagName}' cannot have data on the same line. ACCESSION NUMBER: ${accessionNumber}`);
                    }
                    
                    // Check if there are multiple instances of this tag at the same level (array detection)
                    let arrayCount = 0;
                    let checkIndex = i;
                    
                    // Look for the same tag at the same level in the parent scope
                    while (checkIndex < endIndex) {
                        const checkLine = sgmlLines[checkIndex].trim();
                        if (checkLine.startsWith(`<${tagName}>`)) {
                            arrayCount++;
                        }
                        checkIndex++;
                    }
                    
                    // Check if it's an array tag
                    const isSgmlArray = SGML_ARRAY_TAGS.includes(tagName);
                    
                    // If array is detected but tag is not in SGML_ARRAY_TAGS, throw error
                    if (arrayCount > 1 && !isSgmlArray) {
                        const accessionMatch = sgmlBody.match(/<ACCESSION-NUMBER>([^<]*)/);
                        const accessionNumber = accessionMatch ? accessionMatch[1] : 'unknown';
                        throw new Error(`Tag ${tagName} is missing from SGML_ARRAY_TAGS array. ACCESSION NUMBER: ${accessionNumber}`);
                    }
                    
                    if (isSgmlArray) {
                        // This is an array tag - always process as array
                        const arrayItems = [];
                        let arrayIndex = i;
                        
                        while (arrayIndex < endIndex) {
                            const arrayLine = sgmlLines[arrayIndex].trim();
                            
                            if (arrayLine.startsWith(`<${tagName}>`)) {
                                // Find the closing tag for this array item
                                let itemClosingIndex = -1;
                                let itemIndex = arrayIndex + 1;
                                
                                while (itemIndex < endIndex) {
                                    const itemLine = sgmlLines[itemIndex].trim();
                                    
                                    if (itemLine === `</${tagName}>`) {
                                        itemClosingIndex = itemIndex;
                                        break;
                                    }
                                    
                                    itemIndex++;
                                }
                                
                                if (itemClosingIndex !== -1) {
                                    const item = processLines(arrayIndex + 1, itemClosingIndex, currentDepth + 1);
                                    arrayItems.push(item);
                                    arrayIndex = itemClosingIndex + 1;
                                } else {
                                    break;
                                }
                            } else {
                                // If we encounter a different tag, we've reached the end of the array
                                break;
                            }
                        }
                        
                        const jsonPropertyName = tagToJson(tagName);
                        obj[jsonPropertyName] = arrayItems;
                        i = arrayIndex;
                    } else {
                        // Single hierarchical tag
                        const jsonPropertyName = tagToJson(tagName);
                        obj[jsonPropertyName] = processLines(i + 1, closingTagIndex, currentDepth + 1);
                        i = closingTagIndex + 1;
                    }
                } else {
                    // Data bearing tag - check if it's an array tag
                    const isSgmlArray = SGML_ARRAY_TAGS.includes(tagName);
                    
                    if (isSgmlArray) {
                        // This is an array tag - always process as array, even if only one item
                        const arrayItems = [];
                        let arrayIndex = i;
                        
                        while (arrayIndex < endIndex) {
                            const arrayLine = sgmlLines[arrayIndex].trim();
                            
                            if (arrayLine.startsWith(`<${tagName}>`)) {
                                const tagMatch = arrayLine.match(/^<([A-Z][A-Z0-9-_]*)>(.*)$/);
                                if (tagMatch) {
                                    const [, , data] = tagMatch;
                                    const cleanData = data.replace(/<\/[^>]*>$/, '').trim();
                                    arrayItems.push(cleanData || '');
                                }
                                arrayIndex++;
                            } else {
                                // If we encounter a different tag, we've reached the end of the array
                                break;
                            }
                        }
                        
                        const jsonPropertyName = tagToJson(tagName);
                        obj[jsonPropertyName] = arrayItems;
                        i = arrayIndex;
                    } else {
                        // Single data bearing tag (not an array tag)
                        const jsonPropertyName = tagToJson(tagName);
                        const accessionMatch = sgmlBody.match(/<ACCESSION-NUMBER>([^<]*)/);
                        const accessionNumber = accessionMatch ? accessionMatch[1] : 'unknown';
                        if(obj[jsonPropertyName]) throw new Error(`Duplicate tag '${tagName}' found in SGML file. ACCESSION NUMBER: ${accessionNumber}`);
                        if(SGML_FLAG_TAGS.includes(jsonPropertyName))  {  //flag tags without data are true (e.g. <CORRECTION> and <DELETION>)
                            obj[jsonPropertyName] = true;
                        } else {
                            obj[jsonPropertyName] = cleanData || '';
                        }

                        i++;
                    }
                }
            } else {
                i++;
            }
        }
        
        return obj;
    };
    
    return processLines(0, sgmlLines.length);
}

/* // Self-executing test routine
(async function testSgmlToJson() {
    let sgmlBody, started, result;
    try {
        // Try to read the sample SGML file
        console.log('Reading sample SGML file #1 ...');
        sgmlBody = readFileSync('../samples/0001752724-25-192150/0001752724-25-192150.hdr.sgml', 'utf8');
        console.log('Sample SGML file found, processing...');
        started = Date.now();
        result = sgmlToJson(sgmlBody);
        console.log(`SGML to JSON conversion result (exec time ${Date.now() - started}ms):`);
        console.log(JSON.stringify(result, null, 2));


        console.log('Reading sample SGML file #2 (items) ...');
        sgmlBody = readFileSync('/data/0000081061-24-000003.hdr.sgml', 'utf8');
        console.log('Sample SGML file found, processing...');
        started = Date.now();
        result = sgmlToJson(sgmlBody);
        console.log(`SGML to JSON conversion result (exec time ${Date.now() - started}ms):`);
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('Sample SGML file not found.');
            
            
        } else {
            console.error('Error processing SGML:', error.message);
        }
    }
})();
 */
// Export the function

export { 
    sgmlToJson,
    tagToJson
 };

