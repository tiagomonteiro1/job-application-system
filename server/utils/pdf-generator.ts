import puppeteer from 'puppeteer';
import Mustache from 'mustache';
import fs from 'fs/promises';
import path from 'path';

interface CurriculoData {
  nome: string;
  cargo: string;
  telefone?: string;
  email?: string;
  localizacao?: string;
  linkedin?: string;
  github?: string;
  resumo?: string;
  destaques?: Array<{
    icone: string;
    valor: string;
    label: string;
  }>;
  competencias?: Array<{
    categoria: string;
    skills: string[];
  }>;
  experiencias?: Array<{
    cargo: string;
    empresa: string;
    periodo: string;
    descricao?: string;
    conquistas?: string[];
    tecnologias?: string;
  }>;
  formacao?: Array<{
    curso: string;
    instituicao: string;
    ano: string;
  }>;
  certificacoes?: string[];
  projetos?: Array<{
    titulo: string;
    descricao: string;
    metricas?: string;
  }>;
  idiomas?: Array<{
    idioma: string;
    nivel: string;
  }>;
}

/**
 * Extrai dados estruturados do currículo em markdown
 */
export function parseCurriculoMarkdown(markdown: string): CurriculoData {
  const lines = markdown.split('\n');
  const data: CurriculoData = {
    nome: '',
    cargo: '',
  };

  // Extrair nome (primeira linha com #)
  const nomeMatch = markdown.match(/^#\s+(.+)$/m);
  if (nomeMatch) {
    data.nome = nomeMatch[1].trim();
  }

  // Extrair cargo (linha após o nome, geralmente)
  const cargoMatch = markdown.match(/^#\s+.+\n(.+)$/m);
  if (cargoMatch) {
    data.cargo = cargoMatch[1].trim();
  }

  // Extrair contatos
  const emailMatch = markdown.match(/✉️\s*(.+@.+)/);
  if (emailMatch) data.email = emailMatch[1].trim();

  const telefoneMatch = markdown.match(/📞\s*(\([0-9]{2}\)\s*[0-9-]+)/);
  if (telefoneMatch) data.telefone = telefoneMatch[1].trim();

  const localizacaoMatch = markdown.match(/📍\s*(.+)/);
  if (localizacaoMatch) data.localizacao = localizacaoMatch[1].trim();

  const linkedinMatch = markdown.match(/🔗\s*(linkedin\.com\/[^\s]+)/);
  if (linkedinMatch) data.linkedin = linkedinMatch[1].trim();

  const githubMatch = markdown.match(/💻\s*(github\.com\/[^\s]+)/);
  if (githubMatch) data.github = githubMatch[1].trim();

  // Extrair resumo
  const resumoMatch = markdown.match(/##\s*Resumo\s+Executivo\s*\n+([\s\S]+?)(?=\n##|$)/i);
  if (resumoMatch) {
    data.resumo = resumoMatch[1].trim().replace(/\*\*/g, '');
  }

  // Extrair destaques
  const destaquesMatch = markdown.match(/##\s*Destaques[\s\S]+?(?=\n##|$)/i);
  if (destaquesMatch) {
    const destaquesText = destaquesMatch[0];
    data.destaques = [];
    
    const destaquesItems = destaquesText.match(/[-•]\s*\*\*(.+?)\*\*:?\s*(.+)/g);
    if (destaquesItems) {
      destaquesItems.forEach((item, index) => {
        const match = item.match(/[-•]\s*\*\*(.+?)\*\*:?\s*(.+)/);
        if (match) {
          const icones = ['✓', '★', '▲', '●'];
          data.destaques!.push({
            icone: icones[index % icones.length],
            valor: match[2].trim(),
            label: match[1].trim(),
          });
        }
      });
    }
  }

  // Extrair competências
  const competenciasMatch = markdown.match(/##\s*Competências[\s\S]+?(?=\n##|$)/i);
  if (competenciasMatch) {
    const compText = competenciasMatch[0];
    data.competencias = [];
    
    // Procurar por categorias (linhas com **Categoria:**)
    const categorias = compText.match(/\*\*(.+?):\*\*\s*(.+)/g);
    if (categorias) {
      categorias.forEach(cat => {
        const match = cat.match(/\*\*(.+?):\*\*\s*(.+)/);
        if (match) {
          data.competencias!.push({
            categoria: match[1].trim(),
            skills: match[2].split(/[,•]/).map(s => s.trim()).filter(s => s),
          });
        }
      });
    }
  }

  // Extrair experiências
  const experienciasMatch = markdown.match(/##\s*Experiência\s+Profissional\s*\n+([\s\S]+?)(?=\n##|$)/i);
  if (experienciasMatch) {
    const expText = experienciasMatch[1];
    data.experiencias = [];
    
    // Dividir por empresa (linhas com ###)
    const empresas = expText.split(/###\s+/).filter(e => e.trim());
    
    empresas.forEach(emp => {
      const lines = emp.split('\n');
      const primeiraLinha = lines[0];
      
      // Extrair cargo e empresa
      const cargoEmpresaMatch = primeiraLinha.match(/(.+?)\s*—\s*(.+)/);
      if (cargoEmpresaMatch) {
        const cargo = cargoEmpresaMatch[1].trim();
        const empresa = cargoEmpresaMatch[2].trim();
        
        // Extrair período
        const periodoMatch = emp.match(/(\d{4}\s*[-–]\s*(?:\d{4}|Atual))/);
        const periodo = periodoMatch ? periodoMatch[1] : '';
        
        // Extrair conquistas (linhas com ● ou -)
        const conquistas: string[] = [];
        const conquistasMatches = emp.match(/[●•-]\s*(.+)/g);
        if (conquistasMatches) {
          conquistasMatches.forEach(c => {
            const match = c.match(/[●•-]\s*(.+)/);
            if (match) {
              conquistas.push(match[1].trim());
            }
          });
        }
        
        // Extrair tecnologias
        const tecMatch = emp.match(/\*\*Tecnologias:\*\*\s*(.+)/);
        const tecnologias = tecMatch ? tecMatch[1].trim() : undefined;
        
        if (!data.experiencias) data.experiencias = [];
        data.experiencias.push({
          cargo,
          empresa,
          periodo,
          conquistas: conquistas.length > 0 ? conquistas : undefined,
          tecnologias,
        });
      }
    });
  }

  // Extrair formação
  const formacaoMatch = markdown.match(/##\s*Formação\s+Acadêmica\s*\n+([\s\S]+?)(?=\n##|$)/i);
  if (formacaoMatch) {
    const formText = formacaoMatch[1];
    data.formacao = [];
    
    const cursos = formText.match(/[-•]\s*\*\*(.+?)\*\*\s*—\s*(.+?)\s*\((\d{4})\)/g);
    if (cursos) {
      cursos.forEach(curso => {
        const match = curso.match(/[-•]\s*\*\*(.+?)\*\*\s*—\s*(.+?)\s*\((\d{4})\)/);
        if (match) {
          data.formacao!.push({
            curso: match[1].trim(),
            instituicao: match[2].trim(),
            ano: match[3],
          });
        }
      });
    }
  }

  // Extrair certificações
  const certMatch = markdown.match(/##\s*Certificações\s*\n+([\s\S]+?)(?=\n##|$)/i);
  if (certMatch) {
    const certText = certMatch[1];
    data.certificacoes = [];
    
    const certs = certText.match(/[-•✅]\s*(.+)/g);
    if (certs) {
      certs.forEach(cert => {
        const match = cert.match(/[-•✅]\s*(.+)/);
        if (match) {
          data.certificacoes!.push(match[1].trim().replace(/\*\*/g, ''));
        }
      });
    }
  }

  // Extrair projetos
  const projetosMatch = markdown.match(/##\s*Projetos[\s\S]+?(?=\n##|$)/i);
  if (projetosMatch) {
    const projText = projetosMatch[0];
    data.projetos = [];
    
    const projs = projText.split(/###\s+/).filter(p => p.trim());
    projs.forEach(proj => {
      const tituloMatch = proj.match(/^(.+)/);
      if (tituloMatch) {
        const titulo = tituloMatch[1].trim();
        const descMatch = proj.match(/\n(.+)/);
        const descricao = descMatch ? descMatch[1].trim() : '';
        
        const metricasMatch = proj.match(/\*\*(.+?)\*\*/g);
        const metricas = metricasMatch ? metricasMatch.join(' • ').replace(/\*\*/g, '') : undefined;
        
        data.projetos!.push({ titulo, descricao, metricas });
      }
    });
  }

  // Extrair idiomas
  const idiomasMatch = markdown.match(/##\s*Idiomas\s*\n+([\s\S]+?)(?=\n##|$)/i);
  if (idiomasMatch) {
    const idiomasText = idiomasMatch[1];
    data.idiomas = [];
    
    const idiomas = idiomasText.match(/[-•]\s*(.+?)\s*\((.+?)\)/g);
    if (idiomas) {
      idiomas.forEach(idioma => {
        const match = idioma.match(/[-•]\s*(.+?)\s*\((.+?)\)/);
        if (match) {
          data.idiomas!.push({
            idioma: match[1].trim(),
            nivel: match[2].trim(),
          });
        }
      });
    }
  }

  return data;
}

/**
 * Gera PDF premium a partir do currículo em markdown
 */
export async function gerarPDFPremium(
  curriculoMarkdown: string,
  outputPath: string
): Promise<void> {
  // Parse do markdown para dados estruturados
  const data = parseCurriculoMarkdown(curriculoMarkdown);
  
  // Adicionar data de geração
  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  (data as any).data_geracao = dataAtual;

  // Ler template HTML
  const templatePath = path.join(__dirname, '../templates/curriculo-premium.html');
  const template = await fs.readFile(templatePath, 'utf-8');

  // Renderizar HTML com Mustache
  const html = Mustache.render(template, data);

  // Gerar PDF com Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
    });
  } finally {
    await browser.close();
  }
}
