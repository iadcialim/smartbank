import { DualReadConfig } from '../services/dual-read-service';
export interface MigrationPhase {
    phase: 'pre-migration' | 'dual-read' | 'dual-write' | 'post-migration';
    primarySource: 'supabase' | 'dynamodb';
    fallbackEnabled: boolean;
    comparisonMode: boolean;
    writeToSupabase: boolean;
    writeToDynamoDB: boolean;
}
export declare class MigrationConfigManager {
    private static instance;
    private currentPhase;
    private constructor();
    static getInstance(): MigrationConfigManager;
    private loadPhaseFromEnvironment;
    getCurrentPhase(): MigrationPhase;
    getDualReadConfig(): DualReadConfig;
    shouldWriteToSupabase(): boolean;
    shouldWriteToDynamoDB(): boolean;
    isComparisonModeEnabled(): boolean;
    isFallbackEnabled(): boolean;
    setPhase(phase: MigrationPhase['phase']): void;
    getMigrationStatus(): {
        phase: string;
        primarySource: string;
        fallbackEnabled: boolean;
        comparisonMode: boolean;
        timestamp: string;
    };
}
//# sourceMappingURL=migration-config.d.ts.map