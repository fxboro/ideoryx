import { BaseService, toCamelCase } from "./base.service";
import { ProposalSchemaType, proposalSchema } from "../validators";

export class ProposalService extends BaseService<ProposalSchemaType> {
  constructor() {
    super("proposals", proposalSchema);
  }

  async getRecentProposals(userId: string, limit: number = 10): Promise<ProposalSchemaType[]> {
    const supabase = await this.getClient();
    const { data } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(limit);
    return (data || []).map((row: any) => toCamelCase(row) as ProposalSchemaType);
  }
}

export const proposalService = new ProposalService();
