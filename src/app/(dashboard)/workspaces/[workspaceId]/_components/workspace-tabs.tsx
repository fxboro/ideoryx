"use client"

import * as React from "react"
import { WorkspaceOverviewTab } from "./tabs/workspace-overview-tab"
import { WorkspaceSignalsTab } from "./tabs/workspace-signals-tab"
import { WorkspaceChecklistPanel } from "./workspace-checklist-panel"
import { EmptyState } from "@/components/empty-state"
import { 
  FolderKanban, 
  Route, 
  Blocks, 
  Scale, 
  Bot, 
  BookOpen, 
  AlertTriangle,
  Sparkles,
  Search,
  FileText,
  Activity,
  Lightbulb,
  Rocket,
  CheckCircle2
} from "lucide-react"
import { 
  mockProjectTasks, 
  mockProjectGoals, 
  mockProjectDecisions, 
  mockProjectAgentRuns 
} from "@/app/(dashboard)/projects/_components/mock-projects"
import type { Workspace } from "@/types"

interface WorkspaceTabsProps {
  workspace: Workspace
  onWorkspaceUpdated: (updated: Workspace) => void
}

export function WorkspaceTabs({ workspace, onWorkspaceUpdated }: WorkspaceTabsProps) {
  const isProduct = workspace.workspaceType === "product"
  
  // Set first active tab
  const [activeTab, setActiveTab] = React.useState("overview")

  const productTabs = [
    "overview",
    "validation",
    "roadmap",
    "build",
    "launch",
    "signals",
    "opportunities",
    "decisions",
    "agent_runs",
  ]

  const clientTabs = [
    "overview",
    "discovery",
    "proposal",
    "scope",
    "delivery",
    "signals",
    "opportunities",
    "decisions",
    "agent_runs",
  ]

  const tabs = isProduct ? productTabs : clientTabs

  // Filter mock lists for this workspace
  const workspaceTasks = mockProjectTasks.filter(
    (t: any) => t.workspaceId === workspace.id || (workspace.id === "w1" && t.projectId === "p1")
  )
  const workspaceGoals = mockProjectGoals.filter(
    (g: any) => g.workspaceId === workspace.id || (workspace.id === "w1" && g.id === "g1")
  )
  const workspaceDecisions = mockProjectDecisions.filter(
    (d: any) => d.workspaceId === workspace.id || (workspace.id === "w1" && d.projectId === "p1")
  )
  const workspaceAgentRuns = mockProjectAgentRuns.filter(
    (r: any) => r.workspaceId === workspace.id || (workspace.id === "w1" && r.projectId === "p1")
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs scroll header */}
      <div className="flex overflow-x-auto border-b border-border/80 hide-scrollbar">
        <div className="flex space-x-1 min-w-max">
           {tabs.map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-4 py-2.5 text-sm font-bold capitalize transition-colors border-b-2 whitespace-nowrap ${
                 activeTab === tab 
                   ? "border-primary text-primary" 
                   : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
               }`}
             >
               {tab.replace("_", " ")}
             </button>
           ))}
         </div>
      </div>
      
      {/* Tab Contents */}
      <div className="pt-2">
         {activeTab === "overview" && (
           <div className="flex flex-col gap-8">
             <WorkspaceChecklistPanel 
               workspace={workspace} 
               onWorkspaceUpdated={onWorkspaceUpdated} 
             />
             <div className="border-t border-border/50 pt-8">
               <h3 className="text-lg font-bold text-foreground mb-4">Workspace Context & Analytics</h3>
               <WorkspaceOverviewTab 
                  workspace={workspace} 
                  tasks={workspaceTasks} 
                  goals={workspaceGoals} 
                  decisions={workspaceDecisions}
                  agentRuns={workspaceAgentRuns}
               />
             </div>
           </div>
         )}
         
         {/* Product tabs */}
         {activeTab === "validation" && (
           <EmptyState 
             icon={Sparkles} 
             title="Product Validation Hub" 
             description="Run validation loops to survey ICP, log customer problem interviews, and track competitor research metrics." 
           />
         )}
         {activeTab === "roadmap" && (
           <EmptyState 
             icon={Route} 
             title="Product Roadmap" 
             description="Map specifications, epics, features, and technical milestones for this product build." 
           />
         )}
         {activeTab === "build" && (
           <EmptyState 
             icon={Blocks} 
             title="Build Environment" 
             description="System architecture logs, source code integrations, repository health checks, and sprint statistics." 
           />
         )}
         {activeTab === "launch" && (
           <EmptyState 
             icon={Rocket} 
             title="Launch Playbook" 
             description="Plan deployment runs, configure production monitoring, and generate launch campaigns using the Launch agent." 
           />
         )}

         {/* Client tabs */}
         {activeTab === "discovery" && (
           <EmptyState 
             icon={Search} 
             title="Client Discovery logs" 
             description="Qualify leads, outline client pain points, prepare discovery question templates, and analyze customer alignment." 
           />
         )}
         {activeTab === "proposal" && (
           <EmptyState 
             icon={FileText} 
             title="Proposals Center" 
             description="Draft, iterate, and deliver cost proposals and delivery specifications. Monitor acceptance and revisions." 
           />
         )}
         {activeTab === "scope" && (
           <EmptyState 
             icon={FolderKanban} 
             title="Client Project Scope" 
             description="Detailed work breakdown structures, milestones, tasks, and scheduling timeline logs." 
           />
         )}
         {activeTab === "delivery" && (
           <EmptyState 
             icon={CheckCircle2} 
             title="Client Delivery & QA" 
             description="Kickoff logs, periodic status reports, client feedback loops, and milestone checklists." 
           />
         )}

         {/* Common tabs */}
         {activeTab === "signals" && (
           <WorkspaceSignalsTab workspace={workspace} />
         )}
         {activeTab === "opportunities" && (
           <EmptyState 
             icon={Lightbulb} 
             title="Growth Opportunities" 
             description="AI-generated monetization tactics, contract expansions, up-sell opportunities, and performance tuning recommendations." 
           />
         )}
         {activeTab === "decisions" && (
           <EmptyState 
             icon={Scale} 
             title="Decisions Registry" 
             description="Track architectural choices, budget negotiations, client approvals, and scoping trade-offs." 
           />
         )}
         {activeTab === "agent_runs" && (
           <EmptyState 
             icon={Bot} 
             title="Agent Activities" 
             description="Audit outputs, logs, and save actions generated by execution, architect, or founder agents." 
           />
         )}
      </div>
    </div>
  )
}
