"use client"

import * as React from "react"
import { PageHeader } from "@/components/page-header"
import { Plus } from "lucide-react"
import { PipelineSummary } from "./_components/pipeline-summary"
import { LeadTable } from "./_components/lead-table"
import { LeadDetailDrawer } from "./_components/lead-detail-drawer"
import { ServiceTemplatesGrid } from "./_components/service-templates-grid"
import { SearchInput } from "@/components/search-input"
import { TagFilter } from "@/components/tag-filter"
import { mockLeads, mockServiceTemplates, pipelineSummary } from "./_components/mock-freelance"
import type { Lead } from "@/types"

const statusFilters = ["new", "qualified", "proposal_sent", "won", "lost"]

export default function FreelancePage() {
  const [search, setSearch] = React.useState("")
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([])
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const filtered = mockLeads.filter((lead) => {
    const matchesSearch =
      search === "" ||
      lead.businessName.toLowerCase().includes(search.toLowerCase()) ||
      (lead.contactName?.toLowerCase().includes(search.toLowerCase()) ?? false)

    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(lead.status)

    return matchesSearch && matchesStatus
  })

  function handleSelectLead(lead: Lead) {
    setSelectedLead(lead)
    setDrawerOpen(true)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background/50">
      <PageHeader
        title="Freelance Workspace"
        description="Move from lead to scoped, profitable work."
        primaryAction={{ label: "New Lead", icon: <Plus className="size-4" /> }}
      />
      <div className="py-4 md:py-6 flex flex-col gap-8 max-w-[1600px] w-full mx-auto">
        {/* Pipeline Summary */}
        <PipelineSummary summary={pipelineSummary} />

        {/* Lead List */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-base md:text-lg font-bold tracking-tight">Lead Pipeline</h2>
            <SearchInput value={search} onChange={setSearch} placeholder="Search leads..." className="sm:max-w-xs" />
          </div>
          <div className="mb-4">
            <TagFilter tags={statusFilters} selected={selectedStatuses} onChange={setSelectedStatuses} />
          </div>
          <LeadTable leads={filtered} onSelectLead={handleSelectLead} />
        </div>

        {/* Service Templates */}
        <div>
          <h2 className="text-base md:text-lg font-bold tracking-tight mb-4">Service Templates</h2>
          <ServiceTemplatesGrid templates={mockServiceTemplates} />
        </div>
      </div>

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer lead={selectedLead} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
