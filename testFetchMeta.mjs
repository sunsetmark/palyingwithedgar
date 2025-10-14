import { common } from './common.mjs';

const adsh = '0000794367-24-000002';

const result = await common.fetchSubmissionMetadata(adsh);

console.log('Former company from fetchSubmissionMetadata:');
console.table(result.submission.issuer.former_company);

// Also check the JSON file
import { readFile } from 'fs/promises';
import { exec } from 'child_process';

exec(`ls /data/filings/${adsh}/*_${adsh}.nc.json`, async (err, stdout) => {
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



