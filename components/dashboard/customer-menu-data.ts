import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Car,
  FileBarChart,
  Settings,
  HelpCircle,
  MessageSquare,
  FileQuestion,
} from "lucide-react";

export type MenuItem = {
  title: string;
  icon?: React.ElementType;
  href?: string;
  children?: MenuItem[];
};

export const customerMenuData: MenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/customer/dashboard",
  },
  {
    title: "My Warranties",
    icon: ShieldCheck,
    href: "/customer/warranties",
  },
  {
    title: "My Vehicles",
    icon: Car,
    href: "/customer/vehicles",
  },
  {
    title: "Documents",
    icon: FileText,
    href: "/customer/documents",
  },
  {
    title: "Claims & Services",
    icon: FileBarChart,
    children: [
      {
        title: "File a Claim",
        href: "/customer/claims/new",
      },
      {
        title: "My Claims",
        href: "/customer/claims/list",
      },
      {
        title: "Service Centers",
        href: "/customer/service-centers",
      },
    ],
  },
  {
    title: "Support & Help",
    icon: HelpCircle,
    children: [
      {
        title: "FAQs",
        href: "/customer/support/faqs",
      },
      {
        title: "Contact Us",
        href: "/customer/support/contact",
      },
      {
        title: "Live Chat",
        href: "/customer/support/chat",
      },
    ],
  },
  {
    title: "Account Settings",
    icon: Settings,
    href: "/customer/settings",
  },
];
