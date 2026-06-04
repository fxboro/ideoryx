"use client"

import * as React from "react"
import {
  Calendar,
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Briefcase,
  Scale,
  Settings,
  ChevronRight,
  Plus,
  Zap,
  Activity,
  Lightbulb,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

const data = {
  navMain: [
    {
      title: "Today",
      url: "/today",
      icon: LayoutDashboard,
    },
    {
      title: "Workspaces",
      url: "/workspaces",
      icon: Briefcase,
    },
    {
      title: "Signals",
      url: "/signals",
      icon: Activity,
    },
    {
      title: "Opportunities",
      url: "/opportunities",
      icon: Lightbulb,
    },
    {
      title: "Agents",
      url: "/agents",
      icon: Users,
    },
    {
      title: "Playbooks",
      url: "/playbooks",
      icon: BookOpen,
    },
    {
      title: "Learning",
      url: "/learning",
      icon: GraduationCap,
    },
    {
      title: "Freelance",
      url: "/freelance",
      icon: Zap,
    },
    {
      title: "Decisions",
      url: "/decisions",
      icon: Scale,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-border bg-sidebar h-full overflow-hidden">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm ring-1 ring-primary">
            <Zap className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="text-sm font-bold tracking-tight">Mission Control</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Operating OS</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="h-full overflow-hidden flex flex-col">
        <SidebarMenu className="px-2 pt-3 gap-0.5">
          {data.navMain.map((item) => {
            const isActive = pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url))
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  className="transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group min-h-[44px] md:min-h-[36px]"
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <item.icon className={`size-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    <span className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/settings"}
              tooltip="Settings"
              className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground min-h-[44px] md:min-h-[36px]"
            >
              <Link href="/settings" className="flex items-center gap-3">
                <Settings className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-sm font-medium">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
