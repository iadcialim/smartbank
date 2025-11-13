"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DualReadService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
class DualReadService {
    supabaseClient;
    dynamodbClient;
    config;
    constructor(config) {
        this.config = config;
        this.initializeClients();
    }
    initializeClients() {
        // Initialize Supabase client
        if (this.config.supabaseUrl && this.config.supabaseKey) {
            this.supabaseClient = (0, supabase_js_1.createClient)(this.config.supabaseUrl, this.config.supabaseKey);
        }
        // Initialize DynamoDB client
        if (this.config.dynamodbTableName) {
            const dynamoClient = new client_dynamodb_1.DynamoDBClient({
                region: this.config.awsRegion || 'ap-southeast-2'
            });
            this.dynamodbClient = lib_dynamodb_1.DynamoDBDocumentClient.from(dynamoClient);
        }
    }
    async readFromSupabase(table, query) {
        const startTime = Date.now();
        try {
            if (!this.supabaseClient) {
                throw new Error('Supabase client not initialized');
            }
            let supabaseQuery = this.supabaseClient.from(table).select('*');
            // Apply filters
            if (query.id) {
                supabaseQuery = supabaseQuery.eq('id', query.id);
            }
            if (query.userId) {
                supabaseQuery = supabaseQuery.eq('user_id', query.userId);
            }
            if (query.email) {
                supabaseQuery = supabaseQuery.eq('email', query.email);
            }
            const { data, error } = await supabaseQuery;
            if (error) {
                throw new Error(error.message);
            }
            return {
                data: (query.single ? data?.[0] : data),
                source: 'supabase',
                responseTime: Date.now() - startTime
            };
        }
        catch (error) {
            return {
                data: null,
                source: 'supabase',
                error: error instanceof Error ? error.message : 'Unknown error',
                responseTime: Date.now() - startTime
            };
        }
    }
    async readFromDynamoDB(entityType, query) {
        const startTime = Date.now();
        try {
            if (!this.dynamodbClient || !this.config.dynamodbTableName) {
                throw new Error('DynamoDB client not initialized');
            }
            let result;
            if (query.id) {
                // Get single item by ID
                const pk = this.buildPrimaryKey(entityType, query);
                const sk = this.buildSortKey(entityType, query);
                const command = new lib_dynamodb_1.GetCommand({
                    TableName: this.config.dynamodbTableName,
                    Key: { PK: pk, SK: sk }
                });
                result = await this.dynamodbClient.send(command);
                return {
                    data: result.Item || null,
                    source: 'dynamodb',
                    responseTime: Date.now() - startTime
                };
            }
            else {
                // Query or scan for multiple items
                const command = query.userId
                    ? new lib_dynamodb_1.QueryCommand({
                        TableName: this.config.dynamodbTableName,
                        KeyConditionExpression: 'PK = :pk',
                        ExpressionAttributeValues: {
                            ':pk': `USER#${query.userId}`
                        }
                    })
                    : new lib_dynamodb_1.ScanCommand({
                        TableName: this.config.dynamodbTableName,
                        FilterExpression: 'entityType = :entityType',
                        ExpressionAttributeValues: {
                            ':entityType': entityType.toUpperCase()
                        }
                    });
                result = await this.dynamodbClient.send(command);
                return {
                    data: result.Items || null,
                    source: 'dynamodb',
                    responseTime: Date.now() - startTime
                };
            }
        }
        catch (error) {
            return {
                data: null,
                source: 'dynamodb',
                error: error instanceof Error ? error.message : 'Unknown error',
                responseTime: Date.now() - startTime
            };
        }
    }
    buildPrimaryKey(entityType, query) {
        switch (entityType) {
            case 'profiles':
                return `USER#${query.id}`;
            case 'accounts':
                return query.userId ? `USER#${query.userId}` : `ACCOUNT#${query.id}`;
            case 'transactions':
                return `ACCOUNT#${query.accountId}`;
            case 'financial_products':
                return `PRODUCT#${query.id}`;
            default:
                return `${entityType.toUpperCase()}#${query.id}`;
        }
    }
    buildSortKey(entityType, query) {
        switch (entityType) {
            case 'profiles':
                return 'PROFILE';
            case 'accounts':
                return `ACCOUNT#${query.id}`;
            case 'transactions':
                return `TRANSACTION#${query.createdAt || new Date().toISOString()}#${query.id}`;
            case 'financial_products':
                return 'DETAILS';
            default:
                return 'DETAILS';
        }
    }
    compareData(supabaseData, dynamodbData) {
        const differences = [];
        if (!supabaseData && !dynamodbData) {
            return { match: true, differences: [] };
        }
        if (!supabaseData || !dynamodbData) {
            differences.push('One source returned null while the other returned data');
            return { match: false, differences };
        }
        // Simple comparison - in production, this would be more sophisticated
        const supabaseStr = JSON.stringify(supabaseData);
        const dynamodbStr = JSON.stringify(dynamodbData);
        if (supabaseStr !== dynamodbStr) {
            differences.push('Data structures differ between sources');
        }
        return {
            match: differences.length === 0,
            differences
        };
    }
    async dualRead(entityType, query = {}) {
        const tableName = this.getSupabaseTableName(entityType);
        // Determine read order based on primary source
        const primaryRead = this.config.primarySource === 'supabase'
            ? () => this.readFromSupabase(tableName, query)
            : () => this.readFromDynamoDB(entityType, query);
        const fallbackRead = this.config.primarySource === 'supabase'
            ? () => this.readFromDynamoDB(entityType, query)
            : () => this.readFromSupabase(tableName, query);
        // Execute primary read
        const primaryResult = await primaryRead();
        const result = {
            primary: primaryResult
        };
        // Execute fallback read if enabled or if primary failed
        if (this.config.fallbackEnabled || primaryResult.error) {
            result.fallback = await fallbackRead();
        }
        // Execute comparison if in comparison mode
        if (this.config.comparisonMode && result.fallback) {
            result.comparison = this.compareData(primaryResult.data, result.fallback.data);
        }
        return result;
    }
    getSupabaseTableName(entityType) {
        const tableMap = {
            'profiles': 'profiles',
            'accounts': 'accounts',
            'transactions': 'transactions',
            'financial_products': 'financial_products',
            'transfers': 'transfers',
            'payments': 'payments'
        };
        return tableMap[entityType] || entityType;
    }
    // Convenience methods for specific entities
    async getUser(userId) {
        return this.dualRead('profiles', { id: userId, single: true });
    }
    async getUserByEmail(email) {
        return this.dualRead('profiles', { email, single: true });
    }
    async getUserAccounts(userId) {
        return this.dualRead('accounts', { userId });
    }
    async getAccount(accountId) {
        return this.dualRead('accounts', { id: accountId, single: true });
    }
    async getAccountTransactions(accountId) {
        return this.dualRead('transactions', { accountId });
    }
    async getFinancialProducts() {
        return this.dualRead('financial_products', {});
    }
    // Health check method
    async healthCheck() {
        const supabaseCheck = this.supabaseClient
            ? await this.readFromSupabase('profiles', { limit: 1 })
            : { data: null, source: 'supabase', error: 'Client not initialized', responseTime: 0 };
        const dynamodbCheck = this.dynamodbClient
            ? await this.readFromDynamoDB('profiles', { limit: 1 })
            : { data: null, source: 'dynamodb', error: 'Client not initialized', responseTime: 0 };
        return {
            supabase: {
                available: !supabaseCheck.error,
                responseTime: supabaseCheck.responseTime,
                error: supabaseCheck.error
            },
            dynamodb: {
                available: !dynamodbCheck.error,
                responseTime: dynamodbCheck.responseTime,
                error: dynamodbCheck.error
            }
        };
    }
}
exports.DualReadService = DualReadService;
//# sourceMappingURL=dual-read-service.js.map