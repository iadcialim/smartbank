# Quickstart Guide: Australian Mobile Banking App Clone

**Feature**: Australian Mobile Banking App Clone  
**Date**: 2024-09-19  
**Phase**: 1 - Design & Contracts

## Overview
This quickstart guide provides step-by-step instructions to validate the complete user journey for the Australian Mobile Banking App Clone. It covers user registration, authentication, account management, fund transfers, and payment processing.

## Prerequisites
- AWS CLI configured with appropriate permissions
- AWS SAM CLI installed
- Node.js 22+ installed
- Expo CLI installed
- DynamoDB table created (`SmartBankData`)
- AWS Cognito User Pool configured
- API Gateway deployed

## User Journey Validation

### 1. User Registration
**Scenario**: New user wants to join SmartBank

**Steps**:
1. **POST** `/auth/register`
   ```json
   {
     "email": "john.doe@example.com",
     "password": "SecurePass123!",
     "firstName": "John",
     "lastName": "Doe",
     "phoneNumber": "+61412345678",
     "dateOfBirth": "1990-01-15"
   }
   ```
2. **Expected Response**: `201 Created`
   ```json
   {
     "userId": "123e4567-e89b-12d3-a456-426614174000",
     "email": "john.doe@example.com",
     "message": "User registered successfully. Please check your email for verification."
   }
   ```
3. **Verify**: User record created in DynamoDB with `PK: USER#{userId}`, `SK: PROFILE`

### 2. User Authentication
**Scenario**: Existing user logs into the app

**Steps**:
1. **POST** `/auth/login`
   ```json
   {
     "email": "john.doe@example.com",
     "password": "SecurePass123!"
   }
   ```
2. **Expected Response**: `200 OK`
   ```json
   {
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "expiresIn": 3600,
     "user": {
       "userId": "123e4567-e89b-12d3-a456-426614174000",
       "email": "john.doe@example.com",
       "firstName": "John",
       "lastName": "Doe",
       "kycStatus": "VERIFIED",
       "mfaEnabled": false
     }
   }
   ```
3. **Verify**: JWT token is valid and contains user information

### 3. Account Creation
**Scenario**: User wants to open a new savings account

**Steps**:
1. **POST** `/accounts` (with Bearer token)
   ```json
   {
     "accountType": "SAVINGS",
     "accountName": "John's Savings Account"
   }
   ```
2. **Expected Response**: `201 Created`
   ```json
   {
     "accountId": "456e7890-e89b-12d3-a456-426614174001",
     "accountNumber": "1234567890",
     "bsb": "062000",
     "accountType": "SAVINGS",
     "accountName": "John's Savings Account",
     "balance": 0,
     "availableBalance": 0,
     "currency": "AUD",
     "status": "ACTIVE",
     "interestRate": 2.5,
     "dailyTransferLimit": 1000000,
     "monthlyTransferLimit": 10000000
   }
   ```
3. **Verify**: Account record created in DynamoDB with `PK: USER#{userId}`, `SK: ACCOUNT#{accountId}`

### 4. View Accounts
**Scenario**: User wants to see all their accounts

**Steps**:
1. **GET** `/accounts` (with Bearer token)
2. **Expected Response**: `200 OK`
   ```json
   {
     "accounts": [
       {
         "accountId": "456e7890-e89b-12d3-a456-426614174001",
         "accountNumber": "1234567890",
         "bsb": "062000",
         "accountType": "SAVINGS",
         "accountName": "John's Savings Account",
         "balance": 500000,
         "availableBalance": 500000,
         "currency": "AUD",
         "status": "ACTIVE"
       }
     ]
   }
   ```
3. **Verify**: All user accounts are returned with current balances

### 5. View Financial Products
**Scenario**: User wants to see their debit and credit cards

**Steps**:
1. **GET** `/products` (with Bearer token)
2. **Expected Response**: `200 OK`
   ```json
   {
     "products": [
       {
         "productId": "789e0123-e89b-12d3-a456-426614174002",
         "accountId": "456e7890-e89b-12d3-a456-426614174001",
         "productType": "DEBIT_CARD",
         "productName": "SmartBank Debit Card",
         "cardNumber": "**** **** **** 1234",
         "expiryDate": "12/25",
         "status": "ACTIVE",
         "dailyLimit": 2000000,
         "monthlyLimit": 20000000
       }
     ]
   }
   ```
