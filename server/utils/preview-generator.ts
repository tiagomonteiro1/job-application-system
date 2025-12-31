import Mustache from 'mustache';
import fs from 'fs/promises';
import path from 'path';
import { parseCurriculoMarkdown } from './pdf-generator';

/**
 * Gera HTML preview do currículo para visualização em tempo real
 */
export async function gerarPreviewHTML(curriculoMarkdown: string): Promise<string> {
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

  return html;
}
