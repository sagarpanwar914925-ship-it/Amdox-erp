# AMDOX Technologies – Entity Relationship Diagram (ERD) & Database Schema

**Version**: 1.0  
**Date**: June 7, 2026

---

## 1. ERD Overview

The AMDOX database is organized into logical domains:

```
┌────────────────────────────────────────────────────────────────────┐
│                    MULTI-TENANCY DOMAIN                            │
│  Tenant → Organization → Department → Employee, User, Role        │
└────────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────┬──────────────┬──────────────┬──────────────┐
        ↓             ↓              ↓              ↓              ↓
   FINANCE         HR/PAYROLL    SUPPLY CHAIN   PROJECTS      AUDIT
   Domain          Domain         Domain         Domain        Domain
   
   GL              Employee       Product        Project       AuditLog
   Account         Attendance     Vendor         Task          Notification
   JournalEntry    LeaveRequest   Warehouse      TaskDep       (Cross-cutting)
   Invoice         PayrollRecord  InventoryItem  Milestone
   Bill            Performance    PurchaseOrder  ProjectMem
   Customer        Recruitment    DemandFcst
   Vendor
```

---

## 2. Multi-Tenancy Domain

### Tenant (Root)
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| name | String | e.g., "Acme Corporation" |
| slug | String | Unique, URL-safe, e.g., "acme-corp" |
| domain | String | Optional custom domain |
| logo | String | URL to logo image |
| plan | Enum | STARTER, PROFESSIONAL, ENTERPRISE, CUSTOM |
| status | Enum | ACTIVE, SUSPENDED, TRIAL, EXPIRED |
| maxUsers | Int | Licensed user seats |
| maxStorage | BigInt | Storage quota in bytes (default 10GB) |
| settings | JSON | Custom tenant config |
| createdAt | DateTime | Audit timestamp |
| updatedAt | DateTime | Audit timestamp |

**Relations**:
- Organization (1:N) – Multiple divisions/subsidiaries
- User (1:N) – Tenant users
- Subscription (1:N) – Billing subscriptions
- AuditLog (1:N) – Audit trail

---

### Organization
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| tenantId | String | FK to Tenant |
| name | String | e.g., "North America Division" |
| code | String | Unique within tenant, e.g., "NA" |
| address | String | Full address |
| city, country | String | Location |
| currency | String | ISO 4217, default "USD" |
| fiscalYear | String | e.g., "JAN-DEC" or "APR-MAR" |
| taxId | String | VAT/Tax ID |
| logo | String | Org-specific logo |
| settings | JSON | Org-level config |
| createdAt, updatedAt | DateTime | Audit |

**Unique Constraint**: (tenantId, code)

**Relations**:
- Tenant (N:1)
- Department (1:N)
- Employee (1:N)
- Vendor (1:N)
- Customer (1:N)
- Account (1:N) – Chart of Accounts
- Warehouse (1:N)
- Project (1:N)
- Budget (1:N)

---

### User
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| tenantId | String | FK to Tenant |
| email | String | Unique per tenant |
| name | String | Display name |
| avatar | String | Avatar URL |
| phone | String | Phone number |
| passwordHash | String | Bcrypt hash (if local auth) |
| role | Enum | SUPER_ADMIN, TENANT_ADMIN, FINANCE_MANAGER, etc. |
| status | Enum | ACTIVE, INACTIVE, SUSPENDED |
| mfaEnabled | Boolean | 2FA enabled? |
| mfaSecret | String | TOTP secret (encrypted) |
| lastLogin | DateTime | Last successful login |
| loginAttempts | Int | Failed attempts counter |
| lockedUntil | DateTime | Account lock expiration |
| preferences | JSON | UI preferences (theme, language, etc.) |
| createdAt, updatedAt | DateTime | Audit |

**Unique Constraint**: (tenantId, email)

**Relations**:
- Tenant (N:1)
- Employee (1:1) – Optional link to employee record
- Session (1:N)
- Notification (1:N)
- AuditLog (1:N)
- Approval (1:N as approver and requester)

---

