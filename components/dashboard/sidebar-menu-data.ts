import {
  LayoutDashboard,
  Users,
  LogOut,
  Clock,
  Palmtree,
  Wallet,
  Gift,
  Timer,
  Coins,
  PiggyBank,
  FileText,
  Receipt,
  Settings,
  Shield,
  Menu,
  Database,
  Store,
  FileBarChart,
  UserCheck,
  Package,
  FileCheck,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  Building2,
  Car,
  CreditCard,
  Upload,
} from "lucide-react";

export type MenuItem = {
  title: string;
  icon?: React.ElementType;
  href?: string;
  children?: MenuItem[];
};


export const menuData: MenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    children: [
      { title: "Main Dashboard", href: "/dashboard" },
      { title: "User Dashboard", href: "/dashboard/user" },
    ],
  },
  {
    title: "Employee Setup",
    icon: Users,
    children: [
      {
        title: "Employee",
        children: [
          { title: "Create", href: "/dashboard/employee/create" },
          { title: "List", href: "/dashboard/employee/list" },
          { title: "User Accounts", href: "/dashboard/employee/accounts" },
        ],
      },
      {
        title: "Exit Clearance",
        icon: LogOut,
        children: [
          { title: "Create", href: "/dashboard/exit-clearance/create" },
          { title: "List", href: "/dashboard/exit-clearance/list" },
        ],
      },
    ],
  },

  {
    title: "Attendance Setup",
    icon: Clock,
    children: [
      {
        title: "Attendance",
        children: [
          { title: "Manage", href: "/dashboard/attendance/manage" },
          { title: "View", href: "/dashboard/attendance/view" },
          { title: "Summary", href: "/dashboard/attendance/summary" },
          { title: "Requests", href: "/dashboard/attendance/requests" },
          { title: "Request List", href: "/dashboard/attendance/request-list" },
          { title: "Exemptions", href: "/dashboard/attendance/exemptions" },
          {
            title: "Exemptions List",
            href: "/dashboard/attendance/exemptions-list",
          },
          {
            title: "Request Forwarding",
            href: "/dashboard/attendance/request-forwarding",
          },
        ],
      },
      {
        title: "Working Hours Policy",
        children: [
          { title: "Create", href: "/dashboard/working-hours/create" },
          { title: "View", href: "/dashboard/working-hours/view" },
        ],
      },
      {
        title: "Holidays",
        children: [
          { title: "Create", href: "/dashboard/holidays/create" },
          { title: "List", href: "/dashboard/holidays/list" },
        ],
      },
    ],
  },
  {
    title: "Leaves Setup",
    icon: Palmtree,
    children: [
      {
        title: "Leave Application",
        children: [
          { title: "Mine List", href: "/dashboard/leaves/mine" },
          { title: "View Requests", href: "/dashboard/leaves/requests" },
          { title: "Request Forwarding", href: "/dashboard/leaves/forwarding" },
        ],
      },
    ],
  },
  {
    title: "Payroll Setup",
    icon: Wallet,
    children: [
      {
        title: "Payroll",
        children: [
          { title: "Create", href: "/dashboard/payroll/create" },
          { title: "View Report", href: "/dashboard/payroll/report" },
          { title: "Bank Report", href: "/dashboard/payroll/bank-report" },
          { title: "Payslips Emails", href: "/dashboard/payroll/payslips" },
        ],
      },
      {
        title: "Allowance",
        children: [
          { title: "Create", href: "/dashboard/allowance/create" },
          { title: "View", href: "/dashboard/allowance/view" },
        ],
      },
      {
        title: "Deduction",
        children: [
          { title: "Create", href: "/dashboard/deduction/create" },
          { title: "View", href: "/dashboard/deduction/view" },
        ],
      },
      {
        title: "Advance Salary",
        children: [
          { title: "Create", href: "/dashboard/advance-salary/create" },
          { title: "View", href: "/dashboard/advance-salary/view" },
        ],
      },
      {
        title: "Load Requests",
        children: [
          { title: "Create", href: "/dashboard/load-requests/create" },
          { title: "View", href: "/dashboard/load-requests/view" },
          { title: "View Requests", href: "/dashboard/load-requests/requests" },
          {
            title: "Request Forwarding",
            href: "/dashboard/load-requests/forwarding",
          },
        ],
      },
      {
        title: "Increment/Decrement",
        children: [
          { title: "Create", href: "/dashboard/increment/create" },
          { title: "View", href: "/dashboard/increment/view" },
          { title: "Letters Email", href: "/dashboard/increment/letters" },
        ],
      },
      {
        title: "Bonus",
        icon: Gift,
        children: [
          { title: "Add", href: "/dashboard/bonus/add" },
          { title: "View", href: "/dashboard/bonus/view" },
          { title: "Issue Bonus", href: "/dashboard/bonus/issue" },
          { title: "View Report", href: "/dashboard/bonus/report" },
          { title: "Bank Report", href: "/dashboard/bonus/bank-report" },
          { title: "Bonus Payslip", href: "/dashboard/bonus/payslip" },
        ],
      },
      {
        title: "Overtime",
        icon: Timer,
        children: [
          { title: "Create", href: "/dashboard/overtime/create" },
          { title: "List", href: "/dashboard/overtime/list" },
          {
            title: "Request Forwarding",
            href: "/dashboard/overtime/forwarding",
          },
        ],
      },
      {
        title: "Leave Encashment",
        icon: Coins,
        children: [
          { title: "Create", href: "/dashboard/leave-encashment/create" },
          { title: "List", href: "/dashboard/leave-encashment/list" },
          {
            title: "Request Forwarding",
            href: "/dashboard/leave-encashment/forwarding",
          },
        ],
      },
      {
        title: "Provident Fund",
        icon: PiggyBank,
        children: [
          { title: "Create", href: "/dashboard/provident-fund/create" },
          { title: "List", href: "/dashboard/provident-fund/list" },
        ],
      },
      {
        title: "PF for Employee",
        children: [
          { title: "Create PF", href: "/dashboard/pf-employee/create" },
          { title: "View PF", href: "/dashboard/pf-employee/view" },
          {
            title: "Create Withdraw",
            href: "/dashboard/pf-employee/withdraw-create",
          },
          {
            title: "View Withdraw",
            href: "/dashboard/pf-employee/withdraw-view",
          },
          { title: "View Report", href: "/dashboard/pf-employee/report" },
          { title: "View Ledger", href: "/dashboard/pf-employee/ledger" },
        ],
      },
      {
        title: "Final Settlement",
        children: [
          { title: "Create", href: "/dashboard/final-settlement/create" },
          { title: "List", href: "/dashboard/final-settlement/list" },
        ],
      },
      {
        title: "HR Letters",
        icon: FileText,
        children: [
          { title: "Create", href: "/dashboard/hr-letters/create" },
          { title: "View", href: "/dashboard/hr-letters/view" },
          { title: "Upload", href: "/dashboard/hr-letters/upload" },
        ],
      },
      {
        title: "Salary Sheet",
        icon: Receipt,
        children: [
          {
            title: "Tax Certificate",
            href: "/dashboard/salary-sheet/tax-certificate",
          },
        ],
      },
      {
        title: "Rebate",
        children: [
          { title: "Create", href: "/dashboard/rebate/create" },
          { title: "List", href: "/dashboard/rebate/list" },
        ],
      },
    ],
  },
  {
    title: "Profile Settings",
    icon: Settings,
    children: [
      {
        title: "Settings",
        children: [
          { title: "Change Password", href: "/dashboard/settings/password" },
          { title: "Edit Profile", href: "/dashboard/settings/profile" },
        ],
      },
      {
        title: "Roles",
        icon: Shield,
        children: [
          { title: "Add Role", href: "/dashboard/roles/add" },
          { title: "View Role", href: "/dashboard/roles/view" },
        ],
      },
      {
        title: "Sub Menu",
        icon: Menu,
        children: [
          { title: "Add and View", href: "/dashboard/submenu/manage" },
        ],
      },
    ],
  },
];

