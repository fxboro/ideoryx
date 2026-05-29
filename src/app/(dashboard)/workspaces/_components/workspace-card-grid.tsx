"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Folder, Percent } from "lucide-react"
import type { Workspace } from "@/types"

interface WorkspaceCardGridProps {
  workspaces: Workspace[]
}

export function WorkspaceCardGrid({ workspaces }: WorkspaceCardGridProps) {
  const router = useRouter()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workspaces.map((w) => {
        // Color based on readiness score
        const progressColor = w.readinessScore >= 80 
          ? "bg-emerald-500" 
          : w.readinessScore >= 50 
            ? "bg-amber-500" 
            : "bg-primary";

        return (
          <Card 
            key={w.id} 
            onClick={() => router.push(`/workspaces/${w.id}`)}
            className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all duration-300 h-full flex flex-col group bg-card border-border/80"
          >
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-muted/40 border border-border rounded-lg group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                  <Folder className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                </div>
                <StatusBadge status={w.status} />
              </div>
              <CardTitle className="text-xl font-bold truncate group-hover:text-primary transition-colors leading-tight">{w.name}</CardTitle>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {w.workspaceType}
                </span>
                <span className="text-xs text-muted-foreground font-medium">• Stage: <strong className="capitalize">{w.stage}</strong></span>
              </div>
            </CardHeader>
            <CardContent className="p-5 flex-1 flex flex-col gap-4">
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{w.summary}</p>
              
              {/* Readiness Score Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">Readiness Score</span>
                  <span className="font-bold text-foreground flex items-center gap-0.5">{w.readinessScore}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border/50">
                  <div 
                    className={`h-full ${progressColor} transition-all duration-500`}
                    style={{ width: `${w.readinessScore}%` }}
                  />
                </div>
              </div>

              <div className="mt-auto space-y-2 pt-2 border-t border-border/40">
                {w.currentFocus && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Current Focus</p>
                    <p className="text-sm font-semibold truncate text-foreground">{w.currentFocus}</p>
                  </div>
                )}
                {w.nextMilestone && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Next Milestone</p>
                    <p className="text-sm font-semibold truncate text-foreground/90">{w.nextMilestone}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-4 border-t border-border/50 bg-muted/10 flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">
                Risk:{" "}
                <strong 
                  className={`uppercase tracking-wider font-bold ${
                    w.risk === 'high' 
                      ? 'text-destructive' 
                      : w.risk === 'medium' 
                        ? 'text-amber-500' 
                        : 'text-emerald-500'
                  }`}
                >
                  {w.risk}
                </strong>
              </span>
              <span className="font-bold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                View Workspace &rarr;
              </span>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  )
}
