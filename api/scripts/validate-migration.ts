#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ValidationConfig {
  supabaseDir: string;
  dynamodbDir: string;
  outputDir: string;
}

interface ValidationError {
  type: 'MISSING_RECORD' | 'DATA_MISMATCH' | 'REFERENTIAL_INTEGRITY' | 'FORMAT_ERROR';
  entity: string;
  recordId: string;
  field?: string;
  expected?: any;
  actual?: any;
  message: string;
}

interface ValidationResult {
  entity: string;
  sourceCount: number;
  transformedCount: number;
  validRecords: number;
  errors: ValidationError[];
  passed: boolean;
}

interface ValidationSummary {
  validationDate: string;
  totalSourceRecords: number;
  totalTransformedRecords: number;
  totalValidRecords: number;
  totalErrors: number;
  overallPassed: boolean;
  results: ValidationResult[];
  errors: ValidationError[];
}

class DataValidator {
  private config: ValidationConfig;

  constructor(config: ValidationConfig) {
    this.config = config;
  }

  private extractDynamoDBValue(dynamoValue: any): any {
    if (!dynamoValue || typeof dynamoValue !== 'object') return dynamoValue;
    
    if (dynamoValue.S) return dynamoValue.S;
    if (dynamoValue.N) return parseFloat(dynamoValue.N);
    if (dynamoValue.BOOL !== undefined) return dynamoValue.BOOL;
    if (dynamoValue.NULL) return null;
    if (dynamoValue.L) return dynamoValue.L.map((item: any) => this.extractDynamoDBValue(item));
    if (dynamoValue.M) {
      const obj: any = {};
      for (const [key, value] of Object.entries(dynamoValue.M)) {
        obj[key] = this.extractDynamoDBValue(value);
      }
      return obj;
    }
    
    return dynamoValue;
  }

  private validateRequiredFields(entity: string, record: any, requiredFields: string[]): ValidationError[] {
    const errors: ValidationError[] = [];
    
    for (const field of requiredFields) {
      if (!record[field] || record[field] === null || record[field] === undefined) {
        errors.push({
          type: 'FORMAT_ERROR',
          entity,
          recordId: record.id || 'unknown',
          field,
          message: `Missing required field: ${field}`
        });
      }
    }
    
    return errors;
  }

  private validateDataTypes(entity: string, record: any, typeValidations: Record<string, string>): ValidationError[] {
    const errors: ValidationError[] = [];
    
    for (const [field, expectedType] of Object.entries(typeValidations)) {
      if (record[field] !== undefined && record[field] !== null) {
        const actualType = typeof record[field];
        if (actualType !== expectedType) {
          errors.push({
            type: 'FORMAT_ERROR',
            entity,
            recordId: record.id || 'unknown',
            field,
            expected: expectedType,
            actual: actualType,
            message: `Invalid data type for ${field}: expected ${expectedType}, got ${actualType}`
          });
        }
      }
    }
    
    return errors;
  }

  private validateProfiles(sourceData: any[], transformedData: any[]): ValidationResult {
    const errors: ValidationError[] = [];
    const requiredFields = ['id', 'email', 'firstName', 'lastName'];
    const typeValidations = { id: 'string', email: 'string', firstName: 'string', lastName: 'string' };
    
    let validRecords = 0;
    
    for (const sourceRecord of sourceData) {
      // Find corresponding transformed record
      const transformedRecord = transformedData.find(t => 
        this.extractDynamoDBValue(t.id) === sourceRecord.id
      );
      
      if (!transformedRecord) {
        errors.push({
          type: 'MISSING_RECORD',
          entity: 'profiles',
          recordId: sourceRecord.id,
          message: `Profile record missing in transformed data: ${sourceRecord.id}`
        });
        continue;
      }
      
      // Extract DynamoDB values for validation
      const extractedRecord = {
        id: this.extractDynamoDBValue(transformedRecord.id),
        email: this.extractDynamoDBValue(transformedRecord.email),
        firstName: this.extractDynamoDBValue(transformedRecord.firstName),
        lastName: this.extractDynamoDBValue(transformedRecord.lastName)
      };
      
      // Validate required fields
      errors.push(...this.validateRequiredFields('profiles', extractedRecord, requiredFields));
      
      // Validate data types
      errors.push(...this.validateDataTypes('profiles', extractedRecord, typeValidations));
      
      // Validate email format
      if (extractedRecord.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(extractedRecord.email)) {
        errors.push({
          type: 'FORMAT_ERROR',
          entity: 'profiles',
          recordId: sourceRecord.id,
          field: 'email',
          message: `Invalid email format: ${extractedRecord.email}`
        });
      }
      
      // Validate data consistency
      if (extractedRecord.email !== sourceRecord.email) {
        errors.push({
          type: 'DATA_MISMATCH',
          entity: 'profiles',
          recordId: sourceRecord.id,
          field: 'email',
          expected: sourceRecord.email,
          actual: extractedRecord.email,
          message: 'Email mismatch between source and transformed data'
        });
      }
      
      if (errors.filter(e => e.recordId === sourceRecord.id).length === 0) {
        validRecords++;
      }
    }
    
    return {
      entity: 'profiles',
      sourceCount: sourceData.length,
      transformedCount: transformedData.length,
      validRecords,
      errors: errors.filter(e => e.entity === 'profiles'),
      passed: errors.filter(e => e.entity === 'profiles').length === 0
    };
  }

