# AMDOX Technologies – System Requirements Specification (SRS)

**Version**: 1.0  
**Date**: June 7, 2026  
**Status**: In Development

---

## 1. Overview

This document specifies the technical and functional requirements for the AMDOX ERP platform implementation.

---

## 2. System Architecture

### 2.1 High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Browser)                   │
│              Next.js 16 + React 19 + Tailwind                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway & Auth Layer                   │
│    NextAuth.js v5 + Keycloak + Rate Limiting + CORS         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Business Logic Layer (BFF)                  │
│  Next.js API Routes + tRPC + Validation + Authorization     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Data Access Layer                          │
│         Prisma ORM + PostgreSQL + Row-Level Security        │
└─────────────────────────────────────────────────────────────┘
                              ↓
       ┌────────────────┬──────────────┬──────────────┐
       ↓                ↓              ↓              ↓
   PostgreSQL        Redis         Keycloak      FastAPI (AI)
  (Transactional)  (Cache/Queue)  (Identity)    (Forecasting)
```

### 2.2 Deployment Architecture
- **Development**: Docker Compose (all services locally)
- **Staging**: Kubernetes on AWS EKS
- **Production**: Kubernetes on AWS EKS with multi-AZ setup

---

## 3. Database Schema

### 3.1 Core Entities

#### Authentication & Users
```
Tenant (Multi-tenancy root)
├── Organization
├── User
├── Session
└── Role & Permission

User
├── Employee (1:1 optional)
├── Session (1:N)
└── Notification (1:N)
```

#### Finance
```
Account (Chart of Accounts - Hierarchical)
├── JournalEntry (1:N)
│   └── JournalLine (1:N)
├── Invoice (1:N from Customer)
├── Bill (1:N from Vendor)
└── Payment (1:N)

Customer/Vendor
├── Invoice/Bill (1:N)
└── Contract (1:N)
```

#### HR & Payroll
```
Employee
├── Attendance (1:N)
├── LeaveRequest (1:N)
├── PayrollRecord (1:N)
├── PerformanceReview (1:N)
└── ProjectMember (1:N)
```

#### Supply Chain
```
Product
├── InventoryItem (1:N by warehouse)
├── DemandForecast (1:N)
└── PurchaseOrder Item (1:N)

Warehouse
├── InventoryItem (1:N)
└── StockTransfer (1:N)

Vendor
├── Bill (1:N)
├── PurchaseOrder (1:N)
└── Contract (1:N)
```

#### Projects
```
Project
├── Task (1:N - Hierarchical)
│   ├── TaskDependency (1:N)
│   └── Assignee (Employee)
├── ProjectMember (1:N)
├── Milestone (1:N)
└── Budget

Budget
└── BudgetLine (1:N)
```

### 3.2 Cross-Cutting Entities
```
Approval (Workflow)
├── Type: PO, Leave, Expense, Invoice, Payroll, Journal
├── RequesterId → User
└── ApproverId → User (Optional)

Notification (Multi-channel)
├── NotificationTemplate
├── Channel: IN_APP, EMAIL, SMS, WEBHOOK
└── Recipient: User

AuditLog (Compliance)
├── Entity tracking (all entities)
├── Change history (old/new values)
└── User attribution
```

---

## 4. API Specification

### 4.1 API Structure
- **Framework**: Next.js API Routes + tRPC
- **Base URL**: `https://api.amdox.local/api`
- **Authentication**: Bearer token (JWT from NextAuth)
- **Versioning**: `/api/v1/...`
- **Rate Limiting**: 100 req/min per user, 10,000 req/min per tenant

### 4.2 Core Endpoints (tRPC Routers)

#### Authentication
```
POST /auth/login                 # Username/password
POST /auth/mfa/setup             # Enable 2FA
POST /auth/mfa/verify            # Verify OTP
POST /auth/logout                # Invalidate session
POST /auth/refresh               # Refresh JWT token
```

#### Finance
```
GET    /finance/accounts                    # List COA
POST   /finance/accounts                    # Create account
GET    /finance/journal-entries             # List JE
POST   /finance/journal-entries             # Create JE
POST   /finance/journal-entries/:id/post    # Post JE
GET    /finance/invoices                    # List AR
POST   /finance/invoices                    # Create invoice
GET    /finance/bills                       # List AP
POST   /finance/bills                       # Create bill
GET    /finance/reports/p-and-l             # P&L report
GET    /finance/reports/balance-sheet       # Balance sheet
GET    /finance/budgets                     # List budgets
POST   /finance/budgets                     # Create budget
```

