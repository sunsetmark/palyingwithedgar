// Test script for SGML template generation
import Handlebars from 'handlebars';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

console.log('Starting SGML template test...\n');

// Read and compile the Handlebars templates
const templateSource = await readFile('./sgml_template.handlebars', 'utf-8');
const entityPartialSource = await readFile('./sgml_entity_partial.handlebars', 'utf-8');

// Register the entity partial
Handlebars.registerPartial('entity', entityPartialSource);

// Register a custom helper to check if a property exists (even if it's an empty string)
Handlebars.registerHelper('hasProperty', function(obj, propName) {
    return obj && obj.hasOwnProperty(propName);
});

// Register helper to check if this is an investment company form (N-2, N-14, 486 series, etc.)
Handlebars.registerHelper('isInvestmentCompanyForm', function(formType) {
    if (!formType) return false;
    const rootForm = formType.split('/')[0].trim();
    const investmentForms = ['N-2', 'N-14', '486APOS', '486BPOS', '486BXT', 'N-2ASR', 'POS 8C', 'N-14 8C', '485APOS', '485BPOS', '485BXT'];
    return investmentForms.includes(rootForm);
});

// Compile the main template
const template = Handlebars.compile(templateSource);

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
            
            // Generate SGML from the metadata using the template
            const generatedSgml = template(metadata.submission);
            
            // Read the original SGML file
            const originalSgml = await readFile(sgmlFilePath, 'utf-8');
            
            // Normalize both for comparison (remove extra whitespace, normalize line endings)
            const normalizeString = (str) => {
                return str
                    .replace(/\r\n/g, '\n')  // Normalize line endings
                    .replace(/\n+/g, '\n')   // Remove extra blank lines
                    .trim();
            };
            
            const normalizedGenerated = normalizeString(generatedSgml);
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
console.log('Test completed!');
process.exit(0);

