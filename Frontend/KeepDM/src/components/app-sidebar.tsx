"use client"

import * as React from "react"
import {
  User,
  LayoutDashboard,
  Database,
  Settings,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { NavSettings } from "@/components/nav-settings"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Data",
      url: "#",
      icon: Database,
      isActive: true,
      items: [
        {
          title: "Table",
          url: "#",
        },
        {
          title: "Upload",
          url: "#",
        },
        {
          title: "Export",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Dashboard",
      url: "#",
      icon: LayoutDashboard,
    },
    {
      name: "Profile",
      url: "#",
      icon: User,
    }
  ],
  settings: [
    { 
      name: "Settings",
      url: "#",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
        <NavMain items={data.navMain} />
        <NavSettings settings={data.settings} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
