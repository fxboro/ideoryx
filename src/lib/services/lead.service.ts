import { BaseService, toCamelCase } from "./base.service";
import { LeadSchemaType, leadSchema } from "../validators";

export class LeadService extends BaseService<LeadSchemaType> {
  constructor() {
    super("leads", leadSchema);
  }

  async getOpenLeads(userId: string): Promise<LeadSchemaType[]> {
    const supabase = await this.getClient();
    const { data } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .in("status", ["new", "qualified", "proposal_sent"])
      .order("updated_at", { ascending: false });
    return (data || []).map((row: any) => toCamelCase(row) as LeadSchemaType);
  }
}

export const leadService = new LeadService();
