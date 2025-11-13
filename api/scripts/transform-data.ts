#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

interface TransformConfig {
  inputDir: string;
  outputDir: string;
}

interface DynamoDBItem {
  PK: { S: string };
  SK: { S: string };
  GSI1PK?: { S: string };
  GSI1SK?: { S: string };
  [key: string]: any;
}

interface TransformResult {
  entity: string;
  inputCount: number;
  outputCount: number;
  file: string;
}

class DataTransformer {
  private inputDir: string;
  private outputDir: string;

  constructor(config: TransformConfig) {
    this.inputDir = config.inputDir;
    this.outputDir = config.outputDir;
    
    // Ensure output directory exists
    mkdirSync(this.outputDir, { recursive: true });
  }

  private toDynamoDBFormat(value: any): any {
    if (value === null || value === undefined) return { NULL: true };
    if (typeof value === 'string') return { S: value };
    if (typeof value === 'number') return { N: value.toString() };
    if (typeof value === 'boolean') return { BOOL: value };
    if (Array.isArray(value)) return { L: value.map(v => this.toDynamoDBFormat(v)) };
    if (typeof value === 'object') {
      const obj: any = { M: {} };
      for (const [k, v] of Object.entries(value)) {
        obj.M[k] = this.toDynamoDBFormat(v);
      }
      return obj;
    }
    return { S: String(value) };
  }

  private transformProfiles(profiles: any[]): DynamoDBItem[] {
    return profiles.map(profile => ({
      PK: { S: `USER#${profile.id}` },
      SK: { S: `PROFILE` },
      GSI1PK: { S: `EMAIL#${profile.email}` },
      GSI1SK: { S: `USER#${profile.id}` },
      id: this.toDynamoDBFormat(profile.id),
      email: this.toDynamoDBFormat(profile.email),
      firstName: this.toDynamoDBFormat(profile.first_name),
      lastName: this.toDynamoDBFormat(profile.last_name),
      phone: this.toDynamoDBFormat(profile.phone),
      dateOfBirth: this.toDynamoDBFormat(profile.date_of_birth),
      address: this.toDynamoDBFormat(profile.address),
      createdAt: this.toDynamoDBFormat(profile.created_at),
      updatedAt: this.toDynamoDBFormat(profile.updated_at),
      entityType: { S: 'USER' }
    }));
  }

  private transformAccounts(accounts: any[]): DynamoDBItem[] {
    return accounts.map(account => ({
      PK: { S: `USER#${account.user_id}` },
      SK: { S: `ACCOUNT#${account.id}` },
      GSI1PK: { S: `ACCOUNT#${account.id}` },
      GSI1SK: { S: `USER#${account.user_id}` },
      id: this.toDynamoDBFormat(account.id),
      userId: this.toDynamoDBFormat(account.user_id),
      accountNumber: this.toDynamoDBFormat(account.account_number),
      bsb: this.toDynamoDBFormat(account.bsb),
      accountType: this.toDynamoDBFormat(account.account_type),
      balance: this.toDynamoDBFormat(account.balance),
      availableBalance: this.toDynamoDBFormat(account.available_balance),
      productId: this.toDynamoDBFormat(account.product_id),
      status: this.toDynamoDBFormat(account.status),
      createdAt: this.toDynamoDBFormat(account.created_at),
      updatedAt: this.toDynamoDBFormat(account.updated_at),
      entityType: { S: 'ACCOUNT' }
    }));
  }

  private transformTransactions(transactions: any[]): DynamoDBItem[] {
    return transactions.map(transaction => ({
      PK: { S: `ACCOUNT#${transaction.account_id}` },
      SK: { S: `TRANSACTION#${transaction.created_at}#${transaction.id}` },
      GSI1PK: { S: `TRANSACTION#${transaction.id}` },
      GSI1SK: { S: `ACCOUNT#${transaction.account_id}` },
      id: this.toDynamoDBFormat(transaction.id),
      accountId: this.toDynamoDBFormat(transaction.account_id),
      amount: this.toDynamoDBFormat(transaction.amount),
      type: this.toDynamoDBFormat(transaction.type),
      description: this.toDynamoDBFormat(transaction.description),
      reference: this.toDynamoDBFormat(transaction.reference),
      balanceAfter: this.toDynamoDBFormat(transaction.balance_after),
      createdAt: this.toDynamoDBFormat(transaction.created_at),
      entityType: { S: 'TRANSACTION' }
    }));
  }

