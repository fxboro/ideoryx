import { BaseService, toCamelCase } from "./base.service";
import { GoalSchemaType, goalSchema } from "../validators";

export class GoalService extends BaseService<GoalSchemaType> {
  constructor() {
    super("goals", goalSchema);
  }

  async getWeeklyGoals(userId: string, weekStr: string): Promise<GoalSchemaType[]> {
    const supabase = await this.getClient();
    const { data } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .eq("timeframe", weekStr)
      .order("updated_at", { ascending: false });
    return (data || []).map((row: any) => toCamelCase(row) as GoalSchemaType);
  }
}

export const goalService = new GoalService();
