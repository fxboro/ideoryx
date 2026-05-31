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
import type { Opportunity, Task, TaskType, Priority, Decision } from "@/types"

// ─────────────────────────────────────────────────────────────
// CREATE TASK DIALOG
// ─────────────────────────────────────────────────────────────

interface CreateTaskConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunity: Opportunity | null
  onTaskCreated: (newTask: Task) => void
}

export function CreateTaskConfirmDialog({
  open,
  onOpenChange,
  opportunity,
  onTaskCreated,
}: CreateTaskConfirmDialogProps) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [priority, setPriority] = React.useState<Priority>("medium")
  const [taskType, setTaskType] = React.useState<TaskType>("feature")
  const [estimateHours, setEstimateHours] = React.useState(4)

  React.useEffect(() => {
    if (opportunity) {
      setTitle(opportunity.title)
      setDescription(opportunity.description)
      
      // Map opportunity score to task priority
      if (opportunity.score >= 70) {
        setPriority("high")
      } else if (opportunity.score >= 35) {
        setPriority("medium")
      } else {
        setPriority("low")
      }

      // Map category to task type
      if (opportunity.category === "performance") {
        setTaskType("chore")
      } else if (opportunity.category === "quality") {
        setTaskType("bug")
      } else {
        setTaskType("feature")
      }
    }
  }, [opportunity])

  if (!opportunity) return null

  function handleSubmit() {
    if (!opportunity) return
    if (!title.trim()) {
      toast.error("Task title is required.")
      return
    }

    const id = "task_" + crypto.randomUUID().substring(0, 8)
    const newTask: Task = {
      id,
      userId: opportunity.userId,
      workspaceId: opportunity.workspaceId,
      title,
      description,
      type: taskType,
      priority,
      status: "todo",
      estimateHours: estimateHours || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    onTaskCreated(newTask)
    toast.success(`Task "${title}" created successfully and linked to Opportunity!`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] border border-border bg-popover max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Create Task from Opportunity</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Confirm and edit details to generate an optimization task. Tasks are not auto-created.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="t-title" className="font-bold text-xs uppercase tracking-wider">Task Title</Label>
            <Input
              id="t-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background border border-border"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="t-desc" className="font-bold text-xs uppercase tracking-wider">Description</Label>
            <Textarea
              id="t-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background border border-border min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-priority" className="font-bold text-xs uppercase tracking-wider">Priority</Label>
              <select
                id="t-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary text-foreground"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-type" className="font-bold text-xs uppercase tracking-wider">Task Type</Label>
              <select
                id="t-type"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as TaskType)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary text-foreground"
              >
                <option value="feature">Feature</option>
                <option value="bug">Bug</option>
                <option value="chore">Chore</option>
                <option value="research">Research</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="t-hours" className="font-bold text-xs uppercase tracking-wider">Estimated Hours</Label>
            <Input
              id="t-hours"
              type="number"
              min="0"
              value={estimateHours}
              onChange={(e) => setEstimateHours(Number(e.target.value))}
              className="bg-background border border-border"
            />
          </div>
        </div>

        <DialogFooter className="border-t border-border bg-muted/20 px-4 py-3 -mx-6 -mb-6 flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-primary text-primary-foreground font-bold">
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────────────────────────
// RECORD DECISION DIALOG
// ─────────────────────────────────────────────────────────────

interface SaveDecisionConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunity: Opportunity | null
  onDecisionSaved: (newDecision: Decision) => void
}

export function SaveDecisionConfirmDialog({
  open,
  onOpenChange,
  opportunity,
  onDecisionSaved,
}: SaveDecisionConfirmDialogProps) {
  const [title, setTitle] = React.useState("")
  const [context, setContext] = React.useState("")
  const [optionsConsideredText, setOptionsConsideredText] = React.useState("")
  const [chosenOption, setChosenOption] = React.useState("")
  const [rationale, setRationale] = React.useState("")
  const [tradeoffs, setTradeoffs] = React.useState("")
  const [risks, setRisks] = React.useState("")

  React.useEffect(() => {
    if (opportunity) {
      setTitle(`Resolve Opportunity: ${opportunity.title}`)
      setContext(`Triggered by opportunity: ${opportunity.description}`)
      setOptionsConsideredText("Option A: Do nothing\nOption B: Full optimization project\nOption C: Quick remediation workaround")
      setChosenOption("Option C")
      setRationale("Provides 80% of the benefit with very minimal effort, allowing us to validate metrics first.")
      setTradeoffs("Doesn't completely re-architect the codebase, but solves connection issues in peak hours.")
      setRisks("Workaround might need revision if traffic scale doubles.")
    }
  }, [opportunity])

  if (!opportunity) return null

  function handleSubmit() {
    if (!opportunity) return
    if (!title.trim()) {
      toast.error("Decision title is required.")
      return
    }
    if (!context.trim()) {
      toast.error("Context is required.")
      return
    }
    if (!chosenOption.trim()) {
      toast.error("Chosen Option is required.")
      return
    }
    if (!rationale.trim()) {
      toast.error("Rationale is required.")
      return
    }

    const options = optionsConsideredText
      .split("\n")
      .map((opt) => opt.trim())
      .filter((opt) => opt.length > 0)

    if (options.length === 0) {
      toast.error("Please add at least one considered option.")
      return
    }

    const id = "dec_" + crypto.randomUUID().substring(0, 8)
    const newDecision: Decision = {
      id,
      userId: opportunity.userId,
      workspaceId: opportunity.workspaceId,
      title,
      context,
      optionsConsidered: options,
      chosenOption,
      rationale,
      tradeoffs: tradeoffs || undefined,
      risks: risks || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    onDecisionSaved(newDecision)
    toast.success(`Decision "${title}" saved successfully!`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border border-border bg-popover max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Record Architecture Decision</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Document options and chosen path to address this opportunity candidate.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="d-title" className="font-bold text-xs uppercase tracking-wider">Decision Title</Label>
            <Input
              id="d-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background border border-border"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="d-context" className="font-bold text-xs uppercase tracking-wider">Context</Label>
            <Textarea
              id="d-context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="bg-background border border-border min-h-[60px]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="d-options" className="font-bold text-xs uppercase tracking-wider">Options Considered (One per line)</Label>
            <Textarea
              id="d-options"
              value={optionsConsideredText}
              onChange={(e) => setOptionsConsideredText(e.target.value)}
              placeholder="Option A: Description..."
              className="bg-background border border-border min-h-[80px]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="d-chosen" className="font-bold text-xs uppercase tracking-wider">Chosen Option</Label>
            <Input
              id="d-chosen"
              value={chosenOption}
              onChange={(e) => setChosenOption(e.target.value)}
              placeholder="e.g. Option C"
              className="bg-background border border-border"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="d-rationale" className="font-bold text-xs uppercase tracking-wider">Rationale</Label>
            <Textarea
              id="d-rationale"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              className="bg-background border border-border min-h-[60px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="d-tradeoffs" className="font-bold text-xs uppercase tracking-wider">Tradeoffs</Label>
              <Textarea
                id="d-tradeoffs"
                value={tradeoffs}
                onChange={(e) => setTradeoffs(e.target.value)}
                className="bg-background border border-border min-h-[50px] text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="d-risks" className="font-bold text-xs uppercase tracking-wider">Risks</Label>
              <Textarea
                id="d-risks"
                value={risks}
                onChange={(e) => setRisks(e.target.value)}
                className="bg-background border border-border min-h-[50px] text-xs"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border bg-muted/20 px-4 py-3 -mx-6 -mb-6 flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-primary text-primary-foreground font-bold">
            Record Decision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