#### HR & Payroll
```
GET    /hr/employees                        # List employees
POST   /hr/employees                        # Create employee
GET    /hr/attendance                       # Attendance records
POST   /hr/attendance/clock-in              # Clock in
POST   /hr/attendance/clock-out             # Clock out
GET    /hr/leave-requests                   # List leaves
POST   /hr/leave-requests                   # Request leave
GET    /hr/payroll/records                  # List payroll
POST   /hr/payroll/process                  # Process payroll
GET    /hr/performance-reviews              # Reviews
POST   /hr/performance-reviews              # Create review
```

#### Supply Chain
```
GET    /supply-chain/products               # List products
POST   /supply-chain/products               # Create product
GET    /supply-chain/inventory              # Stock levels
POST   /supply-chain/purchase-orders        # Create PO
GET    /supply-chain/vendors                # Vendors
POST   /supply-chain/vendors                # Add vendor
GET    /supply-chain/forecasts              # Demand forecasts
GET    /supply-chain/forecasts/:product-id  # Forecast for product
```

#### Projects
```
GET    /projects                            # List projects
POST   /projects                            # Create project
GET    /projects/:id/tasks                  # Tasks
POST   /projects/:id/tasks                  # Create task
PUT    /projects/:id/tasks/:taskId          # Update task
GET    /projects/:id/gantt                  # Gantt data
GET    /projects/:id/resources              # Resource utilization
```

#### Business Intelligence
```
GET    /dashboards                          # List dashboards
POST   /dashboards                          # Create dashboard
PUT    /dashboards/:id                      # Update dashboard
GET    /dashboards/:id/data                 # Dashboard data
GET    /reports                             # List reports
POST   /reports/generate                    # Generate report
GET    /reports/:id/export                  # Export (PDF/Excel/CSV)
```

#### AI & Insights
```
GET    /ai/forecast/:product-id             # Demand forecast
GET    /ai/anomalies                        # Anomalies detected
GET    /ai/recommendations                  # Recommendations
POST   /ai/query                            # NL query
```

---

## 5. Data Flow Specifications

### 5.1 Authentication Flow
```
User → Login Form
    ↓ (email, password)
Keycloak SSO/NextAuth
    ↓ (Validate credentials)
JWT Token + Refresh Token
    ↓ (Store in httpOnly cookie)
Authorized API Requests
    ↓ (Bearer token in header)
tRPC Router → Authorization Check
    ↓ (Verify role, tenant, row-level access)
Return Data
```

### 5.2 Purchase Order Approval Workflow
```
Employee → Create PO
    ↓
PO Status = DRAFT
    ↓
Request Approval (Approval Level 1)
    ↓
Manager Approves? → Yes → Next Level? → Yes → Request Level 2
                ↓              ↓
               No            No → PO Status = APPROVED
                ↓
        Approval Status = REJECTED
        PO Status = DRAFT
```

### 5.3 Payroll Processing Flow
```
HR Manager → Process Payroll (Period: June 2026)
    ↓
Calculate:
  - Basic Salary × Days Present
  - + Allowances
  - - Deductions (Advance, Loan, etc.)
  - - Tax (Using tax brackets)
  = Net Pay
    ↓
Generate Payroll Records (DRAFT status)
    ↓
HR Manager → Submit for Approval
    ↓
Finance Manager → Approve or Reject
    ↓
Mark as APPROVED (or return to DRAFT)
    ↓
Scheduled Job → Post to GL
    ↓
Accounting Records Created
    ↓
Schedule Bank Transfer
    ↓
Mark as PAID
```

---

## 6. Security Requirements

### 6.1 Authentication
- OIDC/SAML via Keycloak
- NextAuth.js session management
- JWT tokens with 1-hour expiry, 7-day refresh token
- Mandatory MFA for admins (TOTP via Google Authenticator)
- Rate limiting on login (5 attempts/15 minutes)

### 6.2 Authorization
- Row-level security (Tenant, Organization filters in SQL)
- Middleware validation on every request
- Resource ownership validation before CRUD
- Delegated admin capabilities with audit trail

### 6.3 Data Protection
- AES-256 encryption for sensitive fields (SSN, bank account)
- TLS 1.3 for all network communication
- Encrypted backups with AWS KMS
- GDPR compliance: data deletion, data portability

