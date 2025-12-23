"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Building2, Shield, User } from "lucide-react";
import { MenuItem, menuData, warrantyPortalMenuData } from "./sidebar-menu-data";
import { customerMenuData } from "./customer-menu-data";
import { useAuth } from "@/hooks/use-auth";

// Helper function to transform menu items for dealer (replace /super-admin with /dealer)
function transformMenuForDealer(menuItems: MenuItem[]): MenuItem[] {
  return menuItems
    .filter((item) => item.title !== "Create Package" && item.title !== "Dealer Management")
    .map((item) => {
      const transformedItem = { ...item };

      // Transform href if it exists and starts with /super-admin
      if (
        transformedItem.href &&
        transformedItem.href.startsWith("/super-admin")
      ) {
        transformedItem.href = transformedItem.href.replace(
          "/super-admin",
          "/dealer"
        );
      }

      // Transform children recursively
      if (transformedItem.children) {
        transformedItem.children = transformMenuForDealer(
          transformedItem.children
        );
      }

      return transformedItem;
    });
}

function SubMenuItem({ item, pathname }: { item: MenuItem; pathname: string }) {
  const isActive = item.href === pathname;

  if (item.children) {
    return (
      <Collapsible className="group/submenu">
        <CollapsibleTrigger asChild>
          <SidebarMenuSubButton className="cursor-pointer">
            <span>{item.title}</span>
            <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/submenu:rotate-90" />
          </SidebarMenuSubButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children.map((child) => (
              <SidebarMenuSubItem key={child.title}>
                <SubMenuItem item={child} pathname={pathname} />
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuSubButton asChild isActive={isActive}>
      <Link href={item.href || "#"}>
        <span>{item.title}</span>
      </Link>
    </SidebarMenuSubButton>
  );
}

function MenuItemComponent({ item, pathname }: { item: MenuItem; pathname: string }) {
  const Icon = item.icon;
  const isActive = item.href === pathname;

  if (item.children) {
    return (
      <Collapsible className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="cursor-pointer">
              {Icon && <Icon className="h-4 w-4" />}
              <span>{item.title}</span>
              <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children.map((child) => (
                <SidebarMenuSubItem key={child.title}>
                  <SubMenuItem item={child} pathname={pathname} />
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={item.href || "#"}>
          {Icon && <Icon className="h-4 w-4" />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

interface AppSidebarProps {
  erpMode?: boolean;
}

export function AppSidebar({ erpMode = false }: AppSidebarProps) {
  const pathname = usePathname();
  const { isAdmin, user } = useAuth();
  
  // Determine user role and select appropriate menu
  const isDealer = user?.role === 'dealer';
  const isCustomer = user?.role === 'customer';
  
  let menuItems: MenuItem[] = [];
  
  if (isAdmin()) {
    menuItems = erpMode ? menuData : warrantyPortalMenuData;
  } else if (isDealer) {
    menuItems = transformMenuForDealer(
      warrantyPortalMenuData.filter((item) => item.title !== "Dealer Management")
    );
  } else if (isCustomer) {
    menuItems = customerMenuData;
  }

  if (!menuItems.length) return null;

  return (
    <Sidebar className="border-r w-64 h-screen fixed">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          {isCustomer ? (
            <Shield className="h-6 w-6 text-primary" />
          ) : isAdmin() ? (
            <Building2 className="h-6 w-6 text-primary" />
          ) : (
            <User className="h-6 w-6 text-primary" />
          )}
          <span className="font-semibold">
            {isCustomer 
              ? 'My Warranty'
              : isAdmin() 
                ? (erpMode ? 'ERP Portal' : 'Warranty Portal')
                : isDealer 
                  ? 'Dealer Portal'
                  : 'Portal'}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-80px)]">
          <SidebarGroup>
            {!isCustomer && (
              <SidebarGroupLabel>
                {erpMode ? "ERP Navigation" : "Warranty Portal"}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <MenuItemComponent key={item.title} item={item} pathname={pathname} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