### Session
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| userId | String | FK to User |
| token | String | JWT token (unique) |
| refreshToken | String | Refresh token (unique) |
| ipAddress | String | Client IP for audit |
| userAgent | String | Browser identifier |
| expiresAt | DateTime | Token expiration |
| createdAt | DateTime | Creation timestamp |

**Relations**:
- User (N:1)

---

## 3. HR & Payroll Domain

### Employee
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| userId | String | FK to User (1:1) |
| organizationId | String | FK to Organization |
| departmentId | String | FK to Department |
| employeeCode | String | e.g., "EMP-001" (unique per org) |
| firstName, lastName | String | Name fields |
| email, phone | String | Contact info |
| dateOfBirth | DateTime | DOB (for age calc) |
| gender | Enum | MALE, FEMALE, OTHER |
| maritalStatus | Enum | SINGLE, MARRIED, DIVORCED, WIDOWED |
| nationality | String | Country code |
| nationalId | String | SSN, ID number, etc. |
| designation | String | Job title |
| employmentType | Enum | FULL_TIME, PART_TIME, CONTRACT, INTERN, FREELANCE |
| joinDate | DateTime | Hire date |
| confirmationDate | DateTime | Probation end |
| exitDate | DateTime | Termination date |
| status | Enum | ACTIVE, ON_LEAVE, SUSPENDED, TERMINATED |
| managerId | String | FK to Employee (manager) |
| bankAccount | String | Encrypted for direct deposit |
| bankName | String | Bank name |
| taxId | String | Tax file number |
| salary | Decimal(18,2) | Monthly/annual base salary |
| currency | String | Salary currency |
| documents | JSON | URLs to resume, certificates, etc. |
| skills | String[] | Array of skill tags |
| createdAt, updatedAt | DateTime | Audit |

**Unique Constraint**: (organizationId, employeeCode)

**Relations**:
- User (1:1)
- Organization (N:1)
- Department (N:1)
- Employee (manager) (N:1)
- Department (managed) (1:N) – Manager of departments
- Attendance (1:N)
- LeaveRequest (1:N)
- PayrollRecord (1:N)
- PerformanceReview (1:N)
- ProjectMember (1:N)
- Task (1:N) – Assignee

---

### Attendance
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| employeeId | String | FK to Employee |
| date | Date | Date of attendance (unique per employee) |
| clockIn | DateTime | Check-in time |
| clockOut | DateTime | Check-out time |
| breakMinutes | Int | Break duration |
| overtime | Decimal(4,2) | Overtime hours |
| status | Enum | PRESENT, ABSENT, LATE, HALF_DAY, HOLIDAY, WEEKEND |
| notes | String | Manager notes |
| location | JSON | GPS location for mobile |
| createdAt, updatedAt | DateTime | Audit |

**Unique Constraint**: (employeeId, date)

---

### LeaveType
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| name | String | e.g., "Annual Leave" |
| code | String | Unique, e.g., "AL" |
| daysAllowed | Int | Annual entitlement |
| carryForward | Boolean | Can carry over? |
| maxCarryDays | Int | Max carry-over days |
| isPaid | Boolean | Paid or unpaid? |
| color | String | UI color code |
| createdAt | DateTime | Creation timestamp |

---

### LeaveRequest
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| employeeId | String | FK to Employee |
| leaveTypeId | String | FK to LeaveType |
| startDate | Date | Leave start |
| endDate | Date | Leave end |
| days | Decimal(4,1) | No. of days (allows half-day) |
| reason | String | Reason for leave |
| status | Enum | PENDING, APPROVED, REJECTED, CANCELLED |
| approvedBy | String | Approver user ID |
| approvedAt | DateTime | Approval timestamp |
| notes | String | Approval notes |
| createdAt, updatedAt | DateTime | Audit |

---

### PayrollRecord
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| employeeId | String | FK to Employee |
| period | String | e.g., "2026-06" (YYYY-MM) |
| basicSalary | Decimal(18,2) | Base salary for period |
| allowances | Decimal(18,2) | HRA, travel, etc. |
| deductions | Decimal(18,2) | Loan, advance, etc. |
| tax | Decimal(18,2) | Income tax |
| netPay | Decimal(18,2) | Gross - Deductions - Tax |
| currency | String | ISO 4217 |
| status | Enum | DRAFT, APPROVED, PROCESSING, PAID, CANCELLED |
| processedAt | DateTime | Processing date |
| paidAt | DateTime | Payment completion |
| payslipUrl | String | PDF URL |
| breakdown | JSON | Detailed calculation breakdown |
| createdAt, updatedAt | DateTime | Audit |

