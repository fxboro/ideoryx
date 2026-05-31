import type { AgentRole } from "@/types";
import type { SaveAction } from "@/lib/agents/types";

// ─── Agent Type & Workflow Type ─────────────────────────────────────────────

export type AgentType =
  | "founder"
  | "architect"
  | "builder"
  | "execution"
  | "freelance"
  | "validation"
  | "launch"
  | "delivery"
  | "improvement"
  | "signal_analyst";

export type WorkflowType =
  | "idea_to_mvp"
  | "competitive_analysis"
  | "pivot_evaluation"
  | "mvp_to_technical_plan"
  | "system_design"
  | "database_schema"
  | "implementation_plan"
  | "code_review_prep"
  | "sprint_breakdown"
  | "weekly_review"
  | "lead_to_proposal"
  | "discovery_prep"
  | "validate_idea"
  | "launch_prep"
  | "delivery_update"
  | "optimize_product"
  | "analyze_signals";

export interface AgentOption {
  id: AgentType;
  name: string;
  role: AgentRole;
  description: string;
  icon: string; // emoji for quick identification
  workflows: WorkflowOption[];
}

export interface WorkflowOption {
  id: WorkflowType;
  name: string;
  description: string;
}

// ─── Structured Output Types ────────────────────────────────────────────────

export interface OutputSection {
  id: string;
  title: string;
  content: string;
  type: "text" | "list" | "table" | "code";
  items?: string[];
}

export interface AgentRunOutput {
  agentType: AgentType;
  workflowName: string;
  timestamp: number;
  sections: OutputSection[];
  nextBestAction: {
    title: string;
    description: string;
    actionLabel: string;
  };
  saveActions: SaveAction[];
}

// ─── Agent Definitions ──────────────────────────────────────────────────────

export const agentOptions: AgentOption[] = [
  {
    id: "freelance",
    name: "Freelance Agent",
    role: "freelance",
    description: "Lead management and proposal generation",
    icon: "💼",
    workflows: [
      {
        id: "lead_to_proposal",
        name: "Draft Proposal",
        description: "Turn a lead and notes into a clear draft proposal.",
      },
      {
        id: "discovery_prep",
        name: "Discovery Prep",
        description: "Prepare for a client discovery call by researching their domain and organizing interview questions.",
      }
    ]
  },
  {
    id: "execution",
    name: "Execution Agent",
    role: "execution",
    description: "Productivity, reviews, and execution strategizing",
    icon: "📈",
    workflows: [
      {
        id: "weekly_review",
        name: "Weekly Review",
        description: "Review recent tasks, blockers, and decisions to plan out the next week in focus areas.",
      }
    ],
  },
  {
    id: "founder",
    name: "Founder Agent",
    role: "founder",
    description: "Strategy, validation, and product scoping",
    icon: "🧭",
    workflows: [
      {
        id: "idea_to_mvp",
        name: "Idea to MVP Spec",
        description: "Turn a raw idea into a structured MVP specification with scope, user stories, and constraints",
      },
      {
        id: "competitive_analysis",
        name: "Competitive Analysis",
        description: "Analyze the competitive landscape and identify positioning opportunities",
      },
      {
        id: "pivot_evaluation",
        name: "Pivot Evaluation",
        description: "Evaluate whether a product pivot makes strategic sense given current data",
      },
    ],
  },
  {
    id: "architect",
    name: "Architect Agent",
    role: "architect",
    description: "System design, schemas, and technical planning",
    icon: "🏗️",
    workflows: [
      {
        id: "mvp_to_technical_plan",
        name: "MVP to Technical Plan",
        description: "Convert an MVP spec into an architecture plan with stack decisions and module breakdown",
      },
      {
        id: "system_design",
        name: "System Design Review",
        description: "Evaluate and improve the architecture of an existing system or module",
      },
      {
        id: "database_schema",
        name: "Database Schema Design",
        description: "Design Firestore collections, indexes, and security rules for a feature set",
      },
    ],
  },
  {
    id: "builder",
    name: "Builder Agent",
    role: "builder",
    description: "Implementation planning, code scaffolding, and sprint execution",
    icon: "⚡",
    workflows: [
      {
        id: "implementation_plan",
        name: "Implementation Plan",
        description: "Break down a feature into ordered implementation tasks with file paths and dependencies",
      },
      {
        id: "code_review_prep",
        name: "Code Review Prep",
        description: "Generate a pre-flight checklist and potential issues before submitting code",
      },
      {
        id: "sprint_breakdown",
        name: "Sprint Breakdown",
        description: "Take a milestone and break it into a week-sized sprint with clear daily targets",
      },
    ],
  },
  {
    id: "validation",
    name: "Validation Agent",
    role: "founder",
    description: "Market validation, persona mapping, and fit checks",
    icon: "🔍",
    workflows: [
      {
        id: "validate_idea",
        name: "Validate Product Idea",
        description: "Analyze market positioning, target personas, and validation metrics.",
      }
    ]
  },
  {
    id: "launch",
    name: "Launch Agent",
    role: "builder",
    description: "Launch channel logistics and release preparation checklists",
    icon: "🚀",
    workflows: [
      {
        id: "launch_prep",
        name: "Product Launch Prep",
        description: "Generate pre-launch safety checklists and multi-channel launch checklists.",
      }
    ]
  },
  {
    id: "delivery",
    name: "Delivery Agent",
    role: "freelance",
    description: "Milestone status checks and client progress updates",
    icon: "📦",
    workflows: [
      {
        id: "delivery_update",
        name: "Client Delivery Update",
        description: "Generate client-friendly progress updates and document changes.",
      }
    ]
  },
  {
    id: "improvement",
    name: "Improvement Agent",
    role: "builder",
    description: "UX enhancements, performance audits, and refactoring candidates",
    icon: "🛠️",
    workflows: [
      {
        id: "optimize_product",
        name: "Identify Product Improvements",
        description: "Structure performance, cost, and quality candidate improvements.",
      }
    ]
  },
  {
    id: "signal_analyst",
    name: "Signal Analyst Agent",
    role: "execution",
    description: "Logs trace auditing and telemetry feed analysis",
    icon: "📊",
    workflows: [
      {
        id: "analyze_signals",
        name: "Analyze Telemetry Signals",
        description: "Scans active logs and recommends resolutions or conversion candidates.",
      }
    ]
  }
];