3. **Verify**: All financial products are returned with masked card numbers

### 6. Internal Transfer
**Scenario**: User wants to transfer money between their own accounts

**Steps**:
1. **POST** `/transfers` (with Bearer token)
   ```json
   {
     "sourceAccountId": "456e7890-e89b-12d3-a456-426614174001",
     "destinationAccountId": "456e7890-e89b-12d3-a456-426614174003",
     "amount": 100000,
     "transferType": "INTERNAL",
     "reference": "Transfer to checking",
     "description": "Monthly transfer to checking account"
   }
   ```
2. **Expected Response**: `201 Created`
   ```json
   {
     "transferId": "abc12345-e89b-12d3-a456-426614174004",
     "sourceAccountId": "456e7890-e89b-12d3-a456-426614174001",
     "destinationAccountId": "456e7890-e89b-12d3-a456-426614174003",
     "amount": 100000,
     "currency": "AUD",
     "transferType": "INTERNAL",
     "status": "COMPLETED",
     "reference": "Transfer to checking",
     "description": "Monthly transfer to checking account",
     "createdAt": "2024-09-19T10:30:00Z",
     "processedAt": "2024-09-19T10:30:01Z"
   }
   ```
3. **Verify**: 
   - Transfer record created in DynamoDB
   - Source account balance decreased by $1000
   - Destination account balance increased by $1000
   - Transaction records created for both accounts

### 7. External Transfer
**Scenario**: User wants to send money to another person's account

**Steps**:
1. **POST** `/transfers` (with Bearer token)
   ```json
   {
     "sourceAccountId": "456e7890-e89b-12d3-a456-426614174001",
     "destinationBSB": "062000",
     "destinationAccountNumber": "9876543210",
     "destinationAccountName": "Jane Smith",
     "amount": 50000,
     "transferType": "EXTERNAL",
     "reference": "Payment to Jane",
     "description": "Payment for services"
   }
   ```
2. **Expected Response**: `201 Created`
   ```json
   {
     "transferId": "def67890-e89b-12d3-a456-426614174005",
     "sourceAccountId": "456e7890-e89b-12d3-a456-426614174001",
     "destinationBSB": "062000",
     "destinationAccountNumber": "9876543210",
     "destinationAccountName": "Jane Smith",
     "amount": 50000,
     "currency": "AUD",
     "transferType": "EXTERNAL",
     "status": "COMPLETED",
     "reference": "Payment to Jane",
     "description": "Payment for services",
     "createdAt": "2024-09-19T11:00:00Z",
     "processedAt": "2024-09-19T11:00:02Z"
   }
   ```
3. **Verify**: 
   - Transfer record created with external account details
   - Source account balance decreased by $500
   - Transaction record created for source account

### 8. BPAY Payment
**Scenario**: User wants to pay a utility bill using BPAY

**Steps**:
1. **POST** `/payments` (with Bearer token)
   ```json
   {
     "accountId": "456e7890-e89b-12d3-a456-426614174001",
     "paymentType": "BPAY",
     "amount": 150000,
     "recipient": "Electricity Company",
     "bpayReference": "1234567890123456",
     "billerCode": "12345",
     "reference": "Electricity Bill",
     "description": "Monthly electricity payment"
   }
   ```
2. **Expected Response**: `201 Created`
   ```json
   {
     "paymentId": "ghi90123-e89b-12d3-a456-426614174006",
     "accountId": "456e7890-e89b-12d3-a456-426614174001",
     "paymentType": "BPAY",
     "amount": 150000,
     "currency": "AUD",
     "recipient": "Electricity Company",
     "bpayReference": "1234567890123456",
     "billerCode": "12345",
     "status": "COMPLETED",
     "reference": "Electricity Bill",
     "description": "Monthly electricity payment",
     "createdAt": "2024-09-19T12:00:00Z",
     "processedAt": "2024-09-19T12:00:03Z"
   }
   ```
3. **Verify**: 
   - Payment record created with BPAY details
   - Account balance decreased by $1500
   - Transaction record created

### 9. Transaction History
**Scenario**: User wants to view their transaction history

