"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { Workspace, WorkspaceType, ProductLifecycleStage, ClientLifecycleStage, WorkspaceRiskLevel } from "@/types"
import { MOCK_PRODUCT_CHECKLISTS, MOCK_CLIENT_CHECKLISTS } from "./mock-workspaces"

interface CreateWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (workspace: Workspace) => void
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateWorkspaceDialogProps) {
  const [workspaceType, setWorkspaceType] = React.useState<WorkspaceType>("product")
  const [name, setName] = React.useState("")
  const [summary, setSummary] = React.useState("")
  const [currentFocus, setCurrentFocus] = React.useState("")
  const [nextMilestone, setNextMilestone] = React.useState("")
  const [risk, setRisk] = React.useState<WorkspaceRiskLevel>("low")
  const [stage, setStage] = React.useState<string>("validation")

  // Reset stage selection when type changes
  React.useEffect(() => {
    if (workspaceType === "product") {
      setStage("validation")
    } else {
      setStage("discovery")
    }
  }, [workspaceType])

  function handleCreate() {
    if (!name.trim()) {
      toast.error("Workspace name is required.")
      return
    }
    if (!summary.trim()) {
      toast.error("Description / Summary is required.")
      return
    }

    const defaultChecklists = workspaceType === "product"
      ? JSON.parse(JSON.stringify(MOCK_PRODUCT_CHECKLISTS))
      : JSON.parse(JSON.stringify(MOCK_CLIENT_CHECKLISTS));

    const id = "ws_" + crypto.randomUUID().substring(0, 8);

    const newWorkspace: Workspace = {
      id,
      userId: "user1",
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      workspaceType,
      status: "active",
      summary,
      stage: stage as ProductLifecycleStage | ClientLifecycleStage,
      readinessScore: 0,
      checklists: defaultChecklists,
      currentFocus: currentFocus || undefined,
      nextMilestone: nextMilestone || undefined,
      risk,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      type: workspaceType === "product" ? "product" : "freelance",
      phase: workspaceType === "product" ? "spec" : "launch"
    };

    // Persist to Supabase backend API
    fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug: newWorkspace.slug,
        workspaceType,
        summary,
        stage,
        risk,
        currentFocus,
        nextMilestone,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          onCreated(json.data)
        } else {
          onCreated(newWorkspace)
        }
      })
      .catch(() => {
        onCreated(newWorkspace)
      })

    toast.success(`Workspace "${name}" successfully created!`)
    
    // Reset state
    setName("")
    setSummary("")
    setCurrentFocus("")
    setNextMilestone("")
    setRisk("low")
    if (workspaceType === "product") {
      setStage("validation")
    } else {
      setStage("discovery")
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border border-border bg-popover">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Workspace</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Workspaces organize your client jobs and product builds with dedicated stages.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Workspace Type Selector */}
          <div className="flex flex-col gap-2">
            <Label className="font-bold text-xs uppercase tracking-wider">Workspace Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setWorkspaceType("product")}
                className={`py-3 px-4 rounded-xl border text-center font-bold text-sm transition-all flex flex-col items-center gap-1 ${
                  workspaceType === "product"
                    ? "bg-primary/5 text-primary border-primary ring-1 ring-primary"
                    : "bg-background border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <span>Product Workspace</span>
                <span className="text-[10px] font-medium opacity-80 font-normal">Build products or SaaS</span>
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceType("client")}
                className={`py-3 px-4 rounded-xl border text-center font-bold text-sm transition-all flex flex-col items-center gap-1 ${
                  workspaceType === "client"
                    ? "bg-primary/5 text-primary border-primary ring-1 ring-primary"
                    : "bg-background border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <span>Client Workspace</span>
                <span className="text-[10px] font-medium opacity-80 font-normal">Manage freelance & client contracts</span>
              </button>
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="font-bold text-xs uppercase tracking-wider">Workspace Name</Label>
            <Input
              id="name"
              placeholder="e.g. Acme SaaS Platform"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border border-border"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="summary" className="font-bold text-xs uppercase tracking-wider">Description / Summary</Label>
            <Textarea
              id="summary"
              placeholder="Provide a brief summary of the workspace..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="bg-background border border-border min-h-[80px]"
            />
          </div>

          {/* Current Focus / Objectives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="focus" className="font-bold text-xs uppercase tracking-wider">Current Objective / Focus</Label>
              <Input
                id="focus"
                placeholder="e.g. Scoping core features"
                value={currentFocus}
                onChange={(e) => setCurrentFocus(e.target.value)}
                className="bg-background border border-border"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="milestone" className="font-bold text-xs uppercase tracking-wider">Target Outcome / Milestone</Label>
              <Input
                id="milestone"
                placeholder="e.g. Spec review complete"
                value={nextMilestone}
                onChange={(e) => setNextMilestone(e.target.value)}
                className="bg-background border border-border"
              />
            </div>
          </div>

          {/* Stage & Risk */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stage" className="font-bold text-xs uppercase tracking-wider">Starting Stage</Label>
              <select
                id="stage"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              >
                {workspaceType === "product" ? (
                  <>
                    <option value="validation">Validation</option>
                    <option value="spec">Spec</option>
                    <option value="build">Build</option>
                    <option value="launch">Launch</option>
                    <option value="growth">Growth</option>
                  </>
                ) : (
                  <>
                    <option value="discovery">Discovery</option>
                    <option value="proposal">Proposal</option>
                    <option value="delivery">Delivery</option>
                    <option value="launch">Launch</option>
                    <option value="support">Support</option>
                  </>
                )}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="risk" className="font-bold text-xs uppercase tracking-wider">Risk Level</Label>
              <select
                id="risk"
                value={risk}
                onChange={(e) => setRisk(e.target.value as WorkspaceRiskLevel)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border bg-muted/20 px-4 py-3 -mx-6 -mb-6 flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} className="bg-primary text-primary-foreground font-bold">
            Create Workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
