# AMDOX ERP - API Documentation

**Version**: 1.0.0  
**Base URL**: `https://api.amdox.local/api/v1`  
**Authentication**: Bearer Token (JWT)  
**Content-Type**: `application/json`

---

## Authentication

### Login
Create a session with email and password.

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@amdox.local",
  "password": "SecurePassword123"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "cuid",
    "email": "user@amdox.local",
    "name": "John Doe",
    "role": "FINANCE_MANAGER",
    "tenantId": "tenant-cuid"
  },
  "session": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "refresh_token_here",
    "expiresAt": "2026-06-08T10:30:00Z"
  }
}
```

### Refresh Token
Extend session using refresh token.

```bash
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

### Logout
Invalidate current session.

```bash
POST /auth/logout
Authorization: Bearer {token}
```

---

## Finance Module

### Chart of Accounts

#### List Accounts
```bash
GET /finance/accounts
Authorization: Bearer {token}

# Query Parameters:
# - organizationId: required
# - type: optional (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)
# - isActive: optional (true/false)
# - limit: default 50
# - offset: default 0
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "account-cuid",
      "code": "1100",
      "name": "Cash - Operating Account",
      "type": "ASSET",
      "balance": 150000.00,
      "currency": "USD",
      "isActive": true,
      "createdAt": "2026-01-15T08:00:00Z"
    }
  ],
  "total": 45,
  "limit": 50,
  "offset": 0
}
```

#### Create Account
```bash
POST /finance/accounts
Authorization: Bearer {token}
Content-Type: application/json

{
  "organizationId": "org-cuid",
  "code": "1200",
  "name": "Accounts Receivable",
  "type": "ASSET",
  "currency": "USD"
}
```

### Journal Entries

#### List Journal Entries
```bash
GET /finance/journal-entries
Authorization: Bearer {token}

# Query Parameters:
# - organizationId: required
# - startDate: optional (YYYY-MM-DD)
# - endDate: optional (YYYY-MM-DD)
# - status: optional (DRAFT, POSTED, REVERSED)
# - limit: default 50
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "je-cuid",
      "reference": "JE-2026-000001",
      "date": "2026-06-07",
      "description": "June rent payment",
      "status": "POSTED",
      "postedAt": "2026-06-07T09:00:00Z",
      "lines": [
        {
          "accountCode": "5200",
          "accountName": "Rent Expense",
          "debit": 5000.00,
          "credit": 0.00
        },
        {
          "accountCode": "1100",
          "accountName": "Cash",
          "debit": 0.00,
          "credit": 5000.00
        }
      ]
    }
  ],
  "total": 1245
}
```

#### Create Journal Entry
```bash
POST /finance/journal-entries
Authorization: Bearer {token}
Content-Type: application/json

{
  "organizationId": "org-cuid",
  "date": "2026-06-07",
  "description": "June rent payment",
  "lines": [
    {
      "accountId": "account-cuid-1",
      "description": "Rent expense",
      "debit": 5000.00,
      "credit": 0.00
    },
    {
      "accountId": "account-cuid-2",
      "description": "Cash payment",
      "debit": 0.00,
      "credit": 5000.00
    }
  ]
}
```

### Invoices

#### List Invoices
```bash
GET /finance/invoices
Authorization: Bearer {token}

# Query Parameters:
# - organizationId: required
# - customerId: optional
# - status: optional (DRAFT, SENT, PAID, OVERDUE)
# - startDate: optional
# - endDate: optional
```

#### Create Invoice
```bash
POST /finance/invoices
Authorization: Bearer {token}
Content-Type: application/json

{
  "organizationId": "org-cuid",
  "customerId": "customer-cuid",
  "date": "2026-06-07",
  "dueDate": "2026-07-07",
  "items": [
    {
      "description": "Product: Premium Widget",
      "quantity": 10,
      "unitPrice": 125.00,
      "tax": 10
    }
  ],
  "notes": "Payment due within 30 days"
}
```

### Financial Reports

