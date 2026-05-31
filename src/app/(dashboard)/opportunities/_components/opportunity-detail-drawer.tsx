"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Calendar,
  Layers,
  Sparkles,
  Link as LinkIcon,
  PlaySquare,
  Scale,
  Settings,
  ShieldCheck,
  CheckCircle,
  Activity,
  AlertTriangle,
} from "lucide-react"
import { calculateOpportunityScore } from "@/lib/utils/opportunity-scoring"
import type { Opportunity, OpportunityStatus, OpportunityCategory, Workspace, Signal } from "@/types"

interface OpportunityDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunity: Opportunity | null
  workspace: Workspace | null
  allSignals: Signal[]
  onOpportunityChange: (updated: Opportunity) => void
  onRequestCreateTask: () => void
  onRequestRecordDecision: () => void
}

export function OpportunityDetailDrawer({
  open,
  onOpenChange,
  opportunity,
  workspace,
  allSignals,
  onOpportunityChange,
  onRequestCreateTask,
  onRequestRecordDecision,
}: OpportunityDetailDrawerProps) {
  const [activeTab, setActiveTab] = React.useState<"details" | "adjuster">("details")

  // Scoring states (local to sync with sliders)
  const [impact, setImpact] = React.useState(3)
  const [confidence, setConfidence] = React.useState(3)
  const [effort, setEffort] = React.useState(3)

  // Sync sliders with opportunity when it loads
  React.useEffect(() => {
    if (opportunity) {
      setImpact(opportunity.scoringBreakdown?.impact ?? 3)
      setConfidence(opportunity.scoringBreakdown?.confidence ?? 3)
      setEffort(opportunity.scoringBreakdown?.effort ?? 3)
    }
  }, [opportunity])

  if (!opportunity) return null

  // Format date helper
  const formattedDate = new Date(opportunity.createdAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })

  // Resolve linked signals
  const linkedSignals = allSignals.filter((sig) => 
    opportunity.sourceSignalIds?.includes(sig.id)
  )

  // Recalculate score live based on sliders
  const { score: liveScore, explanation: liveExplanation } = calculateOpportunityScore(impact, confidence, effort)

  function handleSaveSliders() {
    if (!opportunity) return
    const updated: Opportunity = {
      ...opportunity,
      score: liveScore,
      scoringBreakdown: {
        impact,
        confidence,
        effort,
        explanation: liveExplanation,
      },
      updatedAt: Date.now(),
    }
    onOpportunityChange(updated)
  }

  function handleStatusChange(status: OpportunityStatus) {
    if (!opportunity) return
    const updated: Opportunity = {
      ...opportunity,
      status,
      updatedAt: Date.now(),
    }
    onOpportunityChange(updated)
  }

  // Category badge maps
  function getCategoryBadge(category: OpportunityCategory) {
    switch (category) {
      case "growth":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 capitalize font-medium">Growth</Badge>
      case "performance":
        return <Badge className="bg-violet-500/10 text-violet-500 border border-violet-500/20 capitalize font-medium">Performance</Badge>
      case "security":
        return <Badge className="bg-red-500/10 text-red-500 border border-red-500/20 capitalize font-medium">Security</Badge>
      case "cost":
        return <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 capitalize font-medium">Cost</Badge>
      case "quality":
        return <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 capitalize font-medium">Quality</Badge>
      case "other":
      default:
        return <Badge variant="outline" className="capitalize font-medium">{category}</Badge>
    }
  }

  // Status badge maps
  function getStatusBadge(status: OpportunityStatus) {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase text-[10px] font-bold">Open</Badge>
      case "in_progress":
        return <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase text-[10px] font-bold">In Progress</Badge>
      case "implemented":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase text-[10px] font-bold">Implemented</Badge>
      case "archived":
      default:
        return <Badge variant="outline" className="text-muted-foreground uppercase text-[10px] font-bold">Archived</Badge>
    }
  }

  // Priority Score Color Helper
  function getScoreColorClass(score: number) {
    if (score >= 70) return "text-red-500 bg-red-500/10 border-red-500/20"
    if (score >= 35) return "text-amber-500 bg-amber-500/10 border-amber-500/20"
    return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto border-l border-border bg-popover text-foreground flex flex-col h-full p-0">
        
        {/* Header */}
        <SheetHeader className="p-6 border-b border-border">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {getCategoryBadge(opportunity.category)}
            {getStatusBadge(opportunity.status)}
            <Badge className={`border font-black text-[10px] ${getScoreColorClass(opportunity.score)}`}>
              Priority Score: {opportunity.score}/100
            </Badge>
          </div>
          <SheetTitle className="text-xl font-bold leading-snug tracking-tight text-foreground pr-6">
            {opportunity.title}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
            <Calendar className="size-3.5" /> Logged on {formattedDate}
          </SheetDescription>
        </SheetHeader>

        {/* Tab Selection */}
        <div className="flex border-b border-border/60 bg-muted/10 px-4">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === "details"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Opportunity details
          </button>
          <button
            onClick={() => setActiveTab("adjuster")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === "adjuster"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Dynamic RICE adjuster
          </button>
        </div>

        {/* Content Tab Details */}
        {activeTab === "details" && (
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Associated Workspace */}
            <div className="bg-muted/30 border border-border/60 rounded-lg p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="size-3.5" /> Associated Workspace
              </h4>
              {workspace ? (
                <div>
                  <p className="text-sm font-semibold text-foreground">{workspace.name}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">
                    {workspace.workspaceType} Workspace • Stage: {workspace.stage}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No linked workspace (orphan opportunity)</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description & Recommendation</h4>
              <div className="bg-background border border-border rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed text-foreground min-h-[100px]">
                {opportunity.description}
              </div>
            </div>

            {/* Current Score Rationale */}
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles className="size-3.5" /> Priority scoring rationale
              </h4>
              <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                {opportunity.scoringBreakdown?.explanation}
              </p>
            </div>

            {/* Actions Quick Launch */}
            <div className="border border-border rounded-lg p-4 bg-muted/10 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resolve Opportunity</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={onRequestCreateTask}
                  variant="outline"
                  className="h-10 hover:bg-primary/5 hover:text-primary hover:border-primary/30 text-xs font-bold flex items-center gap-2"
                >
                  <PlaySquare className="size-4" /> Create Task...
                </Button>
                <Button
                  onClick={onRequestRecordDecision}
                  variant="outline"
                  className="h-10 hover:bg-primary/5 hover:text-primary hover:border-primary/30 text-xs font-bold flex items-center gap-2"
                >
                  <Scale className="size-4" /> Record Decision...
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground/80 text-center">
                Action triggers will pre-populate configurations for review.
              </p>
            </div>

            {/* Linked Signals */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <LinkIcon className="size-3.5" /> Source Signals ({linkedSignals.length})
              </h4>
              {linkedSignals.length > 0 ? (
                <div className="space-y-2">
                  {linkedSignals.map((sig) => (
                    <div key={sig.id} className="border border-border/80 rounded-lg p-3 bg-background hover:bg-muted/10 transition-colors">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-foreground line-clamp-1">{sig.title}</span>
                        <Badge variant="outline" className="text-[9px] uppercase font-bold text-muted-foreground">
                          {sig.source}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{sig.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No raw telemetry signals directly linked.</p>
              )}
            </div>

            {/* Lifecycle Status Change */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Update Status</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleStatusChange("open")}
                  variant={opportunity.status === "open" ? "default" : "outline"}
                  size="sm"
                  className="text-xs font-semibold"
                >
                  Open
                </Button>
                <Button
                  onClick={() => handleStatusChange("in_progress")}
                  variant={opportunity.status === "in_progress" ? "default" : "outline"}
                  size="sm"
                  className="text-xs font-semibold"
                >
                  In Progress
                </Button>
                <Button
                  onClick={() => handleStatusChange("implemented")}
                  variant={opportunity.status === "implemented" ? "default" : "outline"}
                  size="sm"
                  className="text-xs font-semibold"
                >
                  Implemented
                </Button>
                <Button
                  onClick={() => handleStatusChange("archived")}
                  variant={opportunity.status === "archived" ? "default" : "outline"}
                  size="sm"
                  className="text-xs font-semibold"
                >
                  Archive
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content Tab Adjuster */}
        {activeTab === "adjuster" && (
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="size-4 text-primary" /> RICE Scoring Model
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Prioritize candidate items by configuring Impact (RICE Impact equivalent), Confidence (proven level), and Effort (cost of build). Priority score is scaled from 1 to 100.
              </p>
            </div>

            <div className="space-y-5">
              {/* Impact */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <Label htmlFor="adj-impact" className="font-bold flex items-center gap-1.5 text-foreground/80">
                    Impact: {impact}/5
                  </Label>
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-semibold">
                    {impact === 5 ? "Massive" : impact === 4 ? "High" : impact === 3 ? "Medium" : impact === 2 ? "Low" : "Minimal"}
                  </span>
                </div>
                <input
                  id="adj-impact"
                  type="range"
                  min="1"
                  max="5"
                  value={impact}
                  onChange={(e) => setImpact(Number(e.target.value))}
                  className="w-full accent-primary bg-muted rounded-lg appearance-none h-2 cursor-pointer"
                />
              </div>

              {/* Confidence */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <Label htmlFor="adj-confidence" className="font-bold flex items-center gap-1.5 text-foreground/80">
                    Confidence: {confidence}/5
                  </Label>
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-semibold">
                    {confidence === 5 ? "Very High/Proven" : confidence === 4 ? "High" : confidence === 3 ? "Medium" : confidence === 2 ? "Low-Medium" : "Low"}
                  </span>
                </div>
                <input
                  id="adj-confidence"
                  type="range"
                  min="1"
                  max="5"
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full accent-primary bg-muted rounded-lg appearance-none h-2 cursor-pointer"
                />
              </div>

              {/* Effort */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <Label htmlFor="adj-effort" className="font-bold flex items-center gap-1.5 text-foreground/80">
                    Effort: {effort}/5
                  </Label>
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-semibold">
                    {effort === 5 ? "Very High (2+ weeks)" : effort === 4 ? "High (2 weeks)" : effort === 3 ? "Medium (1 week)" : effort === 2 ? "Low (3-5 days)" : "Very Low (1-2 days)"}
                  </span>
                </div>
                <input
                  id="adj-effort"
                  type="range"
                  min="1"
                  max="5"
                  value={effort}
                  onChange={(e) => setEffort(Number(e.target.value))}
                  className="w-full accent-primary bg-muted rounded-lg appearance-none h-2 cursor-pointer"
                />
              </div>
            </div>

            {/* Calculated Output Preview */}
            <div className="border border-border rounded-xl p-4 bg-muted/20 space-y-3 mt-6">
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Adjusted Priority Score</span>
                <span className="text-2xl font-black text-foreground">{liveScore}/100</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                  <Sparkles className="size-3.5" /> Explainable scoring preview
                </span>
                <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                  {liveExplanation}
                </p>
              </div>
            </div>

            {/* Actions for Tab Adjuster */}
            <div className="flex justify-end pt-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setImpact(opportunity.scoringBreakdown?.impact ?? 3)
                  setConfidence(opportunity.scoringBreakdown?.confidence ?? 3)
                  setEffort(opportunity.scoringBreakdown?.effort ?? 3)
                }}
                className="text-xs font-bold"
              >
                Reset
              </Button>
              <Button
                onClick={handleSaveSliders}
                size="sm"
                className="bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5"
              >
                <ShieldCheck className="size-4" /> Save Score configuration
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <SheetFooter className="p-6 border-t border-border bg-muted/20 flex flex-row justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close Drawer
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
