"use client"

import * as React from "react"
import { Search, Plus, Zap, Bell, User, Settings } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TopNav() {
  const { open, setOpen, openMobile, setOpenMobile } = useSidebar()
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false)
  
  return (
    <header className="sticky top-0 z-40 flex h-14 md:h-16 w-full shrink-0 items-center gap-2 md:gap-4 border-b border-border bg-background px-3 md:px-4 lg:px-6">
      <div className="flex flex-1 items-center gap-2 md:gap-4 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
           <SidebarTrigger className="ring-1 ring-border shadow-sm border-border hover:bg-muted touch-target" />
        </div>
        
        {/* Desktop search */}
        <div className="relative hidden md:block max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search everything..."
            className="h-9 w-full rounded-md border border-input bg-muted/50 pl-9 pr-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-all duration-200"
          />
        </div>

        {/* Mobile search toggle */}
        {mobileSearchOpen && (
          <div className="flex-1 md:hidden animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                placeholder="Search..."
                onBlur={() => setMobileSearchOpen(false)}
                className="h-10 w-full rounded-md border border-input bg-muted/50 pl-9 pr-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-all"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
        {/* Mobile search button */}
        {!mobileSearchOpen && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden size-9 rounded-full hover:bg-muted touch-target"
            onClick={() => setMobileSearchOpen(true)}
          >
            <Search className="size-4 text-muted-foreground" />
          </Button>
        )}

        {/* Quick Add — icon on tablet, full on desktop */}
        <Button variant="outline" size="sm" className="hidden md:flex border-border bg-sidebar h-9 gap-2 px-2 lg:px-3 shadow-sm transition-all hover:bg-muted group">
          <Plus className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-sm font-medium tracking-tight hidden lg:inline">Quick Add</span>
        </Button>
        
        {/* Run Agent — icon on tablet, full on desktop */}
        <Button variant="default" size="sm" className="hidden md:flex h-9 bg-primary text-primary-foreground gap-2 px-2 lg:px-4 shadow-md hover:shadow-lg transition-all active:scale-95">
          <Zap className="size-4 fill-primary-foreground" />
          <span className="text-sm font-bold tracking-tight hidden lg:inline">Run Agent</span>
        </Button>

        <div className="flex items-center gap-1.5 md:gap-2 border-l border-border pl-2 md:pl-3">
           <Button variant="ghost" size="icon" className="size-9 rounded-full relative hover:bg-muted touch-target">
            <Bell className="size-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9 rounded-full ring-1 ring-border p-0 hover:bg-muted overflow-hidden touch-target">
                <Avatar className="size-full">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">CH</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 border-border p-1 shadow-xl">
              <DropdownMenuLabel className="px-2 py-1.5 flex flex-col gap-0.5">
                <span className="text-sm font-bold">Chima Operating</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Builder Tier</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 focus:bg-primary/5 cursor-pointer">
                <User className="size-4" />
                <span className="font-medium">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 focus:bg-primary/5 cursor-pointer">
                <Settings className="size-4" />
                <span className="font-medium">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:bg-destructive/5 font-medium cursor-pointer">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