// ─── Mock Project Options (for linked project selector) ─────────────────────

export const mockProjectOptions = [
  { id: "p1", name: "Mission Control AI" },
  { id: "p2", name: "Client Wellness Portal" },
  { id: "p3", name: "Advanced Firebase Realtime" },
];

// ─── Mock Lead Options (for optional lead selector) ─────────────────────────

export const mockLeadOptions = [
  { id: "l1", name: "Acme Wellness Studio" },
  { id: "l2", name: "Podea Demo Lead" },
];

// ─── Mock Structured Outputs ────────────────────────────────────────────────

export const mockFounderOutput: AgentRunOutput = {
  agentType: "founder",
  workflowName: "Idea to MVP Spec",
  timestamp: Date.now(),
  sections: [
    {
      id: "goal",
      title: "Product Goal",
      type: "text",
      content:
        "Build a personal operating system that helps a solo technical founder manage projects, run AI workflows, track decisions, and develop skills — all from a single interface.",
    },
    {
      id: "target_user",
      title: "Target User",
      type: "text",
      content:
        "Solo developer–founder balancing product builds, freelance work, and continuous learning. Technical enough to use AI tooling but needs structure to avoid scattering effort.",
    },
    {
      id: "core_pain",
      title: "Core Pain Points",
      type: "list",
      content: "",
      items: [
        "Context scattered across Notion, spreadsheets, and memory",
        "No single place to run structured AI workflows and save outputs",
        "Decisions made informally and forgotten within weeks",
        "No way to connect learning goals to active project challenges",
        "Freelance pipeline tracked in head, leading to missed follow-ups",
      ],
    },
    {
      id: "mvp_scope",
      title: "MVP Scope — What's In",
      type: "list",
      content: "",
      items: [
        "Dashboard with daily priorities and suggested next actions",
        "Project management with phases, milestones, and task tracking",
        "Agent console for running role-based AI workflows",
        "Decision log with tradeoff tracking and review reminders",
        "Basic playbook system for saving reusable workflows",
        "Freelance lead pipeline with proposal generation",
      ],
    },
    {
      id: "mvp_out",
      title: "MVP Scope — What's Out",
      type: "list",
      content: "",
      items: [
        "Multi-user collaboration and team features",
        "Real-time AI model integration (mock outputs for V1)",
        "Mobile native app (responsive web only)",
        "Third-party integrations (GitHub, Slack, Calendar)",
        "Complex analytics or reporting dashboards",
      ],
    },
    {
      id: "constraints",
      title: "Constraints & Assumptions",
      type: "list",
      content: "",
      items: [
        "Single-user system — no auth complexity at V1",
        "Firebase as backend for fast iteration",
        "Next.js + Tailwind CSS for frontend",
        "Ship within 3 weeks of focused part-time work",
        "All AI outputs are mock data in V1, replaced with real APIs later",
      ],
    },
  ],
  nextBestAction: {
    title: "Run Architect Agent",
    description:
      "Now that the MVP spec is defined, convert it into a technical architecture plan with stack decisions, module breakdown, and database schema.",
    actionLabel: "Run Architect → MVP to Technical Plan",
  },
  saveActions: [
    {
      key: "create_project",
      label: "Create Project",
      collection: "projects",
      payload: {
        name: "Personal OS",
        type: "product",
        status: "active",
        summary: "Build a personal operating system that helps a solo technical founder manage projects...",
      }
    },
    {
      key: "task_1",
      label: "Create Task",
      collection: "tasks",
      payload: {
        title: "Setup Next.js & Tailwind project",
        type: "chore",
        status: "todo",
      }
    }
  ]
};

