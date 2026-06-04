"use client"

import * as React from "react"
import { LucideIcon } from "lucide-react"

interface SectionCardProps {
  title: string
  icon?: LucideIcon
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function SectionCard({ title, icon: Icon, description, action, children, className }: SectionCardProps) {
  return (
    <div className={`rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-sm ${className}`}>
      <div className="flex items-start justify-between p-4 md:p-5 pb-0">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
              <Icon className="size-4 text-primary" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">{title}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-4 md:p-5">{children}</div>
    </div>
  )
}
