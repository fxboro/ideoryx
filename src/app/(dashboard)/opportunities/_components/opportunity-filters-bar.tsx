"use client"

import * as React from "react"
import { Search, ArrowUpDown } from "lucide-react"
import type { Workspace } from "@/types"

interface OpportunityFiltersBarProps {
  search: string
  setSearch: (val: string) => void
  workspaceFilter: string
  setWorkspaceFilter: (val: string) => void
  categoryFilter: string
  setCategoryFilter: (val: string) => void
  statusFilter: string
  setStatusFilter: (val: string) => void
  sortBy: string
  setSortBy: (val: string) => void
  workspaces: Workspace[]
}

export function OpportunityFiltersBar({
  search,
  setSearch,
  workspaceFilter,
  setWorkspaceFilter,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  workspaces,
}: OpportunityFiltersBarProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm mb-6">
      <div className="flex flex-col md:flex-row flex-1 items-stretch md:items-center gap-3 w-full">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2 flex-1">
          {/* Workspace Filter */}
          <select
            value={workspaceFilter}
            onChange={(e) => setWorkspaceFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary text-foreground"
          >
            <option value="all">All Workspaces</option>
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary text-foreground"
          >
            <option value="all">All Categories</option>
            <option value="growth">Growth</option>
            <option value="performance">Performance</option>
            <option value="security">Security</option>
            <option value="cost">Cost</option>
            <option value="quality">Quality</option>
            <option value="other">Other</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary text-foreground"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="implemented">Implemented</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 mt-2 md:mt-0">
          <ArrowUpDown className="size-3.5 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary text-foreground font-medium"
          >
            <option value="score-desc">Highest Score</option>
            <option value="score-asc">Lowest Score</option>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  )
}