export const mockArchitectOutput: AgentRunOutput = {
  agentType: "architect",
  workflowName: "MVP to Technical Plan",
  timestamp: Date.now(),
  sections: [
    {
      id: "assumptions",
      title: "Technical Assumptions",
      type: "list",
      content: "",
      items: [
        "Single-user Firestore with userId field on all documents",
        "Server-side rendering via Next.js App Router with React Server Components",
        "Firebase Admin SDK for server-side operations, client SDK for auth only",
        "No external AI API calls in V1 — all agent outputs are mock JSON",
        "Deploy on Vercel with Firebase backend",
      ],
    },
    {
      id: "stack",
      title: "Chosen Stack",
      type: "list",
      content: "",
      items: [
        "Frontend: Next.js 15 + Tailwind CSS v4 + shadcn/ui",
        "Backend: Firebase Firestore (NoSQL) + Firebase Functions",
        "Auth: Firebase Authentication (email/password, Google SSO)",
        "Hosting: Vercel (Next.js) + Firebase (backend services)",
        "State: React state + URL params, no external state management",
      ],
    },
    {
      id: "modules",
      title: "Core Modules",
      type: "list",
      content: "",
      items: [
        "Dashboard Module — Today view with aggregated panels",
        "Projects Module — CRUD, detail tabs (roadmap, tasks, architecture)",
        "Agents Module — Agent console with selectors, output renderer, save actions",
        "Decisions Module — Log, detail drawer, filterable table",
        "Playbooks Module — Card grid, detail page, run integration",
        "Freelance Module — Lead pipeline, proposal viewer, service templates",
        "Learning Module — Weak spots, study sprints, project-linked learning",
        "Settings Module — Identity memory, preferences, integrations",
      ],
    },
    {
      id: "database",
      title: "Firestore Collection Design",
      type: "code",
      content: `users/{uid}
  └── profile, preferences, identity memory

projects/{projectId}           — userId indexed
tasks/{taskId}                 — projectId + userId indexed  
decisions/{decisionId}         — projectId + userId indexed
agentRuns/{runId}              — projectId + userId indexed
playbooks/{playbookId}         — userId indexed
leads/{leadId}                 — userId indexed
proposals/{proposalId}         — leadId + userId indexed
goals/{goalId}                 — userId indexed
memories/{memoryId}            — userId indexed
learningItems/{itemId}         — userId indexed`,
    },
    {
      id: "risks",
      title: "Technical Risks",
      type: "list",
      content: "",
      items: [
        "Firestore read costs could spike if dashboard over-queries — mitigate with server-side aggregation",
        "Mock-to-real agent transition may require output schema changes — define schemas early",
        "Single-user model may limit future monetisation — but keeps V1 shipping fast",
        "No offline support — acceptable for V1 desktop-first usage",
      ],
    },
  ],
  nextBestAction: {
    title: "Run Builder Agent",
    description:
      "Architecture is defined. Break the first milestone into a sprint with daily implementation targets.",
    actionLabel: "Run Builder → Sprint Breakdown",
  },
  saveActions: [
    {
      key: "save_decision_1",
      label: "Save Architecture Selection",
      collection: "decisions",
      payload: {
        title: "Use Firebase Next.js Stack",
        context: "Architecture planning",
        chosenOption: "Next.js 15 + Firebase",
        rationale: "Familiarity and fast time to market"
      }
    }
  ]
};

