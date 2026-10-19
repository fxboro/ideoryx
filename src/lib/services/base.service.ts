import { z } from "zod";
import { getDbClient } from "../supabase/db";

function camelToSnakeKey(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function snakeToCamelKey(str: string): string {
  return str.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
}

export function toSnakeCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    result[camelToSnakeKey(key)] = value;
  }
  return result;
}

export function toCamelCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[snakeToCamelKey(key)] = value;
  }
  return result;
}

export class BaseService<T extends { id?: string; userId?: string; createdAt?: number; updatedAt?: number }> {
  constructor(
    protected tableName: string,
    protected schema?: z.ZodSchema<T>
  ) {}

  protected async getClient() {
    return await getDbClient();
  }

  async getById(id: string): Promise<T | null> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return toCamelCase(data) as T;
  }

  async getOwned(id: string, userId: string): Promise<T | null> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;
    return toCamelCase(data) as T;
  }

  async listByUser(userId: string): Promise<T[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error || !data) return [];
    return data.map((row: any) => toCamelCase(row) as T);
  }

  async create(id: string, data: Partial<T> & { userId: string }): Promise<void> {
    const now = Date.now();
    const payload = {
      ...data,
      id,
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    };

    if (this.schema) {
      this.schema.parse(payload);
    }

    const supabase = await this.getClient();
    const dbPayload = toSnakeCase(payload);
    const { error } = await supabase.from(this.tableName).insert(dbPayload);
    if (error) {
      throw new Error(`Failed to create in ${this.tableName}: ${error.message}`);
    }
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    const payload = {
      ...data,
      updatedAt: Date.now(),
    };

    if (this.schema && typeof (this.schema as any).partial === "function") {
      (this.schema as any).partial().parse(payload);
    }

    const supabase = await this.getClient();
    const dbPayload = toSnakeCase(payload);
    const { error } = await supabase
      .from(this.tableName)
      .update(dbPayload)
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to update in ${this.tableName}: ${error.message}`);
    }
  }

  async updateOwned(id: string, userId: string, data: Partial<T>): Promise<void> {
    const existing = await this.getOwned(id, userId);
    if (!existing) {
      throw new Error(`Record not found or unauthorized: ${id}`);
    }
    await this.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase.from(this.tableName).delete().eq("id", id);
    if (error) {
      throw new Error(`Failed to delete in ${this.tableName}: ${error.message}`);
    }
  }

  async deleteOwned(id: string, userId: string): Promise<void> {
    const existing = await this.getOwned(id, userId);
    if (!existing) {
      throw new Error(`Record not found or unauthorized: ${id}`);
    }
    await this.delete(id);
  }
}
