# Drive Safe Warranty Portal - Project Structure

## Overview

This project has been restructured to support three distinct portals:

1. **Super Admin Portal** - Drive Safe Warranty management
2. **Dealer Portal** - Showroom partner portal
3. **Customer Portal** - End customer portal

## Directory Structure

```
/app
├── /core-auth          # Authentication pages (login, etc.)
├── /super-admin        # Super Admin Portal
│   ├── /dashboard      # Main dashboard
│   ├── /dealers        # Dealer management
│   ├── /customers      # Customer management
│   ├── /warranty-packages   # Warranty package management
│   ├── /warranty-sales      # Warranty sales management
│   ├── /dealer-pricing      # Dealer pricing management
│   ├── /documents           # Document management
│   ├── /reports             # Reports and analytics
│   ├── /invoices            # Invoice management
│   └── /settings            # Settings
├── /dealer             # Dealer Portal
│   ├── /dashboard
│   ├── /warranty-sales
│   ├── /customers
│   ├── /invoices
│   └── /settings
├── /customer           # Customer Portal
│   ├── /dashboard
│   ├── /documents
│   └── /enquiries
├── /shared             # Shared utilities and components
│   ├── /components
│   ├── /ui
│   ├── /hooks
│   ├── /utils
│   └── /permissions
└── /dashboard          # Existing ERP dashboard (HR/Employee Management)
```

## ERP Mode Toggle

The Super Admin has access to an ERP Mode toggle in the header that switches between:

- **ERP Mode ON**: Shows HR/Employee Management menu (existing functionality)
- **ERP Mode OFF**: Shows Warranty Portal menu (Dealer Management, Reports, Customer Management)

## Key Features

### Super Admin Portal
- Dealer Management (Create, View, Edit dealers)
- Customer Management
- Warranty Package Management
- Warranty Sales Management
- Dealer Pricing Assignment
- Document Management
- Reports (Sales, Earnings, Customers, etc.)
- Invoice Generation and Management

### Dealer Portal
- Dashboard with sales overview
- Warranty Sales Creation
- Customer Management
- Invoice Viewing
- Settings (Branding, Invoice Customization)

### Customer Portal
- Warranty Details View
- Document Access
- Service Enquiries

## Menu Structure

The sidebar menu is dynamically controlled by:
- User role (Super Admin, Dealer, Customer)
- ERP Mode toggle (for Super Admin only)

Menu definitions are in: `components/dashboard/sidebar-menu-data.ts`

## Permissions

Permission constants and role-based permissions are defined in:
`app/shared/permissions/index.ts`

## Shared Utilities

Common utilities are available in:
`app/shared/utils/index.ts`

Includes:
- Currency formatting
- Date formatting
- Warranty date calculations
- Warranty status checks