### 6.4 Audit & Compliance
- Complete audit trail for all transactions
- User attribution on all changes
- IP and User-Agent logging
- Compliance reports (SOX, GDPR ready)

---

## 7. Performance Requirements

### 7.1 Response Time Targets
| Scenario | Target | P95 |
|---|---|---|
| Login | 500ms | 1s |
| Dashboard load | 1s | 2s |
| Search (1M records) | 300ms | 500ms |
| Report generation | 2s | 5s |
| API endpoint | 200ms | 500ms |

### 7.2 Scalability
- Support 1,000+ concurrent users
- 100,000+ organizations (tenants)
- 10M+ employees across all orgs
- 1B+ transactions (invoices, journal entries, etc.)
- Database connection pool: 100 connections

### 7.3 Availability
- 99.9% uptime SLA
- RTO: 1 hour
- RPO: 15 minutes
- Automated failover with health checks

---

## 8. Integration Requirements

### 8.1 Third-Party Integrations
- **Payment Gateway**: Stripe (for subscriptions)
- **Email Service**: Resend or AWS SES
- **SMS**: Twilio (for OTP, alerts)
- **Storage**: AWS S3 (documents, attachments)
- **Analytics**: Segment or Mixpanel
- **LLM**: OpenAI API (ChatGPT-based queries)

### 8.2 API Consumers
- Mobile web (responsive design)
- Desktop web (Chrome, Firefox, Safari, Edge)
- Mobile apps (future - via REST API)
- Third-party integrations (via webhooks)

---

## 9. Testing Requirements

### 9.1 Unit Testing
- Vitest framework
- Minimum 80% code coverage for business logic
- Test isolated functions (utilities, calculations)
- Mock external dependencies

### 9.2 Integration Testing
- Database integration tests (with transactions rolled back)
- API endpoint testing
- Workflow testing (approval flows, state machines)
- Cross-service testing

### 9.3 E2E Testing
- Playwright for browser automation
- Critical user journeys:
  - Login → Dashboard → Create Invoice → Submit
  - Employee Clock In → Leave Request → Approval
  - PO Creation → Approval → GRN → Payment
- Run on staging environment

### 9.4 Load Testing
- k6 for load testing
- Simulate 1,000 concurrent users
- Dashboard refresh under load
- Report generation under load

---

## 10. DevOps & Deployment

### 10.1 CI/CD Pipeline
```
Push to main branch
    ↓
Run linter (ESLint)
    ↓
Run unit tests (Vitest)
    ↓
Build Docker image
    ↓
Push to ECR
    ↓
Deploy to staging (Kubernetes)
    ↓
Run E2E tests (Playwright)
    ↓
Manual approval
    ↓
Deploy to production
    ↓
Health checks & smoke tests
```

### 10.2 Monitoring & Logging
- **Metrics**: Prometheus (CPU, memory, requests, errors)
- **Visualization**: Grafana dashboards
- **Logging**: Structured logging (JSON) → CloudWatch/ELK
- **Tracing**: OpenTelemetry for distributed tracing
- **Alerting**: PagerDuty for critical alerts

### 10.3 Backup & Recovery
- PostgreSQL automated backups (hourly)
- Point-in-time recovery (PITR) enabled
- Backup retention: 30 days
- Backup verification: automated restore test weekly
- Disaster recovery drill: quarterly

---

## 11. Compliance & Standards

### 11.1 Security Standards
- OWASP Top 10 compliance
- NIST Cybersecurity Framework
- SOC 2 Type II audit-ready
- ISO 27001 baseline

### 11.2 Data Protection
- GDPR compliance (EU privacy law)
- CCPA compliance (California privacy law)
- Data residency options (US, EU, Asia-Pacific)
- Right to data portability and deletion

### 11.3 Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast (4.5:1 for text)

---

## 12. Technical Constraints

- **Browser Support**: Chrome 120+, Firefox 121+, Safari 17+, Edge 120+
- **Node.js Version**: 20+ LTS
- **PostgreSQL Version**: 15+
- **Database Size Limit**: 1TB (with sharding for larger deployments)
- **File Upload Limit**: 100MB per file, 1GB per tenant per day

---

## Appendix: Entity Attributes Reference

See [ERD.md](./ERD.md) for complete data model and attributes.
