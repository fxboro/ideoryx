import { BaseService } from "./base.service";
import { WorkspaceSchemaType, workspaceSchema } from "../validators";
import { Workspace, WorkspaceChecklistItem } from "../../types";
import { calculateReadinessScore } from "../utils/lifecycle";

export const DEFAULT_PRODUCT_CHECKLISTS: Record<string, WorkspaceChecklistItem[]> = {
  validation: [
    { id: "v1", stage: "validation", label: "Define Target Customer Profile (ICP)", completed: false },
    { id: "v2", stage: "validation", label: "Validate 5+ customer pain points in interviews", completed: false },
    { id: "v3", stage: "validation", label: "Analyze competitors and unique positioning", completed: false },
    { id: "v4", stage: "validation", label: "Establish Unique Value Proposition (UVP)", completed: false },
  ],
  spec: [
    { id: "s1", stage: "spec", label: "Write MVP specifications and scope", completed: false },
    { id: "s2", stage: "spec", label: "Design modular system architecture", completed: false },
    { id: "s3", stage: "spec", label: "Draft Firestore collection/schema details", completed: false },
    { id: "s4", stage: "spec", label: "Define milestone timeline and delivery targets", completed: false },
  ],
  build: [
    { id: "b1", stage: "build", label: "Set up repository & configure dev environment", completed: false },
    { id: "b2", stage: "build", label: "Implement authentication and user accounts", completed: false },
    { id: "b3", stage: "build", label: "Build core feature modules", completed: false },
    { id: "b4", stage: "build", label: "Run security and code quality review checklists", completed: false },
  ],
  launch: [
    { id: "l1", stage: "launch", label: "Provision production database & deployments", completed: false },
    { id: "l2", stage: "launch", label: "Set up performance/telemetry monitoring", completed: false },
    { id: "l3", stage: "launch", label: "Create onboarding guide / tutorials", completed: false },
    { id: "l4", stage: "launch", label: "Execute launch marketing/campaign checklist", completed: false },
  ],
  growth: [
    { id: "g1", stage: "growth", label: "Collect and index post-launch user feedback", completed: false },
    { id: "g2", stage: "growth", label: "Monitor telemetry errors and triage alerts", completed: false },
    { id: "g3", stage: "growth", label: "Map improvement opportunities (impact vs effort)", completed: false },
  ]
};

export const DEFAULT_CLIENT_CHECKLISTS: Record<string, WorkspaceChecklistItem[]> = {
  discovery: [
    { id: "d1", stage: "discovery", label: "Qualify lead and contact alignment", completed: false },
    { id: "d2", stage: "discovery", label: "Identify primary business pain points", completed: false },
    { id: "d3", stage: "discovery", label: "Host discovery/requirements call", completed: false },
    { id: "d4", stage: "discovery", label: "Establish high-level budget match", completed: false },
  ],
  proposal: [
    { id: "p1", stage: "proposal", label: "Define detailed client project scope", completed: false },
    { id: "p2", stage: "proposal", label: "Estimate implementation hours and cost logic", completed: false },
    { id: "p3", stage: "proposal", label: "Generate and review draft proposal", completed: false },
    { id: "p4", stage: "proposal", label: "Deliver final proposal and capture feedback", completed: false },
  ],
  delivery: [
    { id: "e1", stage: "delivery", label: "Conduct project kickoff with client", completed: false },
    { id: "e2", stage: "delivery", label: "Ship milestone deliverables on timeline", completed: false },
    { id: "e3", stage: "delivery", label: "Send periodic progress & scope reports", completed: false },
    { id: "e4", stage: "delivery", label: "Perform QA and client feedback cycles", completed: false },
  ],
  launch: [
    { id: "c1", stage: "launch", label: "Deploy final solution to client production", completed: false },
    { id: "c2", stage: "launch", label: "Conduct handover session & training", completed: false },
    { id: "c3", stage: "launch", label: "Submit system documentation and admin keys", completed: false },
    { id: "c4", stage: "launch", label: "Secure client final sign-off", completed: false },
  ],
  support: [
    { id: "u1", stage: "support", label: "Sign SLAs / define maintenance terms", completed: false },
    { id: "u2", stage: "support", label: "Schedule monthly feedback follow-up", completed: false },
    { id: "u3", stage: "support", label: "Analyze expansion/retention opportunities", completed: false },
  ]
};

export class WorkspaceService extends BaseService<WorkspaceSchemaType> {
  constructor() {
    super("workspaces", workspaceSchema);
  }

  async createWorkspace(id: string, data: Omit<Workspace, "id" | "createdAt" | "updatedAt">): Promise<void> {
    const defaultChecklists = data.workspaceType === "product"
      ? DEFAULT_PRODUCT_CHECKLISTS
      : DEFAULT_CLIENT_CHECKLISTS;

    // Deep clone the default checklists to prevent mutating shared global objects
    const checklists = data.checklists || structuredClone(defaultChecklists);
    const readinessScore = data.readinessScore ?? this.calculateReadinessScore(checklists, data.stage);

    const payload = {
      ...data,
      id,
      checklists,
      readinessScore,
      status: data.status ?? "active",
      risk: data.risk ?? "low",
    };

    await this.create(id, payload);
  }

  async getWorkspaceById(id: string): Promise<Workspace | null> {
    const docData = await this.getById(id);
    return docData as Workspace | null;
  }

  async listWorkspacesByUser(userId: string): Promise<Workspace[]> {
    const docList = await this.listByUser(userId);
    return docList as Workspace[];
  }

  async updateWorkspace(id: string, data: Partial<Workspace>): Promise<void> {
    let updatedData = { ...data };
    if (data.checklists || data.stage) {
      if (data.checklists && data.stage) {
        // No read needed if both checklists and stage are supplied in updates
        updatedData.readinessScore = this.calculateReadinessScore(data.checklists, data.stage);
      } else {
        const currentWorkspace = await this.getWorkspaceById(id);
        if (currentWorkspace) {
          const checklists = data.checklists || currentWorkspace.checklists;
          const stage = data.stage || currentWorkspace.stage;
          updatedData.readinessScore = this.calculateReadinessScore(checklists, stage);
        }
      }
    }
    await this.update(id, updatedData as Partial<WorkspaceSchemaType>);
  }

  async archiveWorkspace(id: string): Promise<void> {
    await this.update(id, { status: "archived" });
  }

  async toggleChecklistItem(id: string, stage: string, itemId: string, completed: boolean): Promise<Workspace> {
    const workspace = await this.getWorkspaceById(id);
    if (!workspace) {
      throw new Error(`Workspace not found: ${id}`);
    }

    const updatedChecklists = { ...workspace.checklists };
    const items = updatedChecklists[stage] || [];
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          completed,
          completedAt: completed ? Date.now() : undefined
        };
      }
      return item;
    });

    updatedChecklists[stage] = updatedItems;

    const newReadiness = calculateReadinessScore(updatedItems);

    const updatedData = {
      checklists: updatedChecklists,
      readinessScore: newReadiness,
    };

    await this.update(id, updatedData);

    return {
      ...workspace,
      ...updatedData,
      updatedAt: Date.now()
    };
  }

  calculateReadinessScore(checklists: Record<string, WorkspaceChecklistItem[]>, currentStage: string): number {
    return calculateReadinessScore(checklists[currentStage] || []);
  }
}

export const workspaceService = new WorkspaceService();
