"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 md:p-8">
      <div className="flex w-full max-w-sm flex-col gap-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <Zap className="size-6 fill-primary-foreground" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Ideoryx</h1>
          <p className="text-sm text-muted-foreground font-medium">Log in to access your operating OS.</p>
        </div>
        <Button asChild className="h-12 md:h-11 w-full font-bold shadow-md">
          <Link href="/today">Enter Ideoryx</Link>
        </Button>
      </div>
    </div>
  )
}
