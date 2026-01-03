import { eq, like, or, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, curriculos, InsertCurriculo, Curriculo, candidaturas, InsertCandidatura, Candidatura, planos, InsertPlano, Plano, assinaturas, InsertAssinatura, Assinatura, usoRecursos, InsertUsoRecurso, UsoRecurso } from "../drizzle/schema";
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

// ===== FUNÇÕES DE PLANOS =====

export async function listarPlanos(apenasAtivos: boolean = true) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const query = db.select().from(planos);
  
  if (apenasAtivos) {
    return await query.where(eq(planos.ativo, true)).orderBy(planos.ordem);
  }
  
  return await query.orderBy(planos.ordem);
}

export async function buscarPlanoPorId(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(planos).where(eq(planos.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function criarPlano(data: InsertPlano) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(planos).values(data);
  const planoId = Number(result[0].insertId);
  return await buscarPlanoPorId(planoId);
}

export async function atualizarPlano(id: number, data: Partial<InsertPlano>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(planos).set({
    ...data,
    updatedAt: new Date(),
  }).where(eq(planos.id, id));

  return await buscarPlanoPorId(id);
}

export async function deletarPlano(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(planos).where(eq(planos.id, id));
}

export async function ativarDesativarPlano(id: number, ativo: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(planos).set({
    ativo,
    updatedAt: new Date(),
  }).where(eq(planos.id, id));

  return await buscarPlanoPorId(id);
}

// ===== FUNÇÕES DE ASSINATURAS =====

export async function listarAssinaturas(userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const query = db.select().from(assinaturas);
  
  if (userId) {
    return await query.where(eq(assinaturas.userId, userId));
  }
  
  return await query;
}

export async function buscarAssinaturaPorId(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(assinaturas).where(eq(assinaturas.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function buscarAssinaturaAtiva(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select()
    .from(assinaturas)
    .where(
      and(
        eq(assinaturas.userId, userId),
        eq(assinaturas.status, 'ativa')
      )
    )
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function criarAssinatura(data: InsertAssinatura) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(assinaturas).values(data);
  const assinaturaId = Number(result[0].insertId);
  return await buscarAssinaturaPorId(assinaturaId);
}

export async function atualizarAssinatura(id: number, data: Partial<InsertAssinatura>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(assinaturas).set({
    ...data,
    updatedAt: new Date(),
  }).where(eq(assinaturas.id, id));

  return await buscarAssinaturaPorId(id);
}

export async function deletarAssinatura(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(assinaturas).where(eq(assinaturas.id, id));
}

export async function cancelarAssinatura(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(assinaturas).set({
    status: 'cancelada',
    updatedAt: new Date(),
  }).where(eq(assinaturas.id, id));

  return await buscarAssinaturaPorId(id);
}

// ===== FUNÇÕES DE USO DE RECURSOS =====

export async function buscarUsoRecursos(userId: number, mesReferencia: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select()
    .from(usoRecursos)
    .where(
      and(
        eq(usoRecursos.userId, userId),
        eq(usoRecursos.mesReferencia, mesReferencia)
      )
    )
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function incrementarUsoRecurso(
  userId: number, 
  mesReferencia: string, 
  tipo: 'curriculos' | 'candidaturas' | 'analises'
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const usoAtual = await buscarUsoRecursos(userId, mesReferencia);

  if (!usoAtual) {
    // Criar novo registro
    await db.insert(usoRecursos).values({
      userId,
      mesReferencia,
      curriculosEnviados: tipo === 'curriculos' ? 1 : 0,
      candidaturasRealizadas: tipo === 'candidaturas' ? 1 : 0,
      analisesRealizadas: tipo === 'analises' ? 1 : 0,
    });
  } else {
    // Incrementar contador existente
    const updates: any = { updatedAt: new Date() };
    
    if (tipo === 'curriculos') {
      updates.curriculosEnviados = (usoAtual.curriculosEnviados || 0) + 1;
    } else if (tipo === 'candidaturas') {
      updates.candidaturasRealizadas = (usoAtual.candidaturasRealizadas || 0) + 1;
    } else if (tipo === 'analises') {
      updates.analisesRealizadas = (usoAtual.analisesRealizadas || 0) + 1;
    }

    await db.update(usoRecursos)
      .set(updates)
      .where(
        and(
          eq(usoRecursos.userId, userId),
          eq(usoRecursos.mesReferencia, mesReferencia)
        )
      );
  }

  return await buscarUsoRecursos(userId, mesReferencia);
}
