"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/empty-state"
import { SaveActionsBar } from "./save-actions-bar"
import {
  Bot,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  List,
  Code,
  FileText,
} from "lucide-react"
import type { AgentRunOutput, OutputSection } from "./mock-agent-data"

import type { SaveAction } from "@/lib/agents/types"

interface AgentRightPanelProps {
  output: AgentRunOutput | null
  isLoading: boolean
  onSaveAction: (actionKey: string, payload: any) => void
}

function SectionIcon({ type }: { type: OutputSection["type"] }) {
  switch (type) {
    case "list":
      return <List className="size-4 text-primary/70" />
    case "code":
      return <Code className="size-4 text-primary/70" />
    case "table":
      return <FileText className="size-4 text-primary/70" />
    default:
      return <FileText className="size-4 text-primary/70" />
  }
}

function OutputSectionCard({ section }: { section: OutputSection }) {
  return (
    <Card className="border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-200 hover:shadow-sm group">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-bold">
          <SectionIcon type={section.type} />
          {section.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {section.type === "text" && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {section.content}
          </p>
        )}

        {section.type === "list" && section.items && (
          <ul className="space-y-2">
            {section.items.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed"
              >
                <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-primary/40" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        {section.type === "code" && (
          <pre className="rounded-lg bg-muted/50 border border-border/30 p-4 text-xs font-mono text-foreground/80 overflow-x-auto scrollbar-refined leading-relaxed">
            {section.content}
          </pre>
        )}
      </CardContent>
    </Card>
  )
}

function NextBestActionCard({
  action,
}: {
  action: AgentRunOutput["nextBestAction"]
}) {
  return (
    <Card className="border-primary/20 bg-primary/5 hover:bg-primary/8 transition-all duration-200 hover:shadow-md hover:shadow-primary/5">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center size-9 rounded-full bg-primary/10 shrink-0">
            <Sparkles className="size-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-primary/70 mb-1">
              Recommended Next Step
            </p>
            <p className="text-sm font-bold text-foreground mb-1">
              {action.title}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              {action.description}
            </p>
            <Badge
              variant="outline"
              className="gap-1.5 cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-xs font-semibold"
            >
              {action.actionLabel}
              <ArrowRight className="size-3" />
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Output header skeleton */}
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="size-8 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* Section skeletons */}
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-border/30">
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function AgentRightPanel({ output, isLoading, onSaveAction }: AgentRightPanelProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <LoadingSkeleton />
      </div>
    )
  }

  if (!output) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <EmptyState
          icon={Bot}
          title="Pick an agent and workflow to begin"
          description="Select an agent from the left panel, choose a workflow, describe your goal, and hit Run. The structured output will appear here."
          action={
            <div className="flex items-center gap-2 text-xs text-muted-foreground/60 mt-2">
              <Sparkles className="size-3" />
              <span>Recommended: Founder Agent → Idea to MVP</span>
            </div>
          }
        />
      </div>
    )
  }

  const emojiMap: Record<string, string> = {
    founder: "🧭",
    architect: "🏗️",
    builder: "⚡",
    execution: "📈",
    freelance: "💼",
    validation: "🔍",
    launch: "🚀",
    delivery: "📦",
    improvement: "🛠️",
    signal_analyst: "📊",
  }
  const agentEmoji = emojiMap[output.agentType] || "🤖"

  return (
    <div className="flex flex-col">
      {/* Output Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center justify-center size-10 rounded-full bg-muted/50 text-xl">
          {agentEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-foreground">
            {output.workflowName}
          </h3>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="size-3 text-green-500" />
            Completed {new Date(output.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <Badge variant="secondary" className="text-xs font-bold">
          {output.sections.length} sections
        </Badge>
      </div>

      {/* Output Sections */}
      <div className="space-y-4 mb-6">
        {output.sections.map((section, i) => (
          <div
            key={section.id}
            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: "backwards" }}
          >
            <OutputSectionCard section={section} />
          </div>
        ))}
      </div>

      {/* Next Best Action */}
      <div className="mb-0 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${output.sections.length * 80}ms`, animationFillMode: "backwards" }}>
        <NextBestActionCard action={output.nextBestAction} />
      </div>

      {/* Save Actions */}
      <div className="mt-4">
        <SaveActionsBar actions={output.saveActions || []} visible={true} onSave={onSaveAction} />
      </div>
    </div>
  )
}
