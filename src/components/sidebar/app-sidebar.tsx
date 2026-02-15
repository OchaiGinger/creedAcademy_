// components/sidebar/app-sidebar.tsx
"use client";

import * as React from "react";
import * as Icons from "lucide-react";
import Link from "next/link";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { NavUser } from "@/components/sidebar/nav-user";
import { SidebarData, NavItem } from "@/components/dashboard/shared-layout";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navData: SidebarData;
}

export function AppSidebar({ navData, ...props }: AppSidebarProps) {
  // Logic to convert string names to Actual Components
  const convertItems = (items: NavItem[]) =>
    items.map((item) => ({
      ...item,
      icon: (Icons as any)[item.icon] || Icons.HelpCircle,
    }));

  const processedNavMain = convertItems(navData.navMain);
  const processedNavSecondary = navData.navSecondary
    ? convertItems(navData.navSecondary)
    : [];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="p-1.5!">
              <Link href="/" className="flex items-center gap-3">
                <img src="/logo.svg" alt="Logo" className="size-9" />
                <div className="flex flex-col leading-tight">
                  <span className="font-bold">Keek Institute</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={processedNavMain} />
        {navData.navSecondary && (
          <NavSecondary items={processedNavSecondary} className="mt-auto" />
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
