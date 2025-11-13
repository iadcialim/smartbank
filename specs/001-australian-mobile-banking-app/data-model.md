# Data Model: Australian Mobile Banking App Clone

**Feature**: Australian Mobile Banking App Clone  
**Date**: 2024-09-19  
**Phase**: 1 - Design & Contracts

## DynamoDB Single-Table Design

### Table Structure
**Table Name**: `SmartBankData`  
**Partition Key**: `PK` (String)  
**Sort Key**: `SK` (String)  
**Global Secondary Indexes**: 
- `GSI1`: `GSI1PK` (String), `GSI1SK` (String)
- `GSI2`: `GSI2PK` (String), `GSI2SK` (String)

### Entity Design Patterns

#### 1. User Entity
```
PK: USER#{userId}
SK: PROFILE
GSI1PK: EMAIL#{email}
GSI1SK: USER#{userId}
GSI2PK: USER#{userId}
GSI2SK: PROFILE

Attributes:
- userId: String (UUID)
- email: String (unique)
- passwordHash: String (encrypted)
- firstName: String
- lastName: String
- phoneNumber: String
- dateOfBirth: String (ISO date)
- address: Map
- kycStatus: String (PENDING, VERIFIED, REJECTED)
- mfaEnabled: Boolean
- createdAt: String (ISO timestamp)
- updatedAt: String (ISO timestamp)
- lastLoginAt: String (ISO timestamp)
```

#### 2. Account Entity
```
PK: USER#{userId}
SK: ACCOUNT#{accountId}
GSI1PK: ACCOUNT#{accountId}
GSI1SK: USER#{userId}
GSI2PK: ACCOUNT_TYPE#{accountType}
GSI2SK: ACCOUNT#{accountId}

Attributes:
- accountId: String (UUID)
- userId: String (UUID)
- accountNumber: String (unique)
- bsb: String (6-digit)
- accountType: String (SAVINGS, CHECKING, TERM_DEPOSIT)
- accountName: String
- balance: Number (in cents)
- availableBalance: Number (in cents)
- currency: String (AUD)
- status: String (ACTIVE, SUSPENDED, CLOSED)
- interestRate: Number (annual percentage)
- dailyTransferLimit: Number (in cents)
- monthlyTransferLimit: Number (in cents)
- createdAt: String (ISO timestamp)
- updatedAt: String (ISO timestamp)
```

#### 3. Financial Product Entity
```
PK: USER#{userId}
SK: PRODUCT#{productId}
GSI1PK: PRODUCT#{productId}
GSI1SK: USER#{userId}
GSI2PK: PRODUCT_TYPE#{productType}
GSI2SK: PRODUCT#{productId}

Attributes:
- productId: String (UUID)
- userId: String (UUID)
- accountId: String (UUID)
- productType: String (DEBIT_CARD, CREDIT_CARD)
- productName: String
- cardNumber: String (masked)
- expiryDate: String (MM/YY)
- cvv: String (encrypted)
- status: String (ACTIVE, BLOCKED, EXPIRED)
- dailyLimit: Number (in cents)
- monthlyLimit: Number (in cents)
- createdAt: String (ISO timestamp)
- updatedAt: String (ISO timestamp)
```

#### 4. Transaction Entity
```
PK: ACCOUNT#{accountId}
SK: TRANSACTION#{timestamp}#{transactionId}
GSI1PK: TRANSACTION#{transactionId}
GSI1SK: ACCOUNT#{accountId}
GSI2PK: USER#{userId}
GSI2SK: TRANSACTION#{timestamp}#{transactionId}

Attributes:
- transactionId: String (UUID)
- accountId: String (UUID)
- userId: String (UUID)
- transactionType: String (TRANSFER_IN, TRANSFER_OUT, PAYMENT, DEPOSIT, WITHDRAWAL)
- amount: Number (in cents)
- currency: String (AUD)
- description: String
- reference: String
- status: String (PENDING, COMPLETED, FAILED, CANCELLED)
- sourceAccountId: String (UUID, for transfers)
- destinationAccountId: String (UUID, for transfers)
- destinationBSB: String (for external transfers)
- destinationAccountNumber: String (for external transfers)
- paymentMethod: String (BPAY, DIRECT_DEBIT, ONLINE_PURCHASE, UTILITY_BILL, CREDIT_CARD)
- createdAt: String (ISO timestamp)
- processedAt: String (ISO timestamp)
- updatedAt: String (ISO timestamp)
```

#### 5. Transfer Entity
```
PK: TRANSFER#{transferId}
SK: TRANSFER#{transferId}
GSI1PK: USER#{userId}
GSI1SK: TRANSFER#{timestamp}#{transferId}
GSI2PK: STATUS#{status}
GSI2SK: TRANSFER#{timestamp}#{transferId}

Attributes:
- transferId: String (UUID)
- userId: String (UUID)
- sourceAccountId: String (UUID)
- destinationAccountId: String (UUID, for internal transfers)
- destinationBSB: String (for external transfers)
- destinationAccountNumber: String (for external transfers)
- destinationAccountName: String (for external transfers)
- amount: Number (in cents)
- currency: String (AUD)
- transferType: String (INTERNAL, EXTERNAL)
- status: String (PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED)
- reference: String
- description: String
- scheduledAt: String (ISO timestamp, for scheduled transfers)
- processedAt: String (ISO timestamp)
- createdAt: String (ISO timestamp)
- updatedAt: String (ISO timestamp)
```

