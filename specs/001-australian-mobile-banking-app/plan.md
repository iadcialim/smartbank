# Implementation Plan: Australian Mobile Banking App Clone

**Branch**: `001-australian-mobile-banking` | **Date**: 2024-09-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-australian-mobile-banking-app/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Build a comprehensive Australian mobile banking app clone with React Native frontend and AWS SAM backend, migrating from existing Supabase implementation. The system will provide user registration, authentication, account management, fund transfers, and payment processing capabilities following Australian banking standards.

## Technical Context
**Language/Version**: TypeScript 5.3+ (Frontend), TypeScript 5.3+ with Node.js 22 (Backend)  
**Primary Dependencies**: React Native with Expo SDK, AWS SAM, AWS Lambda, API Gateway, DynamoDB, AWS Cognito  
**Storage**: DynamoDB (migrating from Supabase PostgreSQL)  
**Testing**: Jest (Backend), React Testing Library (Frontend), AWS SAM Local  
**Target Platform**: iOS/Android mobile devices, AWS Cloud  
**Project Type**: mobile (React Native app + AWS API)  
**Performance Goals**: <3s app load, <5s transaction processing, <200ms API responses  
**Constraints**: Australian banking compliance, offline capability, <100MB app size  
**Scale/Scope**: 10k+ concurrent users, 50+ screens, 15+ Lambda functions  

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Serverless-First Architecture
- **Compliance**: All backend functionality will use AWS Lambda functions deployed via SAM
- **Status**: PASS - Single-purpose, stateless functions planned

### ✅ API Gateway Integration
- **Compliance**: All external communication through AWS API Gateway
- **Status**: PASS - API Gateway handles auth, rate limiting, CORS, validation

### ✅ DynamoDB Data Layer
- **Compliance**: All persistent data stored in DynamoDB with single-table design
- **Status**: PASS - Migration from Supabase PostgreSQL to DynamoDB planned

### ✅ TypeScript & Node.js 22
- **Compliance**: All backend code in TypeScript targeting Node.js 22
- **Status**: PASS - Strict typing and modern runtime features

### ✅ React Native & Expo Frontend
- **Compliance**: TypeScript-enforced mobile app with Expo SDK
- **Status**: PASS - Component-based architecture with proper navigation

### ✅ Security & Compliance
- **Compliance**: AWS Cognito auth, KMS encryption, comprehensive validation
- **Status**: PASS - Australian banking regulations and security standards

### ✅ Test-Driven Development
- **Compliance**: TDD mandatory with >90% coverage
- **Status**: PASS - Jest and React Testing Library planned

### ✅ AWS SAM Guidelines
- **Compliance**: Infrastructure as Code with proper resource management
- **Status**: PASS - SAM templates for all serverless resources

## Project Structure

### Documentation (this feature)
```
specs/001-australian-mobile-banking-app/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Mobile + API structure (detected from "React Native" + "AWS API")
api/
├── src/
│   ├── models/
│   ├── services/
│   ├── handlers/
│   └── utils/
├── tests/
│   ├── contract/
│   ├── integration/
│   └── unit/
├── template.yaml        # AWS SAM template
└── samconfig.toml       # SAM configuration

src/                     # React Native frontend (existing)
├── app/
├── components/
├── services/
├── hooks/
└── utils/

tests/                   # Frontend tests
├── components/
├── services/
└── __mocks__/
```

**Structure Decision**: Option 3 - Mobile + API (React Native app + AWS SAM backend)

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - Supabase to DynamoDB migration strategy
   - AWS Cognito integration patterns
   - Australian banking API standards
   - BPAY integration requirements
   - BSB validation patterns

2. **Generate and dispatch research agents**:
   ```
   Task: "Research Supabase to DynamoDB migration patterns for banking applications"
   Task: "Find AWS Cognito best practices for mobile banking authentication"
   Task: "Research Australian banking API standards and compliance requirements"
   Task: "Investigate BPAY integration patterns and requirements"
   Task: "Research BSB validation algorithms and Australian banking standards"
   Task: "Find AWS SAM best practices for multi-environment banking applications"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all migration and integration patterns resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - User, Account, Financial Product, Transaction, Transfer, Payment entities
   - DynamoDB single-table design with proper partition/sort keys
   - Validation rules from Australian banking requirements
   - State transitions for account and transaction statuses

2. **Generate API contracts** from functional requirements:
   - Authentication endpoints (register, login, password reset)
   - Account management endpoints (list, create, update)
   - Transfer endpoints (internal, external with BSB validation)
   - Payment endpoints (BPAY, direct debit, online purchases)
   - Transaction history and search endpoints
   - Output OpenAPI schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint with request/response validation
   - Australian banking compliance test scenarios
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each acceptance scenario → integration test
   - Quickstart test = complete user journey validation

5. **Update agent file incrementally**:
   - Run `.specify/scripts/bash/update-agent-context.sh cursor`
   - Add AWS SAM, DynamoDB, Australian banking context
   - Update recent changes (keep last 3)

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → DynamoDB model creation task [P] 
- Each user story → integration test task
- Supabase migration tasks (data export, transformation, import)
- AWS SAM infrastructure tasks
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Migration order: Infrastructure → Data migration → API implementation → Frontend updates
- Dependency order: Models → Services → Handlers → Frontend integration
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 35-40 numbered, ordered tasks in tasks.md covering:
- AWS SAM infrastructure setup
- Supabase to DynamoDB migration
- Authentication system implementation
- Banking API development
- Frontend integration updates
- Testing and validation

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Migration from Supabase | Existing data and user base | Cannot start fresh due to existing users and data |
| Multiple payment types | Australian banking requirements | Single payment type insufficient for compliance |
| BSB validation | Australian banking standard | Generic account validation insufficient for Australian market |

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.0.0 - See `/memory/constitution.md`*
