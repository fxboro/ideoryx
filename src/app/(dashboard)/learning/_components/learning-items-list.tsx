"use client"

import * as React from "react"
import { StatusBadge } from "@/components/status-badge"
import { ProgressBar } from "@/components/progress-bar"
import { Badge } from "@/components/ui/badge"
import { GraduationCap } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import type { LearningItem } from "@/types"

interface LearningItemsListProps {
  items: LearningItem[]
}

const skillColors = {
  beginner: "bg-emerald-500/10 text-emerald-500",
  intermediate: "bg-amber-500/10 text-amber-500",
  advanced: "bg-purple-500/10 text-purple-500",
}

export function LearningItemsList({ items }: LearningItemsListProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No learning items found"
        description="There are no learning items logged yet."
      />
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-muted text-xs uppercase font-semibold text-muted-foreground border-b border-border">
            <tr>
              <th className="px-5 py-4">Topic</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Level</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 min-w-[150px]">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-muted/10 transition-colors cursor-pointer">
                <td className="px-5 py-4">
                  <div>
                    <span className="font-bold text-foreground">{item.title}</span>
                    <div className="flex gap-1 mt-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[9px] uppercase font-bold text-muted-foreground border px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-muted-foreground font-medium">{item.category}</td>
                <td className="px-5 py-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${skillColors[item.skillLevel]}`}>
                    {item.skillLevel}
                  </span>
                </td>
                <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                <td className="px-5 py-4">
                  <ProgressBar
                    value={item.progress}
                    size="sm"
                    variant={item.progress === 100 ? "success" : item.progress >= 50 ? "default" : "warning"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