#### P&L Statement
```bash
GET /finance/reports/p-and-l
Authorization: Bearer {token}

# Query Parameters:
# - organizationId: required
# - startDate: required (YYYY-MM-DD)
# - endDate: required (YYYY-MM-DD)
```

**Response** (200 OK):
```json
{
  "period": {
    "startDate": "2026-01-01",
    "endDate": "2026-06-07"
  },
  "revenue": {
    "total": 500000.00,
    "byCategory": [
      {
        "name": "Product Sales",
        "amount": 350000.00
      }
    ]
  },
  "expenses": {
    "total": 320000.00,
    "byCategory": [
      {
        "name": "Operating Expenses",
        "amount": 150000.00
      }
    ]
  },
  "netIncome": 180000.00
}
```

---

## HR & Payroll Module

### Employees

#### List Employees
```bash
GET /hr/employees
Authorization: Bearer {token}

# Query Parameters:
# - organizationId: required
# - departmentId: optional
# - status: optional (ACTIVE, TERMINATED, ON_LEAVE)
```

#### Create Employee
```bash
POST /hr/employees
Authorization: Bearer {token}
Content-Type: application/json

{
  "organizationId": "org-cuid",
  "employeeCode": "EMP-050",
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@company.com",
  "phone": "+1-555-0123",
  "dateOfBirth": "1990-05-15",
  "gender": "MALE",
  "nationality": "USA",
  "joinDate": "2026-06-01",
  "designation": "Software Engineer",
  "salary": 120000,
  "departmentId": "dept-cuid",
  "managerId": "manager-emp-cuid"
}
```

### Attendance

#### Clock In
```bash
POST /hr/attendance/clock-in
Authorization: Bearer {token}
Content-Type: application/json

{
  "employeeId": "emp-cuid",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

#### Clock Out
```bash
POST /hr/attendance/clock-out
Authorization: Bearer {token}
Content-Type: application/json

{
  "employeeId": "emp-cuid"
}
```

### Leave Requests

#### Create Leave Request
```bash
POST /hr/leave-requests
Authorization: Bearer {token}
Content-Type: application/json

{
  "employeeId": "emp-cuid",
  "leaveTypeId": "leavetype-cuid",
  "startDate": "2026-06-15",
  "endDate": "2026-06-20",
  "days": 5,
  "reason": "Vacation"
}
```

### Payroll

#### Process Payroll
```bash
POST /hr/payroll/process
Authorization: Bearer {token}
Content-Type: application/json

{
  "organizationId": "org-cuid",
  "period": "2026-06",
  "employees": ["emp-cuid-1", "emp-cuid-2"]
}
```

**Response** (200 OK):
```json
{
  "period": "2026-06",
  "processedEmployees": 50,
  "totalNetPay": 250000.00,
  "status": "DRAFT",
  "records": [
    {
      "employeeId": "emp-cuid-1",
      "basicSalary": 10000.00,
      "allowances": 2000.00,
      "deductions": 1500.00,
      "tax": 1200.00,
      "netPay": 9300.00
    }
  ]
}
```

---

## Supply Chain Module

### Products

#### List Products
```bash
GET /supply-chain/products
Authorization: Bearer {token}

# Query Parameters:
# - category: optional
# - isActive: optional
```

#### Get Product Details
```bash
GET /supply-chain/products/:productId
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "id": "product-cuid",
  "sku": "PROD-001",
  "name": "Premium Widget",
  "description": "High-quality widget",
  "category": "Hardware",
  "costPrice": 50.00,
  "salePrice": 125.00,
  "currentStock": 1000,
  "reorderLevel": 200,
  "isActive": true,
  "lastRestockDate": "2026-06-01"
}
```

### Inventory

#### Get Stock Levels
```bash
GET /supply-chain/inventory
Authorization: Bearer {token}

