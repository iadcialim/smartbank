# SmartBank Constitution

## Core Principles

### I. Serverless-First Architecture
All backend functionality MUST be implemented using AWS Lambda functions. No traditional servers or containers allowed. Each Lambda function must be single-purpose, stateless, and independently deployable. Functions must be optimized for cold start performance and follow AWS Lambda best practices.

### II. API Gateway Integration (NON-NEGOTIABLE)
All external communication MUST go through AWS API Gateway. No direct Lambda invocation from external clients allowed. API Gateway must handle:
- Authentication and authorization
- Rate limiting and throttling
- Request/response transformation
- CORS configuration
- OpenAPI specification documentation
- Request validation and error handling

### III. DynamoDB Data Layer (NON-NEGOTIABLE)
All persistent data MUST be stored in DynamoDB. No relational databases or other storage systems allowed. Data modeling must follow:
- Single-table design principles where possible
- Proper partition/sort key design for efficient queries
- Global Secondary Indexes (GSI) for alternative access patterns
- Point-in-time recovery and backup strategies
- All data access through well-defined data access layers

### IV. TypeScript & Node.js 22 (NON-NEGOTIABLE)
All backend code MUST be written in TypeScript targeting Node.js 22 runtime with:
- Strict type checking enabled
- No JavaScript files allowed in production code
- Latest Node.js 22 features and modern TypeScript patterns
- Comprehensive type definitions for all data structures
- Proper error handling with typed exceptions

### V. React Native & Expo Frontend (NON-NEGOTIABLE)
All frontend code MUST be built using React Native with Expo development environment:
- TypeScript enforced for all components, hooks, and utilities
- Expo SDK for consistent development and deployment
- Component-based architecture with clear separation of concerns
- Custom hooks for business logic and state management
- Proper navigation structure using Expo Router
- Responsive design principles for various screen sizes

### VI. Modular Frontend Architecture (NON-NEGOTIABLE)
Frontend must follow a modular, component-based architecture:
- Atomic design principles (atoms, molecules, organisms, templates)
- Reusable components with proper prop typing
- Custom hooks for shared business logic
- Context providers for global state management
- Service layer for API communication
- Utility functions for common operations

### VII. Three-Layer Backend Architecture (NON-NEGOTIABLE)
All backend services MUST follow a strict three-layer architecture pattern:
- **Controller Layer (Handlers)**: Lambda functions that handle HTTP requests/responses
- **Service Layer**: Business logic and orchestration between controllers and repositories
- **Repository Layer**: Data access and persistence operations with DynamoDB

**Implementation Requirements**:
- Each service must be implemented completely (all 3 layers) before starting the next service
- Controllers MUST NOT contain business logic - only request/response handling
- Services MUST contain all business logic and validation rules
- Repositories MUST handle all data access operations and DynamoDB interactions
- Clear separation of concerns with proper dependency injection
- Frontend integration must be completed for each service before moving to the next

## Session Management Protocol (NON-NEGOTIABLE)

### New Chat Session Checklist (MANDATORY - READ FIRST)
Every new chat session MUST begin with:
- [ ] Read current task status from `specs/[feature-name]/tasks.md`
- [ ] Identify next task to execute
- [ ] Reference Task Execution Protocol (Section below)
- [ ] Ask user for explicit confirmation before ANY implementation
- [ ] Never assume previous session permissions carry over
- [ ] State "Per constitution requirement, I need your confirmation before proceeding"

### AI Assistant Compliance Requirements (NON-NEGOTIABLE)
- **MUST** state "Per constitution requirement, I need your confirmation before proceeding"
- **MUST** reference the constitution before any code changes
- **MUST NOT** proceed without explicit user approval
- **MUST** provide testing instructions after each completed task
- **MUST** follow the one-task-at-a-time rule
- **MUST** provide task summary before moving to next task

### Constitution Compliance Check (MANDATORY)
Before implementing any task:
- [ ] Have I read the Task Execution Protocol?
- [ ] Have I asked for user confirmation?
- [ ] Am I following the one-task-at-a-time rule?
- [ ] Will I provide testing instructions after completion?
- [ ] Am I referencing the constitution properly?

## Security & Compliance Requirements (NON-NEGOTIABLE)

