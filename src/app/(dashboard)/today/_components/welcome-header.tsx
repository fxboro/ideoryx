"use client"

import * as React from "react"
import { Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface WelcomeHeaderProps {
  name: string
  mission: string
  weeklyFocus: string
}

export function WelcomeHeader({ name, mission, weeklyFocus }: WelcomeHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-between items-start md:items-center bg-card p-4 md:p-6 border rounded-xl shadow-sm">
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">Good morning, {name}.</h1>
        <div className="flex flex-col text-xs md:text-sm text-muted-foreground gap-1.5 mt-1">
          <p className="line-clamp-2 md:line-clamp-none"><strong className="text-foreground">Mission:</strong> {mission}</p>
          <p className="text-primary/80 font-medium pb-0.5 border-b border-primary/20 w-fit">
            Focus this week: {weeklyFocus}
          </p>
        </div>
      </div>
      <Button size="lg" className="h-11 md:h-12 px-5 md:px-6 gap-2 w-full md:w-auto shrink-0 shadow-md transition-all active:scale-95 group" asChild>
        <Link href="/agents?agent=execution&workflow=weekly_review">
          <Zap className="size-5 fill-primary-foreground group-hover:scale-110 transition-transform" />
          <span className="font-bold">Weekly Review</span>
        </Link>
      </Button>
    </div>
  )
}
