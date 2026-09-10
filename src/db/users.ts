import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export interface UserUpsertData {
  uid: string;
  email: string;
  name?: string;
  role?: string;
  bpId?: string;
  phone?: string;
  street?: string;
  city?: string;
  pin?: string;
}

export async function getOrCreateUser(data: UserUpsertData) {
  try {
    const result = await db.insert(users)
      .values({
        uid: data.uid,
        email: data.email,
        name: data.name || 'Golden Star Member',
        role: data.role || 'CUSTOMER',
        bpId: data.bpId || null,
        phone: data.phone || null,
        street: data.street || null,
        city: data.city || null,
        pin: data.pin || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: data.email,
          ...(data.name ? { name: data.name } : {}),
          ...(data.role ? { role: data.role } : {}),
          ...(data.bpId ? { bpId: data.bpId } : {}),
          ...(data.phone ? { phone: data.phone } : {}),
          ...(data.street ? { street: data.street } : {}),
          ...(data.city ? { city: data.city } : {}),
          ...(data.pin ? { pin: data.pin } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Database user upsert failed:", error);
    throw new Error("Failed to synchronize user to Cloud SQL database.", { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const rows = await db.select().from(users).where(eq(users.uid, uid));
    return rows[0] || null;
  } catch (error) {
    console.error("Database fetch user failed:", error);
    throw new Error("Failed to fetch user from Cloud SQL.", { cause: error });
  }
}

export async function getAllUsers() {
  try {
    return await db.select().from(users);
  } catch (error) {
    console.error("Database fetch all users failed:", error);
    throw new Error("Failed to fetch users from Cloud SQL.", { cause: error });
  }
}