### Authentication & Authorization
- All API endpoints MUST implement proper authentication using AWS Cognito or API Gateway authorizers
- JWT tokens must be validated in every Lambda function with proper expiration handling
- Role-based access control (RBAC) must be implemented for all user operations
- Multi-factor authentication (MFA) required for high-value transactions
- Session management with secure token refresh mechanisms

### Data Protection & Encryption
- All sensitive data MUST be encrypted at rest using AWS KMS
- All data in transit MUST use TLS 1.3 encryption
- PII and financial data must be encrypted using AES-256 encryption
- Database queries must use parameterized statements to prevent injection attacks
- Secure key management with AWS KMS and proper key rotation policies

### Input Validation & Security
- All backend endpoints MUST implement comprehensive input validation
- Request payload validation using JSON Schema or similar
- SQL injection prevention through parameterized queries
- XSS protection through proper input sanitization
- Rate limiting to prevent abuse and DDoS attacks

### Audit & Compliance
- Comprehensive audit logging for all financial transactions
- Data retention policies clearly defined and implemented per Australian regulations
- Privacy protection aligned with Australian Privacy Principles
- Compliance with Australian banking regulations and standards
- Regular security assessments and penetration testing

## Technology & Tooling Requirements (NON-NEGOTIABLE)

### AWS SAM Guidelines
- All serverless resources MUST be defined using AWS SAM templates
- Proper resource naming conventions and tagging strategies
- Environment-specific configurations (dev, staging, production)
- Automated deployment pipelines using AWS CodePipeline
- Infrastructure as Code (IaC) principles with version control
- Proper IAM role definitions with least privilege access

### React Native & Expo Standards
- Expo SDK version consistency across all environments
- TypeScript strict mode enabled for all frontend code
- ESLint and Prettier configuration for consistent code style
- Proper component prop typing with TypeScript interfaces
- Custom hooks for reusable business logic
- Proper error boundaries and error handling

### Development Environment
- Node.js 22 for backend development
- Expo CLI for frontend development and testing
- AWS CLI and SAM CLI for backend deployment
- Docker for local development consistency
- Git hooks for pre-commit validation
- ESLint and Prettier for code quality and formatting
- Husky and lint-staged for automated pre-commit checks
- Jest for testing framework across all projects

## Quality & Maintenance Requirements (NON-NEGOTIABLE)

### Test-Driven Development (TDD)
- TDD mandatory: Tests written → User approved → Tests fail → Then implement
- Red-Green-Refactor cycle strictly enforced
- All Lambda functions must have comprehensive Jest test suites
- Frontend components must have React Testing Library tests
- Integration tests must cover all API endpoints and database operations
- End-to-end tests must cover critical user journeys
- Test coverage must be >90% for all business logic

### Code Quality Standards
- All TypeScript code must pass ESLint with strict configuration
- Prettier must be used for consistent code formatting
- All functions must have comprehensive JSDoc documentation
- Code complexity must not exceed cyclomatic complexity of 10
- SonarQube or similar static analysis tools for code quality
- Regular code reviews with at least two approvers

### Linting & Code Style Standards (NON-NEGOTIABLE)
- **ESLint Configuration**: All projects MUST use ESLint with TypeScript support
  - Backend: `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin`
  - Frontend: `eslint-config-universe/native` for React Native projects
  - Strict rules enabled: `no-unused-vars`, `no-console` (warnings), `prefer-const`
  - TypeScript-specific rules: `@typescript-eslint/no-explicit-any`, `@typescript-eslint/explicit-function-return-type`
  - React-specific rules: `react/jsx-boolean-value`, `react-hooks/rules-of-hooks`

- **Prettier Configuration**: Consistent code formatting across all projects
  - Single quotes for strings, semicolons required
  - 100 character line length, 2-space indentation
  - Trailing commas in ES5, arrow function parentheses avoided
  - Tailwind CSS plugin for frontend projects

- **Pre-commit Hooks**: Automated linting and formatting enforcement
  - `lint-staged` for staged file processing
  - `husky` for Git hook management
  - Automatic Prettier formatting on commit
  - ESLint checks must pass before commit acceptance