export const mockBuilderOutput: AgentRunOutput = {
  agentType: "builder",
  workflowName: "Implementation Plan",
  timestamp: Date.now(),
  sections: [
    {
      id: "objective",
      title: "Implementation Objective",
      type: "text",
      content:
        "Build the Agents Console page — a two-column layout where the user selects an agent and workflow, provides input, runs a simulated agent, and reviews/saves the structured output.",
    },
    {
      id: "steps",
      title: "Ordered Implementation Steps",
      type: "list",
      content: "",
      items: [
        "1. Install missing shadcn/ui components (select, textarea, label)",
        "2. Define TypeScript types for AgentType, WorkflowType, OutputSection, AgentRunOutput",
        "3. Create mock structured output data for Founder, Architect, and Builder agents",
        "4. Build AgentLeftPanel component with all selectors and the run button",
        "5. Build AgentRightPanel component with output renderer and empty state",
        "6. Build SaveActionsBar component with the four action buttons",
        "7. Compose the agents/page.tsx with two-column layout and state management",
        "8. Add loading skeleton state for the right panel during simulated runs",
        "9. Test responsive stacking on mobile breakpoints",
      ],
    },
    {
      id: "files",
      title: "Files to Create / Modify",
      type: "list",
      content: "",
      items: [
        "src/app/(dashboard)/agents/_components/mock-agent-data.ts — types + mock data",
        "src/app/(dashboard)/agents/_components/agent-left-panel.tsx — selector + input panel",
        "src/app/(dashboard)/agents/_components/agent-right-panel.tsx — output rendering",
        "src/app/(dashboard)/agents/_components/save-actions-bar.tsx — action buttons",
        "src/app/(dashboard)/agents/page.tsx — page composition and state",
      ],
    },
    {
      id: "edge_cases",
      title: "Edge Cases & Safeguards",
      type: "list",
      content: "",
      items: [
        "Show empty state when no agent run has been triggered yet",
        "Disable Run button when required fields (agent, workflow) are not selected",
        "Clear output when agent type changes to prevent showing stale data",
        "Gracefully handle case where selected workflow does not have mock output",
        "Show loading skeleton for 1.5 seconds to simulate API latency",
      ],
    },
    {
      id: "acceptance",
      title: "Acceptance Criteria",
      type: "list",
      content: "",
      items: [
        "User can select Founder, Architect, or Builder agent",
        "Workflow options update when agent selection changes",
        "Output renders as structured section cards, not raw text",
        "Next best action callout appears below output sections",
        "Save action buttons show toast on click",
        "Mobile layout stacks left panel above right panel",
      ],
    },
  ],
  nextBestAction: {
    title: "Begin Implementation",
    description:
      "The implementation plan is ready. Start with step 1 and work through sequentially. Ship the Agents Console today.",
    actionLabel: "Create Tasks from Plan",
  },
  saveActions: [
    {
      key: "save_playbook_1",
      label: "Save as Playbook",
      collection: "playbooks",
      payload: {
        title: "Agent Build Step",
        category: "implementation",
        summary: "Build Agents Console page components",
        steps: [
          "Install missing shadcn/ui components",
          "Define TypeScript types",
          "Create mock structured output",
        ]
      }
    }
  ]
};

