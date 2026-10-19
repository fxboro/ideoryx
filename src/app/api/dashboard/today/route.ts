import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/api-auth";
import {
  userService,
  workspaceService,
  taskService,
  signalService,
  decisionService,
  leadService,
  proposalService,
  agentRunService,
} from "@/lib/services";
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
} from "@/app/(dashboard)/today/_components/mock-data";

function formatRelativeTime(dateInput: any): string {
  if (!dateInput) return "Recently";
  const timestamp = typeof dateInput === "number" ? dateInput : new Date(dateInput).getTime();
  if (isNaN(timestamp)) return String(dateInput);
  
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 2) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthUserId(req);
    const userId = typeof authResult === "string" ? authResult : null;

    if (!userId) {
      // In preview or unauthenticated mode, return the default starter layout
      return NextResponse.json({
        success: true,
        data: {
          user: mockUser,
          priorities: mockPriorities,
          suggestedAction: mockSuggestedAction,
          activeProjects: mockActiveProjects,
          blockers: mockBlockers,
          goals: mockGoals,
          decisions: mockDecisions,
          learning: mockLearning,
          freelance: mockFreelance,
          agentRuns: mockAgentRuns,
          isLive: false,
        },
      });
    }

    // Authenticated user: fetch live aggregated records in parallel
    const [
      profile,
      workspaces,
      userTasks,
      userSignals,
      userDecisions,
      openLeads,
      proposals,
      agentRuns,
    ] = await Promise.all([
      userService.getByUid(userId).catch(() => null),
      workspaceService.listWorkspacesByUser(userId).catch(() => []),
      taskService.listByUser(userId).catch(() => []),
      signalService.listSignalsByUser(userId).catch(() => []),
      decisionService.getRecentDecisions(userId, 6).catch(() => []),
      leadService.getOpenLeads(userId).catch(() => []),
      proposalService.listByUser(userId).catch(() => []),
      agentRunService.getRecentAgentRuns(userId, 5).catch(() => []),
    ]);

    // 1. User Header Details
    const name = profile?.name || (profile as any)?.displayName || profile?.email?.split("@")[0] || "Builder";
    const mission = profile?.missionStatement || (profile as any)?.mission || mockUser.mission;
    const weeklyFocus = (profile as any)?.weeklyFocus || (profile as any)?.focus || mockUser.weeklyFocus;

    // 2. Workspaces mapped to Active Projects
    const activeProjects = workspaces.length > 0
      ? workspaces.slice(0, 4).map((w: any) => ({
          id: w.id,
          name: w.name,
          phase: (w.stage || "build") as any,
          health: w.health || (w.readinessScore && w.readinessScore > 70 ? "on-track" : "at-risk"),
          tasks: (w.checklist || []).filter((c: any) => !c.completed).length,
          readinessScore: w.readinessScore || 0,
        }))
      : mockActiveProjects;

    // 3. Priorities (Tasks prioritized by urgency or latest open)
    const openTasks = userTasks.filter((t: any) => t.status !== "done" && t.status !== "completed");
    const priorities = openTasks.length > 0
      ? openTasks.slice(0, 3).map((t: any, idx: number) => {
          const matchedWorkspace = workspaces.find((w: any) => w.id === t.workspaceId || w.id === t.projectId);
          return {
            id: t.id || `task-${idx}`,
            title: t.title,
            project: matchedWorkspace?.name || t.project || "Mission Control",
            priority: (t.priority || "medium") as any,
          };
        })
      : mockPriorities;

    // 4. Blockers: signals with severity high/critical or tasks with status 'blocked'
    const highRiskSignals = userSignals.filter(
      (s: any) => (s.severity === "high" || s.severity === "critical") && s.status !== "resolved"
    );
    const blockedTasks = userTasks.filter((t: any) => t.status === "blocked");

    const blockers = [
      ...highRiskSignals.map((s: any) => {
        const ws = workspaces.find((w: any) => w.id === s.workspaceId);
        return {
          id: s.id,
          title: s.title || s.summary || "High severity signal",
          project: ws?.name || "System Alert",
          status: "blocked" as const,
        };
      }),
      ...blockedTasks.map((t: any) => {
        const ws = workspaces.find((w: any) => w.id === t.workspaceId || w.id === t.projectId);
        return {
          id: t.id,
          title: t.title,
          project: ws?.name || "Task Blocked",
          status: "blocked" as const,
        };
      }),
    ];

    const displayBlockers = blockers.length > 0 ? blockers.slice(0, 4) : mockBlockers;

    // 5. Recent Decisions
    const decisions = userDecisions.length > 0
      ? userDecisions.slice(0, 5).map((d: any) => ({
          id: d.id,
          title: d.title || d.rationale || "Decision logged",
          date: formatRelativeTime(d.createdAt),
        }))
      : mockDecisions;

    // 6. Freelance Stats
    const freelance = {
      newLeads: openLeads.filter((l: any) => l.status === "new").length || mockFreelance.newLeads,
      activeProposals: proposals.filter((p: any) => p.status === "sent" || p.status === "draft").length || mockFreelance.activeProposals,
      followUps: openLeads.filter((l: any) => l.status === "qualified" || l.status === "follow_up").length || mockFreelance.followUps,
    };

    // 7. Recent Agent Runs
    const displayAgentRuns = agentRuns.length > 0
      ? agentRuns.slice(0, 5).map((r: any) => ({
          id: r.id,
          agent: r.agentType ? r.agentType.charAt(0).toUpperCase() + r.agentType.slice(1) : "AI",
          workflow: r.workflowId ? r.workflowId.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) : "Workflow Run",
          time: formatRelativeTime(r.createdAt),
          status: r.status || "completed",
        }))
      : mockAgentRuns;

    // 8. Goals derived from workspaces or user goals
    const goals = workspaces.length > 0
      ? workspaces.slice(0, 3).map((w: any) => ({
          id: w.id,
          title: `Launch ${w.name}`,
          progress: Math.min(100, Math.max(10, w.readinessScore || 25)),
        }))
      : mockGoals;

    // 9. Suggested Action
    const suggestedAction = workspaces.length > 0
      ? {
          workflow: `${workspaces[0].name} Stage Transition`,
          context: `Workspace is in ${workspaces[0].stage || 'validation'} stage. Current readiness: ${workspaces[0].readinessScore || 0}%.`,
          buttonLabel: "Run Stage Review",
        }
      : mockSuggestedAction;

    return NextResponse.json({
      success: true,
      data: {
        user: { name, mission, weeklyFocus },
        priorities,
        suggestedAction,
        activeProjects,
        blockers: displayBlockers,
        goals,
        decisions,
        learning: mockLearning,
        freelance,
        agentRuns: displayAgentRuns,
        isLive: true,
      },
    });
  } catch (error) {
    console.error("Dashboard Today API Error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data", success: false, data: null },
      { status: 500 }
    );
  }
}
