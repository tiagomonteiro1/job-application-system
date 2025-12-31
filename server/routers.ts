import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { curriculoRouter } from "./routers/curriculo";
import { candidaturaRouter } from "./routers/candidatura";
import { compatibilidadeRouter } from "./routers/compatibilidade";
import { usuariosRouter } from "./routers/usuarios";
import { notificacoesRouter } from "./routers/notificacoes";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Feature routers
  curriculo: curriculoRouter,
  candidatura: candidaturaRouter,
  compatibilidade: compatibilidadeRouter,
  usuarios: usuariosRouter,
  notificacoes: notificacoesRouter,
});

export type AppRouter = typeof appRouter;
