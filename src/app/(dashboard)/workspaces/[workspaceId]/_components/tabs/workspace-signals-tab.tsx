"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/empty-state"
import { toast } from "sonner"
import {
  Plus,
  Activity,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  Zap,
  MessageSquare,
  User,
  ArrowRight,
  BellRing,
} from "lucide-react"

import { getStoredSignals, saveStoredSignals } from "@/app/(dashboard)/signals/_components/mock-signals"
import { CreateSignalDialog } from "@/app/(dashboard)/signals/_components/create-signal-dialog"
import { SignalDetailDrawer } from "@/app/(dashboard)/signals/_components/signal-detail-drawer"

import type { Signal, SignalStatus, Workspace } from "@/types"

interface WorkspaceSignalsTabProps {
  workspace: Workspace
}

export function WorkspaceSignalsTab({ workspace }: WorkspaceSignalsTabProps) {
  const [signals, setSignals] = useState<Signal[]>([])
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null)
  
  // Dialog/Drawer control
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Load signals on mount
  useEffect(() => {
    setSignals(getStoredSignals())
  }, [])

  // Filter signals specific to this workspace
  const workspaceSignals = signals.filter(s => s.workspaceId === workspace.id)

  const handleCreated = (newSignal: Signal) => {
    const updated = [newSignal, ...signals]
    setSignals(updated)
    saveStoredSignals(updated)
  }

  const handleStatusChange = (signalId: string, newStatus: SignalStatus) => {
    const updated = signals.map((s) => {
      if (s.id === signalId) {
        return { ...s, status: newStatus, updatedAt: Date.now() }
      }
      return s
    })

    setSignals(updated)
    saveStoredSignals(updated)

    if (selectedSignal && selectedSignal.id === signalId) {
      setSelectedSignal({ ...selectedSignal, status: newStatus, updatedAt: Date.now() })
    }

    if (newStatus === "converted") {
      toast.success("Signal converted to opportunity! Tasks generated.")
    } else {
      toast.success(`Signal status updated to ${newStatus}.`)
    }
  }

  // Icons and color mapping helpers
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
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Telemetry & Signal Feed</h3>
          <p className="text-xs text-muted-foreground">Monitor real-time logs, customer responses, and error traces for this workspace.</p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          size="sm"
          className="bg-primary text-primary-foreground font-bold"
        >
          <Plus className="size-4 mr-1.5" /> Log Signal
        </Button>
      </div>

      {workspaceSignals.length > 0 ? (
        <div className="space-y-3">
          {workspaceSignals.map((signal) => (
            <div
              key={signal.id}
              onClick={() => {
                setSelectedSignal(signal)
                setIsDetailOpen(true)
              }}
              className={`group border rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-200 cursor-pointer hover:scale-[1.005] hover:shadow-sm ${getSeverityColorClass(
                signal.severity
              )}`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="mt-1 p-2 rounded-lg bg-background border border-border shadow-xs shrink-0">
                  {getSeverityIcon(signal.severity)}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[280px] md:max-w-[400px]">
                      {signal.title}
                    </h4>
                    <Badge className="bg-muted text-muted-foreground capitalize text-[10px] py-0 px-1.5 font-normal">
                      {signal.category}
                    </Badge>
                    {signal.status === "new" && (
                      <Badge className="bg-primary text-primary-foreground font-semibold text-[10px] py-0 px-1.5">
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
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BellRing}
          title="No signals logged"
          description="There are currently no telemetry signals or user feedback logs mapped to this workspace."
          action={
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-primary text-primary-foreground font-bold"
            >
              <Plus className="size-4 mr-1.5" /> Log First Signal
            </Button>
          }
        />
      )}

      {/* Dialog modals */}
      <CreateSignalDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        workspaces={[workspace]}
        onCreated={handleCreated}
      />

      <SignalDetailDrawer
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        signal={selectedSignal}
        workspace={workspace}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
