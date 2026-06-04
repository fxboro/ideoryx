"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
    <SidebarProvider className="flex min-h-screen w-full bg-background selection:bg-primary/20">
      <AppSidebar className="shadow-2xl z-50 border-r border-border/50 bg-sidebar-background transition-all duration-500 ease-in-out" />
      <SidebarInset className="flex w-full flex-col bg-background relative overflow-hidden transition-all duration-500 ease-in-out">
        <TopNav />
        <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth focus:outline-none relative">
           <div className="mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-8 pb-20 md:pb-16 pb-safe relative">
              {children}
           </div>
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
    </TooltipProvider>
  )
}