**Steps**:
1. **GET** `/accounts/456e7890-e89b-12d3-a456-426614174001/transactions?limit=10&offset=0` (with Bearer token)
2. **Expected Response**: `200 OK`
   ```json
   {
     "transactions": [
       {
         "transactionId": "jkl23456-e89b-12d3-a456-426614174007",
         "accountId": "456e7890-e89b-12d3-a456-426614174001",
         "transactionType": "PAYMENT",
         "amount": -150000,
         "currency": "AUD",
         "description": "BPAY Payment - Electricity Company",
         "reference": "Electricity Bill",
         "status": "COMPLETED",
         "createdAt": "2024-09-19T12:00:00Z",
         "processedAt": "2024-09-19T12:00:03Z"
       },
       {
         "transactionId": "mno34567-e89b-12d3-a456-426614174008",
         "accountId": "456e7890-e89b-12d3-a456-426614174001",
         "transactionType": "TRANSFER_OUT",
         "amount": -50000,
         "currency": "AUD",
         "description": "Transfer to Jane Smith",
         "reference": "Payment to Jane",
         "status": "COMPLETED",
         "createdAt": "2024-09-19T11:00:00Z",
         "processedAt": "2024-09-19T11:00:02Z"
       }
     ],
     "pagination": {
       "limit": 10,
       "offset": 0,
       "total": 2,
       "hasMore": false
     }
   }
   ```
3. **Verify**: All transactions are returned in chronological order with proper pagination

### 10. BSB Validation
**Scenario**: User wants to validate a BSB before making a transfer

**Steps**:
1. **POST** `/validation/bsb`
   ```json
   {
     "bsb": "062000"
   }
   ```
2. **Expected Response**: `200 OK`
   ```json
   {
     "isValid": true,
     "bankName": "Commonwealth Bank of Australia",
     "branchName": "Sydney",
     "address": "48 Martin Place, Sydney NSW 2000"
   }
   ```
3. **Verify**: BSB validation returns correct bank and branch information

## Error Scenarios

### 1. Invalid Login Credentials
**POST** `/auth/login`
```json
{
  "email": "john.doe@example.com",
  "password": "WrongPassword"
}
```
**Expected Response**: `401 Unauthorized`
```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password",
  "code": "AUTH_001"
}
```

### 2. Insufficient Funds
**POST** `/transfers`
```json
{
  "sourceAccountId": "456e7890-e89b-12d3-a456-426614174001",
  "destinationAccountId": "456e7890-e89b-12d3-a456-426614174003",
  "amount": 10000000,
  "transferType": "INTERNAL"
}
```
**Expected Response**: `422 Unprocessable Entity`
```json
{
  "error": "INSUFFICIENT_FUNDS",
  "message": "Insufficient funds in source account",
  "code": "TRANSFER_001"
}
```

### 3. Invalid BSB
**POST** `/validation/bsb`
```json
{
  "bsb": "123456"
}
```
**Expected Response**: `200 OK`
```json
{
  "isValid": false,
  "bankName": null,
  "branchName": null,
  "address": null
}
```

## Performance Validation

### Response Time Requirements
- **Authentication**: < 2 seconds
- **Account Operations**: < 1 second
- **Transfer Processing**: < 5 seconds
- **Payment Processing**: < 5 seconds
- **Transaction History**: < 2 seconds

### Load Testing
- **Concurrent Users**: 100+ simultaneous users
- **API Throughput**: 1000+ requests per minute
- **Database Performance**: < 100ms query response time

## Security Validation

### Authentication
- JWT tokens expire after 1 hour
- Refresh tokens expire after 30 days
- MFA required for transactions > $1000
- Rate limiting: 100 requests per minute per user

### Data Protection
- All sensitive data encrypted at rest
- All API communication over TLS 1.3
- PII data masked in responses
- Audit logging for all financial transactions

## Compliance Validation

### Australian Banking Standards
- BSB validation for all external transfers
- Transaction limits enforced
- Audit trail maintained
- Data retention policies implemented

### Privacy Compliance
- User consent for data processing
- Right to data portability
- Right to data deletion
- Privacy policy compliance

---

**Quickstart Status**: ✅ Complete  
**User Journey**: ✅ Validated  
**Error Scenarios**: ✅ Covered  
**Performance**: ✅ Requirements Defined  
**Security**: ✅ Standards Met  
**Compliance**: ✅ Australian Standards
