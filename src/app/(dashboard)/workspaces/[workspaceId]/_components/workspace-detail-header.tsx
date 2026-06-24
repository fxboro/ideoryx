"use client"

import * as React from "react"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Zap, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Workspace } from "@/types"

interface WorkspaceDetailHeaderProps {
  workspace: Workspace
}

export function WorkspaceDetailHeader({ workspace }: WorkspaceDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <Link href="/workspaces" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit font-medium transition-colors">
         <ArrowLeft className="w-4 h-4" /> Back to workspaces
      </Link>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
           <div className="flex flex-wrap items-center gap-3 mb-2">
             <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{workspace.name}</h1>
             <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
               {workspace.workspaceType}
             </span>
             <StatusBadge status={workspace.status} />
           </div>
           <p className="text-sm font-medium text-muted-foreground max-w-3xl leading-relaxed">{workspace.summary}</p>
        </div>
        <Button asChild className="font-bold gap-2 shadow-lg shadow-primary/15 hover:shadow-xl hover:shadow-primary/25 shrink-0 hover:scale-105 active:scale-95 transition-all">
           <Link href={`/agents?workspaceId=${workspace.id}`}>
             <Zap className="w-4 h-4 fill-primary-foreground" />
             Run Agent
           </Link>
         </Button>
      </div>
    </div>
  )
}
