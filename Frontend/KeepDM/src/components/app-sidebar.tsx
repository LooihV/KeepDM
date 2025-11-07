"use client"

import * as React from "react"
import {
  LayoutDashboard,
  FileText,
  Upload as UploadIcon,
  Settings,
} from "lucide-react"

// import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavData } from "@/components/nav-data"
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
  projects: [
    {
      name: "Dashboards",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
  ],
  dataItems: [
    {
      name: "Plantillas",
      url: "/templates",
      icon: FileText,
    },
    {
      name: "Mis datos",
      url: "/upload",
      icon: UploadIcon,
    },
  ],
  settings: [
    {
      name: "Configuración",
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
        <NavData items={data.dataItems} />
        <NavSettings settings={data.settings} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
