"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Plus, Briefcase } from "lucide-react"
import { WorkspaceFiltersBar } from "./_components/workspace-filters-bar"
import { WorkspaceTable } from "./_components/workspace-table"
import { WorkspaceCardGrid } from "./_components/workspace-card-grid"
import { CreateWorkspaceDialog } from "./_components/create-workspace-dialog"
import { EmptyState } from "@/components/empty-state"
import { getStoredWorkspaces, saveStoredWorkspaces } from "./_components/mock-workspaces"
import type { Workspace } from "@/types"

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Filters State
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [stageFilter, setStageFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [riskFilter, setRiskFilter] = useState("all")

  // Load from database
  useEffect(() => {
    fetch("/api/workspaces")
      .then((res) => res.json())
      .then((json) => {
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setWorkspaces(json.data)
        } else {
          setWorkspaces(getStoredWorkspaces())
        }
      })
      .catch(() => setWorkspaces(getStoredWorkspaces()))
  }, [])

  // Save changes
  const handleCreated = (newWorkspace: Workspace) => {
    const updated = [newWorkspace, ...workspaces]
    setWorkspaces(updated)
    saveStoredWorkspaces(updated)
  }

  // Filter Logic
  const filteredWorkspaces = workspaces.filter((w) => {
    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchesSearch = 
        w.name.toLowerCase().includes(q) || 
        w.summary.toLowerCase().includes(q) ||
        (w.currentFocus && w.currentFocus.toLowerCase().includes(q)) ||
        (w.nextMilestone && w.nextMilestone.toLowerCase().includes(q));
      if (!matchesSearch) return false
    }

    // Type filter
    if (typeFilter !== "all" && w.workspaceType !== typeFilter) {
      return false
    }

    // Stage filter
    if (stageFilter !== "all" && w.stage !== stageFilter) {
      return false
    }

    // Status filter
    if (statusFilter !== "all" && w.status !== statusFilter) {
      return false
    }

    // Risk filter
    if (riskFilter !== "all" && w.risk !== riskFilter) {
      return false
    }

    return true
  })

  return (
    <div className="flex flex-col min-h-screen bg-background/50">
      <div className="py-4 md:py-6 flex flex-col w-full mx-auto max-w-[1600px] h-full">
        <PageHeader
          title="Workspaces"
          description="Manage your product launches, client delivery systems, and operational lifecycles."
          primaryAction={{
            label: "New Workspace",
            icon: <Plus className="size-4" />,
            onClick: () => setIsCreateOpen(true)
          }}
        />

        <div className="mt-8 flex-1 flex flex-col">
          {workspaces.length > 0 ? (
            <>
              <WorkspaceFiltersBar
                viewMode={viewMode}
                setViewMode={setViewMode}
                search={search}
                setSearch={setSearch}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                stageFilter={stageFilter}
                setStageFilter={setStageFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                riskFilter={riskFilter}
                setRiskFilter={setRiskFilter}
              />

              {filteredWorkspaces.length > 0 ? (
                <div className="flex-1 w-full relative">
                  {viewMode === 'table' ? (
                    <WorkspaceTable workspaces={filteredWorkspaces} />
                  ) : (
                    <WorkspaceCardGrid workspaces={filteredWorkspaces} />
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-16 bg-card border rounded-xl">
                  <p className="text-muted-foreground font-medium text-sm">No workspaces match your active filter criteria.</p>
                  <button 
                    onClick={() => {
                      setSearch("")
                      setTypeFilter("all")
                      setStageFilter("all")
                      setStatusFilter("all")
                      setRiskFilter("all")
                    }}
                    className="mt-3 text-xs text-primary font-bold hover:underline"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center pt-12">
              <div className="max-w-md w-full">
                <EmptyState
                  icon={Briefcase}
                  title="No workspaces yet"
                  description="Workspaces let you scale from simple products to clients and dynamic lifecycles."
                  action={
                    <button 
                      onClick={() => setIsCreateOpen(true)}
                      className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold text-sm"
                    >
                      <Plus className="w-4 h-4" /> Create first workspace
                    </button>
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateWorkspaceDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={handleCreated}
      />
    </div>
  )
}