export const mockExecutionOutput: AgentRunOutput = {
  agentType: "execution",
  workflowName: "Weekly Review",
  timestamp: Date.now(),
  sections: [
    {
      id: "summary",
      title: "Situation Summary",
      type: "text",
      content: "Solid week. You pushed forward on the core Agent Console elements, closing out major project architectural tasks while picking up a client lead. Momentum is positive but needs focus to ship MVP.",
    },
    {
      id: "lessons",
      title: "Lessons Learned",
      type: "list",
      content: "",
      items: [
        "Keeping all agent models tightly typed with Zod speeds up UI integration significantly.",
        "Sales call conversion is higher when sending immediate proposals. Try saving proposals directly via Agent pipelines.",
      ],
    },
    {
      id: "blockers",
      title: "Blockers to Resolve",
      type: "list",
      content: "",
      items: [
        "Decide on final persistence layer (Firebase vs Postgres) before attempting real-time agent output save actions.",
        "Refactor learning module layout to accommodate wider screens.",
      ],
    },
    {
      id: "focus",
      title: "Next Week Focus Areas",
      type: "list",
      content: "",
      items: [
        "Finalize and integrate Firebase for all Save Actions.",
        "Complete 'Learning' dashboard to bridge the weakness spot flow.",
        "Deliver Acme Wellness Studio proposal.",
      ],
    },
    {
      id: "priorities",
      title: "Top 3 Priorities",
      type: "list",
      content: "",
      items: [
        "1. Ship the Weekly Review workflow.",
        "2. Hook Agents Console to real LLM backend endpoint.",
        "3. Send the proposal for Acme Lead.",
      ],
    },
    {
      id: "learning",
      title: "Targeted Learning",
      type: "text",
      content: "Deep Dive into Next.js App Router API Routes to structure securely bounded agent endpoints.",
    },
  ],
  nextBestAction: {
    title: "Create Focus Goals",
    description: "Map out your next week into active goals and roll over blockers into standard tasks to resolve.",
    actionLabel: "Save Review Goals",
  },
  saveActions: [
    {
      key: "save_goals",
      label: "Save Action Items",
      collection: "goals",
      payload: {
        title: "Ship Agent Run backend",
        type: "weekly",
        timeframe: "Next Week",
      }
    }
  ]
};

export const mockFreelanceOutput: AgentRunOutput = {
  agentType: "freelance",
  workflowName: "Draft Proposal",
  timestamp: Date.now(),
  sections: [
    {
      id: "problem_summary",
      title: "Client Problem Summary",
      type: "text",
      content: "The client needs a unified dashboard out-of-the-box that can bridge their chaotic, multi-platform HR workflow into a single source of truth.",
    },
    {
      id: "scope",
      title: "Recommended Scope",
      type: "text",
      content: "A minimal, custom Next.js HR Dashboard tying into their existing Workday API. It will include standard onboarding templates and leave management flow.",
    },
    {
      id: "deliverables",
      title: "Deliverables",
      type: "list",
      content: "",
      items: [
        "Core Dashboard Interface",
        "Workday API Integration Module",
        "Onboarding Document Generator",
        "Admin Roles & Permissions",
      ],
    },
    {
      id: "timeline",
      title: "Timeline Logic",
      type: "text",
      content: "Project estimated at 6 weeks. Week 1-2 for design and discovery, Week 3-5 for build, Week 6 for QA, launch, and training.",
    },
    {
      id: "pricing",
      title: "Pricing Logic",
      type: "text",
      content: "Fixed bid of $12,500 given the value-based outcome and standard risk buffer. Billed 50% upfront, 50% upon QA approval.",
    },
    {
      id: "assumptions",
      title: "Assumptions",
      type: "list",
      content: "",
      items: [
        "Client provides sandbox API keys immediately.",
        "Design approval SLA is 48 hours maximum.",
      ],
    },
    {
      id: "risks",
      title: "Risks",
      type: "list",
      content: "",
      items: [
        "Workday API rate limits could throttle the bulk export feature.",
        "Delays in feedback loops given client's holiday schedule.",
      ],
    },
  ],
  nextBestAction: {
    title: "Draft Proposal",
    description: "The logic evaluates cleanly. You should save this structure to trigger proposal document generation, then review the final prose.",
    actionLabel: "Save Proposal Draft",
  },
  saveActions: [
    {
      key: "save_proposal_draft",
      label: "Save Proposal Draft",
      collection: "proposals",
      payload: {
        title: "HR Dashboard Consolidation",
        status: "draft",
        problemSummary: "The client needs a unified dashboard out-of-the-box that can bridge their chaotic, multi-platform HR workflow into a single source of truth.",
        scope: "A minimal, custom Next.js HR Dashboard tying into their existing Workday API. It will include standard onboarding templates and leave management flow.",
        deliverables: [
          "Core Dashboard Interface",
          "Workday API Integration Module",
          "Onboarding Document Generator",
          "Admin Roles & Permissions"
        ],
        timeline: "Project estimated at 6 weeks. Week 1-2 for design and discovery, Week 3-5 for build, Week 6 for QA, launch, and training.",
        pricing: "Fixed bid of $12,500 given the value-based outcome and standard risk buffer.",
        assumptions: "Sandbox API keys immediately provided.",
        risks: "API Rate limits.",
      }
    }
  ]
};