# Query Parameters:
# - warehouseId: optional (get all warehouses if not specified)
# - productId: optional
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "warehouseId": "wh-cuid",
      "warehouseName": "Main Warehouse",
      "productId": "prod-cuid",
      "productCode": "PROD-001",
      "productName": "Premium Widget",
      "quantity": 1000,
      "reservedQty": 150,
      "availableQty": 850,
      "reorderLevel": 200,
      "status": "NORMAL"
    }
  ]
}
```

### Demand Forecasts

#### Get Demand Forecast
```bash
GET /supply-chain/forecasts/:productId
Authorization: Bearer {token}

# Query Parameters:
# - months: optional (default 12)
# - model: optional (default "prophet")
```

**Response** (200 OK):
```json
{
  "productId": "prod-cuid",
  "productName": "Premium Widget",
  "model": "prophet",
  "forecasts": [
    {
      "date": "2026-07-01",
      "forecastQty": 1500,
      "confidence": 0.95,
      "lower": 1200,
      "upper": 1800
    },
    {
      "date": "2026-08-01",
      "forecastQty": 1600,
      "confidence": 0.94,
      "lower": 1250,
      "upper": 1950
    }
  ],
  "accuracy": {
    "mape": 4.5,
    "rmse": 125.3
  }
}
```

### Purchase Orders

#### Create Purchase Order
```bash
POST /supply-chain/purchase-orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "organizationId": "org-cuid",
  "vendorId": "vendor-cuid",
  "expectedDate": "2026-06-30",
  "items": [
    {
      "productId": "prod-cuid",
      "description": "Premium Widget",
      "quantity": 500,
      "unitPrice": 60.00
    }
  ],
  "notes": "Rush order - required by June 30"
}
```

---

## Projects Module

### Projects

#### List Projects
```bash
GET /projects
Authorization: Bearer {token}

# Query Parameters:
# - organizationId: required
# - status: optional (PLANNING, ACTIVE, COMPLETED)
```

#### Create Project
```bash
POST /projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "organizationId": "org-cuid",
  "name": "Q3 Marketing Campaign",
  "code": "PROJ-2026-Q3-MC",
  "startDate": "2026-07-01",
  "endDate": "2026-09-30",
  "budget": 100000,
  "managerId": "emp-cuid",
  "priority": "HIGH"
}
```

### Tasks

#### Create Task
```bash
POST /projects/:projectId/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Design marketing materials",
  "description": "Create social media graphics",
  "assigneeId": "emp-cuid",
  "priority": "HIGH",
  "startDate": "2026-07-05",
  "dueDate": "2026-07-15",
  "estimatedHrs": 40
}
```

#### Update Task Status
```bash
PATCH /projects/:projectId/tasks/:taskId
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "progress": 50
}
```

---

## Error Handling

All API errors follow this standard format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more validation errors occurred",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Common Error Codes

| Code | HTTP | Description |
|---|---|---|
| UNAUTHORIZED | 401 | Missing or invalid authentication token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request parameters |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMIT | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

---

## Rate Limiting

- **Limit**: 100 requests per minute per user
- **Headers**: 
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 95
  - `X-RateLimit-Reset`: 1654589400

---

## Pagination

Use `limit` and `offset` for list endpoints:

```bash
GET /finance/invoices?limit=50&offset=100
```

**Response includes**:
```json
{
  "data": [...],
  "total": 1250,
  "limit": 50,
  "offset": 100,
  "hasMore": true
}
```

---

## Webhooks

Subscribe to events for real-time updates:

```bash
POST /webhooks/subscribe
Authorization: Bearer {token}
Content-Type: application/json

{
  "event": "invoice.created",
  "url": "https://your-app.com/webhooks/invoice-created",
  "secret": "webhook_secret_key"
}
```

### Supported Events
- `invoice.created`, `invoice.sent`, `invoice.paid`
- `bill.created`, `bill.approved`, `bill.paid`
- `employee.created`, `employee.updated`, `employee.terminated`
- `payroll.processed`, `payroll.paid`
- `purchase_order.created`, `purchase_order.approved`, `purchase_order.received`
- `project.created`, `project.completed`
- `task.created`, `task.updated`, `task.completed`
