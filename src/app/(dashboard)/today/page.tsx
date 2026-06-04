"use client"

import * as React from "react"
import { WelcomeHeader } from "./_components/welcome-header"
import { TopPrioritiesCard } from "./_components/top-priorities-card"
import { SuggestedActionCard } from "./_components/suggested-action-card"
import { ActiveProjectsPanel } from "./_components/active-projects-panel"
import { BlockersPanel } from "./_components/blockers-panel"
import { GoalsProgressPanel } from "./_components/goals-progress-panel"
import { RecentDecisionsPanel } from "./_components/recent-decisions-panel"
import { LearningFocusPanel } from "./_components/learning-focus-panel"
import { FreelanceSnapshotPanel } from "./_components/freelance-snapshot-panel"
import { RecentAgentRunsPanel } from "./_components/recent-agent-runs-panel"

import {
  mockUser,
  mockPriorities,
  mockSuggestedAction,
  mockActiveProjects,
  mockBlockers,
  mockGoals,
  mockDecisions,
  mockLearning,
  mockFreelance,
  mockAgentRuns,
} from "./_components/mock-data"

export default function TodayPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background/50">
      <div className="py-4 md:py-6 flex flex-col gap-4 md:gap-6 max-w-[1600px] w-full mx-auto">
        
        {/* Header Section */}
        <WelcomeHeader 
          name={mockUser.name}
          mission={mockUser.mission}
          weeklyFocus={mockUser.weeklyFocus}
        />

        {/* Priority & Action Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          <div className="lg:col-span-3">
             <TopPrioritiesCard items={mockPriorities} />
          </div>
          <div className="lg:col-span-2">
             <SuggestedActionCard {...mockSuggestedAction} />
          </div>
        </div>

        {/* Projects & Blockers Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
           <ActiveProjectsPanel projects={mockActiveProjects} />
           <BlockersPanel blockers={mockBlockers} />
        </div>

        {/* Goals & Decisions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
           <GoalsProgressPanel goals={mockGoals} />
           <RecentDecisionsPanel decisions={mockDecisions} />
        </div>

        {/* Learning & Freelance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
           <LearningFocusPanel learning={mockLearning} />
           <FreelanceSnapshotPanel freelance={mockFreelance} />
        </div>

        {/* Full Width Footer Section */}
        <div className="mb-8">
           <RecentAgentRunsPanel runs={mockAgentRuns} />
        </div>

      </div>
    </div>
  )
}