- **IDE Integration**: Consistent development environment
  - ESLint and Prettier extensions required for all developers
  - Auto-format on save enabled
  - Real-time linting feedback in IDE
  - Consistent configuration files in project root

- **CI/CD Integration**: Automated quality checks
  - ESLint checks in all CI pipelines
  - Prettier formatting validation
  - Zero tolerance for linting errors in production code
  - Automated formatting fixes where possible

- **Code Style Enforcement**:
  - No console.log statements in production code (warnings in development)
  - Consistent import ordering and grouping
  - Proper TypeScript type annotations required
  - Unused variables and imports must be removed
  - Consistent naming conventions (camelCase for variables, PascalCase for components)

### CI/CD Pipeline Requirements
- Automated testing on every pull request
- Automated security scanning and vulnerability assessment
- Automated deployment to staging environment
- Manual approval required for production deployments
- Automated rollback procedures for failed deployments
- Comprehensive logging and monitoring of deployment processes

### Performance Standards
- Lambda functions must complete within 5 seconds for standard operations
- API Gateway response times must be <200ms for cached responses
- DynamoDB queries must be optimized for single-digit millisecond response times
- Frontend app must load within 3 seconds on mobile devices
- Cold start times must be minimized through proper Lambda configuration
- Memory usage optimization for mobile devices

## Monitoring & Observability Requirements (NON-NEGOTIABLE)

### Application Monitoring
- AWS CloudWatch for Lambda function monitoring and alerting
- Custom metrics for business-critical operations
- Distributed tracing for request flow analysis
- Error tracking and alerting for production issues
- Performance monitoring for both frontend and backend

### Security Monitoring
- AWS CloudTrail for API call logging and auditing
- AWS GuardDuty for threat detection
- Real-time security event monitoring and alerting
- Regular security log analysis and reporting
- Incident response procedures for security breaches

### Business Metrics
- Transaction volume and success rates
- User engagement and retention metrics
- Performance benchmarks and SLA monitoring
- Cost optimization and resource utilization tracking
- Regular reporting to stakeholders

## Governance & Compliance

### Constitution Authority
This constitution supersedes all other development practices, architectural decisions, and project documentation. It serves as the single source of truth for all technical and procedural decisions.

### Amendment Process
Constitution amendments require:
- Detailed documentation of the proposed change and its business justification
- Comprehensive impact analysis on existing systems and processes
- Security and compliance review by designated security team
- Approval from technical lead, security team, and product owner
- Migration plan for any breaking changes with rollback procedures
- Updated documentation and training materials

### Compliance Verification
- All pull requests and code reviews must verify compliance with this constitution
- Automated checks in CI/CD pipeline to enforce constitutional requirements
- Regular compliance audits and reviews
- Any deviation from these principles must be explicitly justified and documented
- Use the templates in `.specify/templates/` for consistent documentation and planning

### Enforcement
- Non-compliance with constitutional requirements results in automatic PR rejection
- Regular team training on constitutional principles and requirements
- Quarterly reviews of constitutional effectiveness and updates
- Clear escalation procedures for constitutional violations

### Task Execution Protocol (NON-NEGOTIABLE)
- **One Service at a Time**: Complete one entire service (all layers + deployment + testing) before starting the next
- **Service Completion**: Each service must include Models → Repositories → Services → Handlers → **Deployment** → **Automated Testing** → **Manual Testing Instructions** → Frontend Integration
- **Deployment Mandatory**: Every backend service MUST be deployed and accessible via live API endpoints before proceeding
- **Testing Mandatory**: Every deployed service MUST pass automated tests and provide manual testing steps
- **Confirmation Required**: Always ask for explicit user confirmation before implementing any changes
  - **MUST** state: "Per constitution requirement, I need your confirmation before proceeding"
  - **MUST** wait for explicit user approval before any code changes
  - **MUST NOT** proceed without user confirmation
- **Summary Before Proceeding**: Provide complete summary of completed service before moving to next
- **No Parallel Service Execution**: Do not start multiple services simultaneously without explicit approval
- **User Testing Window**: Allow user to test and validate each complete service before proceeding
- **Clear Status Updates**: Always provide current service status and what will be done next
- **Session Continuity**: Always check tasks.md at the start of new sessions to understand current progress
- **Constitution Reference**: Always reference this constitution before implementing any changes

