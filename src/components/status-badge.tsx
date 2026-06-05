"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"

import type {
  ProjectStatus,
  TaskStatus,
  GoalStatus,
  LeadStatus,
  ProposalStatus,
  AgentRunStatus,
  SignalStatus,
  OpportunityStatus,
  LearningStatus,
} from "@/types"

export type StatusType =
  | ProjectStatus
  | TaskStatus
  | GoalStatus
  | LeadStatus
  | ProposalStatus
  | AgentRunStatus
  | SignalStatus
  | OpportunityStatus
  | LearningStatus;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/_/g, " ")
  
  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"
  
  // Basic mapping for colors based on typical status meanings
  const activeOrDone = ["active", "completed", "done", "accepted", "won"]
  const warningOrIssue = ["on_hold", "blocked", "failed", "rejected", "lost"]
  const pendingOrProgress = ["todo", "in_progress", "draft", "sent", "new", "qualified", "proposal_sent", "pending"]
  
  if (activeOrDone.includes(status)) variant = "default"
  if (warningOrIssue.includes(status)) variant = "destructive"
  if (pendingOrProgress.includes(status)) variant = "outline"

  return (
    <Badge variant={variant} className={`capitalize font-medium ${className}`}>
      {normalized}
    </Badge>
  )
}
