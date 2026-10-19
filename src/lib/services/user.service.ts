import { getDbClient } from "../supabase/db";
import { UserSchemaType, userSchema } from "../validators";
import { toCamelCase, toSnakeCase } from "./base.service";

export class UserService {
  private tableName = "profiles";

  private async getClient() {
    return await getDbClient();
  }

  async getByUid(uid: string): Promise<UserSchemaType | null> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("id", uid)
      .maybeSingle();

    if (error || !data) return null;
    return toCamelCase(data) as UserSchemaType;
  }

  async createOrUpdate(uid: string, data: Partial<UserSchemaType>): Promise<void> {
    const now = Date.now();
    const existing = await this.getByUid(uid);
    const supabase = await this.getClient();

    if (!existing) {
      const payload = {
        ...data,
        uid,
        createdAt: now,
      };
      userSchema.parse(payload);
      const dbPayload = toSnakeCase({ ...payload, id: uid });
      await supabase.from(this.tableName).insert(dbPayload);
    } else {
      const payload = {
        ...data,
      };
      userSchema.partial().parse(payload);
      const dbPayload = toSnakeCase(payload);
      await supabase.from(this.tableName).update(dbPayload).eq("id", uid);
    }
  }
}

export const userService = new UserService();
