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
    return '0'.repeat(10-unpaddedCIK.toString().length) + unpaddedCIK.toString()
}
export const formatSeriesId = function(intSeriesID){ //accept int or string and return string with padded zero
    return 'S' +'0'.repeat(9-intSeriesID.toString().length) + intSeriesID.toString()
}
export const formatClassId = function(intClassID){ //accept int or string and return string with padded zero
    return 'C' + '0'.repeat(9-intClassID.toString().length) + intClassID.toString()
}

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
    formatClassId
};
