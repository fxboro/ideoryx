import { BaseService } from "./base.service";
import { OpportunitySchemaType, opportunitySchema } from "../validators";
import { Opportunity, OpportunityStatus } from "../../types";

export class OpportunityService extends BaseService<OpportunitySchemaType> {
  constructor() {
    super("opportunities", opportunitySchema);
  }

  async createOpportunity(id: string, data: Omit<Opportunity, "id" | "createdAt" | "updatedAt">): Promise<void> {
    const payload = {
      ...data,
      id,
      status: data.status ?? "open",
    };
    await this.create(id, payload);
  }

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    const docData = await this.getById(id);
    return docData as Opportunity | null;
  }

  async listOpportunitiesByUser(userId: string): Promise<Opportunity[]> {
    const docList = await this.listByUser(userId);
    return docList as Opportunity[];
  }

  async listOpportunitiesByWorkspace(workspaceId: string): Promise<Opportunity[]> {
    const snapshot = await this.collection
      .where("workspaceId", "==", workspaceId)
      .orderBy("score", "desc")
      .get();
    return snapshot.docs.map((doc) => doc.data() as Opportunity);
  }

  async updateOpportunityStatus(id: string, status: OpportunityStatus): Promise<void> {
    await this.update(id, { status });
  }
}

export const opportunityService = new OpportunityService();
