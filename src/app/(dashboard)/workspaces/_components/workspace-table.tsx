"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { StatusBadge } from "@/components/status-badge"
import type { Workspace } from "@/types"

interface WorkspaceTableProps {
  workspaces: Workspace[]
}

export function WorkspaceTable({ workspaces }: WorkspaceTableProps) {
  const router = useRouter()

  return (
    <div className="w-full overflow-x-auto border border-border rounded-xl bg-card shadow-sm">
      <table className="w-full min-w-[800px] text-sm text-left whitespace-nowrap">
        <thead className="bg-muted/50 text-xs uppercase font-semibold text-muted-foreground border-b border-border">
          <tr>
            <th className="px-3 py-3 md:px-5 md:py-4">Name</th>
            <th className="px-3 py-3 md:px-5 md:py-4">Type</th>
            <th className="px-3 py-3 md:px-5 md:py-4">Status</th>
            <th className="px-3 py-3 md:px-5 md:py-4">Stage</th>
            <th className="px-3 py-3 md:px-5 md:py-4">Readiness</th>
            <th className="px-3 py-3 md:px-5 md:py-4">Current Focus</th>
            <th className="px-3 py-3 md:px-5 md:py-4">Risk</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {workspaces.map((w) => {
            const progressColor = w.readinessScore >= 80 
              ? "bg-emerald-500" 
              : w.readinessScore >= 50 
                ? "bg-amber-500" 
                : "bg-primary";

            return (
              <tr 
                key={w.id} 
                onClick={() => router.push(`/workspaces/${w.id}`)}
                className="hover:bg-muted/5 transition-colors cursor-pointer"
              >
                <td className="px-3 py-3 md:px-5 md:py-4 font-bold text-foreground hover:text-primary transition-colors">{w.name}</td>
                <td className="px-3 py-3 md:px-5 md:py-4">
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {w.workspaceType}
                  </span>
                </td>
                <td className="px-3 py-3 md:px-5 md:py-4"><StatusBadge status={w.status} /></td>
                <td className="px-3 py-3 md:px-5 md:py-4 font-bold capitalize">{w.stage}</td>
                <td className="px-3 py-3 md:px-5 md:py-4">
                  <div className="flex items-center gap-3 w-40">
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border/50">
                      <div 
                        className={`h-full ${progressColor} transition-all`}
                        style={{ width: `${w.readinessScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-foreground">{w.readinessScore}%</span>
                  </div>
                </td>
                <td className="px-3 py-3 md:px-5 md:py-4 text-muted-foreground truncate max-w-xs">{w.currentFocus || "-"}</td>
                <td className="px-3 py-3 md:px-5 md:py-4">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                    w.risk === 'high' 
                      ? 'bg-destructive/10 text-destructive' 
                      : w.risk === 'medium' 
                        ? 'bg-amber-500/10 text-amber-600' 
                        : 'bg-emerald-500/10 text-emerald-600'
                  }`}>
                    {w.risk}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )
}