// Warranty Portal Menu (for Super Admin when ERP mode is off)
export const warrantyPortalMenuData: MenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/super-admin/dashboard",
  },
  {
    title: "Dealer Management",
    icon: Store,
    children: [
      { title: "Create", href: "/super-admin/dealers/create" },
      { title: "List", href: "/super-admin/dealers/list" },
      {
        title: "Warranties Assigned",
        href: "/super-admin/dealers/assigned-warranties",
      }, // Assuming a route or placeholder
    ],
  },
  {
    title: "Customer Management",
    icon: UserCheck,
    children: [
      { title: "Customers", href: "/super-admin/customers/list" }, // Combined create/list into list or main view as per request "customer (ispe click krengy to list show hogi...)"
      { title: "Documents", href: "/super-admin/documents/view" }, // Combined upload/view or mostly view
    ],
  },
  {
    title: "Warranty Management",
    icon: ShieldCheck,
    children: [
      { title: "Warranty Tiers", href: "/super-admin/warranty-plan-levels" },
      {
        title: "Warranty Packages",
        href: "/super-admin/warranty-packages/list",
      },
      { title: "Warranty Sales", href: "/super-admin/warranty-sales/list" },
    ],
  },
  {
    title: "Reports",
    icon: FileBarChart,
    children: [
      {
        title: "Sales Reports",
        icon: TrendingUp,
        children: [
          { title: "Total Sales", href: "/super-admin/reports/sales" },
          {
            title: "Sales by Dealer",
            href: "/super-admin/reports/sales-by-dealer",
          },
          {
            title: "Sales by Package",
            href: "/super-admin/reports/sales-by-package",
          },
        ],
      },
      {
        title: "Financial Reports",
        icon: DollarSign,
        children: [
          { title: "Earnings Report", href: "/super-admin/reports/earnings" },
          { title: "Invoice Report", href: "/super-admin/reports/invoices" },
          { title: "Payment Status", href: "/super-admin/reports/payments" },
        ],
      },
      {
        title: "Customer Reports",
        icon: Users,
        children: [
          { title: "Customer List", href: "/super-admin/reports/customers" },
          {
            title: "Warranty Status",
            href: "/super-admin/reports/warranty-status",
          },
        ],
      },
    ],
  },
  {
    title: "Invoices",
    icon: Receipt,
    children: [
      { title: "Invoice History", href: "/super-admin/invoices" },
      { title: "Invoice Settings", href: "/super-admin/invoices/invoice" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    children: [
      { title: "Change Password", href: "/dashboard/settings/password" },
      { title: "Edit Profile", href: "/dashboard/settings/profile" },
    ],
  },
];

export function flattenMenu(
  items: MenuItem[],
  parentPath = ""
): { title: string; href: string; path: string }[] {
  const result: { title: string; href: string; path: string }[] = [];
  for (const item of items) {
    const currentPath = parentPath
      ? `${parentPath} > ${item.title}`
      : item.title;
    if (item.href) {
      result.push({ title: item.title, href: item.href, path: currentPath });
    }
    if (item.children) {
      result.push(...flattenMenu(item.children, currentPath));
    }
  }
  return result;
}
