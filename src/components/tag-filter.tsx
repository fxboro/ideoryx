"use client"

import * as React from "react"

interface TagFilterProps {
  tags: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  className?: string
}

export function TagFilter({ tags, selected, onChange, className }: TagFilterProps) {
  const isAllSelected = selected.length === 0

  function toggle(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag))
    } else {
      onChange([...selected, tag])
    }
  }

  return (
    <div className={`flex items-center gap-2 overflow-x-auto md:overflow-x-visible md:flex-wrap scroll-hidden pb-1 md:pb-0 ${className}`}>
      <button
        onClick={() => onChange([])}
        className={`px-3 py-2 md:py-1.5 rounded-full text-xs font-bold tracking-wide transition-all border whitespace-nowrap shrink-0 ${
          isAllSelected
            ? "bg-primary text-primary-foreground border-primary shadow-sm"
            : "bg-transparent text-muted-foreground border-border hover:bg-muted hover:text-foreground"
        }`}
      >
        All
      </button>
      {tags.map((tag) => {
        const isActive = selected.includes(tag)
        return (
          <button
            key={tag}
            onClick={() => toggle(tag)}
            className={`px-3 py-2 md:py-1.5 rounded-full text-xs font-bold tracking-wide transition-all border capitalize whitespace-nowrap shrink-0 ${
              isActive
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-transparent text-muted-foreground border-border hover:bg-muted hover:text-foreground"
            }`}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}
