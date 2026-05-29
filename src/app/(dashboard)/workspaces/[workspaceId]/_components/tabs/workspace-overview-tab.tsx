"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Workspace, Task, Goal, Decision, AgentRun } from "@/types"
import { PriorityBadge } from "@/components/priority-badge"
import { CheckCircle2, AlertCircle, Sparkles, Scale } from "lucide-react"

interface WorkspaceOverviewTabProps {
  workspace: Workspace
  tasks: Task[]
  goals: Goal[]
  decisions: Decision[]
  agentRuns: AgentRun[]
}

export function WorkspaceOverviewTab({ workspace, tasks, goals, decisions, agentRuns }: WorkspaceOverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Execution */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Workspace Health & Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Card className="shadow-sm border-border/50 bg-card">
             <CardHeader className="pb-3 border-b border-border/40">
               <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4 text-primary" /> Linked Goals
               </CardTitle>
             </CardHeader>
             <CardContent className="p-4 flex flex-col gap-4">
                {goals.length > 0 ? (
                  goals.map(goal => (
                    <div key={goal.id}>
                       <div className="flex justify-between items-end mb-2">
                          <span className="text-sm font-bold text-foreground">{goal.title}</span>
                          <span className="text-xs font-bold text-muted-foreground">{goal.progress}%</span>
                       </div>
                       <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border/40">
                          <div className="h-full bg-primary" style={{ width: `${goal.progress}%` }} />
                       </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm font-semibold text-muted-foreground py-2">No linked goals configuration.</p>
                )}
             </CardContent>
           </Card>

           <Card className="shadow-sm border-destructive/20 relative overflow-hidden bg-card">
             <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
             <CardHeader className="pb-3 border-b border-border/40">
               <CardTitle className="text-sm font-bold uppercase tracking-wider text-destructive flex items-center gap-2">
                 <AlertCircle className="w-4 h-4" /> Current Blockers
               </CardTitle>
             </CardHeader>
             <CardContent className="p-4">
                <p className="text-sm font-bold text-muted-foreground">No active blockers reported.</p>
             </CardContent>
           </Card>
        </div>

        {/* Tasks */}
        <Card className="shadow-sm border-border/50 bg-card">
           <CardHeader className="pb-3 border-b border-border/40 flex flex-row justify-between items-center">
             <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recent Tasks</CardTitle>
             <button className="text-xs font-bold text-primary hover:underline">View Kanban</button>
           </CardHeader>
           <CardContent className="p-0">
              {tasks.length > 0 ? (
                <div className="divide-y divide-border/60">
                  {tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-4 hover:bg-muted/5 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${task.status === 'done' ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`} />
                          <div>
                            <p className={`text-sm font-bold ${task.status === 'done' ? 'line-through text-muted-foreground/80' : 'text-foreground'}`}>{task.title}</p>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{task.type}</p>
                          </div>
                       </div>
                       <PriorityBadge priority={task.priority} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-semibold text-muted-foreground p-5 text-center">No tasks assigned to this workspace.</p>
              )}
           </CardContent>
        </Card>

      </div>

      {/* Right Column - Intelligence */}
      <div className="flex flex-col gap-6">
         
         <Card className="shadow-sm bg-primary/5 border-primary/20">
           <CardHeader className="pb-3 border-b border-primary/10">
             <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
               <Sparkles className="w-4 h-4 text-primary" /> Last Agent Output
             </CardTitle>
           </CardHeader>
           <CardContent className="p-4">
              {agentRuns.length > 0 && agentRuns[0] ? (
                 <div className="flex flex-col gap-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary/70">{agentRuns[0].agentRole} Agent</p>
                    <p className="text-sm font-semibold">"{agentRuns[0].inputGoal}"</p>
                    <button className="w-full text-xs font-bold bg-primary text-primary-foreground py-2 rounded mt-2 hover:bg-primary/95 shadow">View Output Detail</button>
                 </div>
              ) : (
                <p className="text-sm font-semibold text-muted-foreground">No agents have been run for this workspace recently.</p>
              )}
           </CardContent>
         </Card>

         <Card className="shadow-sm border-border/50 bg-card">
           <CardHeader className="pb-3 border-b border-border/40 flex flex-row justify-between items-center">
             <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
               <Scale className="w-4 h-4 text-muted-foreground" /> Recent Decisions
             </CardTitle>
           </CardHeader>
           <CardContent className="p-0">
              {decisions.length > 0 ? (
                <div className="divide-y divide-border/60">
                  {decisions.map(d => (
                    <div key={d.id} className="p-4 hover:bg-muted/5 transition-colors cursor-pointer">
                      <p className="text-sm font-bold line-clamp-1 text-foreground">{d.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">Option: {d.chosenOption}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-semibold text-muted-foreground p-5 text-center">No decisions tracked yet.</p>
              )}
           </CardContent>
         </Card>

      </div>
    </div>
  )
}