// ─── Output lookup helper ───────────────────────────────────────────────────

export const mockValidationOutput: AgentRunOutput = {
  agentType: "validation",
  workflowName: "Validate Product Idea",
  timestamp: Date.now(),
  sections: [
    {
      id: "validation_summary",
      title: "Validation Summary",
      type: "text",
      content: "Initial validation checklist completed. Target persona verified as solo developers. Market demands align with a low-friction operating system. Suggest advancing to specification stage.",
    },
    {
      id: "channels",
      title: "Acquisition Channels",
      type: "list",
      content: "",
      items: [
        "Developer forums (Reddit r/selfhosted, Hacker News)",
        "Open source directory listings",
        "Direct outreach to freelance contractors",
      ],
    },
  ],
  nextBestAction: {
    title: "Draft MVP Specification",
    description: "Validation is solid. Advancing the workspace to 'spec' stage and drafting core features.",
    actionLabel: "Advance Stage & Create Tasks",
  },
  saveActions: [
    {
      key: "advance_stage_validation",
      label: "Update Lifecycle Stage (Spec)",
      collection: "workspaces",
      payload: {
        stage: "spec",
      },
    },
    {
      key: "create_task_validation",
      label: "Create User Interview Task",
      collection: "tasks",
      payload: {
        title: "Conduct 5 user interviews",
        type: "research",
        priority: "medium",
        description: "Draft interview guide and interview 5 developers on how they prioritize tasks daily.",
      },
    },
  ],
};

export const mockLaunchOutput: AgentRunOutput = {
  agentType: "launch",
  workflowName: "Product Launch Prep",
  timestamp: Date.now(),
  sections: [
    {
      id: "checklist",
      title: "Launch Checklist",
      type: "list",
      content: "",
      items: [
        "Confirm SSL certificate binds cleanly",
        "Triage and close all critical Sentry logs",
        "Run database stress tests on connection pool",
        "Set up social copy assets for Product Hunt launch",
      ],
    },
  ],
  nextBestAction: {
    title: "Deploy & Advance to Growth",
    description: "Launch prep checks passed. Advance the workspace stage to growth.",
    actionLabel: "Deploy & Upgrade Stage",
  },
  saveActions: [
    {
      key: "advance_stage_launch",
      label: "Update Lifecycle Stage (Growth)",
      collection: "workspaces",
      payload: {
        stage: "growth",
      },
    },
    {
      key: "create_task_launch",
      label: "Create Deployment Task",
      collection: "tasks",
      payload: {
        title: "Deploy production build on Vercel",
        type: "chore",
        priority: "high",
        description: "Deploy to production, configure custom domain, and bind environment variables.",
      },
    },
  ],
};

export const mockDeliveryOutput: AgentRunOutput = {
  agentType: "delivery",
  workflowName: "Client Delivery Update",
  timestamp: Date.now(),
  sections: [
    {
      id: "sprint_status",
      title: "Sprint Status Summary",
      type: "text",
      content: "All Client wellness portal milestone targets met. API integration is stable. Client approved the custom layout proposal. Proceeding to finalize delivery handoff.",
    },
  ],
  nextBestAction: {
    title: "Log Client Approval",
    description: "Save client approval decisions to confirm delivery phase and complete sprint.",
    actionLabel: "Log Approval Decision",
  },
  saveActions: [
    {
      key: "save_decision_delivery",
      label: "Save Handoff Decision",
      collection: "decisions",
      payload: {
        title: "Approve Client Phase 2 Milestones",
        context: "Client review session on May 31",
        chosenOption: "Approved & Handoff completed",
        rationale: "Deliverables verified against contract specs. Code reviewed by technical lead.",
        optionsConsidered: ["Approve with minor fixes", "Full delay for minor changes"],
        tradeoffs: "Closing sprint early frees capacity, but minor CSS fixes will need post-launch chore logging.",
      },
    },
  ],
};

