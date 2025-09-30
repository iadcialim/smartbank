"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
class UserRepository {
    constructor() {
        const dynamoClient = new client_dynamodb_1.DynamoDBClient({ region: process.env['AWS_REGION'] || 'ap-southeast-2' });
        this.client = lib_dynamodb_1.DynamoDBDocumentClient.from(dynamoClient);
        this.tableName = process.env['TABLE_NAME'] || 'SmartBankTable';
    }
    async createUser(user) {
        const now = new Date().toISOString();
        const newUser = {
            ...user,
            createdAt: now,
            updatedAt: now
        };
        await this.client.send(new lib_dynamodb_1.PutCommand({
            TableName: this.tableName,
            Item: {
                PK: `USER#${user.userId}`,
                SK: `PROFILE`,
                ...newUser,
                GSI1PK: `EMAIL#${user.email}`,
                GSI1SK: `USER#${user.userId}`
            }
        }));
        return newUser;
    }
    async getUserById(userId) {
        const result = await this.client.send(new lib_dynamodb_1.GetCommand({
            TableName: this.tableName,
            Key: {
                PK: `USER#${userId}`,
                SK: 'PROFILE'
            }
        }));
        if (!result.Item)
            return null;
        const { PK, SK, GSI1PK, GSI1SK, ...user } = result.Item;
        return user;
    }
    async getUserByEmail(email) {
        const result = await this.client.send(new lib_dynamodb_1.QueryCommand({
            TableName: this.tableName,
            IndexName: 'GSI1',
            KeyConditionExpression: 'GSI1PK = :email',
            ExpressionAttributeValues: {
                ':email': `EMAIL#${email}`
            }
        }));
        if (!result.Items || result.Items.length === 0)
            return null;
        const item = result.Items[0];
        const { PK, SK, GSI1PK, GSI1SK, ...user } = item;
        return user;
    }
    async updateUser(userId, updates) {
        const updateExpression = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};
        for (const [key, value] of Object.entries(updates)) {
            if (key !== 'userId') {
                updateExpression.push(`#${key} = :${key}`);
                expressionAttributeNames[`#${key}`] = key;
                expressionAttributeValues[`:${key}`] = value;
            }
        }
        updateExpression.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeValues[':updatedAt'] = new Date().toISOString();
        const result = await this.client.send(new lib_dynamodb_1.UpdateCommand({
            TableName: this.tableName,
            Key: {
                PK: `USER#${userId}`,
                SK: 'PROFILE'
            },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        }));
        const { PK, SK, GSI1PK, GSI1SK, ...user } = result.Attributes;
        return user;
    }
}
exports.UserRepository = UserRepository;
