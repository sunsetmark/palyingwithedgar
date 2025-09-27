#!/bin/bash

# Installation script for POC Node.js project
# This script installs all necessary npm dependencies

echo "Starting installation of Node.js dependencies..."

# Navigate to the code directory
cd /home/ec2-user/poc/code

# Initialize package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    echo "Creating package.json..."
    npm init -y
fi

# Install AWS SDK v3 packages
echo "Installing AWS SDK v3 packages..."
npm install @aws-sdk/client-s3@^3.0.0
npm install @aws-sdk/client-sqs@^3.0.0

# Install MySQL/MariaDB connector
echo "Installing MySQL/MariaDB connector..."
npm install mysql2@^3.0.0

# Install additional utility packages
echo "Installing utility packages..."
npm install node-fetch@^3.0.0
npm install uuencode

# Install development dependencies
echo "Installing development dependencies..."
npm install --save-dev @types/node@^20.0.0

# Verify installations
echo "Verifying installations..."
npm list --depth=0

echo "Installation completed successfully!"
echo "Dependencies installed:"
echo "  - @aws-sdk/client-s3: AWS S3 client"
echo "  - @aws-sdk/client-sqs: AWS SQS client"
echo "  - mysql2: MySQL/MariaDB connector"
echo "  - node-fetch: HTTP client for web requests"
echo "  - uuencode: UU encoding/decoding for PDF processing"
echo "  - @types/node: TypeScript definitions for Node.js"

echo ""
echo "To run the test script:"
echo "  node test.mjs"
