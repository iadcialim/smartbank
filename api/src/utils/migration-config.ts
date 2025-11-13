import { DualReadConfig } from '../services/dual-read-service';

export interface MigrationPhase {
  phase: 'pre-migration' | 'dual-read' | 'dual-write' | 'post-migration';
  primarySource: 'supabase' | 'dynamodb';
  fallbackEnabled: boolean;
  comparisonMode: boolean;
  writeToSupabase: boolean;
  writeToDynamoDB: boolean;
}

export class MigrationConfigManager {
  private static instance: MigrationConfigManager;
  private currentPhase: MigrationPhase;

  private constructor() {
    this.currentPhase = this.loadPhaseFromEnvironment();
  }

  static getInstance(): MigrationConfigManager {
    if (!MigrationConfigManager.instance) {
      MigrationConfigManager.instance = new MigrationConfigManager();
    }
    return MigrationConfigManager.instance;
  }

  private loadPhaseFromEnvironment(): MigrationPhase {
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

  getCurrentPhase(): MigrationPhase {
    return this.currentPhase;
  }

  getDualReadConfig(): DualReadConfig {
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

  shouldWriteToSupabase(): boolean {
    return this.currentPhase.writeToSupabase;
  }

  shouldWriteToDynamoDB(): boolean {
    return this.currentPhase.writeToDynamoDB;
  }

  isComparisonModeEnabled(): boolean {
    return this.currentPhase.comparisonMode;
  }

  isFallbackEnabled(): boolean {
    return this.currentPhase.fallbackEnabled;
  }

  // Method to programmatically change phase (for testing)
  setPhase(phase: MigrationPhase['phase']): void {
    process.env.MIGRATION_PHASE = phase;
    this.currentPhase = this.loadPhaseFromEnvironment();
  }

  // Get migration status for monitoring
  getMigrationStatus(): {
    phase: string;
    primarySource: string;
    fallbackEnabled: boolean;
    comparisonMode: boolean;
    timestamp: string;
  } {
    return {
      phase: this.currentPhase.phase,
      primarySource: this.currentPhase.primarySource,
      fallbackEnabled: this.currentPhase.fallbackEnabled,
      comparisonMode: this.currentPhase.comparisonMode,
      timestamp: new Date().toISOString()
    };
  }
}