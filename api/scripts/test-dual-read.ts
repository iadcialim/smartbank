#!/usr/bin/env node

import { DualReadService } from '../src/services/dual-read-service';
import { MigrationConfigManager } from '../src/utils/migration-config';

async function testDualRead() {
  console.log('🔄 Testing Dual-Read Capability\n');

  // Test different migration phases
  const phases = ['pre-migration', 'dual-read', 'dual-write', 'post-migration'];
  
  for (const phase of phases) {
    console.log(`\n📋 Testing Phase: ${phase}`);
    console.log('='.repeat(40));
    
    // Set migration phase
    const configManager = MigrationConfigManager.getInstance();
    configManager.setPhase(phase as any);
    
    const config = configManager.getDualReadConfig();
    const dualReadService = new DualReadService(config);
    
    // Test health check
    console.log('\n🏥 Health Check:');
    const healthCheck = await dualReadService.healthCheck();
    console.log(`  Supabase: ${healthCheck.supabase.available ? '✅' : '❌'} (${healthCheck.supabase.responseTime}ms)`);
    console.log(`  DynamoDB: ${healthCheck.dynamodb.available ? '✅' : '❌'} (${healthCheck.dynamodb.responseTime}ms)`);
    
    // Test user read
    console.log('\n👤 Testing User Read:');
    try {
      const userResult = await dualReadService.getUser('user-123');
      console.log(`  Primary (${userResult.primary.source}): ${userResult.primary.data ? '✅' : '❌'} (${userResult.primary.responseTime}ms)`);
      
      if (userResult.fallback) {
        console.log(`  Fallback (${userResult.fallback.source}): ${userResult.fallback.data ? '✅' : '❌'} (${userResult.fallback.responseTime}ms)`);
      }
      
      if (userResult.comparison) {
        console.log(`  Data Match: ${userResult.comparison.match ? '✅' : '❌'}`);
        if (!userResult.comparison.match) {
          console.log(`  Differences: ${userResult.comparison.differences.join(', ')}`);
        }
      }
    } catch (error) {
      console.log(`  Error: ${error}`);
    }
    
    // Test accounts read
    console.log('\n🏦 Testing Accounts Read:');
    try {
      const accountsResult = await dualReadService.getUserAccounts('user-123');
      console.log(`  Primary (${accountsResult.primary.source}): ${accountsResult.primary.data ? '✅' : '❌'} (${accountsResult.primary.responseTime}ms)`);
      
      if (accountsResult.fallback) {
        console.log(`  Fallback (${accountsResult.fallback.source}): ${accountsResult.fallback.data ? '✅' : '❌'} (${accountsResult.fallback.responseTime}ms)`);
      }
    } catch (error) {
      console.log(`  Error: ${error}`);
    }
    
    // Show migration status
    const status = configManager.getMigrationStatus();
    console.log('\n📊 Migration Status:');
    console.log(`  Phase: ${status.phase}`);
    console.log(`  Primary Source: ${status.primarySource}`);
    console.log(`  Fallback Enabled: ${status.fallbackEnabled ? '✅' : '❌'}`);
    console.log(`  Comparison Mode: ${status.comparisonMode ? '✅' : '❌'}`);
  }
  
  console.log('\n✅ Dual-Read Testing Complete');
}

// Run test if called directly
if (require.main === module) {
  testDualRead().catch(console.error);
}

export { testDualRead };