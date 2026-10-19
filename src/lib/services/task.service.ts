import { BaseService, toCamelCase } from "./base.service";
import { TaskSchemaType, taskSchema } from "../validators";

export class TaskService extends BaseService<TaskSchemaType> {
  constructor() {
    super("tasks", taskSchema);
  }

  async getProjectTasks(projectId: string): Promise<TaskSchemaType[]> {
    const supabase = await this.getClient();
    const { data } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    return (data || []).map((row: any) => toCamelCase(row) as TaskSchemaType);
  }

  async getWorkspaceTasks(workspaceId: string): Promise<TaskSchemaType[]> {
    const supabase = await this.getClient();
    const { data } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    return (data || []).map((row: any) => toCamelCase(row) as TaskSchemaType);
  }
}

export const taskService = new TaskService();
