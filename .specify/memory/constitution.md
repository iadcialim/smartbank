# SmartBank Constitution

## Core Principles

### I. Serverless-First Architecture
All backend functionality MUST be implemented using AWS Lambda functions. No traditional servers or containers allowed. Each Lambda function must be single-purpose, stateless, and independently deployable. Functions must be optimized for cold start performance and follow AWS Lambda best practices.

### II. API Gateway Integration
All external communication MUST go through AWS API Gateway. No direct Lambda invocation from external clients. API Gateway handles authentication, rate limiting, request/response transformation, and CORS. All endpoints must be properly documented with OpenAPI specifications.

### III. DynamoDB Data Layer
All persistent data MUST be stored in DynamoDB. No relational databases or other storage systems allowed. Data modeling must follow DynamoDB best practices: single-table design where possible, proper partition/sort key design, and efficient query patterns. All data access must go through well-defined data access layers.

### IV. TypeScript & Node.js 22
All backend code MUST be written in TypeScript targeting Node.js 22 runtime. Strict type checking enabled. No JavaScript files allowed in production code. All Lambda functions must use the latest Node.js 22 features and follow modern TypeScript patterns.

### V. Test-First Development (NON-NEGOTIABLE)
TDD mandatory: Tests written → User approved → Tests fail → Then implement. Red-Green-Refactor cycle strictly enforced. All Lambda functions must have comprehensive Jest test suites covering unit tests, integration tests, and error scenarios. Test coverage must be >90%.

## Security & Compliance Requirements

### Authentication & Authorization
- All API endpoints MUST implement proper authentication using AWS Cognito or API Gateway authorizers
- JWT tokens must be validated in every Lambda function
- Role-based access control (RBAC) must be implemented for all user operations
- All sensitive data must be encrypted at rest and in transit

### Data Protection
- PII and financial data must be encrypted using AWS KMS
- All database queries must use parameterized statements to prevent injection
- Audit logging must be implemented for all financial transactions
- Data retention policies must be clearly defined and implemented

### Performance Standards
- Lambda functions must complete within 5 seconds for standard operations
- API Gateway response times must be <200ms for cached responses
- DynamoDB queries must be optimized for single-digit millisecond response times
- Cold start times must be minimized through proper Lambda configuration

## Development Workflow & Quality Gates

### Code Quality Standards
- All TypeScript code must pass ESLint with strict configuration
- Prettier must be used for consistent code formatting
- All functions must have comprehensive JSDoc documentation
- Code complexity must not exceed cyclomatic complexity of 10

### Testing Requirements
- Unit tests must cover all business logic with >90% coverage
- Integration tests must cover all API endpoints and database operations
- End-to-end tests must cover critical user journeys
- All tests must run in CI/CD pipeline before deployment

### Deployment Process
- All changes must go through feature branches with proper naming (001-feature-name)
- Pull requests must include comprehensive test coverage
- All deployments must be automated through AWS CDK or Serverless Framework
- Rollback procedures must be tested and documented

## Governance

This constitution supersedes all other development practices and architectural decisions. Amendments require:
- Documentation of the proposed change and its justification
- Impact analysis on existing systems
- Approval from technical lead and security team
- Migration plan for any breaking changes

All pull requests and code reviews must verify compliance with this constitution. Any deviation from these principles must be explicitly justified and documented. Use the templates in `.specify/templates/` for consistent documentation and planning.

**Version**: 1.0.0 | **Ratified**: 2024-09-19 | **Last Amended**: 2024-09-19