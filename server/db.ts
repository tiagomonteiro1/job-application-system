import { eq, like, or, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, curriculos, InsertCurriculo, Curriculo, candidaturas, InsertCandidatura, Candidatura } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ========== Currículos ==========

export async function createCurriculo(data: InsertCurriculo): Promise<Curriculo> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(curriculos).values(data);
  const insertedId = Number(result[0].insertId);

  const inserted = await db.select().from(curriculos).where(eq(curriculos.id, insertedId)).limit(1);
  if (!inserted[0]) throw new Error("Failed to retrieve inserted curriculo");

  return inserted[0];
}

export async function getCurriculoById(id: number): Promise<Curriculo | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(curriculos).where(eq(curriculos.id, id)).limit(1);
  return result[0];
}

export async function getCurriculosByUserId(userId: number): Promise<Curriculo[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(curriculos).where(eq(curriculos.userId, userId));
}

export async function updateCurriculo(id: number, data: Partial<Curriculo>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(curriculos).set(data).where(eq(curriculos.id, id));
}

// ========== Candidaturas ==========

export async function createCandidatura(data: InsertCandidatura): Promise<Candidatura> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(candidaturas).values(data);
  const insertedId = Number(result[0].insertId);

  const inserted = await db.select().from(candidaturas).where(eq(candidaturas.id, insertedId)).limit(1);
  if (!inserted[0]) throw new Error("Failed to retrieve inserted candidatura");

  return inserted[0];
}

export async function getCandidaturaById(id: number): Promise<Candidatura | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(candidaturas).where(eq(candidaturas.id, id)).limit(1);
  return result[0];
}

export async function getCandidaturasByUserId(userId: number): Promise<Candidatura[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(candidaturas).where(eq(candidaturas.userId, userId));
}

export async function updateCandidatura(id: number, data: Partial<Candidatura>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(candidaturas).set(data).where(eq(candidaturas.id, id));
}


// ========== Gerenciamento de Usuários ==========

export async function getAllUsers(options?: { search?: string; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db.select().from(users);

  // Aplicar filtro de busca
  if (options?.search) {
    const searchPattern = `%${options.search}%`;
    query = query.where(
      or(
        like(users.name, searchPattern),
        like(users.email, searchPattern)
      )
    ) as any;
  }

  // Ordenar por data de criação (mais recentes primeiro)
  query = query.orderBy(desc(users.createdAt)) as any;

  // Aplicar paginação
  if (options?.limit) {
    query = query.limit(options.limit) as any;
  }
  if (options?.offset) {
    query = query.offset(options.offset) as any;
  }

  return await query;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(data: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(users).values(data);
  return Number(result[0].insertId);
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({
    ...data,
    updatedAt: new Date(),
  }).where(eq(users.id, id));
}

export async function deleteUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(users).where(eq(users.id, id));
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUsersStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allUsers = await db.select().from(users);
  return allUsers;
}
