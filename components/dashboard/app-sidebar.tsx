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
import { MenuItem, warrantyPortalMenuData } from "./sidebar-menu-data";
import { customerMenuData } from "./customer-menu-data";
import { useAuth } from "@/hooks/use-auth";

// Helper function to transform menu items for dealer (replace /super-admin with /dealer)
function transformMenuForDealer(menuItems: MenuItem[]): MenuItem[] {
  return menuItems
    .filter((item) => item.title !== "Create Package" && item.title !== "Dealer Management" && item.title !== "Warranty Tiers")
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
          <SidebarMenuSubButton className="cursor-pointer pr-8">
            <span className="truncate flex-1 min-w-0">{item.title}</span>
            <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform group-data-[state=open]/submenu:rotate-90" />
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
            <SidebarMenuButton className="cursor-pointer pr-8">
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              <span className="truncate flex-1 min-w-0">{item.title}</span>
              <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-90" />
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
}

export function AppSidebar({ }: AppSidebarProps) {
  const pathname = usePathname();
  const { isAdmin, user } = useAuth();
  
  // Determine user role and select appropriate menu
  const isDealer = user?.role === 'dealer';
  const isCustomer = user?.role === 'customer';
  
  let menuItems: MenuItem[] = [];
  
  if (isAdmin()) {
    menuItems = warrantyPortalMenuData;
  } else if (isDealer) {
    menuItems = transformMenuForDealer(
      warrantyPortalMenuData.filter((item) => item.title !== "Dealer Management")
    );
  } else if (isCustomer) {
    menuItems = customerMenuData;
  }

  // Get dynamic branding info
  const portalName = isCustomer 
    ? (user?.firstName ? `${user.firstName} Portal` : 'Customer Portal')
    : isAdmin() 
      ? 'Drive Safe Portal'
      : isDealer 
        ? (user?.details?.businessNameLegal || user?.details?.businessNameTrading || 'Dealer Portal')
        : 'Portal';

  const logoUrl = user?.avatar;

  if (!menuItems.length) return null;

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b h-[3.9rem] flex items-center shrink-0">
        <div className="flex items-center gap-2 w-full">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain rounded shrink-0" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white p-1">
               <img src="/Drive Safe-04.png" alt="DriveSafe" className="h-full w-full object-contain" />
            </div>
          )}
          <span className="font-semibold truncate">
            {portalName}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-3.9rem)]">
          <SidebarGroup>
            {!isCustomer && (
              <SidebarGroupLabel>
                Portal Navigation
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
