"use client"

import * as React from "react"
import {
  IconDashboard,
  IconCalendar,
  IconHistory,
  IconSettings,
  IconInnerShadowTop,
  IconClock,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user: any }) {
  const navMain = [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "My Appointments",
      url: "/appointments",
      icon: IconCalendar,
    },
    {
      title: "History",
      url: "/appointment-history",
      icon: IconHistory,
    },
    {
      title: "Appointment Settings",
      url: "/appointment-settings",
      icon: IconClock,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
  ];

  const mapUser = {
    name: user?.name || "Dr. Mapleime",
    email: user?.email || "doc@mapleime.com",
    avatar: "", // could be their avatar
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Mapleime Clinic</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="mt-4">
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={mapUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
