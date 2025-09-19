"use strict";
/**
 * SmartBank API - Main Entry Point
 * Australian Mobile Banking App Clone
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const handler = async (event, context) => {
    console.log('SmartBank API Handler invoked');
    console.log('Event:', JSON.stringify(event, null, 2));
    console.log('Context:', JSON.stringify(context, null, 2));
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
            message: 'SmartBank API is running',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        })
    };
};
exports.handler = handler;
//# sourceMappingURL=index.js.map