"use client"

import * as React from "react"
import { Search, Filter, LayoutGrid, List } from "lucide-react"

interface WorkspaceFiltersBarProps {
  viewMode: 'table' | 'card'
  setViewMode: (mode: 'table' | 'card') => void
  search: string
  setSearch: (val: string) => void
  typeFilter: string
  setTypeFilter: (val: string) => void
  stageFilter: string
  setStageFilter: (val: string) => void
  statusFilter: string
  setStatusFilter: (val: string) => void
  riskFilter: string
  setRiskFilter: (val: string) => void
}

export function WorkspaceFiltersBar({
  viewMode,
  setViewMode,
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  stageFilter,
  setStageFilter,
  statusFilter,
  setStatusFilter,
  riskFilter,
  setRiskFilter,
}: WorkspaceFiltersBarProps) {
  return (
    <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm mb-6">
      <div className="flex flex-col md:flex-row flex-1 items-stretch md:items-center gap-3 w-full">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search workspaces..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2.5 md:py-2 text-sm outline-none focus:ring-1 focus:ring-primary w-full md:w-auto"
          >
            <option value="all">All Types</option>
            <option value="product">Product</option>
            <option value="client">Client</option>
          </select>

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2.5 md:py-2 text-sm outline-none focus:ring-1 focus:ring-primary w-full md:w-auto"
          >
            <option value="all">All Stages</option>
            {typeFilter !== "client" && (
              <>
                <option disabled className="font-semibold text-primary/80">Product Stages</option>
                <option value="validation">Validation</option>
                <option value="spec">Spec</option>
                <option value="build">Build</option>
                <option value="launch">Launch</option>
                <option value="growth">Growth</option>
              </>
            )}
            {typeFilter !== "product" && (
              <>
                <option disabled className="font-semibold text-primary/80">Client Stages</option>
                <option value="discovery">Discovery</option>
                <option value="proposal">Proposal</option>
                <option value="delivery">Delivery</option>
                <option value="launch">Launch (Client)</option>
                <option value="support">Support</option>
              </>
            )}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2.5 md:py-2 text-sm outline-none focus:ring-1 focus:ring-primary w-full md:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2.5 md:py-2 text-sm outline-none focus:ring-1 focus:ring-primary w-full md:w-auto"
          >
            <option value="all">All Risks</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border/80 self-end xl:self-auto">
        <button
          onClick={() => setViewMode('table')}
          className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-background shadow font-bold text-primary border border-border/50' : 'text-muted-foreground hover:bg-muted/50'}`}
          title="Table View"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode('card')}
          className={`p-2 rounded-md transition-colors ${viewMode === 'card' ? 'bg-background shadow font-bold text-primary border border-border/50' : 'text-muted-foreground hover:bg-muted/50'}`}
          title="Card View"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
