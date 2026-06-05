"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp, Flag } from "lucide-react"

import type { Priority } from "@/types";

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const norm = priority.toLowerCase()
  
  const iconProps = { className: "w-3 h-3 mr-1" }
  let Icon = Flag
  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"
  
  switch (norm) {
    case "low":
      Icon = ArrowDown
      variant = "outline"
      break
    case "medium":
      Icon = ArrowUp
      variant = "secondary"
      break
    case "high":
      Icon = AlertTriangle
      variant = "default"
      break
    case "urgent":
      Icon = AlertCircle
      variant = "destructive"
      break
  }

  return (
    <Badge variant={variant} className={`capitalize font-medium flex items-center ${className}`}>
      <Icon {...iconProps} />
      {norm}
    </Badge>
  )
}
