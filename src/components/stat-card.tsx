"use client"

import * as React from "react"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: "up" | "down"
  trendLabel?: string
  className?: string
}

export function StatCard({ label, value, icon: Icon, trend, trendLabel, className }: StatCardProps) {
  return (
    <div className={`relative group overflow-hidden rounded-xl border border-border bg-card p-4 md:p-5 transition-all hover:border-primary/30 hover:shadow-md ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex flex-col gap-1.5 md:gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
          {Icon && (
            <div className="flex items-center justify-center size-7 md:size-8 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
              <Icon className="size-3.5 md:size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          )}
        </div>
        <span className="text-xl md:text-2xl font-black tracking-tight text-foreground">{value}</span>
        {trend && trendLabel && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend === "up" ? "text-emerald-500" : "text-destructive"}`}>
            {trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {trendLabel}
          </div>
        )}
      </div>
    </div>
  )
}
