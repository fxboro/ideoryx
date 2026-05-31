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
import { calculateOpportunityScore } from "@/lib/utils/opportunity-scoring"
import type { Signal, Opportunity, OpportunityCategory, Workspace } from "@/types"

interface ConvertSignalToOpportunityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  signal: Signal | null
  workspaces: Workspace[]
  onConverted: (newOpportunity: Opportunity) => void
}

export function ConvertSignalToOpportunityDialog({
  open,
  onOpenChange,
  signal,
  workspaces,
  onConverted,
}: ConvertSignalToOpportunityDialogProps) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [category, setCategory] = React.useState<OpportunityCategory>("performance")
  const [workspaceId, setWorkspaceId] = React.useState("")
  const [impact, setImpact] = React.useState(3)
  const [confidence, setConfidence] = React.useState(3)
  const [effort, setEffort] = React.useState(3)

  // Initialize fields when signal changes
  React.useEffect(() => {
    if (signal) {
      setTitle(`Resolve: ${signal.title}`)
      setDescription(`Root Cause Signal: ${signal.description}`)
      setWorkspaceId(signal.workspaceId)
      
      // Infer category from signal category
      if (signal.category === "performance") {
        setCategory("performance")
      } else if (signal.category === "error") {
        setCategory("quality")
      } else if (signal.category === "usage") {
        setCategory("growth")
      } else {
        setCategory("other")
      }

      // Infer defaults based on severity
      if (signal.severity === "high") {
        setImpact(4)
        setConfidence(4)
      } else if (signal.severity === "medium") {
        setImpact(3)
        setConfidence(3)
      } else {
        setImpact(2)
        setConfidence(3)
      }
      setEffort(2)
    }
  }, [signal])

  if (!signal) return null

  // Calculate live score
  const { score, explanation } = calculateOpportunityScore(impact, confidence, effort)

  function handleConvert() {
    if (!signal) return
    if (!title.trim()) {
      toast.error("Opportunity title is required.")
      return
    }
    if (!description.trim()) {
      toast.error("Opportunity description is required.")
      return
    }
    if (!workspaceId) {
      toast.error("Please select a target workspace.")
      return
    }

    const id = "opp_" + crypto.randomUUID().substring(0, 8)
    const newOpportunity: Opportunity = {
      id,
      userId: signal.userId || "user1",
      workspaceId,
      title,
      description,
      status: "open",
      category,
      score,
      scoringBreakdown: {
        impact,
        confidence,
        effort,
        explanation,
      },
      sourceSignalIds: [signal.id],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    onConverted(newOpportunity)
    toast.success(`Signal successfully converted into Opportunity: "${title}"!`)
    onOpenChange(false)
  }

  // Get workspace name
  const currentWorkspace = workspaces.find((w) => w.id === workspaceId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border border-border bg-popover max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Convert Signal to Opportunity
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Structure this telemetry feed into an actionable growth or improvement candidate.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Associated Workspace (Display only or editable) */}
          <div className="flex flex-col gap-1.5">
            <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Target Workspace</Label>
            <div className="bg-muted px-3 py-2 rounded-lg text-sm text-foreground/80 border border-border">
              {currentWorkspace ? `${currentWorkspace.name} (${currentWorkspace.workspaceType})` : "Workspace ID: " + workspaceId}
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title" className="font-bold text-xs uppercase tracking-wider">Opportunity Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background border border-border"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="desc" className="font-bold text-xs uppercase tracking-wider">Description & Context</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background border border-border min-h-[80px]"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category" className="font-bold text-xs uppercase tracking-wider">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as OpportunityCategory)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary text-foreground"
            >
              <option value="growth">Growth / Customer Acquisition</option>
              <option value="performance">Performance Optimization</option>
              <option value="security">Security Patching</option>
              <option value="cost">Cost Reduction</option>
              <option value="quality">Quality & Bug Prevention</option>
              <option value="other">Other Improvement</option>
            </select>
          </div>

          {/* Scoring Sliders */}
          <div className="border-t border-border/80 pt-4 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">Scoring Settings</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <Label htmlFor="impact" className="font-semibold">Impact: {impact}/5</Label>
                <span className="text-[10px] text-muted-foreground">
                  {impact === 5 ? "Massive" : impact === 4 ? "High" : impact === 3 ? "Medium" : impact === 2 ? "Low" : "Minimal"}
                </span>
              </div>
              <input
                id="impact"
                type="range"
                min="1"
                max="5"
                value={impact}
                onChange={(e) => setImpact(Number(e.target.value))}
                className="w-full accent-primary bg-muted rounded-lg appearance-none h-1.5 cursor-pointer"
              />

              <div className="flex justify-between items-center text-xs pt-1">
                <Label htmlFor="confidence" className="font-semibold">Confidence: {confidence}/5</Label>
                <span className="text-[10px] text-muted-foreground">
                  {confidence === 5 ? "Proven/High" : confidence === 4 ? "High" : confidence === 3 ? "Medium" : confidence === 2 ? "Low-Medium" : "Low"}
                </span>
              </div>
              <input
                id="confidence"
                type="range"
                min="1"
                max="5"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full accent-primary bg-muted rounded-lg appearance-none h-1.5 cursor-pointer"
              />

              <div className="flex justify-between items-center text-xs pt-1">
                <Label htmlFor="effort" className="font-semibold">Effort: {effort}/5</Label>
                <span className="text-[10px] text-muted-foreground">
                  {effort === 5 ? "2+ weeks" : effort === 4 ? "2 weeks" : effort === 3 ? "1 week" : effort === 2 ? "3-5 days" : "1-2 days"}
                </span>
              </div>
              <input
                id="effort"
                type="range"
                min="1"
                max="5"
                value={effort}
                onChange={(e) => setEffort(Number(e.target.value))}
                className="w-full accent-primary bg-muted rounded-lg appearance-none h-1.5 cursor-pointer"
              />
            </div>

            {/* Calculated Priority Score Explanation */}
            <div className="bg-primary/5 border border-primary/15 rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Priority Score</span>
                <span className="text-lg font-black text-primary">{score}/100</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{explanation}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border bg-muted/20 px-4 py-3 -mx-6 -mb-6 flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConvert} className="bg-primary text-primary-foreground font-bold">
            Convert & Save Opportunity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
