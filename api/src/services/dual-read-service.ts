import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

export interface DualReadConfig {
  primarySource: 'supabase' | 'dynamodb';
  fallbackEnabled: boolean;
  comparisonMode: boolean;
  supabaseUrl?: string;
  supabaseKey?: string;
  dynamodbTableName?: string;
  awsRegion?: string;
}

export interface DataSourceResult<T> {
  data: T | null;
  source: 'supabase' | 'dynamodb';
  error?: string;
  responseTime: number;
}

export interface DualReadResult<T> {
  primary: DataSourceResult<T>;
  fallback?: DataSourceResult<T>;
  comparison?: {
    match: boolean;
    differences: string[];
  };
}

export class DualReadService {
  private supabaseClient?: SupabaseClient;
  private dynamodbClient?: DynamoDBDocumentClient;
  private config: DualReadConfig;

  constructor(config: DualReadConfig) {
    this.config = config;
    this.initializeClients();
  }

  private initializeClients(): void {
    // Initialize Supabase client
    if (this.config.supabaseUrl && this.config.supabaseKey) {
      this.supabaseClient = createClient(
        this.config.supabaseUrl,
        this.config.supabaseKey
      );
    }

    // Initialize DynamoDB client
    if (this.config.dynamodbTableName) {
      const dynamoClient = new DynamoDBClient({
        region: this.config.awsRegion || 'ap-southeast-2'
      });
      this.dynamodbClient = DynamoDBDocumentClient.from(dynamoClient);
    }
  }

  private async readFromSupabase<T>(
    table: string,
    query: any
  ): Promise<DataSourceResult<T>> {
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
        data: (query.single ? data?.[0] : data) as T,
        source: 'supabase',
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        data: null,
        source: 'supabase',
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      };
    }
  }

  private async readFromDynamoDB<T>(
    entityType: string,
    query: any
  ): Promise<DataSourceResult<T>> {
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
        
        const command = new GetCommand({
          TableName: this.config.dynamodbTableName,
          Key: { PK: pk, SK: sk }
        });
        
        result = await this.dynamodbClient.send(command);
        return {
          data: (result.Item as T) || null,
          source: 'dynamodb',
          responseTime: Date.now() - startTime
        };
      } else {
        // Query or scan for multiple items
        const command = query.userId 
          ? new QueryCommand({
              TableName: this.config.dynamodbTableName,
              KeyConditionExpression: 'PK = :pk',
              ExpressionAttributeValues: {
                ':pk': `USER#${query.userId}`
              }
            })
          : new ScanCommand({
              TableName: this.config.dynamodbTableName,
              FilterExpression: 'entityType = :entityType',
              ExpressionAttributeValues: {
                ':entityType': entityType.toUpperCase()
              }
            });

        result = await this.dynamodbClient.send(command);
        return {
          data: (result.Items as T) || null,
          source: 'dynamodb',
          responseTime: Date.now() - startTime
        };
      }
    } catch (error) {
      return {
        data: null,
        source: 'dynamodb',
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      };
    }
  }

  private buildPrimaryKey(entityType: string, query: any): string {
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

  private buildSortKey(entityType: string, query: any): string {
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

  private compareData<T>(
    supabaseData: T,
    dynamodbData: T
  ): { match: boolean; differences: string[] } {
    const differences: string[] = [];
    
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

  async dualRead<T>(
    entityType: string,
    query: any = {}
  ): Promise<DualReadResult<T>> {
    const tableName = this.getSupabaseTableName(entityType);
    
    // Determine read order based on primary source
    const primaryRead = this.config.primarySource === 'supabase'
      ? () => this.readFromSupabase<T>(tableName, query)
      : () => this.readFromDynamoDB<T>(entityType, query);
      
    const fallbackRead = this.config.primarySource === 'supabase'
      ? () => this.readFromDynamoDB<T>(entityType, query)
      : () => this.readFromSupabase<T>(tableName, query);

    // Execute primary read
    const primaryResult = await primaryRead();
    
    const result: DualReadResult<T> = {
      primary: primaryResult
    };

    // Execute fallback read if enabled or if primary failed
    if (this.config.fallbackEnabled || primaryResult.error) {
      result.fallback = await fallbackRead();
    }

    // Execute comparison if in comparison mode
    if (this.config.comparisonMode && result.fallback) {
      result.comparison = this.compareData(
        primaryResult.data,
        result.fallback.data
      );
    }

    return result;
  }

  private getSupabaseTableName(entityType: string): string {
    const tableMap: Record<string, string> = {
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
  async getUser(userId: string): Promise<DualReadResult<any>> {
    return this.dualRead('profiles', { id: userId, single: true });
  }

  async getUserByEmail(email: string): Promise<DualReadResult<any>> {
    return this.dualRead('profiles', { email, single: true });
  }

  async getUserAccounts(userId: string): Promise<DualReadResult<any[]>> {
    return this.dualRead('accounts', { userId });
  }

  async getAccount(accountId: string): Promise<DualReadResult<any>> {
    return this.dualRead('accounts', { id: accountId, single: true });
  }

  async getAccountTransactions(accountId: string): Promise<DualReadResult<any[]>> {
    return this.dualRead('transactions', { accountId });
  }

  async getFinancialProducts(): Promise<DualReadResult<any[]>> {
    return this.dualRead('financial_products', {});
  }

  // Health check method
  async healthCheck(): Promise<{
    supabase: { available: boolean; responseTime?: number; error?: string };
    dynamodb: { available: boolean; responseTime?: number; error?: string };
  }> {
    const supabaseCheck = this.supabaseClient 
      ? await this.readFromSupabase('profiles', { limit: 1 })
      : { data: null, source: 'supabase' as const, error: 'Client not initialized', responseTime: 0 };
      
    const dynamodbCheck = this.dynamodbClient
      ? await this.readFromDynamoDB('profiles', { limit: 1 })
      : { data: null, source: 'dynamodb' as const, error: 'Client not initialized', responseTime: 0 };

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