import { common } from './common.mjs';

const adsh = '0000794367-24-000002';

const rows = await common.runQuery('POC', 
    'SELECT adsh, cik, former_name_sequence, former_conformed_name, date_changed FROM submission_former_name WHERE adsh = ? ORDER BY former_name_sequence',
    [adsh]);

console.log('Former names for', adsh);
console.table(rows);

// Also check the JSON file
import { readFile } from 'fs/promises';
const jsonFile = `/data/filings/${adsh}/*_${adsh}.nc.json`;
const { exec } = await import('child_process');
exec(`ls ${jsonFile}`, async (err, stdout) => {
    if (!err) {
        const filePath = stdout.trim();
        const content = await readFile(filePath, 'utf-8');
        const data = JSON.parse(content);
        console.log('\nFormer company from file:');
        console.table(data.submission.issuer.former_company);
    }
    
    // Close DB connections
    await common.closeAllPools();
    process.exit(0);
});