**Unique Constraint**: (employeeId, period)

---

### PerformanceReview
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| employeeId | String | FK to Employee |
| reviewerId | String | Reviewer user ID |
| period | String | e.g., "H1 2026" |
| rating | Decimal(3,1) | 1.0-5.0 |
| goals | JSON | Annual goals |
| feedback | String | Review comments |
| status | Enum | DRAFT, SUBMITTED, COMPLETED |
| createdAt, updatedAt | DateTime | Audit |

---

## 4. Finance Domain

### Account (Chart of Accounts)
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| organizationId | String | FK to Organization |
| code | String | Unique per org, e.g., "1100" (hierarchical) |
| name | String | e.g., "Cash - Operating Account" |
| type | Enum | ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE |
| subType | String | e.g., "Current Asset", "Fixed Asset" |
| parentId | String | FK to Account (hierarchical) |
| currency | String | ISO 4217 |
| balance | Decimal(18,2) | Current balance |
| isActive | Boolean | Soft delete |
| description | String | Account description |
| createdAt, updatedAt | DateTime | Audit |

**Unique Constraint**: (organizationId, code)

---

### JournalEntry
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| reference | String | Unique ref, e.g., "JE-2026-000001" |
| date | Date | Entry date |
| description | String | Transaction description |
| currency | String | Primary currency |
| exchangeRate | Decimal(10,6) | Exchange rate if multi-currency |
| status | Enum | DRAFT, POSTED, REVERSED |
| type | Enum | MANUAL, INVOICE, PAYMENT, PAYROLL, DEPRECIATION, ADJUSTMENT |
| sourceId | String | Reference to source (invoice, bill, etc.) |
| sourceType | String | "Invoice", "Bill", etc. |
| postedAt | DateTime | Posting timestamp |
| postedBy | String | User ID who posted |
| reversedFrom | String | JE ID if reversal |
| createdAt, updatedAt | DateTime | Audit |

---

### JournalLine
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| journalEntryId | String | FK to JournalEntry |
| accountId | String | FK to Account |
| description | String | Line description |
| debit | Decimal(18,2) | Debit amount |
| credit | Decimal(18,2) | Credit amount |
| currency | String | Line currency |
| exchangeRate | Decimal(10,6) | Conversion rate |
| tags | String[] | Tags for reporting |

**Constraint**: Debit XOR Credit (one must be 0)

---

### Customer
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| organizationId | String | FK to Organization |
| code | String | e.g., "CUST-001" (unique per org) |
| name | String | Customer name |
| email, phone | String | Contact info |
| address, city, country | String | Address |
| currency | String | Default ISO 4217 |
| creditLimit | Decimal(18,2) | AR limit |
| taxId | String | Tax number |
| status | Enum | ACTIVE, INACTIVE, BLACKLISTED |
| createdAt, updatedAt | DateTime | Audit |

**Unique Constraint**: (organizationId, code)

---

### Invoice
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| organizationId | String | FK to Organization |
| customerId | String | FK to Customer |
| number | String | Unique invoice number |
| date | Date | Invoice date |
| dueDate | Date | Payment due date |
| currency | String | Invoice currency |
| exchangeRate | Decimal(10,6) | Multi-currency rate |
| subtotal | Decimal(18,2) | Before tax/discount |
| tax | Decimal(18,2) | Tax amount |
| discount | Decimal(18,2) | Discount applied |
| total | Decimal(18,2) | Grand total |
| paidAmount | Decimal(18,2) | Amount received |
| status | Enum | DRAFT, SENT, PARTIAL, PAID, OVERDUE, CANCELLED |
| notes | String | Invoice notes |
| terms | String | Payment terms |
| createdAt, updatedAt | DateTime | Audit |

**Relations**:
- InvoiceItem (1:N)
- Payment (1:N)

---

