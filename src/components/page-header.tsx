"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Plus, Zap, Filter, Search, MoreHorizontal } from "lucide-react"

interface PageHeaderProps {
  title: string
  description?: string
  primaryAction?: {
    label: string
    onClick?: () => void
    icon?: React.ReactNode
  }
  secondaryAction?: {
    label: string
    onClick?: () => void
    icon?: React.ReactNode
  }
  children?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:gap-6 lg:gap-8 w-full animate-in fade-in slide-in-from-top-4 duration-500 py-4 md:py-5 lg:py-6 bg-background">
      <div className="flex flex-col gap-4 md:gap-6 md:flex-row md:items-center md:justify-between w-full">
        <div className="flex flex-col gap-1 md:gap-1.5 flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground transition-all duration-300 selection:bg-primary/20">{title}</h1>
          {description && (
            <p className="text-xs md:text-sm font-medium text-muted-foreground/80 leading-relaxed max-w-2xl">{description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          {secondaryAction && (
             <Button variant="outline" size="sm" onClick={secondaryAction.onClick} className="h-10 hover:bg-muted border-border px-3 md:px-4 shadow-sm group font-semibold transition-all hover:scale-105 active:scale-95 flex-1 md:flex-none">
              {secondaryAction.icon || <MoreHorizontal className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />}
              <span className="text-sm tracking-tight">{secondaryAction.label}</span>
            </Button>
          )}
          {primaryAction && (
            <Button variant="default" size="sm" onClick={primaryAction.onClick} className="h-10 bg-primary px-4 md:px-5 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all font-bold hover:scale-105 active:scale-95 group flex-1 md:flex-none">
              {primaryAction.icon || <Plus className="size-4.5 mr-1 group-hover:scale-110 transition-transform" />}
              <span className="text-sm tracking-tighter">{primaryAction.label}</span>
            </Button>
          )}
        </div>
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full border-t border-border/50 pt-3 md:pt-4 mt-0 md:mt-2">
          {children}
        </div>
      )}
    </div>
  )
}
