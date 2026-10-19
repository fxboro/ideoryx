import { BaseService, toCamelCase } from "./base.service";
import { ProjectSchemaType, projectSchema } from "../validators";

export class ProjectService extends BaseService<ProjectSchemaType> {
  constructor() {
    super("projects", projectSchema);
  }

  async getActiveProjects(userId: string): Promise<ProjectSchemaType[]> {
    const supabase = await this.getClient();
    const { data } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("updated_at", { ascending: false });
    return (data || []).map((row: any) => toCamelCase(row) as ProjectSchemaType);
  }
}

export const projectService = new ProjectService();
