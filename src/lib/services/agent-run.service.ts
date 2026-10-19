import { BaseService, toCamelCase } from "./base.service";
import { AgentRunSchemaType, agentRunSchema } from "../validators";

export class AgentRunService extends BaseService<AgentRunSchemaType> {
  constructor() {
    super("agent_runs", agentRunSchema);
  }

  async getRecentAgentRuns(userId: string, limit: number = 5): Promise<AgentRunSchemaType[]> {
    const supabase = await this.getClient();
    const { data } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data || []).map((row: any) => toCamelCase(row) as AgentRunSchemaType);
  }
}

export const agentRunService = new AgentRunService();