export const mockImprovementOutput: AgentRunOutput = {
  agentType: "improvement",
  workflowName: "Identify Product Improvements",
  timestamp: Date.now(),
  sections: [
    {
      id: "improvement_points",
      title: "Optimization Candidates",
      type: "list",
      content: "",
      items: [
        "Reduce bundle size on client-side main bundle from 1.2MB to 300KB.",
        "Add system-level dark mode preference auto-matching.",
        "Optimize connection pool recycle timer to 15s.",
      ],
    },
  ],
  nextBestAction: {
    title: "Create Growth Opportunity",
    description: "Generate structured opportunity candidates to track connection improvements.",
    actionLabel: "Create Opportunity",
  },
  saveActions: [
    {
      key: "create_opp_improvement",
      label: "Create Bundle Opportunity",
      collection: "opportunities",
      payload: {
        title: "Optimize Landing Page Bundle Sizing",
        description: "Current bundle size is 1.2MB, slowing down mobile FCP. Compress assets and lazy-load charts.",
        category: "performance",
        score: 60,
        scoringBreakdown: {
          impact: 4,
          confidence: 3,
          effort: 2,
          explanation: "Priority score of 60/100 calculated from: High Impact (4), Medium Confidence (3), and Low Effort (2).",
        },
        sourceSignalIds: [],
      },
    },
  ],
};

export const mockSignalAnalystOutput: AgentRunOutput = {
  agentType: "signal_analyst",
  workflowName: "Analyze Telemetry Signals",
  timestamp: Date.now(),
  sections: [
    {
      id: "signal_summary",
      title: "Triage Report",
      type: "text",
      content: "Scanned telemetry logs. High memory usage spike detected in user layout trace. Multiple out of memory exceptions logged.",
    },
  ],
  nextBestAction: {
    title: "Create Severity Signal",
    description: "Log a structured signal in telemetry logs to track and triage the layout exception.",
    actionLabel: "Log Telemetry Signal",
  },
  saveActions: [
    {
      key: "create_signal_analyst",
      label: "Create Memory Signal",
      collection: "signals",
      payload: {
        title: "High memory usage in render loop",
        description: "Telemetry flagged memory heap spike on landing page. 12 crash events recorded.",
        category: "performance",
        severity: "high",
        source: "posthog",
      },
    },
    {
      key: "save_playbook_analyst",
      label: "Save Triage Playbook",
      collection: "playbooks",
      payload: {
        title: "Memory Heap Triage Guide",
        category: "telemetry",
        summary: "Step-by-step debug flow for memory leak issues.",
        steps: [
          "Open Chrome DevTools Performance Profiler",
          "Identify garbage collection memory retainers",
          "Check clean-up triggers in useEffect dependencies",
        ],
        checklist: ["Check event listeners", "Verify timer disposal"],
        promptTemplate: "Analyze the following heap snapshot trace to find leaks...",
      },
    },
  ],
};

// ─── Output lookup helper ───────────────────────────────────────────────────

export function getMockOutput(
  agentType: AgentType,
  _workflowType: WorkflowType
): AgentRunOutput | null {
  switch (agentType) {
    case "founder":
      return mockFounderOutput;
    case "architect":
      return mockArchitectOutput;
    case "builder":
      return mockBuilderOutput;
    case "execution":
      return mockExecutionOutput;
    case "freelance":
      return mockFreelanceOutput;
    case "validation":
      return mockValidationOutput;
    case "launch":
      return mockLaunchOutput;
    case "delivery":
      return mockDeliveryOutput;
    case "improvement":
      return mockImprovementOutput;
    case "signal_analyst":
      return mockSignalAnalystOutput;
    default:
      return null;
  }
}
