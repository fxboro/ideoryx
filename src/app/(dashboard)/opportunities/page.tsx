"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import {
  Lightbulb,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  ClipboardList,
  Scale,
  Settings,
  BellRing,
  HelpCircle,
} from "lucide-react"

import { getStoredOpportunities, saveStoredOpportunities } from "./_components/mock-opportunities"
import { getStoredWorkspaces } from "../workspaces/_components/mock-workspaces"
import { getStoredSignals, saveStoredSignals } from "../signals/_components/mock-signals"
import { OpportunityFiltersBar } from "./_components/opportunity-filters-bar"
import { OpportunityDetailDrawer } from "./_components/opportunity-detail-drawer"
import { ConvertSignalToOpportunityDialog } from "./_components/convert-dialog"
import { CreateTaskConfirmDialog, SaveDecisionConfirmDialog } from "./_components/action-dialogs"

import type { Opportunity, Workspace, Signal, Task, Decision, OpportunityStatus, OpportunityCategory } from "@/types"

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [signals, setSignals] = useState<Signal[]>([])
  
  // Selected opportunity for detail drawer
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Triage signal for convert modal
  const [triageSignal, setTriageSignal] = useState<Signal | null>(null)
  const [isConvertOpen, setIsConvertOpen] = useState(false)

  // Action confirmations
  const [isTaskConfirmOpen, setIsTaskConfirmOpen] = useState(false)
  const [isDecisionConfirmOpen, setIsDecisionConfirmOpen] = useState(false)

  // Filters State
  const [search, setSearch] = useState("")
  const [workspaceFilter, setWorkspaceFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("score-desc")

  // AI Analyst simulation states
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAnalystBanner, setShowAnalystBanner] = useState(false)
  const [suggestedSignals, setSuggestedSignals] = useState<Signal[]>([])

  // Load datasets on mount
  useEffect(() => {
    setOpportunities(getStoredOpportunities())
    setWorkspaces(getStoredWorkspaces())
    setSignals(getStoredSignals())
  }, [])

  // Resolve Workspace Name
  function getWorkspaceName(workspaceId: string) {
    const found = workspaces.find((w) => w.id === workspaceId)
    return found ? found.name : "Unknown Workspace"
  }

  // Live Opportunities filtering & sorting
  const filteredOpportunities = opportunities.filter((op) => {
    if (search.trim()) {
      const q = search.toLowerCase()
      const matches =
        op.title.toLowerCase().includes(q) ||
        op.description.toLowerCase().includes(q)
      if (!matches) return false
    }
    if (workspaceFilter !== "all" && op.workspaceId !== workspaceFilter) return false
    if (categoryFilter !== "all" && op.category !== categoryFilter) return false
    if (statusFilter !== "all" && op.status !== statusFilter) return false
    return true
  })

  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    if (sortBy === "score-desc") return b.score - a.score
    if (sortBy === "score-asc") return a.score - b.score
    if (sortBy === "date-desc") return b.createdAt - a.createdAt
    if (sortBy === "date-asc") return a.createdAt - b.createdAt
    return 0
  })

  // Opportunity change handler (sliders / status)
  const handleOpportunityChange = (updatedOp: Opportunity) => {
    const updated = opportunities.map((op) => (op.id === updatedOp.id ? updatedOp : op))
    setOpportunities(updated)
    saveStoredOpportunities(updated)
    
    // Sync selected
    if (selectedOpportunity && selectedOpportunity.id === updatedOp.id) {
      setSelectedOpportunity(updatedOp)
    }

    toast.success(`Opportunity "${updatedOp.title}" updated successfully!`)
  }

  // Handle conversion of signal to opportunity
  const handleSignalConverted = (newOpportunity: Opportunity) => {
    // Add opportunity
    const updatedOps = [newOpportunity, ...opportunities]
    setOpportunities(updatedOps)
    saveStoredOpportunities(updatedOps)

    // Mark signal as converted
    const signalId = newOpportunity.sourceSignalIds[0]
    const updatedSignals = signals.map((s) => {
      if (s.id === signalId) {
        return { ...s, status: "converted" as const, updatedAt: Date.now() }
      }
      return s
    })
    setSignals(updatedSignals)
    saveStoredSignals(updatedSignals)

    // Remove from suggested list if it was there
    setSuggestedSignals((prev) => prev.filter((s) => s.id !== signalId))
  }

  // Actions confirmations callback
  const handleTaskCreated = (newTask: Task) => {
    // Save to task localStorage list for full persistence demo
    try {
      const existingTasksData = localStorage.getItem("mission_control_tasks")
      const existingTasks = existingTasksData ? JSON.parse(existingTasksData) : []
      localStorage.setItem("mission_control_tasks", JSON.stringify([newTask, ...existingTasks]))
    } catch (e) {
      console.error(e)
    }

    // Link task id to opportunity
    if (selectedOpportunity) {
      const linkedTaskIds = selectedOpportunity.linkedTaskIds || []
      const updatedOp = {
        ...selectedOpportunity,
        linkedTaskIds: [...linkedTaskIds, newTask.id],
        status: "in_progress" as const, // auto advance to in_progress
        updatedAt: Date.now(),
      }
      handleOpportunityChange(updatedOp)
    }
  }

  const handleDecisionSaved = (newDecision: Decision) => {
    // Save to decision localStorage list
    try {
      const existingDecisionsData = localStorage.getItem("mission_control_decisions")
      const existingDecisions = existingDecisionsData ? JSON.parse(existingDecisionsData) : []
      localStorage.setItem("mission_control_decisions", JSON.stringify([newDecision, ...existingDecisions]))
    } catch (e) {
      console.error(e)
    }

    // Link decision id to opportunity
    if (selectedOpportunity) {
      const linkedDecisionIds = selectedOpportunity.linkedDecisionIds || []
      const updatedOp = {
        ...selectedOpportunity,
        linkedDecisionIds: [...linkedDecisionIds, newDecision.id],
        updatedAt: Date.now(),
      }
      handleOpportunityChange(updatedOp)
    }
  }

  // Simulation: Run AI Opportunity Analyst
  const runAIAnalyst = () => {
    setIsAnalyzing(true)
    toast.info("AI Opportunity Analyst scanning telemetry logs & error trace indexes...")

    setTimeout(() => {
      // Find signals not yet converted or dismissed
      const unconverted = signals.filter((s) => s.status === "new" || s.status === "reviewed")
      setSuggestedSignals(unconverted)
      setShowAnalystBanner(true)
      setIsAnalyzing(false)
      
      if (unconverted.length > 0) {
        toast.success(`Scan completed. Found ${unconverted.length} telemetry candidates matching workspaces!`, {
          icon: <Sparkles className="size-4 text-primary" />,
        })
      } else {
        toast.success("Scan completed. No unresolved telemetry candidates found at this time.", {
          icon: <Sparkles className="size-4 text-primary" />,
        })
      }
    }, 1200)
  }

  // Statistic totals
  const totalCount = opportunities.length
  const openCount = opportunities.filter((o) => o.status === "open").length
  const progressCount = opportunities.filter((o) => o.status === "in_progress").length
  const implementedCount = opportunities.filter((o) => o.status === "implemented").length

  // Priority badge styling
  function getScoreBadge(score: number) {
    if (score >= 70) {
      return <Badge className="bg-red-500/10 text-red-500 border border-red-500/20 font-black">High Priority ({score})</Badge>
    } else if (score >= 35) {
      return <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">Medium Priority ({score})</Badge>
    } else {
      return <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium">Low Priority ({score})</Badge>
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background/50">
      <div className="p-4 md:p-6 lg:p-8 flex flex-col w-full mx-auto max-w-[1600px] h-full">
        <PageHeader
          title="Growth & Optimization"
          description="Identify, prioritize, and structure candidate improvements based on real telemetry data."
        />

        {/* Statistic Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Card className="border border-border/80 bg-card shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total candidates</p>
                <h3 className="text-2xl font-black text-foreground mt-1">{totalCount}</h3>
              </div>
              <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
                <Lightbulb className="size-5" />
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/80 bg-card shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Open priorities</p>
                <h3 className="text-2xl font-black text-foreground mt-1">{openCount}</h3>
              </div>
              <div className="bg-blue-500/10 p-2.5 rounded-lg text-blue-500">
                <TrendingUp className="size-5" />
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/80 bg-card shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">In progress</p>
                <h3 className="text-2xl font-black text-foreground mt-1">{progressCount}</h3>
              </div>
              <div className="bg-amber-500/10 p-2.5 rounded-lg text-amber-500">
                <ClipboardList className="size-5" />
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/80 bg-card shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Implemented</p>
                <h3 className="text-2xl font-black text-foreground mt-1">{implementedCount}</h3>
              </div>
              <div className="bg-emerald-500/10 p-2.5 rounded-lg text-emerald-500">
                <Scale className="size-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Opportunity Analyst Simulation Trigger */}
        <div className="mt-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-4 rounded-xl border border-primary/15 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">AI Opportunity Analyst</h4>
              <p className="text-xs text-muted-foreground">Audit active error traces, performance logs, and feedback to find optimization candidate leads.</p>
            </div>
          </div>
          <Button
            onClick={runAIAnalyst}
            disabled={isAnalyzing}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-lg shadow-primary/10 w-full md:w-auto shrink-0"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-primary-foreground mr-2" />
                Auditing logs...
              </>
            ) : (
              <>
                <Sparkles className="size-4 mr-2" /> Audit Telemetry Logs
              </>
            )}
          </Button>
        </div>

        {/* Suggested Candidates Panel (if Analyst has run) */}
        {showAnalystBanner && (
          <div className="mt-6 border border-amber-500/20 bg-amber-500/5 rounded-xl p-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-amber-500/15 pb-2.5 mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                <Activity className="size-4" /> Suggested candidates from telemetry ({suggestedSignals.length})
              </h4>
              <button
                onClick={() => setShowAnalystBanner(false)}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold"
              >
                Hide
              </button>
            </div>
            {suggestedSignals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestedSignals.map((sig) => (
                  <div
                    key={sig.id}
                    className="border border-border/80 rounded-lg p-3 bg-card hover:border-amber-500/30 transition-all flex flex-col justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-foreground line-clamp-1">{sig.title}</span>
                        <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] uppercase font-bold shrink-0">
                          {sig.category}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{sig.description}</p>
                    </div>
                    <Button
                      onClick={() => {
                        setTriageSignal(sig)
                        setIsConvertOpen(true)
                      }}
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-8 flex items-center justify-center gap-1 w-full"
                    >
                      <Plus className="size-3.5" /> Convert to Opportunity
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">All telemetry candidates have been triaged and converted.</p>
            )}
          </div>
        )}

        <div className="mt-8 flex-1 flex flex-col">
          {opportunities.length > 0 ? (
            <>
              {/* Filter Bar */}
              <OpportunityFiltersBar
                search={search}
                setSearch={setSearch}
                workspaceFilter={workspaceFilter}
                setWorkspaceFilter={setWorkspaceFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                workspaces={workspaces}
              />

              {/* Opportunities grid */}
              {sortedOpportunities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedOpportunities.map((op) => (
                    <div
                      key={op.id}
                      onClick={() => {
                        setSelectedOpportunity(op)
                        setIsDetailOpen(true)
                      }}
                      className="group border border-border/80 bg-card rounded-xl p-5 hover:border-primary/30 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.005] flex flex-col justify-between gap-4 relative overflow-hidden"
                    >
                      {/* Priority Gradient Ribbon */}
                      <div className={`absolute top-0 left-0 right-0 h-1 ${
                        op.score >= 70 ? "bg-red-500" : op.score >= 35 ? "bg-amber-500" : "bg-emerald-500"
                      }`} />

                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2 flex-wrap">
                          <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                            <Layers className="size-3.5 text-muted-foreground/60" /> {getWorkspaceName(op.workspaceId)}
                          </span>
                          {getScoreBadge(op.score)}
                        </div>
                        
                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {op.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {op.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/50 pt-3 text-[11px] text-muted-foreground mt-1">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-muted text-muted-foreground capitalize text-[9px] py-0.5 px-1.5 font-normal border border-border/50">
                            {op.category}
                          </Badge>
                          <span>{new Date(op.createdAt).toLocaleDateString()}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-muted-foreground group-hover:text-primary font-bold text-xs p-0 flex items-center gap-1"
                        >
                          View Adjuster <ArrowRight className="size-3.5 ml-0.5 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-16 bg-card border rounded-xl">
                  <p className="text-muted-foreground font-medium text-sm">No opportunities match your filter criteria.</p>
                  <button
                    onClick={() => {
                      setSearch("")
                      setWorkspaceFilter("all")
                      setCategoryFilter("all")
                      setStatusFilter("all")
                      setSortBy("score-desc")
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
                  icon={Lightbulb}
                  title="No growth or optimization opportunities"
                  description="Prioritize candidate improvements by converting signals, linking sources, and adjusting impact scores."
                  action={
                    <button
                      onClick={runAIAnalyst}
                      className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold text-sm"
                    >
                      <Sparkles className="w-4 h-4" /> Run AI Analyst Scan
                    </button>
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Convert Signal to Opportunity Dialog */}
      <ConvertSignalToOpportunityDialog
        open={isConvertOpen}
        onOpenChange={setIsConvertOpen}
        signal={triageSignal}
        workspaces={workspaces}
        onConverted={handleSignalConverted}
      />

      {/* Opportunity Detail Drawer */}
      <OpportunityDetailDrawer
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        opportunity={selectedOpportunity}
        workspace={selectedOpportunity ? workspaces.find((w) => w.id === selectedOpportunity.workspaceId) || null : null}
        allSignals={signals}
        onOpportunityChange={handleOpportunityChange}
        onRequestCreateTask={() => setIsTaskConfirmOpen(true)}
        onRequestRecordDecision={() => setIsDecisionConfirmOpen(true)}
      />

      {/* Create Task Confirmation Modal */}
      <CreateTaskConfirmDialog
        open={isTaskConfirmOpen}
        onOpenChange={setIsTaskConfirmOpen}
        opportunity={selectedOpportunity}
        onTaskCreated={handleTaskCreated}
      />

      {/* Save Decision Confirmation Modal */}
      <SaveDecisionConfirmDialog
        open={isDecisionConfirmOpen}
        onOpenChange={setIsDecisionConfirmOpen}
        opportunity={selectedOpportunity}
        onDecisionSaved={handleDecisionSaved}
      />
    </div>
  )
}
