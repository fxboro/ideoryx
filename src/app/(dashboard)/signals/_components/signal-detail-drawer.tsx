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
import { Calendar, Layers, Activity, AlertCircle, ShieldAlert, CheckCircle2, XCircle, Lightbulb } from "lucide-react"
import type { Signal, SignalStatus, Workspace } from "@/types"

interface SignalDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  signal: Signal | null
  workspace: Workspace | null
  onStatusChange: (signalId: string, status: SignalStatus) => void
  onConvertClick?: (signal: Signal) => void
}

export function SignalDetailDrawer({
  open,
  onOpenChange,
  signal,
  workspace,
  onStatusChange,
  onConvertClick,
}: SignalDetailDrawerProps) {
  if (!signal) return null

  // Format date helper
  const formattedDate = new Date(signal.createdAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })

  // Severity color maps
  function getSeverityBadge(severity: string) {
    switch (severity) {
      case "high":
        return (
          <Badge className="bg-red-500/10 text-red-500 border border-red-500/30 flex items-center gap-1 font-semibold">
            <ShieldAlert className="size-3.5" /> High
          </Badge>
        )
      case "medium":
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center gap-1 font-semibold">
            <AlertCircle className="size-3.5" /> Medium
          </Badge>
        )
      case "low":
      default:
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="size-3.5" /> Low
          </Badge>
        )
    }
  }

  // Category badge maps
  function getCategoryBadge(category: string) {
    switch (category) {
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "performance":
        return <Badge className="bg-violet-500/10 text-violet-500 border border-violet-500/30">Performance</Badge>
      case "feedback":
        return <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/30">Feedback</Badge>
      case "usage":
        return <Badge className="bg-cyan-500/10 text-cyan-500 border border-cyan-500/30">Usage</Badge>
      default:
        return <Badge variant="outline">{category}</Badge>
    }
  }

  // Status color maps
  function getStatusBadge(status: SignalStatus) {
    switch (status) {
      case "new":
        return <Badge className="bg-primary text-primary-foreground font-bold">New</Badge>
      case "reviewed":
        return <Badge className="bg-blue-500 text-white font-bold">Reviewed</Badge>
      case "converted":
        return <Badge className="bg-emerald-600 text-white font-bold">Converted</Badge>
      case "dismissed":
        return <Badge variant="outline" className="text-muted-foreground line-through">Dismissed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto border-l border-border bg-popover text-foreground flex flex-col h-full p-0">
        <SheetHeader className="p-6 border-b border-border">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {getCategoryBadge(signal.category)}
            {getSeverityBadge(signal.severity)}
            {getStatusBadge(signal.status)}
          </div>
          <SheetTitle className="text-xl font-bold leading-snug tracking-tight text-foreground pr-6">
            {signal.title}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
            <Calendar className="size-3.5" /> Logged on {formattedDate}
          </SheetDescription>
        </SheetHeader>

        {/* Content body */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Linked Workspace */}
          <div className="bg-muted/30 border border-border/60 rounded-lg p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="size-3.5" /> Associated Workspace
            </h4>
            {workspace ? (
              <div>
                <p className="text-sm font-semibold text-foreground">{workspace.name}</p>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">{workspace.workspaceType} Workspace • Stage: {workspace.stage}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No linked workspace (orphan signal)</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description & Details</h4>
            <div className="bg-background border border-border rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed text-foreground min-h-[120px]">
              {signal.description}
            </div>
          </div>

          {/* Ingestion Source */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/10 border border-border/55 rounded-lg p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Ingestion Source</span>
              <span className="text-sm font-medium capitalize mt-1 block">{signal.source}</span>
            </div>
            <div className="bg-muted/10 border border-border/55 rounded-lg p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Signal ID</span>
              <span className="text-sm font-mono text-muted-foreground mt-1 block">{signal.id}</span>
            </div>
          </div>

          {/* Source Metadata */}
          {signal.sourceMetadata && Object.keys(signal.sourceMetadata).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Source Metadata</h4>
              <div className="bg-muted/20 border border-border rounded-lg p-4 font-mono text-xs overflow-x-auto space-y-1.5">
                {Object.entries(signal.sourceMetadata).map(([key, val]) => (
                  <div key={key} className="flex justify-between border-b border-border/40 pb-1 last:border-0 last:pb-0">
                    <span className="text-muted-foreground font-semibold">{key}:</span>
                    <span className="text-foreground">{JSON.stringify(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <SheetFooter className="p-6 border-t border-border bg-muted/20 grid grid-cols-1 gap-2 sm:flex sm:flex-row sm:justify-end">
          {signal.status !== "dismissed" && (
            <Button
              variant="outline"
              onClick={() => onStatusChange(signal.id, "dismissed")}
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20"
            >
              <XCircle className="size-4 mr-2" /> Dismiss
            </Button>
          )}

          {signal.status === "new" && (
            <Button
              variant="outline"
              onClick={() => onStatusChange(signal.id, "reviewed")}
              className="border-blue-500/20 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
            >
              <CheckCircle2 className="size-4 mr-2" /> Mark Reviewed
            </Button>
          )}

          {(signal.status === "new" || signal.status === "reviewed") && (
            <Button
              onClick={() => {
                if (onConvertClick) {
                  onConvertClick(signal)
                } else {
                  onStatusChange(signal.id, "converted")
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <Lightbulb className="size-4 mr-2" /> Convert to Opportunity
            </Button>
          )}

          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
