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
export declare class DualReadService {
    private supabaseClient?;
    private dynamodbClient?;
    private config;
    constructor(config: DualReadConfig);
    private initializeClients;
    private readFromSupabase;
    private readFromDynamoDB;
    private buildPrimaryKey;
    private buildSortKey;
    private compareData;
    dualRead<T>(entityType: string, query?: any): Promise<DualReadResult<T>>;
    private getSupabaseTableName;
    getUser(userId: string): Promise<DualReadResult<any>>;
    getUserByEmail(email: string): Promise<DualReadResult<any>>;
    getUserAccounts(userId: string): Promise<DualReadResult<any[]>>;
    getAccount(accountId: string): Promise<DualReadResult<any>>;
    getAccountTransactions(accountId: string): Promise<DualReadResult<any[]>>;
    getFinancialProducts(): Promise<DualReadResult<any[]>>;
    healthCheck(): Promise<{
        supabase: {
            available: boolean;
            responseTime?: number;
            error?: string;
        };
        dynamodb: {
            available: boolean;
            responseTime?: number;
            error?: string;
        };
    }>;
}
//# sourceMappingURL=dual-read-service.d.ts.map