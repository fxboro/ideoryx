"use client"

import * as React from "react"
import { StatusBadge } from "@/components/status-badge"
import type { Lead } from "@/types"

interface LeadTableProps {
  leads: Lead[]
  onSelectLead: (lead: Lead) => void
}

const urgencyColors = {
  high: "text-destructive font-bold",
  medium: "text-amber-500 font-bold",
  low: "text-muted-foreground font-medium",
}

export function LeadTable({ leads, onSelectLead }: LeadTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full min-w-[800px] text-sm text-left whitespace-nowrap">
        <thead className="bg-muted text-xs uppercase font-semibold text-muted-foreground border-b border-border">
          <tr>
            <th className="px-3 py-3 md:px-5 md:py-4">Business</th>
            <th className="px-3 py-3 md:px-5 md:py-4">Contact</th>
            <th className="px-3 py-3 md:px-5 md:py-4">Niche</th>
            <th className="px-3 py-3 md:px-5 md:py-4">Source</th>
            <th className="px-3 py-3 md:px-5 md:py-4">Status</th>
            <th className="px-3 py-3 md:px-5 md:py-4">Urgency</th>
            <th className="px-3 py-3 md:px-5 md:py-4">Budget</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {leads.map((lead) => (
            <tr
              key={lead.id}
              onClick={() => onSelectLead(lead)}
              className="hover:bg-muted/10 transition-colors cursor-pointer"
            >
              <td className="px-3 py-3 md:px-5 md:py-4 font-bold text-foreground">{lead.businessName}</td>
              <td className="px-3 py-3 md:px-5 md:py-4 text-muted-foreground">{lead.contactName || "-"}</td>
              <td className="px-3 py-3 md:px-5 md:py-4 text-muted-foreground">{lead.niche || "-"}</td>
              <td className="px-3 py-3 md:px-5 md:py-4">
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{lead.source || "-"}</span>
              </td>
              <td className="px-3 py-3 md:px-5 md:py-4"><StatusBadge status={lead.status} /></td>
              <td className="px-3 py-3 md:px-5 md:py-4">
                <span className={`text-xs uppercase tracking-wider ${urgencyColors[lead.urgency || "low"]}`}>
                  {lead.urgency || "-"}
                </span>
              </td>
              <td className="px-3 py-3 md:px-5 md:py-4">
                <span className={`text-xs uppercase tracking-wider ${urgencyColors[lead.budgetSignal || "low"]}`}>
                  {lead.budgetSignal || "-"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
