import { BaseService, toCamelCase } from "./base.service";
import { DecisionSchemaType, decisionSchema } from "../validators";

export class DecisionService extends BaseService<DecisionSchemaType> {
  constructor() {
    super("decisions", decisionSchema);
  }

  async getRecentDecisions(userId: string, limit: number = 10): Promise<DecisionSchemaType[]> {
    const supabase = await this.getClient();
    const { data } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data || []).map((row: any) => toCamelCase(row) as DecisionSchemaType);
  }
}

export const decisionService = new DecisionService();
