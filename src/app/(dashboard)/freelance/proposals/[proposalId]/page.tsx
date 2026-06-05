"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Send, Clock, DollarSign, AlertTriangle, CheckCircle, ListChecks } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { SectionCard } from "@/components/section-card"
import { EmptyState } from "@/components/empty-state"
import { mockProposals, mockLeads } from "../../_components/mock-freelance"

export default function ProposalDetailPage({ params }: { params: Promise<{ proposalId: string }> }) {
  const resolvedParams = React.use(params)
  const proposalId = resolvedParams.proposalId
  const proposal = mockProposals.find((p) => p.id === proposalId)

  if (!proposal) {
    return (
      <div className="flex flex-col min-h-screen bg-background/50 p-4 md:p-8">
        <Link href="/freelance" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit font-medium mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Freelance
        </Link>
        <EmptyState icon={FileText} title="Proposal not found" description="This proposal does not exist." />
      </div>
    )
  }

  const lead = mockLeads.find((l) => l.id === proposal.leadId)

  return (
    <div className="flex flex-col min-h-screen bg-background/50">
      <div className="p-4 md:p-6 lg:p-8 flex flex-col w-full mx-auto max-w-[900px]">
        {/* Back link */}
        <Link href="/freelance" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit font-medium mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Freelance
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-11 rounded-xl bg-primary/10">
                <FileText className="size-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{proposal.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={proposal.status} />
                  {lead && (
                    <span className="text-xs text-muted-foreground">• {lead.businessName}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="font-bold gap-1.5">
                <FileText className="size-3.5" /> Edit
              </Button>
              <Button className="font-bold gap-1.5">
                <Send className="size-3.5" /> Send Proposal
              </Button>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-6 mb-8">
          {/* Problem Summary */}
          <SectionCard title="Problem Summary" icon={AlertTriangle} description="What problem are we solving?">
            <p className="text-sm text-foreground/80 leading-relaxed">{proposal.problemSummary}</p>
          </SectionCard>

          {/* Scope */}
          <SectionCard title="Scope" icon={FileText} description="What's included in this engagement?">
            <p className="text-sm text-foreground/80 leading-relaxed">{proposal.scope}</p>
          </SectionCard>

          {/* Deliverables */}
          <SectionCard title="Deliverables" icon={ListChecks} description="Concrete items we'll deliver">
            <ul className="space-y-2">
              {proposal.deliverables.map((d, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm">
                  <CheckCircle className="size-4 text-emerald-500 shrink-0" />
                  <span className="text-foreground/80">{d}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Timeline */}
          <SectionCard title="Timeline" icon={Clock} description="Project schedule and milestones">
            <p className="text-sm text-foreground/80 leading-relaxed">{proposal.timeline}</p>
          </SectionCard>

          {/* Pricing */}
          <SectionCard title="Pricing Logic" icon={DollarSign} description="Investment and payment structure">
            <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
              <p className="text-sm text-foreground font-semibold leading-relaxed">{proposal.pricing}</p>
            </div>
          </SectionCard>

          {/* Assumptions & Risks */}
          {proposal.assumptions && (
            <SectionCard title="Assumptions & Risks" icon={AlertTriangle} description="What we're assuming and what could go wrong">
              <p className="text-sm text-foreground/80 leading-relaxed">{proposal.assumptions}</p>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  )
}
