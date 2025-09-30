# SmartBank API Manual Testing Guide

## Base URL
```
https://ouu1p18p9h.execute-api.ap-southeast-2.amazonaws.com/dev
```

## Authentication Endpoints

### 1. Register User
```bash
curl -X POST https://ouu1p18p9h.execute-api.ap-southeast-2.amazonaws.com/dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TempPass123!",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "phoneNumber": "+61412345678"
  }'
```

### 2. Login User
```bash
curl -X POST https://ouu1p18p9h.execute-api.ap-southeast-2.amazonaws.com/dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TempPass123!"
  }'
```

### 3. Refresh Token
```bash
# Replace YOUR_REFRESH_TOKEN with the refreshToken from login response
curl -X POST https://ouu1p18p9h.execute-api.ap-southeast-2.amazonaws.com/dev/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 4. Password Reset
```bash
curl -X POST https://ouu1p18p9h.execute-api.ap-southeast-2.amazonaws.com/dev/auth/password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

## Expected Responses

### Register Success (201)
```json
{
  "message": "User registered successfully",
  "userId": "uuid-here",
  "email": "test@example.com"
}
```

### Login Success (200)
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresIn": 3600,
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Error Response (400/401/500)
```json
{
  "error": "Error message here"
}
```

## Testing Flow
1. Register a new user
2. Login with the registered user
3. Use the refreshToken to get new tokens
4. Test password reset with the email