  private validateAccounts(sourceData: any[], transformedData: any[], profiles: any[]): ValidationResult {
    const errors: ValidationError[] = [];
    const requiredFields = ['id', 'userId', 'accountNumber', 'bsb', 'accountType'];
    const typeValidations = { 
      id: 'string', 
      userId: 'string', 
      accountNumber: 'string', 
      bsb: 'string',
      balance: 'number'
    };
    
    let validRecords = 0;
    
    for (const sourceRecord of sourceData) {
      const transformedRecord = transformedData.find(t => 
        this.extractDynamoDBValue(t.id) === sourceRecord.id
      );
      
      if (!transformedRecord) {
        errors.push({
          type: 'MISSING_RECORD',
          entity: 'accounts',
          recordId: sourceRecord.id,
          message: `Account record missing in transformed data: ${sourceRecord.id}`
        });
        continue;
      }
      
      const extractedRecord = {
        id: this.extractDynamoDBValue(transformedRecord.id),
        userId: this.extractDynamoDBValue(transformedRecord.userId),
        accountNumber: this.extractDynamoDBValue(transformedRecord.accountNumber),
        bsb: this.extractDynamoDBValue(transformedRecord.bsb),
        accountType: this.extractDynamoDBValue(transformedRecord.accountType),
        balance: this.extractDynamoDBValue(transformedRecord.balance)
      };
      
      // Validate required fields
      errors.push(...this.validateRequiredFields('accounts', extractedRecord, requiredFields));
      
      // Validate data types
      errors.push(...this.validateDataTypes('accounts', extractedRecord, typeValidations));
      
      // Validate BSB format (Australian BSB: XXX-XXX)
      if (extractedRecord.bsb && !/^\d{3}-\d{3}$/.test(extractedRecord.bsb)) {
        errors.push({
          type: 'FORMAT_ERROR',
          entity: 'accounts',
          recordId: sourceRecord.id,
          field: 'bsb',
          message: `Invalid BSB format: ${extractedRecord.bsb} (expected XXX-XXX)`
        });
      }
      
      // Validate referential integrity - user must exist
      const userExists = profiles.some(p => p.id === extractedRecord.userId);
      if (!userExists) {
        errors.push({
          type: 'REFERENTIAL_INTEGRITY',
          entity: 'accounts',
          recordId: sourceRecord.id,
          field: 'userId',
          message: `Referenced user does not exist: ${extractedRecord.userId}`
        });
      }
      
      if (errors.filter(e => e.recordId === sourceRecord.id).length === 0) {
        validRecords++;
      }
    }
    
    return {
      entity: 'accounts',
      sourceCount: sourceData.length,
      transformedCount: transformedData.length,
      validRecords,
      errors: errors.filter(e => e.entity === 'accounts'),
      passed: errors.filter(e => e.entity === 'accounts').length === 0
    };
  }

  private validateTransactions(sourceData: any[], transformedData: any[], accounts: any[]): ValidationResult {
    const errors: ValidationError[] = [];
    const requiredFields = ['id', 'accountId', 'amount', 'type'];
    const typeValidations = { 
      id: 'string', 
      accountId: 'string', 
      amount: 'number', 
      type: 'string'
    };
    
    let validRecords = 0;
    
    for (const sourceRecord of sourceData) {
      const transformedRecord = transformedData.find(t => 
        this.extractDynamoDBValue(t.id) === sourceRecord.id
      );
      
      if (!transformedRecord) {
        errors.push({
          type: 'MISSING_RECORD',
          entity: 'transactions',
          recordId: sourceRecord.id,
          message: `Transaction record missing in transformed data: ${sourceRecord.id}`
        });
        continue;
      }
      
      const extractedRecord = {
        id: this.extractDynamoDBValue(transformedRecord.id),
        accountId: this.extractDynamoDBValue(transformedRecord.accountId),
        amount: this.extractDynamoDBValue(transformedRecord.amount),
        type: this.extractDynamoDBValue(transformedRecord.type)
      };
      
      // Validate required fields
      errors.push(...this.validateRequiredFields('transactions', extractedRecord, requiredFields));
      
      // Validate data types
      errors.push(...this.validateDataTypes('transactions', extractedRecord, typeValidations));
      
      // Validate transaction type
      if (extractedRecord.type && !['DEBIT', 'CREDIT'].includes(extractedRecord.type)) {
        errors.push({
          type: 'FORMAT_ERROR',
          entity: 'transactions',
          recordId: sourceRecord.id,
          field: 'type',
          message: `Invalid transaction type: ${extractedRecord.type} (expected DEBIT or CREDIT)`
        });
      }
      
      // Validate referential integrity - account must exist
      const accountExists = accounts.some(a => a.id === extractedRecord.accountId);
      if (!accountExists) {
        errors.push({
          type: 'REFERENTIAL_INTEGRITY',
          entity: 'transactions',
          recordId: sourceRecord.id,
          field: 'accountId',
          message: `Referenced account does not exist: ${extractedRecord.accountId}`
        });
      }
      
      if (errors.filter(e => e.recordId === sourceRecord.id).length === 0) {
        validRecords++;
      }
    }
    
    return {
      entity: 'transactions',
      sourceCount: sourceData.length,
      transformedCount: transformedData.length,
      validRecords,
      errors: errors.filter(e => e.entity === 'transactions'),
      passed: errors.filter(e => e.entity === 'transactions').length === 0
    };
  }

