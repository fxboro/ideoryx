"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Plus,
  Activity,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  BellRing,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Zap,
  User,
  ArrowRight,
} from "lucide-react"

import { getStoredSignals, saveStoredSignals } from "./_components/mock-signals"
import { getStoredWorkspaces } from "../workspaces/_components/mock-workspaces"
import { SignalFiltersBar } from "./_components/signal-filters-bar"
import { CreateSignalDialog } from "./_components/create-signal-dialog"
import { SignalDetailDrawer } from "./_components/signal-detail-drawer"

import type { Signal, SignalStatus, Workspace } from "@/types"

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null)
  
  // Dialog & Drawer state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Filters State
  const [search, setSearch] = useState("")
  const [workspaceFilter, setWorkspaceFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Load datasets on mount
  useEffect(() => {
    setSignals(getStoredSignals())
    setWorkspaces(getStoredWorkspaces())
  }, [])

  // Ingestion handler
  const handleCreated = (newSignal: Signal) => {
    const updated = [newSignal, ...signals]
    setSignals(updated)
    saveStoredSignals(updated)
  }

  // Triage state handler
  const handleStatusChange = (signalId: string, newStatus: SignalStatus) => {
    const updated = signals.map((s) => {
      if (s.id === signalId) {
        return { ...s, status: newStatus, updatedAt: Date.now() }
      }
      return s
    })

    setSignals(updated)
    saveStoredSignals(updated)

    // Sync selected signal state
    if (selectedSignal && selectedSignal.id === signalId) {
      setSelectedSignal({ ...selectedSignal, status: newStatus, updatedAt: Date.now() })
    }

    if (newStatus === "converted") {
      toast.success("Signal successfully converted! Optimization tasks generated in target workspace.")
    } else {
      toast.success(`Signal marked as ${newStatus}.`)
    }
  }

  // Run AI analyst simulation
  const runAIAnalyst = () => {
    setIsAnalyzing(true)
    toast.info("AI Signal Analyst is auditing raw telemetry feeds...")

    setTimeout(() => {
      // Auto-triage all "new" signals
      let triagedCount = 0
      const updated = signals.map((s) => {
        if (s.status === "new") {
          triagedCount++
          return { ...s, status: "reviewed" as SignalStatus, updatedAt: Date.now() }
        }
        return s
      })

      if (triagedCount > 0) {
        setSignals(updated)
        saveStoredSignals(updated)
        toast.success(`AI Signal Analyst completed: triaged and marked ${triagedCount} new signals as Reviewed.`, {
          icon: <Sparkles className="size-4 text-primary" />,
        })
      } else {
        toast.success("AI Signal Analyst scan complete: all signals are already triaged.", {
          icon: <Sparkles className="size-4 text-primary" />,
        })
      }
      setIsAnalyzing(false)
    }, 1500)
  }

  // Resolve Workspace Name
  function getWorkspaceName(workspaceId: string) {
    const found = workspaces.find((w) => w.id === workspaceId)
    return found ? found.name : "Unknown Workspace"
  }

  // Filter Logic
  const filteredSignals = signals.filter((s) => {
    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchesSearch =
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.source.toLowerCase().includes(q)
      if (!matchesSearch) return false
    }

    // Workspace filter
    if (workspaceFilter !== "all" && s.workspaceId !== workspaceFilter) {
      return false
    }

    // Source filter
    if (sourceFilter !== "all" && s.source.toLowerCase() !== sourceFilter.toLowerCase()) {
      return false
    }

    // Category (Signal Type) filter
    if (categoryFilter !== "all" && s.category !== categoryFilter) {
      return false
    }

    // Severity filter
    if (severityFilter !== "all" && s.severity !== severityFilter) {
      return false
    }

    // Status filter
    if (statusFilter !== "all" && s.status !== statusFilter) {
      return false
    }

    return true
  })

  // Severity color/badge helpers
  function getSeverityIcon(severity: string) {
    switch (severity) {
      case "high":
        return <ShieldAlert className="size-4 text-red-500" />
      case "medium":
        return <AlertCircle className="size-4 text-amber-500" />
      case "low":
      default:
        return <CheckCircle2 className="size-4 text-emerald-500" />
    }
  }

  function getSeverityColorClass(severity: string) {
    switch (severity) {
      case "high":
        return "border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
      case "medium":
        return "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10"
      case "low":
      default:
        return "border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10"
    }
  }

  function getSourceIcon(source: string) {
    switch (source.toLowerCase()) {
      case "sentry":
        return <Zap className="size-3.5 text-violet-500" />
      case "zendesk":
        return <MessageSquare className="size-3.5 text-blue-500" />
      case "posthog":
        return <Activity className="size-3.5 text-orange-500" />
      case "manual":
      default:
        return <User className="size-3.5 text-muted-foreground" />
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background/50">
      <div className="p-4 md:p-6 lg:p-8 flex flex-col w-full mx-auto max-w-[1600px] h-full">
        <PageHeader
          title="Telemetry Signals"
          description="Consolidated stream of manual logs, performance anomalies, server errors, and client feedbacks."
          primaryAction={{
            label: "Log Signal",
            icon: <Plus className="size-4" />,
            onClick: () => setIsCreateOpen(true),
          }}
        />

        {/* Page Actions/AI banner */}
        <div className="mt-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-4 rounded-xl border border-primary/15 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">AI Triage Analyst Available</h4>
              <p className="text-xs text-muted-foreground">Automatically scan, classify severity, and triages incoming logs to match workspaces.</p>
            </div>
          </div>
          <Button
            onClick={runAIAnalyst}
            disabled={isAnalyzing || signals.length === 0}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-lg shadow-primary/10 w-full md:w-auto"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-primary-foreground mr-2" />
                Triaging Feeds...
              </>
            ) : (
              <>
                <Sparkles className="size-4 mr-2" /> Run Signal Analyst
              </>
            )}
          </Button>
        </div>

        <div className="mt-8 flex-1 flex flex-col">
          {signals.length > 0 ? (
            <>
              {/* Filters Bar */}
              <SignalFiltersBar
                search={search}
                setSearch={setSearch}
                workspaceFilter={workspaceFilter}
                setWorkspaceFilter={setWorkspaceFilter}
                sourceFilter={sourceFilter}
                setSourceFilter={setSourceFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                severityFilter={severityFilter}
                setSeverityFilter={setSeverityFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                workspaces={workspaces}
              />

              {/* Signals feed list */}
              {filteredSignals.length > 0 ? (
                <div className="flex-1 w-full space-y-3">
                  {filteredSignals.map((signal) => {
                    const linkedWorkspace = workspaces.find((w) => w.id === signal.workspaceId) || null
                    return (
                      <div
                        key={signal.id}
                        onClick={() => {
                          setSelectedSignal(signal)
                          setIsDetailOpen(true)
                        }}
                        className={`group border rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-200 cursor-pointer hover:scale-[1.005] hover:shadow-md ${getSeverityColorClass(
                          signal.severity
                        )}`}
                      >
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          {/* Severity Icon */}
                          <div className="mt-1 p-2 rounded-lg bg-background border border-border shadow-xs shrink-0">
                            {getSeverityIcon(signal.severity)}
                          </div>

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[320px] md:max-w-[480px]">
                                {signal.title}
                              </h3>
                              <Badge className="bg-muted text-muted-foreground capitalize text-[10px] py-0 px-1.5 font-normal">
                                {signal.category}
                              </Badge>
                              {signal.status === "new" && (
                                <Badge className="bg-primary text-primary-foreground font-semibold text-[10px] py-0 px-1.5 animate-pulse">
                                  New
                                </Badge>
                              )}
                              {signal.status === "reviewed" && (
                                <Badge className="bg-blue-500 text-white font-semibold text-[10px] py-0 px-1.5">
                                  Reviewed
                                </Badge>
                              )}
                              {signal.status === "converted" && (
                                <Badge className="bg-emerald-600 text-white font-semibold text-[10px] py-0 px-1.5">
                                  Converted
                                </Badge>
                              )}
                              {signal.status === "dismissed" && (
                                <Badge variant="outline" className="text-muted-foreground line-through text-[10px] py-0 px-1.5">
                                  Dismissed
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">{signal.description}</p>
                            <div className="flex items-center gap-4 flex-wrap pt-0.5 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                {getSourceIcon(signal.source)}
                                <span className="capitalize">{signal.source}</span>
                              </span>
                              <span>•</span>
                              <span>Workspace: <strong className="text-foreground/80">{getWorkspaceName(signal.workspaceId)}</strong></span>
                              <span>•</span>
                              <span>{new Date(signal.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground group-hover:text-primary hover:bg-primary/5 transition-colors font-bold text-xs"
                          >
                            Details <ArrowRight className="size-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-16 bg-card border rounded-xl">
                  <p className="text-muted-foreground font-medium text-sm">No signals match your active filter criteria.</p>
                  <button
                    onClick={() => {
                      setSearch("")
                      setWorkspaceFilter("all")
                      setSourceFilter("all")
                      setCategoryFilter("all")
                      setSeverityFilter("all")
                      setStatusFilter("all")
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
                  icon={BellRing}
                  title="No telemetry signals"
                  description="Telemetry signals represent telemetry feeds, customer reports, support tickets, and performance spikes."
                  action={
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold text-sm"
                    >
                      <Plus className="w-4 h-4" /> Log first signal
                    </button>
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog Modals */}
      <CreateSignalDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        workspaces={workspaces}
        onCreated={handleCreated}
      />

      <SignalDetailDrawer
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        signal={selectedSignal}
        workspace={selectedSignal ? workspaces.find((w) => w.id === selectedSignal.workspaceId) || null : null}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
