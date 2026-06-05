"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Play, BookOpen, Copy, Check, ListChecks, Terminal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockPlaybooks } from "../_components/mock-playbooks"
import { EmptyState } from "@/components/empty-state"

export default function PlaybookDetailPage({ params }: { params: Promise<{ playbookId: string }> }) {
  const resolvedParams = React.use(params)
  const playbookId = resolvedParams.playbookId
  const playbook = mockPlaybooks.find((p) => p.id === playbookId)
  const [checkedItems, setCheckedItems] = React.useState<Set<number>>(new Set())
  const [copied, setCopied] = React.useState(false)

  if (!playbook) {
    return (
      <div className="flex flex-col min-h-screen bg-background/50 p-4 md:p-8">
        <Link href="/playbooks" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit font-medium mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to playbooks
        </Link>
        <EmptyState icon={BookOpen} title="Playbook not found" description="This playbook does not exist." />
      </div>
    )
  }

  function toggleCheck(index: number) {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function copyPrompt() {
    navigator.clipboard.writeText(playbook!.promptTemplate)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lastUsedLabel = playbook.lastUsed
    ? `${Math.floor((Date.now() - playbook.lastUsed) / 86400000)} days ago`
    : "Never used"

  return (
    <div className="flex flex-col min-h-screen bg-background/50">
      <div className="p-4 md:p-6 lg:p-8 flex flex-col w-full mx-auto max-w-[900px]">
        {/* Back link */}
        <Link href="/playbooks" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit font-medium mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to playbooks
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-11 rounded-xl bg-primary/10">
                <BookOpen className="size-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{playbook.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">{playbook.category}</Badge>
                  <span className="text-xs text-muted-foreground">• Last used {lastUsedLabel}</span>
                </div>
              </div>
            </div>
            <Button className="font-bold gap-1.5 shrink-0">
              <Play className="size-3.5" /> Run Playbook
            </Button>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{playbook.summary}</p>
          <div className="flex flex-wrap gap-1.5">
            {playbook.tags.map((tag) => (
              <span key={tag} className="text-[10px] uppercase font-bold text-muted-foreground border border-border px-2 py-0.5 rounded-md bg-muted/30">{tag}</span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Steps */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2.5 p-5 pb-3 border-b border-border/50">
              <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
                <ListChecks className="size-4 text-primary" />
              </div>
              <h2 className="text-sm font-bold tracking-tight">Steps</h2>
            </div>
            <div className="p-5">
              <ol className="space-y-3">
                {playbook.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 group">
                    <span className="flex items-center justify-center size-6 rounded-full bg-muted text-[10px] font-black text-muted-foreground shrink-0 mt-0.5 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {i + 1}
                    </span>
                    <span className="text-sm text-foreground/90 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Checklist */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between p-5 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center size-8 rounded-lg bg-emerald-500/10">
                  <Check className="size-4 text-emerald-500" />
                </div>
                <h2 className="text-sm font-bold tracking-tight">Checklist</h2>
              </div>
              <span className="text-xs font-bold text-muted-foreground tabular-nums">
                {checkedItems.size}/{playbook.checklist.length}
              </span>
            </div>
            <div className="p-5">
              <ul className="space-y-2.5">
                {playbook.checklist.map((item, i) => (
                  <li key={i}>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={checkedItems.has(i)}
                        onChange={() => toggleCheck(i)}
                        className="size-4 rounded border-border accent-primary cursor-pointer"
                      />
                      <span className={`text-sm transition-all ${checkedItems.has(i) ? "text-muted-foreground line-through" : "text-foreground/90"}`}>
                        {item}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Prompt Template */}
        <div className="rounded-xl border border-border bg-card overflow-hidden mb-8">
          <div className="flex items-center justify-between p-5 pb-3 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center size-8 rounded-lg bg-amber-500/10">
                <Terminal className="size-4 text-amber-500" />
              </div>
              <h2 className="text-sm font-bold tracking-tight">Reusable Prompt</h2>
            </div>
            <button
              onClick={copyPrompt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="p-5">
            <pre className="text-xs text-foreground/80 font-mono leading-relaxed whitespace-pre-wrap bg-muted/30 p-4 rounded-lg border border-border/50 overflow-x-auto">
              {playbook.promptTemplate}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