  async validateAll(): Promise<ValidationSummary> {
    const results: ValidationResult[] = [];
    const allErrors: ValidationError[] = [];
    
    // Load source data
    const profiles = this.loadSourceData('profiles.json');
    const accounts = this.loadSourceData('accounts.json');
    const transactions = this.loadSourceData('transactions.json');
    const financialProducts = this.loadSourceData('financial_products.json');
    
    // Load transformed data
    const profilesTransformed = this.loadTransformedData('profiles-dynamodb.json');
    const accountsTransformed = this.loadTransformedData('accounts-dynamodb.json');
    const transactionsTransformed = this.loadTransformedData('transactions-dynamodb.json');
    const productsTransformed = this.loadTransformedData('financial_products-dynamodb.json');
    
    // Validate each entity
    const profileResult = this.validateProfiles(profiles, profilesTransformed);
    results.push(profileResult);
    allErrors.push(...profileResult.errors);
    
    const accountResult = this.validateAccounts(accounts, accountsTransformed, profiles);
    results.push(accountResult);
    allErrors.push(...accountResult.errors);
    
    const transactionResult = this.validateTransactions(transactions, transactionsTransformed, accounts);
    results.push(transactionResult);
    allErrors.push(...transactionResult.errors);
    
    // Simple validation for financial products
    const productResult: ValidationResult = {
      entity: 'financial_products',
      sourceCount: financialProducts.length,
      transformedCount: productsTransformed.length,
      validRecords: Math.min(financialProducts.length, productsTransformed.length),
      errors: [],
      passed: financialProducts.length === productsTransformed.length
    };
    results.push(productResult);
    
    const summary: ValidationSummary = {
      validationDate: new Date().toISOString(),
      totalSourceRecords: results.reduce((sum, r) => sum + r.sourceCount, 0),
      totalTransformedRecords: results.reduce((sum, r) => sum + r.transformedCount, 0),
      totalValidRecords: results.reduce((sum, r) => sum + r.validRecords, 0),
      totalErrors: allErrors.length,
      overallPassed: allErrors.length === 0,
      results,
      errors: allErrors
    };
    
    // Write validation report
    writeFileSync(
      join(this.config.outputDir, 'validation-report.json'),
      JSON.stringify(summary, null, 2)
    );
    
    return summary;
  }
  
  private loadSourceData(filename: string): any[] {
    const filepath = join(this.config.supabaseDir, filename);
    if (!existsSync(filepath)) return [];
    return JSON.parse(readFileSync(filepath, 'utf8'));
  }
  
  private loadTransformedData(filename: string): any[] {
    const filepath = join(this.config.dynamodbDir, filename);
    if (!existsSync(filepath)) return [];
    return JSON.parse(readFileSync(filepath, 'utf8'));
  }
}

async function main() {
  const config: ValidationConfig = {
    supabaseDir: join(__dirname, '../data/supabase-export'),
    dynamodbDir: join(__dirname, '../data/dynamodb-import'),
    outputDir: join(__dirname, '../data')
  };

  try {
    const validator = new DataValidator(config);
    const summary = await validator.validateAll();
    
    console.log('\n📊 Validation Summary:');
    console.log(`  Total Source Records: ${summary.totalSourceRecords}`);
    console.log(`  Total Transformed Records: ${summary.totalTransformedRecords}`);
    console.log(`  Total Valid Records: ${summary.totalValidRecords}`);
    console.log(`  Total Errors: ${summary.totalErrors}`);
    console.log(`  Overall Status: ${summary.overallPassed ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (summary.totalErrors > 0) {
      console.log('\n❌ Validation Errors:');
      summary.errors.forEach(error => {
        console.log(`  ${error.entity}[${error.recordId}]: ${error.message}`);
      });
    }
    
    console.log(`\n📄 Detailed report saved to: validation-report.json`);
    
    if (!summary.overallPassed) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { DataValidator, ValidationConfig, ValidationSummary };