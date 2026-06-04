"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { StatusBadge } from "@/components/status-badge"
import type { Project } from "@/types"

export function ProjectTable({ projects }: { projects: Project[] }) {
  const router = useRouter()

  return (
    <div className="w-full overflow-x-auto border rounded-xl bg-card shadow-sm">
      <table className="w-full min-w-[800px] text-sm text-left whitespace-nowrap">
        <thead className="bg-muted text-xs uppercase font-semibold text-muted-foreground border-b border-border">
          <tr>
            <th className="px-3 py-3 md:px-5 md:py-4">Name</th>
            <th className="px-3 py-3 md:px-5 md:py-4">Type</th>
            <th className="px-3 py-3 md:px-5 md:py-4">Status</th>
            <th className="px-3 py-3 md:px-5 md:py-4">Phase</th>
            <th className="px-3 py-3 md:px-5 md:py-4">Current Focus</th>
            <th className="px-3 py-3 md:px-5 md:py-4">Next Milestone</th>
            <th className="px-3 py-3 md:px-5 md:py-4">Risk</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {projects.map((p) => (
            <tr 
              key={p.id} 
              onClick={() => router.push(`/projects/${p.id}`)}
              className="hover:bg-muted/10 transition-colors cursor-pointer"
            >
              <td className="px-3 py-3 md:px-5 md:py-4 font-bold text-foreground">{p.name}</td>
              <td className="px-3 py-3 md:px-5 md:py-4 font-medium text-muted-foreground capitalize">{p.type}</td>
              <td className="px-3 py-3 md:px-5 md:py-4"><StatusBadge status={p.status} /></td>
              <td className="px-3 py-3 md:px-5 md:py-4 font-bold capitalize">{p.phase}</td>
              <td className="px-3 py-3 md:px-5 md:py-4 text-muted-foreground">{p.currentFocus || "-"}</td>
              <td className="px-3 py-3 md:px-5 md:py-4 font-medium">{p.nextMilestone || "-"}</td>
              <td className="px-3 py-3 md:px-5 md:py-4">
                 <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                   p.risk === 'high' ? 'bg-destructive/10 text-destructive' : 
                   p.risk === 'medium' ? 'bg-amber-500/10 text-amber-600' : 
                   'bg-emerald-500/10 text-emerald-600'
                 }`}>
                   {p.risk}
                 </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
