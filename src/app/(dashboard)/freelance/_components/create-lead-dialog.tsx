"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { Lead, Severity, BudgetSignal } from "@/types"

interface CreateLeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (lead: Lead) => void
}

export function CreateLeadDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateLeadDialogProps) {
  const [businessName, setBusinessName] = React.useState("")
  const [contactName, setContactName] = React.useState("")
  const [contactEmail, setContactEmail] = React.useState("")
  const [niche, setNiche] = React.useState("")
  const [source, setSource] = React.useState("LinkedIn")
  const [painPoint, setPainPoint] = React.useState("")
  const [urgency, setUrgency] = React.useState<Severity>("medium")
  const [budgetSignal, setBudgetSignal] = React.useState<BudgetSignal>("medium")
  const [notes, setNotes] = React.useState("")

  function resetForm() {
    setBusinessName("")
    setContactName("")
    setContactEmail("")
    setNiche("")
    setSource("LinkedIn")
    setPainPoint("")
    setUrgency("medium")
    setBudgetSignal("medium")
    setNotes("")
  }

  function handleCreate() {
    if (!businessName.trim()) {
      toast.error("Business name is required.")
      return
    }

    const id = "lead_" + crypto.randomUUID().substring(0, 8)

    const newLead: Lead = {
      id,
      userId: "user1",
      businessName: businessName.trim(),
      contactName: contactName.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      niche: niche.trim() || undefined,
      source: source || undefined,
      painPoint: painPoint.trim() || undefined,
      urgency,
      budgetSignal,
      status: "new",
      notes: notes.trim() || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    onCreated(newLead)
    toast.success(`Lead "${businessName}" successfully created!`)
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] border border-border bg-popover">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">New Lead</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a new prospect to your freelance pipeline.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Business Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="business-name" className="font-bold text-xs uppercase tracking-wider">
              Business Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="business-name"
              placeholder="e.g. Acme Wellness Studio"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="bg-background border border-border"
            />
          </div>

          {/* Contact Name & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-name" className="font-bold text-xs uppercase tracking-wider">Contact Name</Label>
              <Input
                id="contact-name"
                placeholder="e.g. Sarah Chen"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="bg-background border border-border"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-email" className="font-bold text-xs uppercase tracking-wider">Contact Email</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="e.g. sarah@acme.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="bg-background border border-border"
              />
            </div>
          </div>

          {/* Niche & Source */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="niche" className="font-bold text-xs uppercase tracking-wider">Niche / Industry</Label>
              <Input
                id="niche"
                placeholder="e.g. Healthcare, SaaS"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="bg-background border border-border"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="source" className="font-bold text-xs uppercase tracking-wider">Lead Source</Label>
              <select
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="Referral">Referral</option>
                <option value="Cold outreach">Cold Outreach</option>
                <option value="Upwork">Upwork</option>
                <option value="Website form">Website Form</option>
                <option value="Twitter/X">Twitter / X</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Pain Point */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pain-point" className="font-bold text-xs uppercase tracking-wider">Pain Point</Label>
            <Textarea
              id="pain-point"
              placeholder="What problem does this prospect need solved?"
              value={painPoint}
              onChange={(e) => setPainPoint(e.target.value)}
              className="bg-background border border-border min-h-[80px]"
            />
          </div>

          {/* Urgency & Budget Signal */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="urgency" className="font-bold text-xs uppercase tracking-wider">Urgency</Label>
              <select
                id="urgency"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as Severity)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="budget-signal" className="font-bold text-xs uppercase tracking-wider">Budget Signal</Label>
              <select
                id="budget-signal"
                value={budgetSignal}
                onChange={(e) => setBudgetSignal(e.target.value as BudgetSignal)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes" className="font-bold text-xs uppercase tracking-wider">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional context, next steps, or follow-up reminders..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-background border border-border min-h-[70px]"
            />
          </div>
        </div>

        <DialogFooter className="border-t border-border bg-muted/20 px-4 py-3 -mx-6 -mb-6 flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} className="bg-primary text-primary-foreground font-bold">
            Create Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
