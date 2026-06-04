"use client"

import * as React from "react"
import { PageHeader } from "@/components/page-header"
import { Plus } from "lucide-react"
import { PlaybookCard } from "./_components/playbook-card"
import { PlaybookFilters } from "./_components/playbook-filters"
import { mockPlaybooks } from "./_components/mock-playbooks"

export default function PlaybooksPage() {
  const [search, setSearch] = React.useState("")
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])

  const filtered = mockPlaybooks.filter((pb) => {
    const matchesSearch =
      search === "" ||
      pb.title.toLowerCase().includes(search.toLowerCase()) ||
      pb.summary.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(pb.category)

    const matchesTags =
      selectedTags.length === 0 || selectedTags.some((t) => pb.tags.includes(t))

    return matchesSearch && matchesCategory && matchesTags
  })

  return (
    <div className="flex flex-col min-h-screen bg-background/50">
      <PageHeader
        title="Playbooks"
        description="Store and rerun your best repeatable workflows."
        primaryAction={{ label: "New Playbook", icon: <Plus className="size-4" /> }}
      />
      <div className="py-4 md:py-6 flex flex-col gap-6 max-w-[1600px] w-full mx-auto">
        <PlaybookFilters
          search={search}
          onSearchChange={setSearch}
          selectedCategories={selectedCategories}
          onCategoriesChange={setSelectedCategories}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
        />

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((pb) => (
              <PlaybookCard key={pb.id} playbook={pb} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm font-medium text-muted-foreground">No playbooks match your filters.</p>
            <button
              onClick={() => {
                setSearch("")
                setSelectedCategories([])
                setSelectedTags([])
              }}
              className="text-xs font-bold text-primary mt-2 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
