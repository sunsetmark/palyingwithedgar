// Test script for common.mjs functions
import { common } from './common.mjs';

console.log('Starting tests for common.mjs...\n');

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

console.log('All tests completed!');
