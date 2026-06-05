"use client"

import * as React from "react"
import { ProjectDetailHeader } from "./_components/project-detail-header"
import { ProjectSummaryCards } from "./_components/project-summary-cards"
import { ProjectTabs } from "./_components/project-tabs"
import { mockProjects } from "../_components/mock-projects"
import { EmptyState } from "@/components/empty-state"
import { FolderX, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  // Unwrap parameters via React.use for Next.js 15+ App Router compliance
  const resolvedParams = React.use(params)
  const projectId = resolvedParams.projectId
  
  const project = mockProjects.find(p => p.id === projectId)

  if (!project) {
    return (
      <div className="flex flex-col min-h-screen bg-background/50 p-4 md:p-8">
        <Link href="/projects" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit font-medium mb-8">
           <ArrowLeft className="w-4 h-4" /> Back to projects
        </Link>
        <EmptyState 
           icon={FolderX} 
           title="Project not found" 
           description="This project does not exist or you do not have access." 
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background/50">
      <div className="p-4 md:p-6 lg:p-8 flex flex-col w-full mx-auto max-w-[1600px]">
        <ProjectDetailHeader project={project} />
        <ProjectSummaryCards project={project} />
        <ProjectTabs project={project} />
      </div>
    </div>
  )
}
