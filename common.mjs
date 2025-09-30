// Common utility functions for AWS services and other project-wide functionality
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import { createGunzip } from 'zlib';
import { promisify } from 'util';
import mysql from 'mysql2/promise';
import { config } from './config.mjs';

// AWS clients
const s3Client = new S3Client({ region: 'us-east-1' });
const sqsClient = new SQSClient({ region: 'us-east-1' });

// Module-level variables for SEC Fair Use Policy
let recentSecRequest = false;
let secRequestTimer = null;

// Database connection pools
const connectionPools = {};

// Regex patterns for ID extraction (module-level constants)
const REGEX_PATTERNS = {
    CIK: /^(\d{10})$/,
    SERIES_ID: /^S(\d{9})$/,
    CLASS_ID: /^C(\d{9})$/,
    ACCESSION_NUMBER: /^(\d{10})-(\d{2})-(\d{6})$/
};

// S3 Functions
export const s3ReadString = async (bucket, key) => {
    try {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key
        });
        const response = await s3Client.send(command);
        const chunks = [];
        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks).toString('utf-8');
    } catch (error) {
        throw new Error(`S3 Read String Error: ${error.message}`);
    }
};

export const s3ReadStream = async (bucket, key) => {
    try {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key
        });
        const response = await s3Client.send(command);
        return response.Body;
    } catch (error) {
        throw new Error(`S3 Read Stream Error: ${error.message}`);
    }
};

export const s3ReadLine = async (bucket, key) => {
    try {
        const content = await s3ReadString(bucket, key);
        return content.split('\n');
    } catch (error) {
        throw new Error(`S3 Read Line Error: ${error.message}`);
    }
};

export const s3WriteString = async (bucket, key, body) => {
    try {
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: 'text/plain'
        });
        await s3Client.send(command);
        return { success: true, message: 'String written to S3 successfully' };
    } catch (error) {
        throw new Error(`S3 Write String Error: ${error.message}`);
    }
};

export const s3WriteStream = async (bucket, key, writeStream) => {
    try {
        const chunks = [];
        for await (const chunk of writeStream) {
            chunks.push(chunk);
        }
        const body = Buffer.concat(chunks);
        
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: 'application/octet-stream'
        });
        await s3Client.send(command);
        return { success: true, message: 'Stream written to S3 successfully' };
    } catch (error) {
        throw new Error(`S3 Write Stream Error: ${error.message}`);
    }
};

// SQS Functions
export const sqsWriteMessage = async (queue, message) => {
    try {
        const command = new SendMessageCommand({
            QueueUrl: queue,
            MessageBody: JSON.stringify(message)
        });
        const response = await sqsClient.send(command);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        throw new Error(`SQS Write Message Error: ${error.message}`);
    }
};

// Web Fetch Function with SEC Fair Use Policy compliance
export const webFetchFair = async (url) => {
    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    // Check if this is a SEC.gov request
    const isSec = url.includes('.sec.gov');
    
    // SEC Fair Use Policy compliance
    if (isSec) {
        if (recentSecRequest) {
            throw new Error('Violation of SEC Fair Use Policy: Request too soon after previous SEC request');
        }
        
        recentSecRequest = true;
        secRequestTimer = setTimeout(() => {
            recentSecRequest = false;
            secRequestTimer = null;
        }, config.SEC_REQUEST_DELAY);
    }
    
    try {
        // Prepare headers
        const headers = {
            'Accept-Encoding': 'gzip'
        };
        
        if (isSec) {
            headers['User-Agent'] = config.SEC_USER_AGENT;
            headers['Host'] = config.SEC_HOST;
        }
        
        // Make the request
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        
        // Get response body
        let body = await response.arrayBuffer();
        let text = Buffer.from(body).toString('utf-8');
        
        // Check if response is gzip compressed
        const contentEncoding = response.headers.get('content-encoding');
        if (contentEncoding && contentEncoding.includes('gzip')) {
            try {
                const gunzip = createGunzip();
                const buffer = Buffer.from(body);
                const decompressed = await new Promise((resolve, reject) => {
                    const chunks = [];
                    gunzip.on('data', chunk => chunks.push(chunk));
                    gunzip.on('end', () => resolve(Buffer.concat(chunks)));
                    gunzip.on('error', reject);
                    gunzip.write(buffer);
                    gunzip.end();
                });
                text = decompressed.toString('utf-8');
            } catch (decompressError) {
                console.warn('Failed to decompress gzip response, returning raw content:', decompressError.message);
            }
        }
        
        return text;
    } catch (error) {
        throw new Error(`Web Fetch Error: ${error.message}`);
    }
};

// Database Query Function with Connection Pooling
export const runQuery = async (db, sql, params = []) => {
    try {
        // Get database configuration
        const dbConfig = config.DATABASES[db];
        if (!dbConfig) {
            throw new Error(`Database configuration not found for: ${db}`);
        }
        
        // Get or create connection pool for this database
        if (!connectionPools[db]) {
            connectionPools[db] = mysql.createPool({
                host: dbConfig.SERVER,
                user: dbConfig.USER,
                password: dbConfig.PWD,
                database: dbConfig.DB_NAME,
                connectionLimit: 10, // Maximum number of connections in the pool
                queueLimit: 0 // Maximum number of connection requests the pool will queue
            });
        }
        
        // Execute query using the pool
        const [rows] = await connectionPools[db].execute(sql, params);
        return rows;
    } catch (error) {
        console.log(sql, params);
        throw new Error(`Database Query Error: ${error.message}`);
    }
};