  private transformFinancialProducts(products: any[]): DynamoDBItem[] {
    return products.map(product => ({
      PK: { S: `PRODUCT#${product.id}` },
      SK: { S: `DETAILS` },
      GSI1PK: { S: `PRODUCT_TYPE#${product.product_type}` },
      GSI1SK: { S: `PRODUCT#${product.id}` },
      id: this.toDynamoDBFormat(product.id),
      name: this.toDynamoDBFormat(product.name),
      productType: this.toDynamoDBFormat(product.product_type),
      description: this.toDynamoDBFormat(product.description),
      interestRate: this.toDynamoDBFormat(product.interest_rate),
      fees: this.toDynamoDBFormat(product.fees),
      features: this.toDynamoDBFormat(product.features),
      isActive: this.toDynamoDBFormat(product.is_active),
      createdAt: this.toDynamoDBFormat(product.created_at),
      entityType: { S: 'FINANCIAL_PRODUCT' }
    }));
  }

  private transformEntity(entityName: string, data: any[]): DynamoDBItem[] {
    switch (entityName) {
      case 'profiles':
        return this.transformProfiles(data);
      case 'accounts':
        return this.transformAccounts(data);
      case 'transactions':
        return this.transformTransactions(data);
      case 'financial_products':
        return this.transformFinancialProducts(data);
      case 'transfers':
      case 'payments':
        // Simple transformation for transfers and payments
        return data.map(item => ({
          PK: { S: `${entityName.toUpperCase()}#${item.id}` },
          SK: { S: 'DETAILS' },
          ...Object.entries(item).reduce((acc, [key, value]) => {
            acc[key] = this.toDynamoDBFormat(value);
            return acc;
          }, {} as any),
          entityType: { S: entityName.toUpperCase() }
        }));
      default:
        throw new Error(`Unknown entity type: ${entityName}`);
    }
  }

  async transformFile(filename: string): Promise<TransformResult> {
    const entityName = filename.replace('.json', '');
    const inputPath = join(this.inputDir, filename);
    
    if (!existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    console.log(`Transforming ${entityName}...`);
    
    const inputData = JSON.parse(readFileSync(inputPath, 'utf8'));
    const transformedData = this.transformEntity(entityName, inputData);
    
    const outputFilename = `${entityName}-dynamodb.json`;
    const outputPath = join(this.outputDir, outputFilename);
    
    writeFileSync(outputPath, JSON.stringify(transformedData, null, 2));
    
    return {
      entity: entityName,
      inputCount: inputData.length,
      outputCount: transformedData.length,
      file: outputPath
    };
  }

  async transformAll(): Promise<TransformResult[]> {
    const entities = [
      'profiles.json',
      'accounts.json',
      'financial_products.json',
      'transactions.json',
      'transfers.json',
      'payments.json'
    ];

    const results: TransformResult[] = [];
    
    for (const entity of entities) {
      try {
        const result = await this.transformFile(entity);
        results.push(result);
        console.log(`✅ ${result.entity}: ${result.inputCount} → ${result.outputCount} records`);
      } catch (error) {
        console.error(`❌ ${entity}: ${error}`);
      }
    }

    // Create transformation metadata
    const metadata = {
      transformDate: new Date().toISOString(),
      entities: results,
      totalInputRecords: results.reduce((sum, r) => sum + r.inputCount, 0),
      totalOutputRecords: results.reduce((sum, r) => sum + r.outputCount, 0)
    };

    writeFileSync(
      join(this.outputDir, 'transform-metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    return results;
  }
}

async function main() {
  const config: TransformConfig = {
    inputDir: join(__dirname, '../data/supabase-export'),
    outputDir: join(__dirname, '../data/dynamodb-import')
  };

  try {
    const transformer = new DataTransformer(config);
    const results = await transformer.transformAll();
    
    console.log('\n📊 Transformation Summary:');
    results.forEach(r => console.log(`  ${r.entity}: ${r.inputCount} → ${r.outputCount} records`));
    console.log(`\n✅ Transformation completed successfully!`);
    
  } catch (error) {
    console.error('❌ Transformation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { DataTransformer, TransformConfig, TransformResult };