"use client"

import * as React from "react"
import { Search } from "lucide-react"
import type { Workspace } from "@/types"

interface SignalFiltersBarProps {
  search: string
  setSearch: (val: string) => void
  workspaceFilter: string
  setWorkspaceFilter: (val: string) => void
  sourceFilter: string
  setSourceFilter: (val: string) => void
  categoryFilter: string
  setCategoryFilter: (val: string) => void
  severityFilter: string
  setSeverityFilter: (val: string) => void
  statusFilter: string
  setStatusFilter: (val: string) => void
  workspaces: Workspace[]
}

export function SignalFiltersBar({
  search,
  setSearch,
  workspaceFilter,
  setWorkspaceFilter,
  sourceFilter,
  setSourceFilter,
  categoryFilter,
  setCategoryFilter,
  severityFilter,
  setSeverityFilter,
  statusFilter,
  setStatusFilter,
  workspaces,
}: SignalFiltersBarProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm mb-6">
      <div className="flex flex-col md:flex-row flex-1 items-stretch md:items-center gap-3 w-full">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search signals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2">
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

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary text-foreground"
          >
            <option value="all">All Sources</option>
            <option value="manual">Manual Entry</option>
            <option value="sentry">Sentry Alerts</option>
            <option value="posthog">PostHog Analytics</option>
            <option value="zendesk">Zendesk Support</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary text-foreground"
          >
            <option value="all">All Categories</option>
            <option value="feedback">Feedback</option>
            <option value="error">Error</option>
            <option value="performance">Performance</option>
            <option value="usage">Usage</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary text-foreground"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary text-foreground"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="converted">Converted</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>
    </div>
  )
}
