import { BaseService, toCamelCase } from "./base.service";
import { SignalSchemaType, signalSchema } from "../validators";
import { Signal, SignalStatus } from "../../types";

export class SignalService extends BaseService<SignalSchemaType> {
  constructor() {
    super("signals", signalSchema);
  }

  async createSignal(id: string, data: Omit<Signal, "id" | "createdAt" | "updatedAt">): Promise<void> {
    const payload = {
      ...data,
      id,
      status: data.status ?? "new",
    };
    await this.create(id, payload);
  }

  async getSignalById(id: string): Promise<Signal | null> {
    const docData = await this.getById(id);
    return docData as Signal | null;
  }

  async listSignalsByUser(userId: string): Promise<Signal[]> {
    const docList = await this.listByUser(userId);
    return docList as Signal[];
  }

  async listSignalsByWorkspace(workspaceId: string): Promise<Signal[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map((row: any) => toCamelCase(row) as Signal);
  }

  async updateSignalStatus(id: string, status: SignalStatus): Promise<void> {
    await this.update(id, { status });
  }
}

export const signalService = new SignalService();
