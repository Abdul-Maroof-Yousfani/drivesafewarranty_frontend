/**
 * Permission constants for the warranty portal
 */

export const PERMISSIONS = {
  // Super Admin permissions
  DEALERS_CREATE: 'dealers.create',
  DEALERS_VIEW: 'dealers.view',
  DEALERS_EDIT: 'dealers.edit',
  DEALERS_DELETE: 'dealers.delete',
  
  CUSTOMERS_CREATE: 'customers.create',
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_EDIT: 'customers.edit',
  CUSTOMERS_DELETE: 'customers.delete',
  
  WARRANTY_PACKAGES_CREATE: 'warranty_packages.create',
  WARRANTY_PACKAGES_VIEW: 'warranty_packages.view',
  WARRANTY_PACKAGES_EDIT: 'warranty_packages.edit',
  WARRANTY_PACKAGES_DELETE: 'warranty_packages.delete',
  
  WARRANTY_SALES_CREATE: 'warranty_sales.create',
  WARRANTY_SALES_VIEW: 'warranty_sales.view',
  WARRANTY_SALES_EDIT: 'warranty_sales.edit',
  
  INVOICES_GENERATE: 'invoices.generate',
  INVOICES_VIEW: 'invoices.view',
  INVOICES_DOWNLOAD: 'invoices.download',
  
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  
  DOCUMENTS_UPLOAD: 'documents.upload',
  DOCUMENTS_VIEW: 'documents.view',
  DOCUMENTS_DELETE: 'documents.delete',
  
  // Dealer permissions
  DEALER_WARRANTY_SALES_CREATE: 'dealer.warranty_sales.create',
  DEALER_CUSTOMERS_VIEW: 'dealer.customers.view',
  DEALER_INVOICES_VIEW: 'dealer.invoices.view',
  DEALER_INVOICES_CUSTOMIZE: 'dealer.invoices.customize',
  DEALER_SETTINGS_EDIT: 'dealer.settings.edit',
  
  // Customer permissions
  CUSTOMER_WARRANTY_VIEW: 'customer.warranty.view',
  CUSTOMER_DOCUMENTS_VIEW: 'customer.documents.view',
  CUSTOMER_ENQUIRIES_CREATE: 'customer.enquiries.create',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS = {
  super_admin: Object.values(PERMISSIONS),
  dealer: [
    PERMISSIONS.DEALER_WARRANTY_SALES_CREATE,
    PERMISSIONS.DEALER_CUSTOMERS_VIEW,
    PERMISSIONS.DEALER_INVOICES_VIEW,
    PERMISSIONS.DEALER_INVOICES_CUSTOMIZE,
    PERMISSIONS.DEALER_SETTINGS_EDIT,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_VIEW,
  ],
  customer: [
    PERMISSIONS.CUSTOMER_WARRANTY_VIEW,
    PERMISSIONS.CUSTOMER_DOCUMENTS_VIEW,
    PERMISSIONS.CUSTOMER_ENQUIRIES_CREATE,
  ],
} as const;

