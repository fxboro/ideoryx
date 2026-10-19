"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { WorkspaceDetailHeader } from "./_components/workspace-detail-header"
import { WorkspaceSummaryCards } from "./_components/workspace-summary-cards"
import { WorkspaceTabs } from "./_components/workspace-tabs"
import { getStoredWorkspaces, saveStoredWorkspaces } from "../_components/mock-workspaces"
import { EmptyState } from "@/components/empty-state"
import { FolderX, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Workspace } from "@/types"

export default function WorkspaceDetailPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  // Unwrap parameters via React.use for Next.js 15+ App Router compliance
  const resolvedParams = React.use(params)
  const workspaceId = resolvedParams.workspaceId

  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadWorkspace() {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}`)
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.data && isMounted) {
            setWorkspace(json.data)
            setLoading(false)
            return
          }
        }
      } catch (err) {
        console.warn("Could not fetch remote workspace, checking local store:", err)
      }

      if (isMounted) {
        const list = getStoredWorkspaces()
        const found = list.find(w => w.id === workspaceId) || null
        setWorkspace(found)
        setLoading(false)
      }
    }

    loadWorkspace()
    return () => {
      isMounted = false
    }
  }, [workspaceId])

  const handleWorkspaceUpdated = async (updatedWorkspace: Workspace) => {
    setWorkspace(updatedWorkspace)
    const list = getStoredWorkspaces()
    const updatedList = list.map(w => w.id === updatedWorkspace.id ? updatedWorkspace : w)
    saveStoredWorkspaces(updatedList)

    try {
      await fetch(`/api/workspaces/${updatedWorkspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: updatedWorkspace.stage,
          checklists: updatedWorkspace.checklists,
          readinessScore: updatedWorkspace.readinessScore,
        }),
      })
    } catch (err) {
      console.warn("Could not sync workspace update to server:", err)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background/50 p-8 justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="flex flex-col min-h-screen bg-background/50 p-4 md:p-8">
        <Link href="/workspaces" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit font-medium mb-8">
           <ArrowLeft className="w-4 h-4" /> Back to workspaces
        </Link>
        <EmptyState 
           icon={FolderX} 
           title="Workspace not found" 
           description="This workspace does not exist or you do not have access to it." 
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background/50">
      <div className="p-4 md:p-6 lg:p-8 flex flex-col w-full mx-auto max-w-[1600px]">
        <WorkspaceDetailHeader workspace={workspace} />
        <WorkspaceSummaryCards workspace={workspace} />
        <WorkspaceTabs 
          workspace={workspace} 
          onWorkspaceUpdated={handleWorkspaceUpdated} 
        />
      </div>
    </div>
  )
}
