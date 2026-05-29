"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { CheckCircle2, ChevronRight, PlayCircle, Lock, Trophy, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import type { Workspace, WorkspaceChecklistItem } from "@/types"
import { getRecommendedWorkflow, getWorkflowRecommendationReason } from "@/lib/utils/lifecycle"

interface WorkspaceChecklistPanelProps {
  workspace: Workspace
  onWorkspaceUpdated: (updated: Workspace) => void
}

const PRODUCT_STAGES = ["validation", "spec", "build", "launch", "growth"];
const CLIENT_STAGES = ["discovery", "proposal", "delivery", "launch", "support"];

export function WorkspaceChecklistPanel({
  workspace,
  onWorkspaceUpdated,
}: WorkspaceChecklistPanelProps) {
  const currentStage = workspace.stage
  const isProduct = workspace.workspaceType === "product"
  const stageList = isProduct ? PRODUCT_STAGES : CLIENT_STAGES
  const currentStageIndex = stageList.indexOf(currentStage)

  const activeItems = workspace.checklists[currentStage] || []
  const completedCount = activeItems.filter(item => item.completed).length
  const totalCount = activeItems.length
  const allCompleted = totalCount > 0 && completedCount === totalCount

  // Determine if next stage exists
  const hasNextStage = currentStageIndex < stageList.length - 1
  const nextStage = hasNextStage ? stageList[currentStageIndex + 1] : null

  // Recommended Workflow
  const recommendedWorkflow = getRecommendedWorkflow(workspace.workspaceType, currentStage)
  const recommendationReason = recommendedWorkflow ? getWorkflowRecommendationReason(recommendedWorkflow) : ""

  // State for Confirmation Dialog
  const [showConfirm, setShowConfirm] = React.useState(false)

  function handleToggleItem(itemId: string, checked: boolean) {
    const updatedChecklists = { ...workspace.checklists }
    const updatedItems = (updatedChecklists[currentStage] || []).map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          completed: checked,
          completedAt: checked ? Date.now() : undefined
        }
      }
      return item
    })
    
    updatedChecklists[currentStage] = updatedItems

    // Recalculate readiness
    const newReadiness = totalCount > 0 
      ? Math.round((updatedItems.filter(i => i.completed).length / totalCount) * 100) 
      : 0;

    const updatedWorkspace: Workspace = {
      ...workspace,
      checklists: updatedChecklists,
      readinessScore: newReadiness,
      updatedAt: Date.now()
    }

    onWorkspaceUpdated(updatedWorkspace)
    toast.info(checked ? "Task marked completed" : "Task marked incomplete")
  }

  function handleAdvanceStage() {
    if (!nextStage) return

    // Initialize next stage items if they don't have checked ones
    const nextStageItems = workspace.checklists[nextStage] || []
    const nextCompleted = nextStageItems.filter(i => i.completed).length
    const nextTotal = nextStageItems.length
    const nextReadiness = nextTotal > 0 
      ? Math.round((nextCompleted / nextTotal) * 100)
      : 0;

    const updatedWorkspace: Workspace = {
      ...workspace,
      stage: nextStage as any,
      readinessScore: nextReadiness,
      updatedAt: Date.now()
    }

    onWorkspaceUpdated(updatedWorkspace)
    setShowConfirm(false)
    toast.success(`Advanced to next lifecycle stage: "${nextStage.toUpperCase()}"!`)
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checklist items list */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="border-border/60 shadow-sm bg-card">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-primary" /> Active Stage Checklist
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  Complete all requirements to advance to the next lifecycle phase.
                </p>
              </div>
              <div className="text-xs font-bold text-muted-foreground bg-muted/40 border px-3 py-1 rounded-full">
                {completedCount} / {totalCount} Completed
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {activeItems.length > 0 ? (
                <div className="divide-y divide-border/65">
                  {activeItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-start gap-4 p-5 hover:bg-muted/5 transition-all duration-200"
                    >
                      <input
                        id={item.id}
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) => handleToggleItem(item.id, e.target.checked)}
                        className="mt-1 size-4 rounded border-border accent-primary cursor-pointer shrink-0"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={item.id}
                          className={`text-sm font-semibold select-none cursor-pointer leading-relaxed ${
                            item.completed 
                              ? "line-through text-muted-foreground/75" 
                              : "text-foreground"
                          }`}
                        >
                          {item.label}
                        </label>
                        {item.completedAt && (
                          <p className="text-[10px] text-muted-foreground/60 mt-1 font-medium">
                            Completed on {new Date(item.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground font-medium text-sm">
                  No items configured for this lifecycle stage.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Progress, Action & Recommendation Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Readiness card */}
          <Card className="border-border/60 shadow-sm bg-card relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Lifecycle Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-extrabold tracking-tight text-foreground">
                  {workspace.readinessScore}%
                </span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Readiness Score
                </span>
              </div>

              <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border/40">
                <div 
                  className="h-full bg-primary transition-all duration-500 rounded-full"
                  style={{ width: `${workspace.readinessScore}%` }}
                />
              </div>

              {allCompleted ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg p-3 flex gap-2 text-xs font-bold mt-2">
                  <Trophy className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>All checklist items for this stage are completed! You are ready to advance.</span>
                </div>
              ) : (
                <p className="text-xs font-medium text-muted-foreground leading-normal">
                  Finish all tasks to bring the workspace to 100% readiness for launch and review.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Action card */}
          <Card className={`border-border/60 shadow-sm bg-card relative overflow-hidden ${allCompleted ? "border-primary/30 ring-1 ring-primary/10" : ""}`}>
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Next Stage Progression
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-4">
              {hasNextStage ? (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-semibold">Active Stage</span>
                    <span className="font-bold capitalize bg-muted px-2 py-0.5 border rounded">{currentStage}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-semibold">Target Stage</span>
                    <span className="font-bold capitalize bg-primary/10 text-primary px-2 py-0.5 rounded">{nextStage}</span>
                  </div>

                  <Button 
                    onClick={() => setShowConfirm(true)}
                    className="w-full mt-2 font-bold gap-2 text-sm bg-primary text-primary-foreground shadow"
                  >
                    <ChevronRight className="w-4 h-4" /> Advance to Next Stage
                  </Button>
                </>
              ) : (
                <div className="text-center py-4 flex flex-col items-center gap-2">
                  <Lock className="w-6 h-6 text-muted-foreground/60" />
                  <span className="text-sm font-bold text-foreground">Final Stage Reached</span>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5 leading-relaxed">
                    This workspace has progressed to the final support/growth phase.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommended Workflow card */}
          {recommendedWorkflow && (
            <Card className="border-border/60 shadow-sm bg-card relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <PlayCircle className="w-3.5 h-3.5 text-amber-500" /> Recommended Action
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-3">
                <div>
                  <p className="text-xs font-bold capitalize text-foreground">{recommendedWorkflow.replace("_", " ")}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-medium">
                    {recommendationReason}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-xs font-bold border-amber-500/30 text-amber-600 hover:text-amber-700 hover:bg-amber-500/5 mt-1 transition-all"
                  onClick={() => toast.success(`Triggered recommended agent workflow: "${recommendedWorkflow.toUpperCase()}"`)}
                >
                  Launch Stage Agent &rarr;
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Stage Change Confirmation Dialog */}
      {nextStage && (
        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent className="sm:max-w-[420px] border border-border bg-popover">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Advance Lifecycle Stage
              </DialogTitle>
              <DialogDescription className="text-muted-foreground leading-normal mt-1">
                You are about to advance this workspace from the current <strong className="capitalize text-foreground font-semibold">{currentStage}</strong> stage to the <strong className="capitalize text-foreground font-semibold">{nextStage}</strong> stage.
              </DialogDescription>
            </DialogHeader>

            {!allCompleted && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 flex gap-2 text-xs font-bold mt-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-destructive" />
                <span>
                  Warning: You have only completed {completedCount} of {totalCount} requirements for the active stage. Advancing now will bypass remaining checklist items.
                </span>
              </div>
            )}

            <DialogFooter className="border-t border-border bg-muted/20 px-4 py-3 -mx-6 -mb-6 flex flex-row justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAdvanceStage}
                className="bg-primary text-primary-foreground font-bold"
              >
                Confirm & Advance
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
