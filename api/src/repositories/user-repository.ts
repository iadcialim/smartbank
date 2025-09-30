import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { User } from '../models/user';

export class UserRepository {
  private client: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    const dynamoClient = new DynamoDBClient({ region: process.env['AWS_REGION'] || 'ap-southeast-2' });
    this.client = DynamoDBDocumentClient.from(dynamoClient);
    this.tableName = process.env['TABLE_NAME'] || 'SmartBankTable';
  }

  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date().toISOString();
    const newUser: User = {
      ...user,
      createdAt: now,
      updatedAt: now
    };

    await this.client.send(new PutCommand({
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

  async getUserById(userId: string): Promise<User | null> {
    const result = await this.client.send(new GetCommand({
      TableName: this.tableName,
      Key: {
        PK: `USER#${userId}`,
        SK: 'PROFILE'
      }
    }));

    if (!result.Item) return null;

    const { PK, SK, GSI1PK, GSI1SK, ...user } = result.Item;
    return user as User;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.client.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :email',
      ExpressionAttributeValues: {
        ':email': `EMAIL#${email}`
      }
    }));

    if (!result.Items || result.Items.length === 0) return null;

    const item = result.Items[0] as any;
    const { PK, SK, GSI1PK, GSI1SK, ...user } = item;
    return user as User;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const updateExpression = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

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

    const result = await this.client.send(new UpdateCommand({
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

    const { PK, SK, GSI1PK, GSI1SK, ...user } = result.Attributes!;
    return user as User;
  }
}