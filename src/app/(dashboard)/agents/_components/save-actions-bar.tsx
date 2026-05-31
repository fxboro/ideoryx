"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ListChecks, Scale, BookMarked, Pickaxe, Save, Target, Lightbulb, Activity, Layers } from "lucide-react"
import { SaveActionDialog } from "@/components/save-action-dialog"
import type { SaveAction } from "@/lib/agents/types"

interface SaveActionsBarProps {
  visible: boolean
  actions?: SaveAction[]
  onSave?: (actionKey: string, payload: any) => void
}

function getIconForCollection(collection: string) {
  switch (collection) {
    case "projects":
      return Pickaxe
    case "tasks":
      return ListChecks
    case "decisions":
      return Scale
    case "playbooks":
      return BookMarked
    case "goals":
      return Target
    case "memories":
      return Lightbulb
    case "signals":
      return Activity
    case "opportunities":
      return Lightbulb
    case "workspaces":
      return Layers
    default:
      return Save
  }
}

export function SaveActionsBar({ visible, actions = [], onSave }: SaveActionsBarProps) {
  const [selectedAction, setSelectedAction] = React.useState<SaveAction | null>(null)

  if (!visible) return null
  if (actions.length === 0) return null

  function handleActionClick(action: SaveAction) {
    setSelectedAction(action)
  }

  function handleSave(actionKey: string, payload: any) {
    if (onSave) {
      onSave(actionKey, payload)
    } else {
      console.log(`Saving ${actionKey} to backend:`, payload)
    }
  }

  return (
    <>
      <div className="border border-border/50 bg-background rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Save Actions
        </p>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => {
            const Icon = getIconForCollection(action.collection)
            return (
              <Button
                key={action.key}
                variant="outline"
                size="sm"
                className="gap-2 h-9 px-3 font-semibold text-xs border-border hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all hover:scale-105 active:scale-95"
                onClick={() => handleActionClick(action)}
              >
                <Icon className="size-3.5" />
                {action.label}
              </Button>
            )
          })}
        </div>
      </div>

      <SaveActionDialog
        open={!!selectedAction}
        onOpenChange={(open) => !open && setSelectedAction(null)}
        action={selectedAction}
        onSave={handleSave}
      />
    </>
  )
}
