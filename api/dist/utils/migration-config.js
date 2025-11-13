"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationConfigManager = void 0;
class MigrationConfigManager {
    static instance;
    currentPhase;
    constructor() {
        this.currentPhase = this.loadPhaseFromEnvironment();
    }
    static getInstance() {
        if (!MigrationConfigManager.instance) {
            MigrationConfigManager.instance = new MigrationConfigManager();
        }
        return MigrationConfigManager.instance;
    }
    loadPhaseFromEnvironment() {
        const phase = process.env.MIGRATION_PHASE || 'pre-migration';
        switch (phase) {
            case 'pre-migration':
                return {
                    phase: 'pre-migration',
                    primarySource: 'supabase',
                    fallbackEnabled: false,
                    comparisonMode: false,
                    writeToSupabase: true,
                    writeToDynamoDB: false
                };
            case 'dual-read':
                return {
                    phase: 'dual-read',
                    primarySource: 'supabase',
                    fallbackEnabled: true,
                    comparisonMode: true,
                    writeToSupabase: true,
                    writeToDynamoDB: false
                };
            case 'dual-write':
                return {
                    phase: 'dual-write',
                    primarySource: 'supabase',
                    fallbackEnabled: true,
                    comparisonMode: true,
                    writeToSupabase: true,
                    writeToDynamoDB: true
                };
            case 'post-migration':
                return {
                    phase: 'post-migration',
                    primarySource: 'dynamodb',
                    fallbackEnabled: false,
                    comparisonMode: false,
                    writeToSupabase: false,
                    writeToDynamoDB: true
                };
            default:
                console.warn(`Unknown migration phase: ${phase}, defaulting to pre-migration`);
                return {
                    phase: 'pre-migration',
                    primarySource: 'supabase',
                    fallbackEnabled: false,
                    comparisonMode: false,
                    writeToSupabase: true,
                    writeToDynamoDB: false
                };
        }
    }
    getCurrentPhase() {
        return this.currentPhase;
    }
    getDualReadConfig() {
        return {
            primarySource: this.currentPhase.primarySource,
            fallbackEnabled: this.currentPhase.fallbackEnabled,
            comparisonMode: this.currentPhase.comparisonMode,
            supabaseUrl: process.env.SUPABASE_URL,
            supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            dynamodbTableName: process.env.DYNAMODB_TABLE_NAME,
            awsRegion: process.env.AWS_REGION || 'ap-southeast-2'
        };
    }
    shouldWriteToSupabase() {
        return this.currentPhase.writeToSupabase;
    }
    shouldWriteToDynamoDB() {
        return this.currentPhase.writeToDynamoDB;
    }
    isComparisonModeEnabled() {
        return this.currentPhase.comparisonMode;
    }
    isFallbackEnabled() {
        return this.currentPhase.fallbackEnabled;
    }
    // Method to programmatically change phase (for testing)
    setPhase(phase) {
        process.env.MIGRATION_PHASE = phase;
        this.currentPhase = this.loadPhaseFromEnvironment();
    }
    // Get migration status for monitoring
    getMigrationStatus() {
        return {
            phase: this.currentPhase.phase,
            primarySource: this.currentPhase.primarySource,
            fallbackEnabled: this.currentPhase.fallbackEnabled,
            comparisonMode: this.currentPhase.comparisonMode,
            timestamp: new Date().toISOString()
        };
    }
}
exports.MigrationConfigManager = MigrationConfigManager;
//# sourceMappingURL=migration-config.js.map