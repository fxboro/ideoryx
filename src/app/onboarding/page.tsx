"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/progress-bar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Zap, ArrowLeft, ArrowRight, Check, User, Target, Code, Clock, Briefcase, Loader2 } from "lucide-react"

const STEPS = [
  { id: 1, label: "Identity", icon: User },
  { id: 2, label: "Mission", icon: Target },
  { id: 3, label: "Stack", icon: Code },
  { id: 4, label: "Capacity", icon: Clock },
  { id: 5, label: "Review", icon: Check },
]

const techOptions = [
  "Next.js", "React", "TypeScript", "JavaScript", "Tailwind CSS", "Firebase",
  "Supabase", "PostgreSQL", "MongoDB", "Node.js", "Python", "Go",
  "Prisma", "Drizzle", "Zod", "tRPC", "GraphQL", "REST",
  "Docker", "AWS", "Vercel", "shadcn/ui",
]

const businessOptions = [
  "Web Applications", "SaaS Products", "Mobile Apps", "E-Commerce",
  "Client Portals", "Internal Tools", "API Development", "Consulting",
]

const growthOptions = [
  "AI/ML Integration", "System Design", "DevOps", "Technical Writing",
  "Product Management", "UX Design", "Performance Optimization", "Security",
]

export default function OnboardingPage() {
  const [step, setStep] = React.useState(1)
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [mode, setMode] = React.useState<string>("builder")
  const [mission, setMission] = React.useState("")
  const [selectedStack, setSelectedStack] = React.useState<string[]>([])
  const [capacity, setCapacity] = React.useState(40)
  const [businessFocus, setBusinessFocus] = React.useState<string[]>([])
  const [growthFocus, setGrowthFocus] = React.useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const router = useRouter()

  async function handleFinishOnboarding() {
    setIsSubmitting(true)
    try {
      await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "Founder",
          email,
          primaryMode: mode,
          missionStatement: mission,
          preferredStack: selectedStack,
          weeklyCapacity: capacity,
          businessFocus,
          growthFocus,
          onboardingCompleted: true,
        }),
      })
    } catch (err) {
      console.warn("Failed to persist profile:", err)
    } finally {
      router.push("/today")
    }
  }

  function toggleItem(arr: string[], item: string, setter: (v: string[]) => void) {
    if (arr.includes(item)) {
      setter(arr.filter((i) => i !== item))
    } else {
      setter([...arr, item])
    }
  }

  const progress = (step / STEPS.length) * 100

  return (
    <div className="flex min-h-screen flex-col bg-background items-center justify-center p-4 md:p-8">
      <div className="max-w-xl w-full flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center animate-in fade-in duration-700">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Zap className="size-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">Ideoryx</span>
        </div>

        {/* Step Indicator */}
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between">
            {STEPS.map((s) => {
              const StepIcon = s.icon
              const isActive = s.id === step
              const isComplete = s.id < step
              return (
                <div key={s.id} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className={`flex items-center justify-center size-8 sm:size-10 rounded-full border-2 transition-all ${
                    isComplete ? "bg-primary border-primary text-primary-foreground" :
                    isActive ? "border-primary text-primary bg-primary/10 animate-pulse" :
                    "border-border text-muted-foreground"
                  }`}>
                    {isComplete ? <Check className="size-3.5 sm:size-4" /> : <StepIcon className="size-3.5 sm:size-4" />}
                  </div>
                  <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? "text-primary block"
                      : isComplete
                        ? "text-foreground hidden sm:block"
                        : "text-muted-foreground hidden sm:block"
                  }`}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
          <ProgressBar value={progress} showPercentage={false} size="sm" />
        </div>

        {/* Step Content */}
        <div className="p-4 sm:p-6 md:p-8 border rounded-2xl bg-card shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Step 1: Identity */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight mb-1">Welcome aboard! 🚀</h2>
                <p className="text-sm text-muted-foreground">Let&apos;s set up your identity. This helps your AI agents personalize their output.</p>
              </div>
              <div>
                <label className="text-sm font-bold mb-1.5 block">Your Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  placeholder="e.g. Alex"
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  placeholder="alex@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1.5 block">Primary Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  {["builder", "founder", "freelance", "hybrid"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`p-3 rounded-lg border text-sm font-bold capitalize transition-all ${
                        mode === m
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Mission */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight mb-1">Define your mission</h2>
                <p className="text-sm text-muted-foreground">What are you trying to achieve? This becomes your north-star context for all agent workflows.</p>
              </div>
              <div>
                <label className="text-sm font-bold mb-1.5 block">Mission Statement</label>
                <textarea
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  className="w-full h-32 bg-background border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all leading-relaxed"
                  placeholder="e.g. Build a portfolio of micro-SaaS products and establish a high-value freelance practice..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Stack */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight mb-1">Your tech stack</h2>
                <p className="text-sm text-muted-foreground">Select the technologies you work with. Agents will prioritize these in recommendations.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {techOptions.map((tech) => (
                  <button
                    key={tech}
                    onClick={() => toggleItem(selectedStack, tech, setSelectedStack)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      selectedStack.includes(tech)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
              {selectedStack.length > 0 && (
                <p className="text-xs text-muted-foreground">{selectedStack.length} selected</p>
              )}
            </div>
          )}

          {/* Step 4: Capacity & Focus */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight mb-1">Capacity & Focus</h2>
                <p className="text-sm text-muted-foreground">Configure your weekly availability and areas of focus.</p>
              </div>
              <div>
                <label className="text-sm font-bold mb-1.5 block">Weekly Capacity</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-24 bg-background border border-border rounded-lg p-2.5 text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                  <span className="text-sm text-muted-foreground font-medium">hours / week</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold mb-2 block">Business Focus</label>
                <div className="flex flex-wrap gap-2">
                  {businessOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => toggleItem(businessFocus, opt, setBusinessFocus)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        businessFocus.includes(opt)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-transparent text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold mb-2 block">Growth Focus</label>
                <div className="flex flex-wrap gap-2">
                  {growthOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => toggleItem(growthFocus, opt, setGrowthFocus)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        growthFocus.includes(opt)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-transparent text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight mb-1">Ready to launch! 🎯</h2>
                <p className="text-sm text-muted-foreground">Review your setup and enter your dashboard.</p>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</span>
                    <span className="text-sm font-bold">{name || "—"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mode</span>
                    <span className="text-sm font-bold capitalize">{mode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Capacity</span>
                    <span className="text-sm font-bold">{capacity}h/week</span>
                  </div>
                </div>
                {mission && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Mission</span>
                    <p className="text-sm text-foreground/80 leading-relaxed">{mission}</p>
                  </div>
                )}
                {selectedStack.length > 0 && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Stack</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStack.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs font-bold">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {businessFocus.length > 0 && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Business Focus</span>
                    <div className="flex flex-wrap gap-1.5">
                      {businessFocus.map((f) => (
                        <Badge key={f} variant="outline" className="text-xs font-bold">{f}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          {step === 1 ? (
            <Link href="/today" className="text-sm text-muted-foreground font-medium hover:text-foreground transition-colors text-center py-2.5">
              Skip for now
            </Link>
          ) : (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="w-full sm:w-auto font-bold gap-1.5 h-11">
              <ArrowLeft className="size-3.5" /> Back
            </Button>
          )}
          {step < 5 ? (
            <Button onClick={() => setStep((s) => s + 1)} className="w-full sm:w-auto font-bold gap-1.5 h-11">
              Next <ArrowRight className="size-3.5" />
            </Button>
          ) : (
            <Button
              onClick={handleFinishOnboarding}
              disabled={isSubmitting}
              className="w-full sm:w-auto font-bold gap-1.5 h-11 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Zap className="size-3.5" />
              )}
              Launch Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
