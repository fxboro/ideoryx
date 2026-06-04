"use client"

import * as React from "react"
import { PageHeader } from "@/components/page-header"
import { Scale } from "lucide-react"
import { SearchInput } from "@/components/search-input"
import { TagFilter } from "@/components/tag-filter"
import { DecisionDetailDrawer } from "./_components/decision-detail-drawer"
import { mockDecisions } from "./_components/mock-decisions"
import type { Decision } from "@/types"

// Extract unique project labels
const projectLabels = [...new Set(mockDecisions.map((d) => d.projectId).filter(Boolean))] as string[]

export default function DecisionsPage() {
  const [search, setSearch] = React.useState("")
  const [selectedProjects, setSelectedProjects] = React.useState<string[]>([])
  const [selectedDecision, setSelectedDecision] = React.useState<Decision | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const filtered = mockDecisions.filter((d) => {
    const matchesSearch =
      search === "" ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.context.toLowerCase().includes(search.toLowerCase())

    const matchesProject =
      selectedProjects.length === 0 || (d.projectId && selectedProjects.includes(d.projectId))

    return matchesSearch && matchesProject
  })

  function handleSelectDecision(decision: Decision) {
    setSelectedDecision(decision)
    setDrawerOpen(true)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background/50">
      <PageHeader
        title="Decisions Log"
        description="Store important technical and business choices to preserve context."
        primaryAction={{ label: "Log Decision", icon: <Scale className="size-4" /> }}
      />
      <div className="py-4 md:py-6 flex flex-col gap-6 max-w-[1600px] w-full mx-auto">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search decisions..." className="sm:max-w-sm" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">Project</span>
            <TagFilter tags={projectLabels} selected={selectedProjects} onChange={setSelectedProjects} />
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[600px] text-sm text-left whitespace-nowrap">
            <thead className="bg-muted text-xs uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="px-3 py-3 md:px-5 md:py-4">Date</th>
                <th className="px-3 py-3 md:px-5 md:py-4">Title</th>
                <th className="px-3 py-3 md:px-5 md:py-4">Chosen Option</th>
                <th className="hidden sm:table-cell px-3 py-3 md:px-5 md:py-4">Project</th>
                <th className="hidden md:table-cell px-3 py-3 md:px-5 md:py-4 text-right">Review Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => handleSelectDecision(d)}
                  className="hover:bg-muted/10 transition-colors cursor-pointer"
                >
                  <td className="px-3 py-3 md:px-5 md:py-4 text-muted-foreground font-medium">
                    {new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                  <td className="px-3 py-3 md:px-5 md:py-4 font-bold text-foreground">{d.title}</td>
                  <td className="px-3 py-3 md:px-5 md:py-4">
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                      {d.chosenOption}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-3 py-3 md:px-5 md:py-4 text-muted-foreground">{d.projectId || "—"}</td>
                  <td className="hidden md:table-cell px-3 py-3 md:px-5 md:py-4 text-right text-muted-foreground">
                    {d.reviewDate ? new Date(d.reviewDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-12 text-center text-muted-foreground">
                    No decisions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      <DecisionDetailDrawer decision={selectedDecision} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
