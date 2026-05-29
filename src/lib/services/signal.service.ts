import { BaseService } from "./base.service";
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
    const snapshot = await this.collection
      .where("workspaceId", "==", workspaceId)
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) => doc.data() as Signal);
  }

  async updateSignalStatus(id: string, status: SignalStatus): Promise<void> {
    await this.update(id, { status });
  }
}

export const signalService = new SignalService();
