// Configuration module for the POC project
// Contains environment-specific parameters and database configurations

export const config = {
    // Database configurations
    DATABASES: {
        POC: {
            SERVER: '127.0.0.1',
            DB_NAME: 'poc',
            USER: 'poc_user',
            PWD: 'poc_pwd'
        },
        EDGAR: {
            SERVER: '127.0.0.1',
            DB_NAME: 'edgar',
            USER: 'edgar_user',
            PWD: 'edgar_pwd'
        }
    },
    
    // AWS S3 bucket configurations
    S3_BUCKETS: {
        TEST_BUCKET: 'test.publicdata.guru',
        PRODUCTION_BUCKET: 'production.publicdata.guru'
    },
    
    // SQS queue configurations
    SQS_QUEUES: {
        PROCESSING_QUEUE: 'processing-queue',
        NOTIFICATION_QUEUE: 'notification-queue'
    },
    
    // Application settings
    APP_NAME: 'POC_Application',
    VERSION: '1.0.0',
    ENVIRONMENT: 'development',
    
    // SEC Fair Use Policy settings
    SEC_REQUEST_DELAY: 100, // milliseconds
    SEC_USER_AGENT: 'Sunset Partners markelbert@gmail.com',
    SEC_HOST: 'www.sec.gov'
};
