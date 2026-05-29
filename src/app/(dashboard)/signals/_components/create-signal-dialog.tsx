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
import type { Signal, SignalCategory, SignalSeverity, Workspace } from "@/types"

interface CreateSignalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaces: Workspace[]
  onCreated: (signal: Signal) => void
}

export function CreateSignalDialog({
  open,
  onOpenChange,
  workspaces,
  onCreated,
}: CreateSignalDialogProps) {
  const [workspaceId, setWorkspaceId] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [category, setCategory] = React.useState<SignalCategory>("feedback")
  const [severity, setSeverity] = React.useState<SignalSeverity>("medium")
  const [source, setSource] = React.useState("manual")

  // Initialize workspace selection if workspaces exist
  React.useEffect(() => {
    if (workspaces.length > 0 && !workspaceId) {
      setWorkspaceId(workspaces[0].id)
    }
  }, [workspaces, workspaceId])

  function handleCreate() {
    if (!title.trim()) {
      toast.error("Signal title is required.")
      return
    }
    if (!description.trim()) {
      toast.error("Signal description is required.")
      return
    }
    if (!workspaceId) {
      toast.error("Please select a workspace for this signal.")
      return
    }

    const id = "sig_" + crypto.randomUUID().substring(0, 8)

    const newSignal: Signal = {
      id,
      userId: "user1",
      workspaceId,
      title,
      description,
      category,
      severity,
      status: "new",
      source,
      sourceMetadata: {
        creator: "manual_user",
        manualEntry: true,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    onCreated(newSignal)
    toast.success(`Signal "${title}" successfully logged!`)

    // Reset Form
    setTitle("")
    setDescription("")
    setCategory("feedback")
    setSeverity("medium")
    setSource("manual")
    if (workspaces.length > 0) {
      setWorkspaceId(workspaces[0].id)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] border border-border bg-popover">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Log Telemetry Signal</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Manually ingest user feedback, performance alerts, or error reports.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Workspace Select */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="workspace" className="font-bold text-xs uppercase tracking-wider">Target Workspace</Label>
            <select
              id="workspace"
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
            >
              {workspaces.length > 0 ? (
                workspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.workspaceType})
                  </option>
                ))
              ) : (
                <option value="" disabled>No workspaces available</option>
              )}
            </select>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title" className="font-bold text-xs uppercase tracking-wider">Signal Title</Label>
            <Input
              id="title"
              placeholder="e.g. Sentry: NullPointerException in UserAuth"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background border border-border"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="desc" className="font-bold text-xs uppercase tracking-wider">Description / Body</Label>
            <Textarea
              id="desc"
              placeholder="Provide logs, copy tickets, or paste user emails here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background border border-border min-h-[100px]"
            />
          </div>

          {/* Category & Severity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category" className="font-bold text-xs uppercase tracking-wider">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as SignalCategory)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="feedback">Feedback</option>
                <option value="error">Error</option>
                <option value="performance">Performance</option>
                <option value="usage">Usage</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="severity" className="font-bold text-xs uppercase tracking-wider">Severity</Label>
              <select
                id="severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SignalSeverity)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Source Input */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="source" className="font-bold text-xs uppercase tracking-wider">Ingestion Source</Label>
            <select
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="manual">Manual Entry (Discord/Email)</option>
              <option value="sentry">Sentry Alerts</option>
              <option value="posthog">PostHog Analytics</option>
              <option value="zendesk">Zendesk Support</option>
            </select>
          </div>
        </div>

        <DialogFooter className="border-t border-border bg-muted/20 px-4 py-3 -mx-6 -mb-6 flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} className="bg-primary text-primary-foreground font-bold">
            Log Signal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
