import { BaseService } from "./base.service";
import { TaskSchemaType, taskSchema } from "../validators";

export class TaskService extends BaseService<TaskSchemaType> {
  constructor() {
    super("tasks", taskSchema);
  }

  async getProjectTasks(projectId: string): Promise<TaskSchemaType[]> {
    const snapshot = await this.collection
      .where("projectId", "==", projectId)
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) => doc.data() as TaskSchemaType);
  }

  async getWorkspaceTasks(workspaceId: string): Promise<TaskSchemaType[]> {
    const snapshot = await this.collection
      .where("workspaceId", "==", workspaceId)
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) => doc.data() as TaskSchemaType);
  }
}

export const taskService = new TaskService();
