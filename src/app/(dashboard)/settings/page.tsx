"use client"

import * as React from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  User, Target, Code, Clock, Briefcase, TrendingUp, Puzzle, Bot,
  Save, Check, Plug, ToggleLeft, ToggleRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { mockUserSettings, mockIntegrations, mockAgentPreferences } from "./_components/mock-settings"

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "mission", label: "Mission", icon: Target },
  { id: "stack", label: "Preferred Stack", icon: Code },
  { id: "capacity", label: "Weekly Capacity", icon: Clock },
  { id: "business", label: "Business Focus", icon: Briefcase },
  { id: "growth", label: "Growth Focus", icon: TrendingUp },
  { id: "integrations", label: "Integrations", icon: Puzzle },
  { id: "agents", label: "Agent Preferences", icon: Bot },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = React.useState("profile")
  const [saved, setSaved] = React.useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background/50">
      <PageHeader
        title="Settings"
        description="Configure identity memory, preferences, and operating rules."
      />
      <div className="py-4 md:py-6 flex flex-col lg:flex-row gap-8 max-w-[1200px] w-full mx-auto">
        {/* Left Nav */}
        <nav className="lg:w-56 shrink-0">
          <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {sections.map((s) => {
              const Icon = s.icon
              const isActive = activeSection === s.id
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setActiveSection(s.id)}
                    className={`flex items-center gap-2.5 px-3 py-3 lg:py-2.5 rounded-lg text-sm font-medium w-full transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    {s.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Profile */}
            {activeSection === "profile" && (
              <div className="p-4 md:p-6 space-y-5">
                <div>
                  <h3 className="text-base font-bold mb-1">Profile</h3>
                  <p className="text-xs text-muted-foreground">Your identity information.</p>
                </div>
                <div>
                  <label className="text-sm font-bold mb-1.5 block">Name</label>
                  <input className="w-full bg-background border border-border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" defaultValue={mockUserSettings.name} />
                </div>
                <div>
                  <label className="text-sm font-bold mb-1.5 block">Email</label>
                  <input className="w-full bg-background border border-border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" defaultValue={mockUserSettings.email} />
                </div>
                <div>
                  <label className="text-sm font-bold mb-1.5 block">Primary Mode</label>
                  <select className="w-full bg-background border border-border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" defaultValue={mockUserSettings.primaryMode}>
                    <option value="builder">Builder</option>
                    <option value="founder">Founder</option>
                    <option value="freelance">Freelancer</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
            )}

            {/* Mission */}
            {activeSection === "mission" && (
              <div className="p-4 md:p-6 space-y-5">
                <div>
                  <h3 className="text-base font-bold mb-1">Mission Statement</h3>
                  <p className="text-xs text-muted-foreground">Define the objective your AI agents will hold as context.</p>
                </div>
                <textarea className="w-full min-h-[140px] bg-background border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all leading-relaxed" defaultValue={mockUserSettings.missionStatement} />
              </div>
            )}

            {/* Preferred Stack */}
            {activeSection === "stack" && (
              <div className="p-4 md:p-6 space-y-5">
                <div>
                  <h3 className="text-base font-bold mb-1">Preferred Stack</h3>
                  <p className="text-xs text-muted-foreground">Technologies your agents will prioritize in recommendations.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mockUserSettings.preferredStack?.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs font-bold px-3 py-1.5 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors group">
                      {tech}
                      <span className="ml-1.5 text-muted-foreground group-hover:text-destructive">×</span>
                    </Badge>
                  ))}
                </div>
                <input className="w-full bg-background border border-border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" placeholder="Add a technology..." />
              </div>
            )}

            {/* Weekly Capacity */}
            {activeSection === "capacity" && (
              <div className="p-4 md:p-6 space-y-5">
                <div>
                  <h3 className="text-base font-bold mb-1">Weekly Capacity</h3>
                  <p className="text-xs text-muted-foreground">How many hours per week are available for work?</p>
                </div>
                <div className="flex items-center gap-3">
                  <input type="number" className="w-24 bg-background border border-border rounded-lg p-2.5 text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" defaultValue={mockUserSettings.weeklyCapacity} />
                  <span className="text-sm text-muted-foreground font-medium">hours / week</span>
                </div>
              </div>
            )}

            {/* Business Focus */}
            {activeSection === "business" && (
              <div className="p-4 md:p-6 space-y-5">
                <div>
                  <h3 className="text-base font-bold mb-1">Business Focus</h3>
                  <p className="text-xs text-muted-foreground">What types of work are you focusing on?</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mockUserSettings.businessFocus?.map((focus) => (
                    <Badge key={focus} variant="secondary" className="text-xs font-bold px-3 py-1.5 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors group">
                      {focus}
                      <span className="ml-1.5 text-muted-foreground group-hover:text-destructive">×</span>
                    </Badge>
                  ))}
                </div>
                <input className="w-full bg-background border border-border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" placeholder="Add a focus area..." />
              </div>
            )}

            {/* Growth Focus */}
            {activeSection === "growth" && (
              <div className="p-4 md:p-6 space-y-5">
                <div>
                  <h3 className="text-base font-bold mb-1">Growth Focus</h3>
                  <p className="text-xs text-muted-foreground">Skills and areas you want to develop.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mockUserSettings.growthFocus?.map((area) => (
                    <Badge key={area} variant="secondary" className="text-xs font-bold px-3 py-1.5 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors group">
                      {area}
                      <span className="ml-1.5 text-muted-foreground group-hover:text-destructive">×</span>
                    </Badge>
                  ))}
                </div>
                <input className="w-full bg-background border border-border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" placeholder="Add a growth area..." />
              </div>
            )}

            {/* Integrations */}
            {activeSection === "integrations" && (
              <div className="p-4 md:p-6 space-y-5">
                <div>
                  <h3 className="text-base font-bold mb-1">Integrations</h3>
                  <p className="text-xs text-muted-foreground">Connect external tools and services.</p>
                </div>
                <div className="space-y-3">
                  {mockIntegrations.map((int) => (
                    <div key={int.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-9 rounded-lg bg-muted">
                          <Plug className="size-4 text-muted-foreground" />
                        </div>
                        <div>
                          <span className="text-sm font-bold">{int.name}</span>
                          <p className="text-xs text-muted-foreground">{int.description}</p>
                        </div>
                      </div>
                      <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        int.connected
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-muted text-muted-foreground border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                      }`}>
                        {int.connected ? (
                          <><Check className="size-3" /> Connected</>
                        ) : (
                          "Connect"
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agent Preferences */}
            {activeSection === "agents" && (
              <div className="p-4 md:p-6 space-y-5">
                <div>
                  <h3 className="text-base font-bold mb-1">Agent Preferences</h3>
                  <p className="text-xs text-muted-foreground">Configure behavior for each AI agent role.</p>
                </div>
                <div className="space-y-3">
                  {mockAgentPreferences.map((pref) => (
                    <div key={pref.agentRole} className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center size-9 rounded-lg ${pref.enabled ? "bg-primary/10" : "bg-muted"}`}>
                          <Bot className={`size-4 ${pref.enabled ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <span className="text-sm font-bold capitalize">{pref.agentRole}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{pref.verbosity}</span>
                            {pref.autoRun && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">Auto-run</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button className="text-muted-foreground hover:text-foreground transition-colors">
                        {pref.enabled ? (
                          <ToggleRight className="size-6 text-primary" />
                        ) : (
                          <ToggleLeft className="size-6" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Footer */}
            <div className="p-4 md:p-5 border-t border-border bg-muted/10 flex justify-end">
              <Button onClick={handleSave} className="w-full sm:w-auto font-bold gap-1.5">
                {saved ? <Check className="size-4" /> : <Save className="size-4" />}
                {saved ? "Saved!" : "Save Preferences"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
