"use client"

import * as React from "react"
import type { Workspace } from "@/types"
import { Card, CardContent } from "@/components/ui/card"

interface WorkspaceSummaryCardsProps {
  workspace: Workspace
}

export function WorkspaceSummaryCards({ workspace }: WorkspaceSummaryCardsProps) {
  const progressColor = workspace.readinessScore >= 80 
    ? "text-emerald-500" 
    : workspace.readinessScore >= 50 
      ? "text-amber-500" 
      : "text-primary";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {/* Current Stage */}
      <Card className="shadow-sm border-border/60 bg-muted/10">
        <CardContent className="p-4 flex flex-col justify-center gap-1">
           <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Stage</span>
           <span className="font-extrabold capitalize text-foreground">{workspace.stage}</span>
        </CardContent>
      </Card>

      {/* Readiness Score */}
      <Card className="shadow-sm border-border/60 bg-muted/10">
        <CardContent className="p-4 flex flex-col justify-center gap-1">
           <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Stage Readiness</span>
           <span className={`font-extrabold text-lg flex items-center ${progressColor}`}>
             {workspace.readinessScore}%
           </span>
        </CardContent>
      </Card>

      {/* Current Focus */}
      <Card className="shadow-sm border-border/60 bg-muted/10">
        <CardContent className="p-4 flex flex-col justify-center gap-1">
           <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Focus</span>
           <span className="font-extrabold truncate text-foreground/90" title={workspace.currentFocus}>{workspace.currentFocus || "-"}</span>
        </CardContent>
      </Card>

      {/* Next Milestone */}
      <Card className="shadow-sm border-border/60 bg-muted/10">
        <CardContent className="p-4 flex flex-col justify-center gap-1">
           <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Next Milestone</span>
           <span className="font-extrabold truncate text-foreground/95" title={workspace.nextMilestone}>{workspace.nextMilestone || "-"}</span>
        </CardContent>
      </Card>

      {/* Risk Level */}
      <Card className="shadow-sm border-border/60 bg-muted/10 col-span-2 md:col-span-1">
        <CardContent className="p-4 flex flex-col justify-center gap-1">
           <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Risk Level</span>
           <span className={`font-extrabold uppercase text-sm ${
             workspace.risk === 'high' 
               ? 'text-destructive' 
               : workspace.risk === 'medium' 
                 ? 'text-amber-500' 
                 : 'text-emerald-500'
           }`}>
             {workspace.risk}
           </span>
        </CardContent>
      </Card>
    </div>
  )
}
