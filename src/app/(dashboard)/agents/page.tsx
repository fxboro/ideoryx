"use client"

import * as React from "react"
import { Suspense } from "react"
import { PageHeader } from "@/components/page-header"
import { AgentLeftPanel } from "./_components/agent-left-panel"
import { AgentRightPanel } from "./_components/agent-right-panel"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  type AgentType,
  type WorkflowType,
  type AgentRunOutput,
  getMockOutput,
} from "./_components/mock-agent-data"
import { useSearchParams } from "next/navigation"
import { getStoredWorkspaces, saveStoredWorkspaces } from "../workspaces/_components/mock-workspaces"
import { getStoredSignals, saveStoredSignals } from "../signals/_components/mock-signals"
import { getStoredOpportunities, saveStoredOpportunities } from "../opportunities/_components/mock-opportunities"
import { toast } from "sonner"
import type { Workspace, Signal, Opportunity, Task, Decision, Playbook } from "@/types"

function AgentsPageContent() {
  const searchParams = useSearchParams()
  const [selectedAgent, setSelectedAgent] = React.useState<AgentType | null>(
    (searchParams.get("agent") as AgentType) || null
  )
  const [selectedWorkflow, setSelectedWorkflow] = React.useState<WorkflowType | null>(
    (searchParams.get("workflow") as WorkflowType) || null
  )
  const [selectedProject, setSelectedProject] = React.useState<string | null>(
    searchParams.get("projectId") || null
  )
  const [selectedLead, setSelectedLead] = React.useState<string | null>(
    searchParams.get("leadId") || null
  )
  const [contextTags, setContextTags] = React.useState<string[]>([])
  const [goal, setGoal] = React.useState("")
  const [isRunning, setIsRunning] = React.useState(false)
  const [output, setOutput] = React.useState<AgentRunOutput | null>(null)
  
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([])
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string>("")

  React.useEffect(() => {
    const list = getStoredWorkspaces()
    setWorkspaces(list)
    const paramWsId = searchParams.get("workspaceId")
    if (paramWsId && list.some((w) => w.id === paramWsId)) {
      setSelectedWorkspaceId(paramWsId)
    } else if (list.length > 0) {
      setSelectedWorkspaceId(list[0].id)
    }
  }, [searchParams])

  function handleAgentChange(agent: AgentType) {
    setSelectedAgent(agent)
    setSelectedWorkflow(null)
    setOutput(null)
  }

  function handleWorkflowChange(workflow: WorkflowType) {
    setSelectedWorkflow(workflow)
  }

  async function handleRun() {
    if (!selectedAgent || !selectedWorkflow) return

    setIsRunning(true)
    setOutput(null)

    try {
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentRole: selectedAgent,
          workflowType: selectedWorkflow,
          inputGoal: goal || "Execute agent workflow",
          workspaceId: selectedWorkspaceId,
          projectId: selectedProject,
          leadId: selectedLead,
          contextTags,
          sync: true,
        }),
      })

      if (res.ok) {
        const json = await res.json()
        if (json.data?.output) {
          const out = json.data.output
          const sections = [
            {
              id: "summary",
              title: "Executive Summary",
              content: out.summary || out.analysis || "Workflow executed successfully.",
              type: "text" as const,
            },
            ...(out.recommendations ? [{
              id: "recommendations",
              title: "Key Recommendations",
              content: "",
              type: "list" as const,
              items: Array.isArray(out.recommendations) ? out.recommendations : [String(out.recommendations)],
            }] : []),
          ]

          setOutput({
            agentType: selectedAgent,
            workflowName: selectedWorkflow.replace(/_/g, " "),
            timestamp: Date.now(),
            sections,
            nextBestAction: typeof json.data.nextBestAction === "object" && json.data.nextBestAction !== null
              ? json.data.nextBestAction
              : {
                  title: "Review Generated Plan",
                  description: typeof json.data.nextBestAction === "string" ? json.data.nextBestAction : "Review the agent output and save proposed actions to your workspace.",
                  actionLabel: "Apply to Workspace",
                },
            saveActions: json.data.saveActions || [],
          })
          toast.success("Agent workflow executed successfully!")
          return
        }
      }

      // Fallback to sample output if no vendor API key configured yet
      const fallbackResult = getMockOutput(selectedAgent, selectedWorkflow)
      setOutput(fallbackResult)
      toast.info("Generated sample agent output")
    } catch (err) {
      console.warn("Using sample output fallback:", err)
      const fallbackResult = getMockOutput(selectedAgent, selectedWorkflow)
      setOutput(fallbackResult)
    } finally {
      setIsRunning(false)
    }
  }

  function handleSaveAction(actionKey: string, payload: any) {
    try {
      const targetWorkspaceId = selectedWorkspaceId || "w1"
      
      // Resolve collection from output saveActions list
      const actionDef = output?.saveActions.find((a) => a.key === actionKey)
      const collection = actionDef?.collection || actionKey
      
      // Persist to Supabase backend API
      fetch("/api/save-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection,
          payload,
          workspaceId: targetWorkspaceId,
        }),
      }).catch((e) => console.log("API save fallback:", e))
      
      switch (collection) {
        case "signals": {
          const existing = getStoredSignals()
          const newSignal: Signal = {
            id: "sig_" + crypto.randomUUID().substring(0, 8),
            userId: "user1",
            workspaceId: targetWorkspaceId,
            title: payload.title || "Untitled Signal",
            description: payload.description || "",
            category: payload.category || "performance",
            severity: payload.severity || "medium",
            status: "new",
            source: payload.source || "manual",
            sourceMetadata: payload.sourceMetadata || {},
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
          saveStoredSignals([newSignal, ...existing])
          toast.success(`Signal "${newSignal.title}" successfully saved!`)
          break
        }
        case "opportunities": {
          const existing = getStoredOpportunities()
          const newOpp: Opportunity = {
            id: "opp_" + crypto.randomUUID().substring(0, 8),
            userId: "user1",
            workspaceId: targetWorkspaceId,
            title: payload.title || "Untitled Opportunity",
            description: payload.description || "",
            status: "open",
            category: payload.category || "performance",
            score: payload.score || 0,
            scoringBreakdown: payload.scoringBreakdown || {
              impact: 3,
              confidence: 3,
              effort: 3,
              explanation: "Calculated from default parameters.",
            },
            sourceSignalIds: payload.sourceSignalIds || [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
          saveStoredOpportunities([newOpp, ...existing])
          toast.success(`Opportunity "${newOpp.title}" successfully saved!`)
          break
        }
        case "workspaces": {
          const existing = getStoredWorkspaces()
          const targetId = payload.workspaceId || targetWorkspaceId
          const updated = existing.map((w) => {
            if (w.id === targetId) {
              return { ...w, stage: payload.stage, updatedAt: Date.now() }
            }
            return w
          })
          saveStoredWorkspaces(updated)
          setWorkspaces(updated)
          toast.success(`Workspace stage updated to "${payload.stage}"!`)
          break
        }
        case "tasks": {
          const existingData = localStorage.getItem("mission_control_tasks")
          const existing = existingData ? JSON.parse(existingData) : []
          const newTask: Task = {
            id: "task_" + crypto.randomUUID().substring(0, 8),
            userId: "user1",
            workspaceId: targetWorkspaceId,
            title: payload.title || "Untitled Task",
            description: payload.description || "",
            type: payload.type || "feature",
            priority: payload.priority || "medium",
            status: "todo",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
          localStorage.setItem("mission_control_tasks", JSON.stringify([newTask, ...existing]))
          toast.success(`Task "${newTask.title}" successfully saved!`)
          break
        }
        case "decisions": {
          const existingData = localStorage.getItem("mission_control_decisions")
          const existing = existingData ? JSON.parse(existingData) : []
          const newDecision: Decision = {
            id: "dec_" + crypto.randomUUID().substring(0, 8),
            userId: "user1",
            workspaceId: targetWorkspaceId,
            title: payload.title || "Untitled Decision",
            context: payload.context || "",
            optionsConsidered: payload.optionsConsidered || [],
            chosenOption: payload.chosenOption || "",
            rationale: payload.rationale || "",
            tradeoffs: payload.tradeoffs,
            risks: payload.risks,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
          localStorage.setItem("mission_control_decisions", JSON.stringify([newDecision, ...existing]))
          toast.success(`Decision "${newDecision.title}" successfully saved!`)
          break
        }
        case "playbooks": {
          const existingData = localStorage.getItem("mission_control_playbooks")
          const existing = existingData ? JSON.parse(existingData) : []
          const newPlaybook: Playbook = {
            id: "pb_" + crypto.randomUUID().substring(0, 8),
            userId: "user1",
            workspaceId: targetWorkspaceId,
            title: payload.title || "Untitled Playbook",
            category: payload.category || "general",
            summary: payload.summary || "",
            tags: payload.tags || [],
            steps: payload.steps || [],
            checklist: payload.checklist || [],
            promptTemplate: payload.promptTemplate || "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
          localStorage.setItem("mission_control_playbooks", JSON.stringify([newPlaybook, ...existing]))
          toast.success(`Playbook "${newPlaybook.title}" successfully saved!`)
          break
        }
        default:
          toast.error(`Unknown collection type: ${collection}`)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to save record.")
    }
  }

  return (
    <div className="flex flex-col h-full bg-background/50">
      <PageHeader
        title="Agents Console"
        description="Run role-based AI workflows, review structured outputs, and save results into your system."
      />

      <div className="flex-1 overflow-hidden">
        <div className="flex flex-col lg:grid lg:grid-cols-12 h-full max-w-[1400px] mx-auto">
          {/* Left Panel — Input Controls */}
          <div className="lg:col-span-4 xl:col-span-4 border-b lg:border-b-0 lg:border-r border-border/50">
            <ScrollArea className="h-auto lg:h-full max-h-[50vh] lg:max-h-none">
              <div className="p-4 md:p-5 lg:p-8">
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                  <div className="flex items-center justify-center size-7 rounded-lg bg-primary/10">
                    <span className="text-xs font-black text-primary">IN</span>
                  </div>
                  <h2 className="text-sm font-bold text-foreground tracking-tight">
                    Configure & Run
                  </h2>
                </div>
                <AgentLeftPanel
                  selectedWorkspaceId={selectedWorkspaceId}
                  onWorkspaceChange={setSelectedWorkspaceId}
                  workspaces={workspaces}
                  selectedAgent={selectedAgent}
                  selectedWorkflow={selectedWorkflow}
                  selectedProject={selectedProject}
                  selectedLead={selectedLead}
                  contextTags={contextTags}
                  goal={goal}
                  isRunning={isRunning}
                  onAgentChange={handleAgentChange}
                  onWorkflowChange={handleWorkflowChange}
                  onProjectChange={setSelectedProject}
                  onLeadChange={setSelectedLead}
                  onTagsChange={setContextTags}
                  onGoalChange={setGoal}
                  onRun={handleRun}
                />
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel — Output */}
          <div className="lg:col-span-8 xl:col-span-8 flex-1">
            <ScrollArea className="h-auto lg:h-full">
              <div className="p-4 md:p-5 lg:p-8">
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                  <div className="flex items-center justify-center size-7 rounded-lg bg-primary/10">
                    <span className="text-xs font-black text-primary">OUT</span>
                  </div>
                  <h2 className="text-sm font-bold text-foreground tracking-tight">
                    Structured Output
                  </h2>
                </div>
                <AgentRightPanel output={output} isLoading={isRunning} onSaveAction={handleSaveAction} />
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AgentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground flex justify-center text-sm">Loading console...</div>}>
      <AgentsPageContent />
    </Suspense>
  )
}