### InvoiceItem
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| invoiceId | String | FK to Invoice |
| productId | String | Optional FK to Product |
| description | String | Line description |
| quantity | Decimal(18,4) | Qty |
| unitPrice | Decimal(18,2) | Unit price |
| tax | Decimal(5,2) | Tax % |
| discount | Decimal(5,2) | Discount % |
| total | Decimal(18,2) | qty × unitPrice - discount + tax |

---

### Bill (Similar to Invoice)
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| vendorId | String | FK to Vendor |
| number | String | Unique bill number |
| date | Date | Bill date |
| dueDate | Date | Due date |
| currency | String | Bill currency |
| subtotal, tax, total | Decimal(18,2) | Amounts |
| paidAmount | Decimal(18,2) | Paid to date |
| status | Enum | DRAFT, APPROVED, PARTIAL, PAID, OVERDUE, CANCELLED |
| notes | String | Notes |
| createdAt, updatedAt | DateTime | Audit |

---

### Payment
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| invoiceId | String | FK to Invoice (AR) |
| billId | String | FK to Bill (AP) |
| amount | Decimal(18,2) | Payment amount |
| currency | String | Payment currency |
| method | Enum | BANK_TRANSFER, CASH, CHECK, CREDIT_CARD, ONLINE |
| reference | String | Check number, reference, etc. |
| date | Date | Payment date |
| status | Enum | PENDING, COMPLETED, FAILED, REFUNDED |
| notes | String | Notes |
| createdAt | DateTime | Creation timestamp |

---

### Budget
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| organizationId | String | FK to Organization |
| name | String | e.g., "FY 2026 Budget" |
| fiscalYear | String | e.g., "2026" |
| period | Enum | ANNUAL, QUARTERLY, MONTHLY |
| status | Enum | DRAFT, APPROVED, ACTIVE, CLOSED |
| totalAmount | Decimal(18,2) | Total budget |
| createdAt, updatedAt | DateTime | Audit |

**Relations**:
- BudgetLine (1:N)

---

### BudgetLine
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| budgetId | String | FK to Budget |
| accountId | String | FK to Account (optional) |
| department | String | Department name (optional) |
| month | Int | Month number (1-12) |
| amount | Decimal(18,2) | Budgeted amount |
| actual | Decimal(18,2) | Actual spending |
| notes | String | Notes |

---

## 5. Supply Chain Domain

### Product
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| sku | String | Unique stock-keeping unit |
| name | String | Product name |
| description | String | Description |
| category | String | Product category |
| unit | String | e.g., "pcs", "kg", "liters" |
| costPrice | Decimal(18,2) | Cost per unit |
| salePrice | Decimal(18,2) | Sale price per unit |
| taxRate | Decimal(5,2) | Tax % |
| isActive | Boolean | Active? |
| images | String[] | Array of image URLs |
| tags | String[] | Tags for search |
| createdAt, updatedAt | DateTime | Audit |

---

### Warehouse
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| organizationId | String | FK to Organization |
| name | String | e.g., "Main Warehouse" |
| code | String | Unique per org |
| address, city, country | String | Location |
| isActive | Boolean | Active? |
| createdAt | DateTime | Creation |

**Unique Constraint**: (organizationId, code)

---

### InventoryItem
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| productId | String | FK to Product |
| warehouseId | String | FK to Warehouse |
| quantity | Decimal(18,4) | On-hand qty |
| reservedQty | Decimal(18,4) | Reserved for orders |
| reorderLevel | Decimal(18,4) | Minimum stock |
| reorderQty | Decimal(18,4) | Qty to order |
| lastUpdated | DateTime | Last change |

**Unique Constraint**: (productId, warehouseId)

---

### StockTransfer
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| fromWarehouseId | String | FK to Warehouse |
| toWarehouseId | String | FK to Warehouse |
| productId | String | Product being transferred |
| quantity | Decimal(18,4) | Qty transferred |
| status | Enum | PENDING, IN_TRANSIT, COMPLETED, CANCELLED |
| reference | String | Transfer reference |
| notes | String | Notes |
| transferDate | Date | Transfer date |
| createdAt | DateTime | Creation |

---