### Task Testing Protocol (NON-NEGOTIABLE)
- **Mandatory Service Testing**: Every completed service MUST be tested before proceeding to the next
- **Three-Phase Testing**: Each service requires Deployment → Automated Testing → Manual Testing
- **Deployment Testing**: Verify service is deployed and endpoints are live and accessible
- **Automated Testing**: Run comprehensive test suites against deployed endpoints
- **Manual Testing**: Provide step-by-step manual testing instructions with expected results
- **Testing Steps Provided**: Always provide detailed, step-by-step testing instructions for each completed service
- **Self-Testing Option**: Always ask user if they want the assistant to perform the testing automatically
- **Test Results Documentation**: Document all test results (pass/fail) with specific details
- **Failure Handling**: If tests fail, fix issues before proceeding to next service
- **Verification Requirements**: Each service must be verified through:
  - **Deployment verification** (are endpoints live and accessible?)
  - **Automated test verification** (do all automated tests pass?)
  - **Manual test verification** (do manual test steps work as expected?)
  - **Functional testing** (does the service work as expected?)
  - **Integration testing** (does it work with existing services?)
  - **3-Layer Architecture testing** (are all layers properly implemented?)
  - **Frontend integration testing** (does frontend work with the service?)
  - **Quality testing** (does it meet constitutional standards?)
  - **User acceptance testing** (does it meet user requirements?)

### Git Commit Protocol (NON-NEGOTIABLE)
- **Commit Message Generation**: For every completed service, generate a proper git commit message
- **Service-Level Commits**: Commit after each complete service implementation (all 3 layers + frontend)
- **No Git Operations**: Never perform git operations (commit, push, pull) without explicit user confirmation
- **Commit Message Format**: Follow conventional commit format: `type(scope): description`
- **Commit Message Requirements**:
  - **Type**: feat, fix, chore, docs, test, refactor, style
  - **Scope**: api, frontend, config, deps, etc.
  - **Description**: Clear, concise description of what service was completed
  - **Body**: Optional detailed explanation of 3-layer implementation
  - **Footer**: Reference to service and task numbers (e.g., "Closes T030-T039")
- **User Confirmation**: Always ask user to confirm before suggesting git operations
- **Commit Message Examples**:
  - `feat(api): implement authentication service with 3-layer architecture (T030-T039)`
  - `feat(api): implement account management service with 3-layer architecture (T040-T049)`
  - `feat(frontend): integrate authentication service with React Native hooks (T038-T039)`

### Task Tracking Protocol (NON-NEGOTIABLE)
- **Service Status Updates**: For every completed and tested service, update the status in `specs/[feature-name]/tasks.md`
- **Status Marking**: Change all service task statuses from `[ ]` to `[x]` when service is complete
- **Progress Tracking**: Maintain accurate service completion status for continuity across chat sessions
- **Session Continuity**: Enable future AI sessions to pick up exactly where previous sessions left off
- **Service Status Format**: Use consistent markdown checkbox format:
  - `- [ ] T030-T039 Service 1: Authentication Service` (pending)
  - `- [x] T030-T039 Service 1: Authentication Service` (completed)
- **Update Requirements**:
  - Mark service as completed only after successful testing of all layers and frontend integration
  - Include completion timestamp in service description if needed
  - Maintain service dependency tracking
  - Update progress tracking sections in tasks.md
- **Session Handoff**: Always check tasks.md at the start of new sessions to understand current service progress

## Additional Considerations

### Scalability & Future-Proofing
- Architecture must support horizontal scaling for increased user load
- Database design must accommodate future feature requirements
- API design must be versioned and backward compatible
- Frontend architecture must support feature flags and A/B testing

### Disaster Recovery & Business Continuity
- Automated backup strategies for all critical data
- Disaster recovery procedures with defined RTO and RPO targets
- Business continuity planning for service disruptions
- Regular disaster recovery testing and validation

### Documentation & Knowledge Management
- Comprehensive API documentation with OpenAPI specifications
- Architecture decision records (ADRs) for significant technical decisions
- User documentation and help systems
- Developer onboarding documentation and procedures

**Version**: 2.2.0 | **Ratified**: 2024-09-19 | **Last Amended**: 2024-12-19