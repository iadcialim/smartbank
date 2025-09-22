# SmartBank Lambda Layer - Node.js Modules

This directory contains the Node.js modules layer for SmartBank Lambda functions.

## Purpose

The Lambda layer provides shared Node.js dependencies to all Lambda functions, reducing deployment package size and improving cold start performance.

## Structure

```
layers/nodejs/
├── node_modules/          # Shared Node.js dependencies
└── README.md             # This file
```

## Dependencies

Common dependencies that will be included in this layer:
- AWS SDK v3 modules
- Utility libraries (lodash, moment, etc.)
- Validation libraries (joi, yup, etc.)
- Logging libraries (winston, pino, etc.)

## Usage

The layer is automatically attached to all Lambda functions defined in the SAM template. Functions can import modules from this layer without including them in their individual deployment packages.

## Building the Layer

To build and deploy the layer:

```bash
# Install dependencies
npm install

# Copy node_modules to layer directory
cp -r node_modules layers/nodejs/

# Deploy with SAM
sam build
sam deploy
```

## Notes

- Keep the layer size under 250MB (unzipped)
- Only include dependencies that are shared across multiple functions
- Function-specific dependencies should remain in individual function packages
