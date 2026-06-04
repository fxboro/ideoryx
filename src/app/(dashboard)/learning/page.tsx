"use client"

import * as React from "react"
import { PageHeader } from "@/components/page-header"
import { WeakSpotsCard } from "./_components/weak-spots-card"
import { StudySprintCard } from "./_components/study-sprint-card"
import { RecommendedTopics } from "./_components/recommended-topics"
import { LearningItemsList } from "./_components/learning-items-list"
import {
  mockWeakSpots,
  mockStudySprint,
  mockRecommendedTopics,
  mockLearningItems,
} from "./_components/mock-learning"

export default function LearningPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background/50">
      <PageHeader
        title="Learning Hub"
        description="Turn real work into deliberate improvement. Track weak spots, run sprints, and level up."
      />
      <div className="py-4 md:py-6 flex flex-col gap-6 max-w-[1600px] w-full mx-auto">
        {/* Sprint & Weak Spots */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StudySprintCard sprint={mockStudySprint} />
          <WeakSpotsCard weakSpots={mockWeakSpots} />
        </div>

        {/* Recommended */}
        <RecommendedTopics topics={mockRecommendedTopics} />

        {/* Learning Items */}
        <div>
          <h2 className="text-base md:text-lg font-bold tracking-tight mb-4">All Learning Items</h2>
          <LearningItemsList items={mockLearningItems} />
        </div>
      </div>
    </div>
  )
}