### Vendor
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| organizationId | String | FK to Organization |
| code | String | Vendor code (unique per org) |
| name | String | Vendor name |
| email, phone | String | Contact |
| address, city, country | String | Address |
| currency | String | Currency for transactions |
| taxId | String | Tax/VAT ID |
| rating | Decimal(3,1) | 0-5 performance rating |
| paymentTerms | Int | Days (e.g., Net 30) |
| status | Enum | ACTIVE, INACTIVE, BLACKLISTED |
| category | String | Vendor category |
| createdAt, updatedAt | DateTime | Audit |

**Unique Constraint**: (organizationId, code)

---

### VendorContract
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| vendorId | String | FK to Vendor |
| title | String | Contract title |
| startDate | Date | Effective date |
| endDate | Date | Expiration date |
| value | Decimal(18,2) | Contract value |
| currency | String | Currency |
| status | Enum | DRAFT, ACTIVE, EXPIRED, TERMINATED |
| terms | String | Contract terms |
| documentUrl | String | Attachment URL |
| createdAt | DateTime | Creation |

---

### PurchaseOrder
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| vendorId | String | FK to Vendor |
| number | String | Unique PO number |
| date | Date | PO date |
| expectedDate | Date | Expected delivery |
| currency | String | PO currency |
| subtotal, tax, total | Decimal(18,2) | Amounts |
| status | Enum | DRAFT, SENT, PARTIAL, RECEIVED, CANCELLED |
| notes | String | Notes |
| createdAt, updatedAt | DateTime | Audit |

---

### POItem
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| purchaseOrderId | String | FK to PurchaseOrder |
| productId | String | FK to Product (optional) |
| description | String | Item description |
| quantity | Decimal(18,4) | Ordered qty |
| receivedQty | Decimal(18,4) | Received qty |
| unitPrice | Decimal(18,2) | Price per unit |
| tax | Decimal(5,2) | Tax % |
| total | Decimal(18,2) | Line total |

---

### GoodsReceipt
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| purchaseOrderId | String | FK to PurchaseOrder |
| receiptNumber | String | Unique GRN number |
| date | Date | Receipt date |
| status | Enum | PENDING, PARTIAL, COMPLETE |
| notes | String | Notes |
| createdAt | DateTime | Creation |

---

### DemandForecast
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| productId | String | FK to Product |
| forecastDate | Date | Forecast date |
| forecastQty | Decimal(18,4) | Predicted qty |
| actualQty | Decimal(18,4) | Actual qty (after date) |
| model | String | Model used (e.g., "prophet") |
| confidence | Decimal(5,2) | Confidence % |
| mape | Decimal(5,2) | Mean absolute % error |
| createdAt | DateTime | Creation |

---

## 6. Project Management Domain

### Project
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| organizationId | String | FK to Organization |
| name | String | Project name |
| code | String | Unique per org |
| description | String | Description |
| startDate | Date | Project start |
| endDate | Date | Project end |
| status | Enum | PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED |
| priority | Enum | LOW, MEDIUM, HIGH, CRITICAL |
| budget | Decimal(18,2) | Project budget |
| actualCost | Decimal(18,2) | Actual spend |
| progress | Int | % complete (0-100) |
| managerId | String | Project manager user ID |
| color | String | UI color |
| tags | String[] | Tags |
| createdAt, updatedAt | DateTime | Audit |

**Unique Constraint**: (organizationId, code)

---

### Task
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| projectId | String | FK to Project |
| parentId | String | FK to Task (hierarchy) |
| title | String | Task title |
| description | String | Description |
| assigneeId | String | FK to Employee |
| status | Enum | TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED |
| priority | Enum | LOW, MEDIUM, HIGH, CRITICAL |
| startDate | Date | Task start |
| dueDate | Date | Task due |
| completedAt | DateTime | Completion timestamp |
| estimatedHrs | Decimal(6,1) | Estimated hours |
| actualHrs | Decimal(6,1) | Actual hours |
| progress | Int | % complete |
| tags | String[] | Tags |
| order | Int | Display order |
| createdAt, updatedAt | DateTime | Audit |

---

### TaskDependency
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| taskId | String | Dependent task |
| dependsOnId | String | Task it depends on |
| type | Enum | FINISH_TO_START (default), START_TO_START, FINISH_TO_FINISH, START_TO_FINISH |