#### 6. Payment Entity
```
PK: PAYMENT#{paymentId}
SK: PAYMENT#{paymentId}
GSI1PK: USER#{userId}
GSI1SK: PAYMENT#{timestamp}#{paymentId}
GSI2PK: PAYMENT_METHOD#{paymentMethod}
GSI2SK: PAYMENT#{timestamp}#{paymentId}

Attributes:
- paymentId: String (UUID)
- userId: String (UUID)
- accountId: String (UUID)
- paymentType: String (BPAY, DIRECT_DEBIT, ONLINE_PURCHASE, UTILITY_BILL, CREDIT_CARD)
- amount: Number (in cents)
- currency: String (AUD)
- recipient: String
- recipientAccount: String
- bpayReference: String (for BPAY payments)
- billerCode: String (for BPAY payments)
- reference: String
- description: String
- status: String (PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED)
- scheduledAt: String (ISO timestamp, for scheduled payments)
- processedAt: String (ISO timestamp)
- createdAt: String (ISO timestamp)
- updatedAt: String (ISO timestamp)
```

## Data Validation Rules

### User Validation
- Email must be valid format and unique
- Password must meet security requirements (8+ chars, mixed case, numbers, symbols)
- Phone number must be valid Australian format
- Date of birth must be 18+ years ago
- KYC status must be VERIFIED for account opening

### Account Validation
- Account number must be unique and valid format
- BSB must be valid 6-digit Australian BSB
- Balance must be non-negative
- Available balance must be <= balance
- Account type must be valid enum value
- Daily/monthly limits must be positive numbers

### Transaction Validation
- Amount must be positive
- Currency must be AUD
- Transaction type must be valid enum value
- Status transitions must follow business rules
- Reference must be unique for each transaction
- Timestamps must be valid ISO format

### Transfer Validation
- Source and destination accounts must be different
- Amount must be within daily/monthly limits
- BSB must be valid for external transfers
- Account number must be valid format
- Transfer type must match account types

### Payment Validation
- Payment type must be valid enum value
- Amount must be positive
- BPAY reference must be valid format
- Biller code must be valid for BPAY
- Recipient information must be complete

## State Transitions

### Account Status
```
PENDING → ACTIVE (after verification)
ACTIVE → SUSPENDED (due to suspicious activity)
SUSPENDED → ACTIVE (after review)
ACTIVE → CLOSED (user request or compliance)
CLOSED → (no further transitions)
```

### Transaction Status
```
PENDING → PROCESSING (when initiated)
PROCESSING → COMPLETED (successful processing)
PROCESSING → FAILED (processing error)
PENDING → CANCELLED (user cancellation)
COMPLETED → (no further transitions)
FAILED → (no further transitions)
CANCELLED → (no further transitions)
```

### Transfer Status
```
PENDING → PROCESSING (when initiated)
PROCESSING → COMPLETED (successful transfer)
PROCESSING → FAILED (transfer error)
PENDING → CANCELLED (user cancellation)
COMPLETED → (no further transitions)
FAILED → (no further transitions)
CANCELLED → (no further transitions)
```

### Payment Status
```
PENDING → PROCESSING (when initiated)
PROCESSING → COMPLETED (successful payment)
PROCESSING → FAILED (payment error)
PENDING → CANCELLED (user cancellation)
COMPLETED → (no further transitions)
FAILED → (no further transitions)
CANCELLED → (no further transitions)
```

## Data Access Patterns

### Query Patterns
1. **Get User Profile**: `PK = USER#{userId}, SK = PROFILE`
2. **Get User Accounts**: `PK = USER#{userId}, SK begins_with ACCOUNT#`
3. **Get Account Transactions**: `PK = ACCOUNT#{accountId}, SK begins_with TRANSACTION#`
4. **Get User Transactions**: `GSI2PK = USER#{userId}, GSI2SK begins_with TRANSACTION#`
5. **Get Account by Number**: `GSI1PK = ACCOUNT#{accountId}`
6. **Get User by Email**: `GSI1PK = EMAIL#{email}`
7. **Get Transactions by Status**: `GSI2PK = STATUS#{status}, GSI2SK begins_with TRANSACTION#`

### Write Patterns
1. **Create User**: Single item with PK/SK and GSI1 attributes
2. **Create Account**: Single item with PK/SK and GSI1/GSI2 attributes
3. **Create Transaction**: Single item with PK/SK and GSI1/GSI2 attributes
4. **Update Balance**: Conditional update on account item
5. **Batch Operations**: Use DynamoDB batch operations for multiple items

## Migration from Supabase

### Data Transformation
1. **Users Table** → User entities with email GSI
2. **Accounts Table** → Account entities with account number GSI
3. **Transactions Table** → Transaction entities with user GSI
4. **Cards Table** → Financial Product entities
5. **Transfers Table** → Transfer entities with status GSI
6. **Payments Table** → Payment entities with payment method GSI

### Migration Strategy
1. **Phase 1**: Create DynamoDB table and indexes
2. **Phase 2**: Export data from Supabase PostgreSQL
3. **Phase 3**: Transform data to DynamoDB format
4. **Phase 4**: Import data to DynamoDB
5. **Phase 5**: Validate data integrity
6. **Phase 6**: Switch application to DynamoDB
7. **Phase 7**: Decommission Supabase

---

**Data Model Status**: ✅ Complete  
**Validation Rules**: ✅ Defined  
**State Transitions**: ✅ Documented  
**Access Patterns**: ✅ Optimized  
**Migration Strategy**: ✅ Planned