// Function to close all connection pools
export const closeAllPools = async () => {
    const closePromises = Object.values(connectionPools).map(pool => pool.end());
    await Promise.all(closePromises);
    Object.keys(connectionPools).forEach(key => delete connectionPools[key]);
};

//data helper functions
export const formatCIK = function(unpaddedCIK){ //accept int or string and return string with padded zero
    return formatIndexKey(unpaddedCIK, '');
}
export const formatSeriesId = function(intSeriesID){ //accept int or string and return string with padded zero
    return formatIndexKey(intSeriesID, 'S');
}
export const formatClassId = function(intClassID){ //accept int or string and return string with padded zero
    return formatIndexKey(intClassID, 'C');
}

/**
 * Formats an ID with optional prefix and left-pads with zeros to 10 characters
 * @param {number|string} id - The ID to format
 * @param {string} prefix - Optional prefix ('S' for Series, 'C' for Class, '' for default)
 * @returns {string} - Formatted ID string
 * @throws {Error} - If prefix is invalid
 */
export const formatIndexKey = function(id, prefix = '') {
    // Validate prefix
    if (prefix !== '' && prefix !== 'S' && prefix !== 'C') {
        throw new Error(`Invalid prefix '${prefix}'. Valid prefixes are '', 'S', or 'C'.`);
    }
    
    const idStr = id.toString();
    const totalLength = 10;
    const paddingLength = totalLength - prefix.length - idStr.length;
    
    if (paddingLength < 0) {
        throw new Error(`ID '${id}' with prefix '${prefix}' exceeds maximum length of ${totalLength} characters.`);
    }
    
    return prefix + '0'.repeat(paddingLength) + idStr;
};

/**
 * Formats an accession number from an integer
 * @param {number} accession_int - The accession number as integer
 * @returns {string} - Formatted accession number (e.g., "0000000000-24-000001")
 * @throws {Error} - If accession_int or components are <= 0
 */
export const formatAccessionNumber = function(accession_int) {
    if (accession_int <= 0) {
        throw new Error(`Accession number must be > 0, got: ${accession_int}`);
    }
    
    // Convert to 18-character string with leading zeros
    const accessionStr = accession_int.toString().padStart(18, '0');
    
    // Extract components
    const cik = accessionStr.substring(0, 10);
    const year = accessionStr.substring(10, 12);
    const filingCount = accessionStr.substring(12, 18);
    
    // Validate components
    const cikInt = parseInt(cik, 10);
    const filingCountInt = parseInt(filingCount, 10);
    
    if (cikInt <= 0) {
        throw new Error(`CIK component must be > 0, got: ${cikInt}`);
    }
    
    if (filingCountInt <= 0) {
        throw new Error(`Filing count component must be > 0, got: ${filingCountInt}`);
    }
    
    return `${cik}-${year}-${filingCount}`;
};

/**
 * Extracts integer ID from formatted string (CIK, Series ID, Class ID, or Accession Number)
 * @param {string} adshCikSeriesClassId - The formatted ID string
 * @returns {number} - The extracted integer ID
 * @throws {Error} - If input doesn't match any of the 4 formats
 */
export const extractIntId = function(adshCikSeriesClassId) {
    if (!adshCikSeriesClassId || typeof adshCikSeriesClassId !== 'string') {
        throw new Error(`Invalid input: expected string, got ${typeof adshCikSeriesClassId}`);
    }
    
    // Try CIK format (10 digits)
    let match = adshCikSeriesClassId.match(REGEX_PATTERNS.CIK);
    if (match) {
        return parseInt(match[1], 10);
    }
    
    // Try Series ID format (S + 9 digits)
    match = adshCikSeriesClassId.match(REGEX_PATTERNS.SERIES_ID);
    if (match) {
        return parseInt(match[1], 10);
    }
    
    // Try Class ID format (C + 9 digits)
    match = adshCikSeriesClassId.match(REGEX_PATTERNS.CLASS_ID);
    if (match) {
        return parseInt(match[1], 10);
    }
    
    // Try Accession Number format (10-2-6 with dashes)
    match = adshCikSeriesClassId.match(REGEX_PATTERNS.ACCESSION_NUMBER);
    if (match) {
        const cik = match[1];
        const year = match[2];
        const filingCount = match[3];
        const accessionStr = cik + year + filingCount;
        return parseInt(accessionStr, 10);
    }
    
    throw new Error(`Input '${adshCikSeriesClassId}' does not match any of the 4 valid formats: CIK (10 digits), Series ID (S + 9 digits), Class ID (C + 9 digits), or Accession Number (10-2-6 with dashes)`);
};

// Export common object with all functions
export const common = {
    s3ReadString,
    s3ReadStream,
    s3ReadLine,
    s3WriteString,
    s3WriteStream,
    sqsWriteMessage,
    webFetchFair,
    runQuery,
    closeAllPools,
    formatCIK,
    formatSeriesId,
    formatClassId,
    formatIndexKey,
    formatAccessionNumber,
    extractIntId
};
