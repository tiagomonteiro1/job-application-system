import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const integracoesRouter = router({
  /**
   * Listar todas as integrações
   */
  listar: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const integracoes: any = await db.execute(
      sql`SELECT * FROM integracoes_api ORDER BY createdAt DESC`
    );

    return integracoes || [];
  }),

  /**
   * Criar nova integração
   */
  criar: adminProcedure
    .input(
      z.object({
        nome: z.string().min(1),
        siteUrl: z.string().url(),
        apiUrl: z.string().url().optional(),
        apiKey: z.string().optional(),
        apiDocUrl: z.string().url().optional(),
        tipoAutenticacao: z.enum(["api_key", "oauth", "bearer", "basic", "nenhuma"]).optional(),
        formatoDados: z.enum(["json", "form-data", "xml"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.execute(
        sql`INSERT INTO integracoes_api (nome, siteUrl, apiUrl, apiKey, apiDocUrl, tipoAutenticacao, formatoDados, status) 
            VALUES (${input.nome}, ${input.siteUrl}, ${input.apiUrl || null}, ${input.apiKey || null}, ${input.apiDocUrl || null}, ${input.tipoAutenticacao || 'nenhuma'}, ${input.formatoDados || 'json'}, 'descobrindo')`
      );

      return { success: true };
    }),

  /**
   * Atualizar integração
   */
  atualizar: adminProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().optional(),
        siteUrl: z.string().url().optional(),
        apiUrl: z.string().url().optional(),
        apiKey: z.string().optional(),
        apiDocUrl: z.string().url().optional(),
        status: z.enum(["ativa", "inativa", "descobrindo"]).optional(),
        tipoAutenticacao: z.enum(["api_key", "oauth", "bearer", "basic", "nenhuma"]).optional(),
        metodoEnvio: z.string().optional(),
        formatoDados: z.enum(["json", "form-data", "xml"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updates } = input;
      
      // Construir query dinâmica
      const setClauses: string[] = [];
      const values: any[] = [];

      if (updates.nome) {
        setClauses.push(`nome = ?`);
        values.push(updates.nome);
      }
      if (updates.siteUrl) {
        setClauses.push(`siteUrl = ?`);
        values.push(updates.siteUrl);
      }
      if (updates.apiUrl !== undefined) {
        setClauses.push(`apiUrl = ?`);
        values.push(updates.apiUrl);
      }
      if (updates.apiKey !== undefined) {
        setClauses.push(`apiKey = ?`);
        values.push(updates.apiKey);
      }
      if (updates.apiDocUrl !== undefined) {
        setClauses.push(`apiDocUrl = ?`);
        values.push(updates.apiDocUrl);
      }
      if (updates.status) {
        setClauses.push(`status = ?`);
        values.push(updates.status);
      }
      if (updates.tipoAutenticacao) {
        setClauses.push(`tipoAutenticacao = ?`);
        values.push(updates.tipoAutenticacao);
      }
      if (updates.metodoEnvio) {
        setClauses.push(`metodoEnvio = ?`);
        values.push(updates.metodoEnvio);
      }
      if (updates.formatoDados) {
        setClauses.push(`formatoDados = ?`);
        values.push(updates.formatoDados);
      }

      if (setClauses.length === 0) {
        return { success: true };
      }

      setClauses.push(`updatedAt = NOW()`);
      values.push(id);

      // Usar sql template literal ao invés de raw
      const setClause = setClauses.map((clause, i) => {
        const value = values[i];
        return clause.replace('?', `'${value}'`);
      }).join(', ');
      
      await db.execute(sql.raw(`UPDATE integracoes_api SET ${setClause} WHERE id = ${id}`));

      return { success: true };
    }),

  /**
   * Deletar integração
   */
  deletar: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.execute(
        sql`DELETE FROM integracoes_api WHERE id = ${input.id}`
      );

      return { success: true };
    }),

  /**
   * Descobrir API automaticamente
   */
  descobrirApi: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar integração
      const integracao: any = await db.execute(
        sql`SELECT * FROM integracoes_api WHERE id = ${input.id} LIMIT 1`
      );

      if (!integracao || integracao.length === 0) {
        throw new Error("Integração não encontrada");
      }

      // TODO: Implementar lógica real de descoberta de API
      // Por enquanto, simular descoberta
      setTimeout(async () => {
        await simularDescobertaApi(input.id, integracao[0].siteUrl);
      }, 2000);

      return { success: true, message: "Descoberta de API iniciada!" };
    }),

  /**
   * Testar integração
   */
  testar: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar integração
      const integracao: any = await db.execute(
        sql`SELECT * FROM integracoes_api WHERE id = ${input.id} LIMIT 1`
      );

      if (!integracao || integracao.length === 0) {
        throw new Error("Integração não encontrada");
      }

      // TODO: Implementar teste real de API
      // Por enquanto, simular teste
      const sucesso = Math.random() > 0.3;

      if (sucesso) {
        await db.execute(
          sql`UPDATE integracoes_api SET status = 'ativa', testadoEm = NOW() WHERE id = ${input.id}`
        );
        return { success: true, message: "API testada com sucesso!" };
      } else {
        await db.execute(
          sql`UPDATE integracoes_api SET status = 'inativa' WHERE id = ${input.id}`
        );
        throw new Error("Falha ao testar API. Verifique as configurações.");
      }
    }),
});

/**
 * Simular descoberta de API (será substituído por lógica real)
 */
async function simularDescobertaApi(integracaoId: number, siteUrl: string) {
  const db = await getDb();
  if (!db) return;

  // Simular processamento
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Simular descoberta
  const descobriu = Math.random() > 0.4;

  if (descobriu) {
    // API descoberta com sucesso
    const apiUrl = `${siteUrl}/api/v1/jobs`;
    const metodoEnvio = "POST";
    
    await db.execute(
      sql`UPDATE integracoes_api 
          SET apiUrl = ${apiUrl}, 
              metodoEnvio = ${metodoEnvio}, 
              status = 'descobrindo',
              updatedAt = NOW() 
          WHERE id = ${integracaoId}`
    );

    console.log(`API descoberta para integração ${integracaoId}: ${apiUrl}`);
  } else {
    // Não conseguiu descobrir API
    await db.execute(
      sql`UPDATE integracoes_api 
          SET status = 'inativa',
              updatedAt = NOW() 
          WHERE id = ${integracaoId}`
    );

    console.log(`Não foi possível descobrir API para integração ${integracaoId}`);
  }
}
