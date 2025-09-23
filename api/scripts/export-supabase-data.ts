#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface ExportConfig {
  supabaseUrl: string;
  supabaseKey: string;
  outputDir: string;
}

interface ExportResult {
  table: string;
  count: number;
  file: string;
}

class SupabaseExporter {
  private client;
  private outputDir: string;

  constructor(config: ExportConfig) {
    this.client = createClient(config.supabaseUrl, config.supabaseKey);
    this.outputDir = config.outputDir;
    
    // Ensure output directory exists
    mkdirSync(this.outputDir, { recursive: true });
  }

  async exportTable(tableName: string): Promise<ExportResult> {
    console.log(`Exporting ${tableName}...`);
    
    const { data, error } = await this.client
      .from(tableName)
      .select('*');

    if (error) {
      throw new Error(`Failed to export ${tableName}: ${error.message}`);
    }

    const filename = `${tableName}.json`;
    const filepath = join(this.outputDir, filename);
    
    writeFileSync(filepath, JSON.stringify(data, null, 2));
    
    return {
      table: tableName,
      count: data?.length || 0,
      file: filepath
    };
  }

  async exportAll(): Promise<ExportResult[]> {
    const tables = [
      'profiles',
      'accounts', 
      'financial_products',
      'transactions',
      'transfers',
      'payments'
    ];

    const results: ExportResult[] = [];
    
    for (const table of tables) {
      try {
        const result = await this.exportTable(table);
        results.push(result);
        console.log(`✅ ${table}: ${result.count} records exported`);
      } catch (error) {
        console.error(`❌ ${table}: ${error}`);
      }
    }

    // Export metadata
    const metadata = {
      exportDate: new Date().toISOString(),
      tables: results,
      totalRecords: results.reduce((sum, r) => sum + r.count, 0)
    };

    writeFileSync(
      join(this.outputDir, 'export-metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    return results;
  }
}

async function main() {
  const config: ExportConfig = {
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    outputDir: join(__dirname, '../data/supabase-export')
  };

  if (!config.supabaseUrl || !config.supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    process.exit(1);
  }

  try {
    const exporter = new SupabaseExporter(config);
    const results = await exporter.exportAll();
    
    console.log('\n📊 Export Summary:');
    results.forEach(r => console.log(`  ${r.table}: ${r.count} records`));
    console.log(`\n✅ Export completed successfully!`);
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { SupabaseExporter, ExportConfig, ExportResult };