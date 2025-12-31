import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sql, eq, desc } from "drizzle-orm";

export const automacoesRouter = router({
  /**
   * Obter credenciais do usuário
   */
  getCredenciais: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const result: any = await db.execute(
      sql`SELECT * FROM usuario_credenciais WHERE userId = ${ctx.user.id} LIMIT 1`
    );
    
    const rows = Array.isArray(result) ? result : (result.rows || []);
    return rows[0] || null;
  }),

  /**
   * Salvar credenciais do usuário
   */
  salvarCredenciais: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        senha: z.string().min(6),
        telefone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se já existe
      const existing: any = await db.execute(
        sql`SELECT id FROM usuario_credenciais WHERE userId = ${ctx.user.id} LIMIT 1`
      );

      if (existing && existing.length > 0) {
        // Atualizar
        await db.execute(
          sql`UPDATE usuario_credenciais SET email = ${input.email}, senha = ${input.senha}, telefone = ${input.telefone || null}, updatedAt = NOW() WHERE userId = ${ctx.user.id}`
        );
      } else {
        // Inserir
        await db.execute(
          sql`INSERT INTO usuario_credenciais (userId, email, senha, telefone) VALUES (${ctx.user.id}, ${input.email}, ${input.senha}, ${input.telefone || null})`
        );
      }

      return { success: true };
    }),

  /**
   * Iniciar varredura automática
   */
  iniciarVarredura: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Verificar se usuário tem credenciais cadastradas
    const credenciais: any = await db.execute(
      sql`SELECT * FROM usuario_credenciais WHERE userId = ${ctx.user.id} LIMIT 1`
    );

    if (!credenciais || credenciais.length === 0) {
      throw new Error("Cadastre suas credenciais antes de iniciar a varredura");
    }

    // Criar registro de varredura
    const result: any = await db.execute(
      sql`INSERT INTO automacoes_varredura (userId, status) VALUES (${ctx.user.id}, 'em_andamento')`
    );

    const varreduraId = result.insertId;

    // Iniciar varredura em background (simulação)
    // TODO: Implementar lógica real de varredura com Puppeteer/Playwright
    setTimeout(async () => {
      await simularVarredura(varreduraId, credenciais[0]);
    }, 1000);

    return { varreduraId, message: "Varredura iniciada com sucesso!" };
  }),

  /**
   * Listar varreduras do usuário
   */
  listarVarreduras: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const varreduras: any = await db.execute(
      sql`SELECT * FROM automacoes_varredura WHERE userId = ${ctx.user.id} ORDER BY dataInicio DESC LIMIT 100`
    );

    const rows = Array.isArray(varreduras) ? varreduras : (varreduras.rows || []);
    return rows;
  }),

  /**
   * Obter detalhes de uma varredura
   */
  getVarredura: protectedProcedure
    .input(z.object({ varreduraId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const varredura: any = await db.execute(
        sql`SELECT * FROM automacoes_varredura WHERE id = ${input.varreduraId} AND userId = ${ctx.user.id} LIMIT 1`
      );

      const varreduraRows = Array.isArray(varredura) ? varredura : (varredura.rows || []);
      if (varreduraRows.length === 0) {
        throw new Error("Varredura não encontrada");
      }

      const resultados: any = await db.execute(
        sql`SELECT * FROM varredura_resultados WHERE varreduraId = ${input.varreduraId} ORDER BY createdAt DESC`
      );

      const resultadosRows = Array.isArray(resultados) ? resultados : (resultados.rows || []);

      return {
        ...varreduraRows[0],
        resultados: resultadosRows,
      };
    }),
});

/**
 * Simular varredura de sites (será substituído por lógica real)
 */
async function simularVarredura(varreduraId: number, credenciais: any) {
  const db = await getDb();
  if (!db) return;

  // Sites populares de vagas no Brasil
  const sites = [
    { nome: "LinkedIn", url: "https://www.linkedin.com/jobs" },
    { nome: "InfoJobs", url: "https://www.infojobs.com.br" },
    { nome: "Catho", url: "https://www.catho.com.br" },
    { nome: "Vagas.com", url: "https://www.vagas.com.br" },
    { nome: "Gupy", url: "https://www.gupy.io" },
    { nome: "Indeed", url: "https://br.indeed.com" },
    { nome: "Glassdoor", url: "https://www.glassdoor.com.br" },
    { nome: "Trampos", url: "https://www.trampos.co" },
  ];

  let sucessos = 0;
  let pendentes = 0;
  let erros = 0;

  for (const site of sites) {
    // Simular processamento
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simular resultado aleatório
    const random = Math.random();
    let status: "sucesso" | "pendente" | "erro";
    let mensagem: string;
    let linkContinuar: string | null = null;

    if (random < 0.3) {
      status = "sucesso";
      mensagem = "Cadastro realizado com sucesso! Currículo enviado.";
      sucessos++;
    } else if (random < 0.7) {
      status = "pendente";
      mensagem = "Cadastro iniciado. Necessário completar CAPTCHA ou verificação manual.";
      linkContinuar = `${site.url}/register`;
      pendentes++;
    } else {
      status = "erro";
      mensagem = "Erro ao acessar o site. Site pode estar fora do ar ou bloqueou o acesso automatizado.";
      erros++;
    }

    // Inserir resultado
    await db.execute(
      sql`INSERT INTO varredura_resultados (varreduraId, siteName, siteUrl, status, mensagem, linkContinuar) VALUES (${varreduraId}, ${site.nome}, ${site.url}, ${status}, ${mensagem}, ${linkContinuar})`
    );
  }

  // Atualizar varredura
  await db.execute(
    sql`UPDATE automacoes_varredura SET status = 'concluida', totalSites = ${sites.length}, sucessos = ${sucessos}, pendentes = ${pendentes}, erros = ${erros}, dataFim = NOW() WHERE id = ${varreduraId}`
  );

  // TODO: Enviar notificação ao usuário
  console.log(`Varredura ${varreduraId} concluída: ${sucessos} sucessos, ${pendentes} pendentes, ${erros} erros`);
}