**Unique Constraint**: (taskId, dependsOnId)

---

### ProjectMember
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| projectId | String | FK to Project |
| employeeId | String | FK to Employee |
| role | String | e.g., "Developer", "QA", "Designer" |
| allocation | Int | % allocation (0-100) |
| joinedAt | DateTime | Join date |

**Unique Constraint**: (projectId, employeeId)

---

### Milestone
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| projectId | String | FK to Project |
| title | String | Milestone title |
| date | Date | Target date |
| status | Enum | PENDING, COMPLETED, MISSED |
| notes | String | Notes |

---

## 7. Approval Workflows

### Approval
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| type | Enum | PURCHASE_ORDER, LEAVE_REQUEST, EXPENSE, INVOICE, PAYROLL, JOURNAL |
| sourceId | String | PO ID, Leave ID, etc. |
| sourceType | String | Table name |
| requesterId | String | FK to User (who requested) |
| approverId | String | FK to User (approver) |
| status | Enum | PENDING, APPROVED, REJECTED, CANCELLED |
| level | Int | Approval level (1, 2, 3, etc.) |
| notes | String | Approval comments |
| requestedAt | DateTime | Request timestamp |
| resolvedAt | DateTime | Approval/rejection timestamp |

---

## 8. Notifications & Audit

### Notification
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| userId | String | FK to User (recipient) |
| title | String | Notification title |
| body | String | Notification body |
| type | Enum | INFO, SUCCESS, WARNING, ERROR, ALERT |
| channel | Enum | IN_APP, EMAIL, SMS, WEBHOOK |
| isRead | Boolean | Read status |
| readAt | DateTime | Read timestamp |
| data | JSON | Payload for action |
| createdAt | DateTime | Creation |

---

### NotificationTemplate
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| name | String | Unique template name |
| subject | String | Email subject |
| body | String | Template body with {{variables}} |
| channel | Enum | Notification channel |
| variables | String[] | Variable names |
| isActive | Boolean | Active? |

---

### AuditLog
| Column | Type | Notes |
|---|---|---|
| id | CUID | Primary key |
| tenantId | String | FK to Tenant |
| userId | String | FK to User |
| action | String | "CREATE", "UPDATE", "DELETE" |
| entity | String | Table name (e.g., "Invoice") |
| entityId | String | Record ID |
| oldValues | JSON | Previous values |
| newValues | JSON | New values |
| ipAddress | String | Client IP |
| userAgent | String | Browser info |
| timestamp | DateTime | Audit timestamp |

**Indexes**: (tenantId, timestamp), (entity, entityId)

---

## 9. Data Integrity Rules

### Business Rules
1. **Double-entry Bookkeeping**: Every JournalLine must balance (sum(debit) = sum(credit))
2. **Approval Workflow**: Cannot post invoice without approval
3. **Inventory**: Cannot issue stock more than on-hand quantity
4. **Tenant Isolation**: User can only access data from their tenant
5. **Foreign Keys**: All FKs have CASCADE delete where appropriate
6. **Unique Constraints**: Enforce business uniqueness (e.g., one invoice per number per org)

### Audit Trail
- All tables have `createdAt` and `updatedAt` timestamps
- All user actions logged in `AuditLog`
- Sensitive data encrypted at rest (SSN, bank account, password)

---

## 10. Scalability Considerations

### Partitioning Strategy
- **Time-series data** (Attendance, PayrollRecord): Partition by month
- **Large transactional tables** (JournalLine, InvoiceItem): Partition by organizationId
- **Multi-tenant queries**: Always filter by tenantId at query level

### Indexing Strategy
| Table | Index | Purpose |
|---|---|---|
| Invoice | (organizationId, date) | Listing invoices by date |
| JournalEntry | (organizationId, date) | GL date range queries |
| Employee | (organizationId, status) | Active employee list |
| DemandForecast | (productId, forecastDate) | Forecasts by product |
| Task | (projectId, status) | Task filtering |

---

## Total Database Statistics

- **Tables**: 35
- **Enums**: 30+
- **Relations**: 50+ (1:N, N:1, N:N via junction)
- **Audit**: AuditLog tracks all changes
- **Compliance**: GDPR-ready with data retention policies

