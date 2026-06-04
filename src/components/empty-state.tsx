"use client"

import * as React from "react"
import { FolderX, Inbox, LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/5">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-base md:text-lg font-bold tracking-tight text-foreground mb-1">{title}</h3>
      <p className="text-xs md:text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && <div className="w-full sm:w-auto [&>button]:w-full [&>button]:sm:w-auto">{action}</div>}
    </div>
  )
}
