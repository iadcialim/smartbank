<p align="center">
  <a href="https://github.com/edrickleong/smartbank">
    <img src="docs/images/smartbank-logo.svg" alt="Logo" width="120" height="120">
  </a>

<h3 align="center">SmartBank</h3>

<p align="center">
    A demo banking app made with React Native and AWS Serverless. 
    <br />
    Designed by <a href="https://twitter.com/uiuxadrian">Adrian Kuleszo</a>
    <br />
    Demo app created by <a href="https://twitter.com/edrickleong_">Edrick Leong</a>
    <br />
    <br />
    <a href="https://github.com/edrickleong/smartbank/issues">Report Bug</a>
    ·
    <a href="https://github.com/edrickleong/smartbank/issues">Request Feature</a>
</p>

![Mockup](docs/images/mockup.png)

This project uses designs from Adrian Kuleszo's
book [The UI Professional's Design Manual](https://uiadrian.gumroad.com/l/design-manual). Support him by purchasing a
copy of his book on [Gumroad](https://uiadrian.gumroad.com/l/design-manual).

## ⚠️ Constitution Compliance Required

**This project is governed by the SmartBank Constitution.** All AI assistants and developers MUST:

- **Read the constitution**: [`.specify/memory/constitution.md`](.specify/memory/constitution.md)
- **Follow the checklist**: [`.specify/checklist.md`](.specify/checklist.md)
- **Ask for confirmation** before implementing any changes
- **Follow one-task-at-a-time** protocol
- **Reference the constitution** before any code changes

**Constitution Version**: 2.1.0 | **Last Updated**: 2024-12-19

## Demo

<p align="center">
  <img src="docs/demo.gif" alt="demo" width="360" />
</p>

## 📱 Flows

These are groups of screens based on the design manual above.
Some of these screens have been created without adding functionality yet. For example,
the phone verifications screens have been created but do not integrate with a phone verification service.

- [x] Walkthrough
- [x] Login
- [x] Account setup
- [x] Phone verification
- [x] Create passcode
- [ ] Legal information
- [ ] Notifications
- [ ] Verify Identity
- [ ] Selfie
- [ ] Create a card
- [ ] Top up account
- [ ] Home screen
- [ ] Transfer money
- [ ] Exchange money
- [ ] Profile settings
- [ ] Upload avatar

## ✨ Features

- [x] 🔒 Sign Up / Log In
- [ ] 📞 Phone Verification
- [ ] 🔐 Setup PIN + Face ID
- [ ] 📷 Photo Verification
- [ ] 🔔 Request for Notifications
- [ ] 👤 Upload Avatar

## 🔧 Built with

- [Expo](https://expo.dev/) - A framework for building React Native apps
- [NativeWind](https://www.nativewind.dev/) - Tailwind CSS for React Native
- [AWS Lambda](https://aws.amazon.com/lambda/) - Serverless compute
- [AWS API Gateway](https://aws.amazon.com/api-gateway/) - API management
- [AWS DynamoDB](https://aws.amazon.com/dynamodb/) - NoSQL database
- [AWS Cognito](https://aws.amazon.com/cognito/) - Authentication & user management

## 🚀 Local Development

### Prerequisites

1. **Node.js & Bun**
```shell
brew install bun
```

2. **AWS CLI & SAM CLI**
```shell
brew install awscli aws-sam-cli
```

3. **AWS Credentials**
Configure your AWS credentials:
```shell
aws configure
```

### Setup

1. **Clone the repo**
```sh
git clone https://github.com/edrickleong/smartbank
cd smartbank
```

2. **Install dependencies**
```sh
bun install
cd api && npm install && cd ..
```

3. **Configure environment variables**

Copy the example files and update with your values:
```sh
cp api/.env.example api/.env
```

Update `api/.env` with your AWS configuration:
```env
# AWS Configuration
AWS_REGION=your-aws-region
AWS_PROFILE=your-aws-profile

# After deployment, update these from stack outputs:
USER_POOL_ID=your-user-pool-id
USER_POOL_CLIENT_ID=your-user-pool-client-id
DYNAMODB_TABLE_NAME=your-table-name
API_BASE_URL=your-api-gateway-url
```

4. **Deploy the backend**
```sh
cd api
npm run deploy:dev
```

After deployment, update your `.env` file with the stack outputs.

5. **Run tests**
```sh
cd api
npm test
```

6. **Start the frontend**
```sh
bun start
```

## 🏗️ Architecture

### Backend (AWS Serverless)
- **AWS Lambda**: Serverless functions for business logic
- **AWS API Gateway**: RESTful API endpoints
- **AWS DynamoDB**: NoSQL database with single-table design
- **AWS Cognito**: User authentication and management
- **AWS SAM**: Infrastructure as Code

### Frontend (React Native + Expo)
- **Expo**: Development platform and build system
- **React Native**: Cross-platform mobile framework
- **NativeWind**: Tailwind CSS for React Native
- **TypeScript**: Type-safe development

## 📁 Project Structure

```
smartbank/
├── api/                    # Backend (AWS Lambda + SAM)
│   ├── src/
│   │   ├── handlers/       # Lambda function handlers
│   │   ├── services/       # Business logic layer
│   │   ├── repositories/   # Data access layer
│   │   └── models/         # Data models
│   ├── tests/              # Backend tests
│   ├── template.yaml       # SAM template
│   └── .env               # Environment variables (gitignored)
├── src/                   # Frontend (React Native)
│   ├── app/               # Expo Router pages
│   ├── components/        # Reusable components
│   ├── services/          # API client services
│   └── hooks/             # Custom React hooks
└── tests/                 # Frontend tests
```

## 🧪 Testing

### Backend Tests
```sh
cd api
npm test                   # All tests
npm run test:contract      # Contract tests
npm run test:integration   # Integration tests
npm run test:unit          # Unit tests
```

### Frontend Tests
```sh
npm test                   # React Native tests
```

## 🚀 Deployment

### Development
```sh
cd api
npm run deploy:dev
```

### Staging
```sh
cd api
npm run deploy:staging
```

### Production
```sh
cd api
npm run deploy:prod
```

## 🔐 Security

- All API endpoints require authentication via AWS Cognito
- Data encrypted at rest using AWS KMS
- All communications use TLS 1.3
- Input validation on all endpoints
- Rate limiting implemented

## 📝 API Documentation

The API follows RESTful conventions:

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh
- `POST /auth/password-reset` - Password reset
- `GET /accounts` - List user accounts
- `POST /accounts` - Create new account
- `GET /accounts/{id}` - Get account details
- `POST /transfers` - Create transfer
- `POST /payments` - Create payment

