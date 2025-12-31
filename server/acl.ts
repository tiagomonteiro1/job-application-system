/**
 * Sistema de ACL (Access Control List)
 * Controla acesso a módulos baseado no plano do usuário
 */

import { buscarAssinaturaAtiva, buscarPlanoPorId, buscarUsoRecursos } from "./db";

/**
 * Módulos disponíveis no sistema
 */
export const MODULOS = {
  VAGAS: "vagas",
  CURRICULO: "curriculo",
  HISTORICO: "historico",
  NOTIFICACOES: "notificacoes",
  COMPATIBILIDADE: "compatibilidade",
  CARTA: "carta",
  PDF_PREMIUM: "pdf_premium",
} as const;

export type Modulo = typeof MODULOS[keyof typeof MODULOS];

/**
 * Verifica se o usuário tem acesso a um módulo específico
 */
export async function verificarAcessoModulo(userId: number, modulo: Modulo): Promise<boolean> {
  try {
    // Admin tem acesso a tudo
    // Nota: verificação de role deve ser feita antes de chamar esta função
    
    // Buscar assinatura ativa do usuário
    const assinatura = await buscarAssinaturaAtiva(userId);
    
    if (!assinatura) {
      // Sem assinatura = sem acesso
      return false;
    }

    // Verificar se assinatura está ativa
    if (assinatura.status !== 'ativa' && assinatura.status !== 'trial') {
      return false;
    }

    // Verificar se assinatura expirou
    if (assinatura.dataFim && new Date(assinatura.dataFim) < new Date()) {
      return false;
    }

    // Buscar plano
    const plano = await buscarPlanoPorId(assinatura.planoId);
    
    if (!plano || !plano.ativo) {
      return false;
    }

    // Verificar se módulo está permitido no plano
    let modulosPermitidos: string[] = [];
    try {
      modulosPermitidos = typeof plano.modulosPermitidos === 'string' 
        ? JSON.parse(plano.modulosPermitidos) 
        : plano.modulosPermitidos;
    } catch (e) {
      return false;
    }

    return modulosPermitidos.includes(modulo);
  } catch (error) {
    console.error('[ACL] Erro ao verificar acesso:', error);
    return false;
  }
}

/**
 * Verifica se o usuário atingiu o limite de uso de um recurso
 */
export async function verificarLimiteRecurso(
  userId: number, 
  tipo: 'curriculos' | 'candidaturas' | 'analises'
): Promise<{ permitido: boolean; usado: number; limite: number }> {
  try {
    // Buscar assinatura ativa
    const assinatura = await buscarAssinaturaAtiva(userId);
    
    if (!assinatura) {
      return { permitido: false, usado: 0, limite: 0 };
    }

    // Buscar plano
    const plano = await buscarPlanoPorId(assinatura.planoId);
    
    if (!plano) {
      return { permitido: false, usado: 0, limite: 0 };
    }

    // Obter limite do plano
    let limite = 0;
    if (tipo === 'curriculos') {
      limite = plano.limiteCurriculos || 0;
    } else if (tipo === 'candidaturas') {
      limite = plano.limiteCandidaturas || 0;
    } else {
      // Análises não têm limite específico, usar limite de candidaturas
      limite = plano.limiteCandidaturas || 0;
    }

    // Buscar uso atual do mês
    const mesAtual = new Date().toISOString().slice(0, 7); // YYYY-MM
    const usoAtual = await buscarUsoRecursos(userId, mesAtual);

    let usado = 0;
    if (usoAtual) {
      if (tipo === 'curriculos') {
        usado = usoAtual.curriculosEnviados || 0;
      } else if (tipo === 'candidaturas') {
        usado = usoAtual.candidaturasRealizadas || 0;
      } else {
        usado = usoAtual.analisesRealizadas || 0;
      }
    }

    const permitido = usado < limite;

    return { permitido, usado, limite };
  } catch (error) {
    console.error('[ACL] Erro ao verificar limite:', error);
    return { permitido: false, usado: 0, limite: 0 };
  }
}

/**
 * Busca informações completas do plano do usuário
 */
export async function buscarPlanoUsuario(userId: number) {
  try {
    const assinatura = await buscarAssinaturaAtiva(userId);
    
    if (!assinatura) {
      return null;
    }

    const plano = await buscarPlanoPorId(assinatura.planoId);
    
    if (!plano) {
      return null;
    }

    // Parse módulos permitidos
    let modulosPermitidos: string[] = [];
    try {
      modulosPermitidos = typeof plano.modulosPermitidos === 'string' 
        ? JSON.parse(plano.modulosPermitidos) 
        : plano.modulosPermitidos;
    } catch (e) {
      modulosPermitidos = [];
    }

    // Buscar uso do mês atual
    const mesAtual = new Date().toISOString().slice(0, 7);
    const usoAtual = await buscarUsoRecursos(userId, mesAtual);

    return {
      assinatura,
      plano: {
        ...plano,
        modulosPermitidos,
      },
      uso: {
        curriculos: {
          usado: usoAtual?.curriculosEnviados || 0,
          limite: plano.limiteCurriculos || 0,
        },
        candidaturas: {
          usado: usoAtual?.candidaturasRealizadas || 0,
          limite: plano.limiteCandidaturas || 0,
        },
        analises: {
          usado: usoAtual?.analisesRealizadas || 0,
          limite: plano.limiteCandidaturas || 0, // Usar mesmo limite
        },
      },
    };
  } catch (error) {
    console.error('[ACL] Erro ao buscar plano do usuário:', error);
    return null;
  }
}

/**
 * Middleware para verificar acesso a módulo
 * Lança erro se usuário não tiver acesso
 */
export async function requireModuloAccess(userId: number, userRole: string, modulo: Modulo) {
  // Admin tem acesso a tudo
  if (userRole === 'admin') {
    return true;
  }

  const temAcesso = await verificarAcessoModulo(userId, modulo);
  
  if (!temAcesso) {
    throw new Error(`Você não tem acesso ao módulo: ${modulo}. Faça upgrade do seu plano.`);
  }

  return true;
}

/**
 * Middleware para verificar limite de recurso
 * Lança erro se usuário atingiu o limite
 */
export async function requireLimiteRecurso(
  userId: number, 
  userRole: string,
  tipo: 'curriculos' | 'candidaturas' | 'analises'
) {
  // Admin não tem limites
  if (userRole === 'admin') {
    return true;
  }

  const { permitido, usado, limite } = await verificarLimiteRecurso(userId, tipo);
  
  if (!permitido) {
    throw new Error(
      `Limite de ${tipo} atingido (${usado}/${limite}). Faça upgrade do seu plano para continuar.`
    );
  }

  return true;
}
