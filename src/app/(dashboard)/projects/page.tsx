"use client"

import * as React from "react"
import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Plus } from "lucide-react"
import { ProjectFiltersBar } from "./_components/project-filters-bar"
import { ProjectTable } from "./_components/project-table"
import { ProjectCardGrid } from "./_components/project-card-grid"
import { EmptyState } from "@/components/empty-state"
import { FolderPlus } from "lucide-react"
import { mockProjects } from "./_components/mock-projects"

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')

  return (
    <div className="flex flex-col min-h-screen bg-background/50">
      <div className="py-4 md:py-6 flex flex-col w-full mx-auto max-w-[1600px] h-full">
        <PageHeader
          title="Projects"
          description="Manage your product builds, freelance work, and learning missions."
          primaryAction={{ label: "New Project", icon: <Plus className="size-4" /> }}
        />
        
        <div className="mt-8 flex-1 flex flex-col">
          {mockProjects.length > 0 ? (
            <>
              <ProjectFiltersBar viewMode={viewMode} setViewMode={setViewMode} />
              <div className="flex-1 w-full relative">
                {viewMode === 'table' ? (
                  <ProjectTable projects={mockProjects} />
                ) : (
                  <ProjectCardGrid projects={mockProjects} />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center pt-12">
              <div className="max-w-md w-full">
                <EmptyState
                  icon={FolderPlus}
                  title="No projects yet"
                  description="Projects are where your ideas, freelance work, and learning missions live."
                  action={
                    <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold text-sm">
                       <Plus className="w-4 h-4" /> Create first project
                    </button>
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
