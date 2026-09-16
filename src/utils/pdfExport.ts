/**
 * ============================================================================
 * EXPORTAÇÃO DE RELATÓRIOS EM FORMATO PDF
 * ============================================================================
 * Este módulo utiliza as bibliotecas `jspdf` e `jspdf-autotable` para criar
 * relatórios formatados prontos para impressão ou arquivamento pastoral/contábil:
 *
 * 1. `exportFinanceReportPDF`: Gera um balancete analítico completo e elaborado
 *    contendo:
 *    - Cabeçalho institucional (IECVK) com monograma e faixas oficiais.
 *    - Indicadores executivos (KPIs) com cores temáticas e contagem de itens.
 *    - Gráficos integrados gerados em alta resolução (Canvas 2x DPI):
 *      * Comparativo Mensal (Entradas vs Saídas com destaque para o mês).
 *      * Distribuição de Despesas/Receitas por Categoria (Gráfico em Rosca + Legenda com %).
 *    - Quadro sintético de apuração por categoria.
 *    - Livro-caixa / extrato detalhado de lançamentos com linhas zebradas.
 *    - Bloco formal de prestação de contas com 3 assinaturas da diretoria/conselho.
 *    - Numeração automática em todas as páginas ("Página X de Y").
 *
 * 2. `exportMembersReportPDF`: Gera a lista congregação de membros com contatos,
 *    ministérios e dados cadastrais no mesmo padrão visual elegante.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FinanceEntry, Member } from '../types/types';
import { fmtBRL, monthLabel } from './utils';

/**
 * Opções complementares para a geração do relatório financeiro com gráficos.
 */
export interface FinanceReportExportOptions {
  /** Chave do período no formato 'AAAA-MM' ou 'all' */
  periodKey?: string;
  /** Conjunto completo de lançamentos para cálculo da evolução histórica */
  allFinance?: FinanceEntry[];
  /** Dados mensais pré-agrupados para o gráfico comparativo */
  monthlyData?: { ym: string; label: string; entradas: number; saidas: number }[];
  /** Gastos agrupados por categoria */
  expenseByCategory?: { name: string; value: number }[];
  /** Receitas agrupadas por categoria */
  incomeByCategory?: { name: string; value: number }[];
}

/**
 * Opções complementares para a geração do relatório de membros em PDF.
 */
export interface MembersReportExportOptions {
  /** Conjunto completo de membros para cálculo de percentuais comparativos */
  allMembers?: Member[];
  /** Observações ou nota pastoral complementar */
  notes?: string;
}

/**
 * Desenha um retângulo com cantos arredondados no contexto 2D do Canvas.
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Renderiza em um Canvas HTML5 off-screen os gráficos analíticos em alta resolução
 * (2x Retina / Print quality) para inserção direta no documento PDF:
 * 1. Gráfico de barras agrupadas com a evolução mensal (Entradas x Saídas).
 * 2. Gráfico de rosca com a distribuição de despesas por categoria e percentuais.
 *
 * @returns Data URL em formato PNG da imagem gerada.
 */
function generateFinancialChartsCanvas(
  monthlyData: { ym: string; label: string; entradas: number; saidas: number }[],
  expenseCategories: { name: string; value: number }[],
  incomeCategories: { name: string; value: number }[],
  selectedYm?: string
): string {
  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = 480;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Fundo geral transparente/branco
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Paleta de cores institucionais
  const greenColor = '#4B6656';
  const redColor = '#A6432D';
  const navyColor = '#1B2A4A';
  const goldColor = '#B8863B';
  const grayText = '#6B6B63';
  const cardBg = '#FBF9F5';
  const cardBorder = '#E8E3D9';

  // =========================================================================
  // GRÁFICO 1 (ESQUERDA): COMPARATIVO MENSAL DE ENTRADAS VS SAÍDAS
  // =========================================================================
  const card1X = 10;
  const card1Y = 10;
  const card1W = 580;
  const card1H = 460;

  // Fundo do Card 1
  ctx.fillStyle = cardBg;
  drawRoundedRect(ctx, card1X, card1Y, card1W, card1H, 12);
  ctx.fill();
  ctx.strokeStyle = cardBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Título e Subtítulo do Card 1
  ctx.fillStyle = navyColor;
  ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Comparativo Mensal (Entradas vs Saídas)', card1X + 24, card1Y + 36);

  ctx.fillStyle = grayText;
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Evolução histórica recente das finanças', card1X + 24, card1Y + 56);

  // Legenda no canto superior direito do Card 1
  // Entradas
  ctx.fillStyle = greenColor;
  ctx.fillRect(card1X + card1W - 200, card1Y + 26, 12, 12);
  ctx.fillStyle = navyColor;
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('Entradas', card1X + card1W - 182, card1Y + 37);

  // Saídas
  ctx.fillStyle = redColor;
  ctx.fillRect(card1X + card1W - 110, card1Y + 26, 12, 12);
  ctx.fillStyle = navyColor;
  ctx.fillText('Saídas', card1X + card1W - 92, card1Y + 37);

  // Preparação dos dados do gráfico de barras (até os últimos 6 meses para visualização despoluída)
  const displayMonths = monthlyData.slice(-6);

  if (displayMonths.length === 0) {
    ctx.fillStyle = grayText;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Nenhum dado mensal registrado.', card1X + card1W / 2, card1Y + card1H / 2);
    ctx.textAlign = 'left';
  } else {
    const plotX = card1X + 65;
    const plotY = card1Y + 90;
    const plotW = card1W - 85;
    const plotH = card1H - 145;

    // Encontra o valor máximo para a escala do eixo Y
    const maxVal = Math.max(
      ...displayMonths.map((d) => Math.max(d.entradas, d.saidas)),
      1000
    );
    const niceMax = Math.ceil(maxVal * 1.2 / 500) * 500;

    // Linhas de grade horizontais e rótulos da escala
    ctx.lineWidth = 1;
    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const lineY = plotY + plotH - (i / gridSteps) * plotH;
      const val = (i / gridSteps) * niceMax;

      ctx.strokeStyle = i === 0 ? '#C8C2B7' : '#E5DFD5';
      ctx.beginPath();
      ctx.moveTo(plotX, lineY);
      ctx.lineTo(plotX + plotW, lineY);
      ctx.stroke();

      // Rótulo monetário simplificado no eixo Y
      ctx.fillStyle = grayText;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      const labelText = val >= 1000 ? `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k` : `${Math.round(val)}`;
      ctx.fillText(labelText, plotX - 8, lineY + 3.5);
    }
    ctx.textAlign = 'left';

    // Barras agrupadas por mês
    const groupWidth = plotW / displayMonths.length;
    const barWidth = Math.min(22, (groupWidth - 20) / 2);

    displayMonths.forEach((d, idx) => {
      const groupCenterX = plotX + idx * groupWidth + groupWidth / 2;
      const isCurrent = selectedYm && d.ym === selectedYm;

      // Se for o mês atualmente selecionado no relatório, destaca a coluna com um fundo suave
      if (isCurrent) {
        ctx.fillStyle = 'rgba(184, 134, 59, 0.08)';
        drawRoundedRect(ctx, groupCenterX - groupWidth / 2 + 4, plotY - 10, groupWidth - 8, plotH + 20, 8);
        ctx.fill();

        ctx.fillStyle = goldColor;
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MÊS ATUAL', groupCenterX, plotY - 14);
      }

      // Barra de Entrada
      const hEntrada = (d.entradas / niceMax) * plotH;
      const xEntrada = groupCenterX - barWidth - 2;
      const yEntrada = plotY + plotH - hEntrada;

      ctx.fillStyle = greenColor;
      drawRoundedRect(ctx, xEntrada, yEntrada, barWidth, hEntrada, 4);
      ctx.fill();

      // Barra de Saída
      const hSaida = (d.saidas / niceMax) * plotH;
      const xSaida = groupCenterX + 2;
      const ySaida = plotY + plotH - hSaida;

      ctx.fillStyle = redColor;
      drawRoundedRect(ctx, xSaida, ySaida, barWidth, hSaida, 4);
      ctx.fill();

      // Rótulo do Mês abaixo do eixo X
      ctx.fillStyle = isCurrent ? navyColor : grayText;
      ctx.font = isCurrent ? 'bold 11px sans-serif' : '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, groupCenterX, plotY + plotH + 22);
    });
    ctx.textAlign = 'left';
  }

  // =========================================================================
  // GRÁFICO 2 (DIREITA): DISTRIBUIÇÃO DAS DESPESAS POR CATEGORIA (ROSCA)
  // =========================================================================
  const card2X = 610;
  const card2Y = 10;
  const card2W = 580;
  const card2H = 460;

  // Fundo do Card 2
  ctx.fillStyle = cardBg;
  drawRoundedRect(ctx, card2X, card2Y, card2W, card2H, 12);
  ctx.fill();
  ctx.strokeStyle = cardBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Dados a serem apresentados (preferência para Despesas, ou Receitas caso não haja despesas)
  const isExpense = expenseCategories.length > 0;
  const activeCategories = isExpense ? expenseCategories : incomeCategories;
  const totalActive = activeCategories.reduce((acc, c) => acc + c.value, 0);

  // Título e Subtítulo do Card 2
  ctx.fillStyle = navyColor;
  ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(
    isExpense ? 'Composição das Despesas no Período' : 'Composição das Receitas no Período',
    card2X + 24,
    card2Y + 36
  );

  ctx.fillStyle = grayText;
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Distribuição percentual por categoria', card2X + 24, card2Y + 56);

  if (activeCategories.length === 0 || totalActive === 0) {
    ctx.fillStyle = grayText;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Nenhuma categoria movimentada neste período.', card2X + card2W / 2, card2Y + card2H / 2);
    ctx.textAlign = 'left';
  } else {
    // Cores para as fatias do gráfico de rosca
    const sliceColors = [
      '#A6432D',
      '#B8863B',
      '#34456B',
      '#4B6656',
      '#8A7355',
      '#D97706',
      '#6B6B63',
      '#2B4C7E',
    ];

    // Centro e dimensões do gráfico de rosca
    const donutCenterX = card2X + 160;
    const donutCenterY = card2Y + 250;
    const outerRadius = 100;
    const innerRadius = 60;

    let startAngle = -Math.PI / 2;

    // Desenho das fatias
    activeCategories.forEach((cat, i) => {
      const sliceAngle = (cat.value / totalActive) * (Math.PI * 2);
      const endAngle = startAngle + sliceAngle;
      const color = sliceColors[i % sliceColors.length];

      ctx.beginPath();
      ctx.arc(donutCenterX, donutCenterY, outerRadius, startAngle, endAngle);
      ctx.arc(donutCenterX, donutCenterY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.fill();

      // Borda sutil separadora entre fatias
      ctx.strokeStyle = '#FBF9F5';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      startAngle = endAngle;
    });

    // Círculo interno da rosca (texto central)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(donutCenterX, donutCenterY, innerRadius - 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = grayText;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isExpense ? 'TOTAL SAÍDAS' : 'TOTAL ENTRADAS', donutCenterX, donutCenterY - 8);

    ctx.fillStyle = isExpense ? redColor : greenColor;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(fmtBRL(totalActive), donutCenterX, donutCenterY + 14);
    ctx.textAlign = 'left';

    // Lista de categorias com porcentagem ao lado direito
    const listX = card2X + 295;
    let listY = card2Y + 110;
    const maxItems = Math.min(activeCategories.length, 6);

    for (let i = 0; i < maxItems; i++) {
      const cat = activeCategories[i];
      const pct = ((cat.value / totalActive) * 100).toFixed(1);
      const color = sliceColors[i % sliceColors.length];

      // Marcador colorido
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(listX + 6, listY + 5, 5, 0, Math.PI * 2);
      ctx.fill();

      // Nome da categoria
      ctx.fillStyle = navyColor;
      ctx.font = 'bold 12px sans-serif';
      const truncatedName = cat.name.length > 18 ? cat.name.slice(0, 17) + '…' : cat.name;
      ctx.fillText(truncatedName, listX + 20, listY + 8);

      // Porcentagem e valor em R$
      ctx.fillStyle = grayText;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${pct}% (${fmtBRL(cat.value)})`, card2X + card2W - 24, listY + 8);
      ctx.textAlign = 'left';

      // Mini barra de progresso horizontal para visualização imediata
      ctx.fillStyle = '#E5DFD5';
      drawRoundedRect(ctx, listX + 20, listY + 14, card2W - 340, 4, 2);
      ctx.fill();

      ctx.fillStyle = color;
      const barW = Math.max(4, ((card2W - 340) * cat.value) / totalActive);
      drawRoundedRect(ctx, listX + 20, listY + 14, barW, 4, 2);
      ctx.fill();

      listY += 46;
    }
  }

  return canvas.toDataURL('image/png');
}

/**
 * Gera e realiza o download do relatório financeiro elaborado em PDF.
 * Inclui cabeçalho institucional, indicadores executivos, gráficos de alta
 * definição, tabela sintética por categoria, livro-caixa detalhado e assinaturas formais.
 *
 * @param entries Lista de lançamentos a serem exportados
 * @param periodLabel Rótulo do período (ex: "Março de 2026" ou "Todos os períodos")
 * @param options Opções adicionais de dados analíticos para enriquecer o documento
 */
export function exportFinanceReportPDF(
  entries: FinanceEntry[],
  periodLabel: string,
  options?: FinanceReportExportOptions
) {
  // Inicializa o documento no formato A4 retrato
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Ordena os lançamentos em ordem cronológica (mais antigos primeiro para leitura contábil de extrato)
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  // Totais consolidados
  const totals = sorted.reduce(
    (acc, e) => {
      if (e.type === 'entrada') {
        acc.entradas += Number(e.amount);
        acc.countEntradas += 1;
      } else {
        acc.saidas += Number(e.amount);
        acc.countSaidas += 1;
      }
      return acc;
    },
    { entradas: 0, saidas: 0, countEntradas: 0, countSaidas: 0 }
  );

  const saldo = totals.entradas - totals.saidas;
  const isSuperavit = saldo >= 0;

  // Prepara dados mensais se não foram fornecidos
  const monthlyData =
    options?.monthlyData ||
    (() => {
      const source = options?.allFinance || entries;
      const map: Record<string, { ym: string; entradas: number; saidas: number }> = {};
      source.forEach((f) => {
        const ym = f.date.slice(0, 7);
        if (!map[ym]) map[ym] = { ym, entradas: 0, saidas: 0 };
        map[ym][f.type === 'entrada' ? 'entradas' : 'saidas'] += Number(f.amount);
      });
      return Object.values(map)
        .sort((a, b) => a.ym.localeCompare(b.ym))
        .slice(-6)
        .map((d) => ({ ...d, label: monthLabel(d.ym) }));
    })();

  // Prepara categorias de despesas
  const expenseByCategory =
    options?.expenseByCategory ||
    (() => {
      const map: Record<string, number> = {};
      entries
        .filter((f) => f.type === 'saida')
        .forEach((f) => {
          map[f.category] = (map[f.category] || 0) + Number(f.amount);
        });
      return Object.entries(map)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    })();

  // Prepara categorias de receitas
  const incomeByCategory =
    options?.incomeByCategory ||
    (() => {
      const map: Record<string, number> = {};
      entries
        .filter((f) => f.type === 'entrada')
        .forEach((f) => {
          map[f.category] = (map[f.category] || 0) + Number(f.amount);
        });
      return Object.entries(map)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    })();

  // =========================================================================
  // 1. CABEÇALHO INSTITUCIONAL ELEGANTE (FAIXA AZUL MARINHO & DOURADO)
  // =========================================================================
  const headerHeight = 24;
  doc.setFillColor(27, 42, 74); // #1B2A4A Navy
  doc.roundedRect(margin, 12, contentWidth, headerHeight, 2, 2, 'F');

  // Faixa decorativa dourada
  doc.setFillColor(184, 134, 59); // #B8863B Gold
  doc.rect(margin, 12 + headerHeight - 1.5, contentWidth, 1.5, 'F');

  // Título e Subtítulo da Igreja
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('IGREJA EVANGÉLICA CONGREGACIONAL DE VILA KENNEDY', margin + 8, 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(226, 184, 116); // Dourado claro
  doc.text('DEMONSTRATIVO FINANCEIRO & BALANCETE CONTÁBIL', margin + 8, 27);

  // Identificação lateral direita
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('IECVK • OFICIAL', margin + contentWidth - 8, 22, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200, 210, 230);
  doc.text('GESTÃO DE TESOURARIA', margin + contentWidth - 8, 28, { align: 'right' });

  // =========================================================================
  // 2. BARRA DE METADADOS DO DOCUMENTO
  // =========================================================================
  const metaY = 42;
  doc.setFontSize(9.5);
  doc.setTextColor(27, 42, 74);
  doc.setFont('helvetica', 'bold');
  doc.text('Período de Apuração: ', margin, metaY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(periodLabel, margin + 37, metaY);

  // Data e hora de emissão
  const emissionDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  doc.text(`Emissão: ${emissionDate}`, margin + contentWidth, metaY, { align: 'right' });

  // Linha separadora
  doc.setDrawColor(220, 215, 205);
  doc.setLineWidth(0.3);
  doc.line(margin, metaY + 4, margin + contentWidth, metaY + 4);

  // =========================================================================
  // 3. QUADRO EXECUTIVO DE INDICADORES (KPIs EM CARDS COLORIDOS)
  // =========================================================================
  const kpiY = metaY + 8;
  const kpiWidth = (contentWidth - 8) / 3;
  const kpiHeight = 22;

  // Card 1: Total de Entradas (Verde)
  doc.setFillColor(243, 247, 244); // Fundo verde suave
  doc.setDrawColor(198, 218, 203); // Borda verde
  doc.roundedRect(margin, kpiY, kpiWidth, kpiHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(75, 102, 86);
  doc.text('TOTAL DE ENTRADAS', margin + 6, kpiY + 6);

  doc.setFontSize(12.5);
  doc.text(`+ ${fmtBRL(totals.entradas)}`, margin + 6, kpiY + 13.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(110, 120, 115);
  doc.text(`${totals.countEntradas} lançamento${totals.countEntradas === 1 ? '' : 's'}`, margin + 6, kpiY + 18.5);

  // Card 2: Total de Saídas (Terracota)
  const card2X = margin + kpiWidth + 4;
  doc.setFillColor(250, 244, 242); // Fundo terracota suave
  doc.setDrawColor(232, 201, 193); // Borda terracota
  doc.roundedRect(card2X, kpiY, kpiWidth, kpiHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(166, 67, 45);
  doc.text('TOTAL DE SAÍDAS', card2X + 6, kpiY + 6);

  doc.setFontSize(12.5);
  doc.text(`- ${fmtBRL(totals.saidas)}`, card2X + 6, kpiY + 13.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(130, 100, 95);
  doc.text(`${totals.countSaidas} lançamento${totals.countSaidas === 1 ? '' : 's'}`, card2X + 6, kpiY + 18.5);

  // Card 3: Saldo Líquido do Período (Azul Marinho)
  const card3X = card2X + kpiWidth + 4;
  doc.setFillColor(244, 246, 249); // Fundo azul suave
  doc.setDrawColor(204, 212, 226); // Borda azul
  doc.roundedRect(card3X, kpiY, kpiWidth, kpiHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(27, 42, 74);
  doc.text('SALDO DO PERÍODO', card3X + 6, kpiY + 6);

  doc.setFontSize(12.5);
  doc.setTextColor(isSuperavit ? 75 : 166, isSuperavit ? 102 : 67, isSuperavit ? 86 : 45);
  doc.text(fmtBRL(saldo), card3X + 6, kpiY + 13.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(90, 100, 115);
  const statusText = isSuperavit ? 'Superávit no período' : 'Déficit no período';
  doc.text(statusText, card3X + 6, kpiY + 18.5);

  // =========================================================================
  // 4. GRÁFICOS ANALÍTICOS INTEGRADOS EM ALTA RESOLUÇÃO
  // =========================================================================
  const chartImgY = kpiY + kpiHeight + 5;
  const chartImgHeight = 70; // mm

  try {
    const chartDataUrl = generateFinancialChartsCanvas(
      monthlyData,
      expenseByCategory,
      incomeByCategory,
      options?.periodKey
    );

    if (chartDataUrl) {
      doc.addImage(chartDataUrl, 'PNG', margin, chartImgY, contentWidth, chartImgHeight);
    }
  } catch (err) {
    console.warn('Não foi possível gerar os gráficos no Canvas:', err);
  }

  // =========================================================================
  // 5. QUADRO SINTÉTICO: RESUMO POR CATEGORIA
  // =========================================================================
  const categoryTableY = chartImgY + chartImgHeight + 5;

  // Monta linhas da tabela sintética de categorias
  const categoryRows: string[][] = [];

  incomeByCategory.forEach((cat) => {
    const pct = totals.entradas > 0 ? ((cat.value / totals.entradas) * 100).toFixed(1) + '%' : '—';
    categoryRows.push([cat.name, 'Receita (Entrada)', fmtBRL(cat.value), pct]);
  });

  expenseByCategory.forEach((cat) => {
    const pct = totals.saidas > 0 ? ((cat.value / totals.saidas) * 100).toFixed(1) + '%' : '—';
    categoryRows.push([cat.name, 'Despesa (Saída)', fmtBRL(cat.value), pct]);
  });

  if (categoryRows.length > 0) {
    autoTable(doc, {
      startY: categoryTableY,
      head: [['Categoria', 'Classificação', 'Total no Período', '% do Total do Tipo']],
      body: categoryRows,
      styles: {
        fontSize: 8.5,
        cellPadding: 2,
        textColor: [40, 40, 40],
      },
      headStyles: {
        fillColor: [27, 42, 74],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      alternateRowStyles: {
        fillColor: [251, 249, 245],
      },
      columnStyles: {
        2: { halign: 'right', fontStyle: 'bold' },
        3: { halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });
  }

  // =========================================================================
  // 6. LIVRO-CAIXA / EXTRATO ANALÍTICO COMPLETO DE LANÇAMENTOS
  // =========================================================================
  const currentY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || categoryTableY;

  // Verifica se há espaço suficiente para o título do extrato analítico na página atual
  if (currentY + 30 > 275) {
    doc.addPage();
  }

  const ledgerStartY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY
    ? ((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8 > 275
        ? 18
        : (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8)
    : 160;

  autoTable(doc, {
    startY: ledgerStartY,
    head: [['Data', 'Tipo', 'Categoria', 'Histórico / Descrição', 'Valor (R$)']],
    body: sorted.map((e) => [
      new Date(e.date + 'T00:00:00').toLocaleDateString('pt-BR'),
      e.type === 'entrada' ? 'Entrada' : 'Saída',
      e.category,
      e.description || '—',
      (e.type === 'entrada' ? '+ ' : '- ') + fmtBRL(e.amount),
    ]),
    foot: [
      [
        'TOTAIS CONSOLIDADOS',
        '',
        '',
        `Entradas: ${fmtBRL(totals.entradas)}  |  Saídas: ${fmtBRL(totals.saidas)}`,
        `Saldo: ${fmtBRL(saldo)}`,
      ],
    ],
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [30, 30, 30],
    },
    headStyles: {
      fillColor: [27, 42, 74],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    footStyles: {
      fillColor: [240, 237, 230],
      textColor: [27, 42, 74],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: [251, 249, 245],
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 20 },
      2: { cellWidth: 32 },
      4: { halign: 'right', fontStyle: 'bold', cellWidth: 32 },
    },
    margin: { left: margin, right: margin },
  });

  // Mensagem se a lista de lançamentos estiver vazia
  if (sorted.length === 0) {
    const emptyY = ledgerStartY + 10;
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text('Nenhum lançamento registrado neste período.', margin, emptyY);
  }

  // =========================================================================
  // 7. BLOCO FORMAL DE PRESTAÇÃO DE CONTAS E ASSINATURAS
  // =========================================================================
  let finalTableY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 200;

  // Se o espaço restante na página for insuficiente para o bloco de assinaturas (~48mm), cria nova página
  if (finalTableY + 48 > 275) {
    doc.addPage();
    finalTableY = 20;
  }

  const signBlockY = finalTableY + 12;

  // Data e declaração formal
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(
    `Declaro(amos) para os devidos fins que as informações acima conferem com os registros e comprovantes desta congregação.`,
    margin,
    signBlockY
  );

  const signLineY = signBlockY + 18;
  const colWidth = contentWidth / 3;

  // Assinatura 1: Tesouraria
  doc.setDrawColor(180);
  doc.setLineWidth(0.4);
  doc.line(margin + 4, signLineY, margin + colWidth - 8, signLineY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 42, 74);
  doc.text('Tesouraria Geral', margin + colWidth / 2 - 2, signLineY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text('Responsável pela Escrituração', margin + colWidth / 2 - 2, signLineY + 7.5, { align: 'center' });

  // Assinatura 2: Pastor Titular
  const col2Center = margin + colWidth + colWidth / 2;
  doc.line(margin + colWidth + 4, signLineY, margin + colWidth * 2 - 8, signLineY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 42, 74);
  doc.text('Pastor Presidente / Liderança', col2Center, signLineY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text('Visto Pastoral / Homologação', col2Center, signLineY + 7.5, { align: 'center' });

  // Assinatura 3: Conselho Fiscal
  const col3Center = margin + colWidth * 2 + colWidth / 2;
  doc.line(margin + colWidth * 2 + 4, signLineY, margin + contentWidth - 4, signLineY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 42, 74);
  doc.text('Conselho Fiscal / Auditoria', col3Center, signLineY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text('Conferência das Contas', col3Center, signLineY + 7.5, { align: 'center' });

  // =========================================================================
  // 8. RODAPÉ INSTITUCIONAL UNIFICADO EM TODAS AS PÁGINAS
  // =========================================================================
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Linha divisória do rodapé
    doc.setDrawColor(220, 215, 205);
    doc.setLineWidth(0.3);
    doc.line(margin, 287, margin + contentWidth, 287);

    // Texto institucional
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('IECVK • Sistema de Gestão Eclesiástica Integrada', margin, 291);

    // Numeração de página
    doc.text(`Página ${i} de ${totalPages}`, margin + contentWidth, 291, { align: 'right' });
  }

  // Nome seguro para o arquivo gerado
  const safeLabel = periodLabel.replace(/[/\\]/g, '-').replace(/\s+/g, '-').toLowerCase();
  doc.save(`relatorio-financeiro-iecvk-${safeLabel}.pdf`);
}

/**
 * Renderiza em um Canvas HTML5 off-screen os gráficos analíticos de membresia
 * em alta resolução (2x Retina / Print quality) para inserção direta no PDF:
 * 1. Gráfico de barras horizontais com a distribuição por Ministério/Departamento.
 * 2. Gráfico de rosca e indicadores com o Engajamento Ministerial e Comunhão.
 *
 * @returns Data URL em formato PNG da imagem gerada.
 */
function generateMembersChartsCanvas(
  ministries: { name: string; count: number; percentage: number }[],
  stats: {
    total: number;
    withMinistry: number;
    withoutMinistry: number;
    withPhone: number;
    withAddress: number;
    birthdaysThisMonth: number;
  }
): string {
  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = 480;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Fundo branco geral
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  const navyColor = '#1B2A4A';
  const goldColor = '#B8863B';
  const greenColor = '#4B6656';
  const redColor = '#A6432D';
  const blueColor = '#2C5282';
  const purpleColor = '#705E7B';
  const grayText = '#6B6B63';
  const cardBg = '#FBF9F5';
  const cardBorder = '#E8E3D9';

  const palette = [navyColor, goldColor, greenColor, redColor, blueColor, purpleColor, '#2A6F68', '#C25E00'];

  // =========================================================================
  // CARD 1 (ESQUERDA): DISTRIBUIÇÃO POR MINISTÉRIO / DEPARTAMENTO
  // =========================================================================
  const card1X = 10;
  const card1Y = 10;
  const card1W = 580;
  const card1H = 460;

  ctx.fillStyle = cardBg;
  drawRoundedRect(ctx, card1X, card1Y, card1W, card1H, 12);
  ctx.fill();
  ctx.strokeStyle = cardBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = navyColor;
  ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Distribuição por Departamento / Ministério', card1X + 24, card1Y + 36);

  ctx.fillStyle = grayText;
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Alocação e engajamento dos membros na congregação', card1X + 24, card1Y + 56);

  const topMinistries = ministries.slice(0, 6);
  if (topMinistries.length === 0) {
    ctx.fillStyle = grayText;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Nenhum departamento cadastrado.', card1X + card1W / 2, card1Y + card1H / 2);
    ctx.textAlign = 'left';
  } else {
    const listStartY = card1Y + 80;
    const itemHeight = Math.min(58, (card1H - 100) / topMinistries.length);

    topMinistries.forEach((item, index) => {
      const itemY = listStartY + index * itemHeight;
      const color = palette[index % palette.length];

      // Nome do ministério
      ctx.fillStyle = navyColor;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.name, card1X + 24, itemY + 12);

      // Quantidade e percentual
      ctx.fillStyle = grayText;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(
        `${item.count} membro${item.count === 1 ? '' : 's'} (${item.percentage.toFixed(1)}%)`,
        card1X + card1W - 24,
        itemY + 12
      );

      // Fundo da barra
      ctx.fillStyle = '#EBE7DE';
      drawRoundedRect(ctx, card1X + 24, itemY + 18, card1W - 48, 11, 5);
      ctx.fill();

      // Barra colorida proporcional
      const fillW = Math.max(10, ((card1W - 48) * Math.min(100, item.percentage)) / 100);
      ctx.fillStyle = color;
      drawRoundedRect(ctx, card1X + 24, itemY + 18, fillW, 11, 5);
      ctx.fill();
    });
    ctx.textAlign = 'left';
  }

  // =========================================================================
  // CARD 2 (DIREITA): ENGAJAMENTO ECLESIÁSTICO & COMUNHÃO
  // =========================================================================
  const card2X = 610;
  const card2Y = 10;
  const card2W = 580;
  const card2H = 460;

  ctx.fillStyle = cardBg;
  drawRoundedRect(ctx, card2X, card2Y, card2W, card2H, 12);
  ctx.fill();
  ctx.strokeStyle = cardBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = navyColor;
  ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Engajamento Eclesiástico & Comunhão', card2X + 24, card2Y + 36);

  ctx.fillStyle = grayText;
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Visão geral de atividade e contato para o pastoreio', card2X + 24, card2Y + 56);

  // Gráfico de Rosca Central (Engajados vs Sem Ministério)
  const donutCenterX = card2X + 130;
  const donutCenterY = card2Y + 185;
  const outerRadius = 75;
  const innerRadius = 48;

  const total = Math.max(stats.total, 1);
  const engRatio = Math.min(1, stats.withMinistry / total);

  // Arco 1: Com Ministério (Dourado)
  const angle1 = engRatio * 2 * Math.PI;
  ctx.beginPath();
  ctx.arc(donutCenterX, donutCenterY, outerRadius, -Math.PI / 2, -Math.PI / 2 + angle1);
  ctx.arc(donutCenterX, donutCenterY, innerRadius, -Math.PI / 2 + angle1, -Math.PI / 2, true);
  ctx.closePath();
  ctx.fillStyle = goldColor;
  ctx.fill();

  // Arco 2: Sem Ministério (Cinza)
  ctx.beginPath();
  ctx.arc(donutCenterX, donutCenterY, outerRadius, -Math.PI / 2 + angle1, -Math.PI / 2 + 2 * Math.PI);
  ctx.arc(donutCenterX, donutCenterY, innerRadius, -Math.PI / 2 + 2 * Math.PI, -Math.PI / 2 + angle1, true);
  ctx.closePath();
  ctx.fillStyle = '#D6D0C4';
  ctx.fill();

  // Centro da Rosca: Porcentagem
  ctx.fillStyle = navyColor;
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  const engPct = (engRatio * 100).toFixed(0);
  ctx.fillText(`${engPct}%`, donutCenterX, donutCenterY + 4);
  ctx.font = '9px sans-serif';
  ctx.fillStyle = grayText;
  ctx.fillText('ENGAJADOS', donutCenterX, donutCenterY + 18);

  // Legenda lateral ao lado da rosca
  const legX = card2X + 230;
  const legY = card2Y + 125;

  // Item 1: Em Ministérios
  ctx.fillStyle = goldColor;
  ctx.fillRect(legX, legY, 13, 13);
  ctx.fillStyle = navyColor;
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Atuando em Ministérios', legX + 20, legY + 11);
  ctx.fillStyle = grayText;
  ctx.font = '11px sans-serif';
  ctx.fillText(
    `${stats.withMinistry} membro(s) (${((stats.withMinistry / total) * 100).toFixed(1)}%)`,
    legX + 20,
    legY + 26
  );

  // Item 2: Membros Gerais
  ctx.fillStyle = '#D6D0C4';
  ctx.fillRect(legX, legY + 45, 13, 13);
  ctx.fillStyle = navyColor;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('Membros Gerais / Apoio', legX + 20, legY + 56);
  ctx.fillStyle = grayText;
  ctx.font = '11px sans-serif';
  ctx.fillText(
    `${stats.withoutMinistry} membro(s) (${((stats.withoutMinistry / total) * 100).toFixed(1)}%)`,
    legX + 20,
    legY + 71
  );

  // Mini-cards na parte inferior do Card 2
  const statBoxY = card2Y + 300;
  const boxWidth = (card2W - 48 - 14) / 2;
  const boxHeight = 125;

  // Mini Card 1: Cobertura Telefônica / WhatsApp
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, card2X + 24, statBoxY, boxWidth, boxHeight, 8);
  ctx.fill();
  ctx.strokeStyle = '#E2DDD3';
  ctx.stroke();

  ctx.fillStyle = greenColor;
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('CONTATO TELEFÔNICO', card2X + 36, statBoxY + 24);
  ctx.fillStyle = navyColor;
  ctx.font = 'bold 22px monospace';
  const phonePct = ((stats.withPhone / total) * 100).toFixed(0);
  ctx.fillText(`${phonePct}%`, card2X + 36, statBoxY + 56);
  ctx.fillStyle = grayText;
  ctx.font = '11px sans-serif';
  ctx.fillText(`${stats.withPhone} de ${stats.total} com celular`, card2X + 36, statBoxY + 80);
  ctx.fillText('Apto para avisos e pastoreio', card2X + 36, statBoxY + 98);

  // Mini Card 2: Aniversariantes do Mês
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, card2X + 24 + boxWidth + 14, statBoxY, boxWidth, boxHeight, 8);
  ctx.fill();
  ctx.strokeStyle = '#E2DDD3';
  ctx.stroke();

  ctx.fillStyle = redColor;
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('ANIVERSARIANTES DO MÊS', card2X + 36 + boxWidth + 14, statBoxY + 24);
  ctx.fillStyle = navyColor;
  ctx.font = 'bold 22px monospace';
  ctx.fillText(`${stats.birthdaysThisMonth}`, card2X + 36 + boxWidth + 14, statBoxY + 56);
  ctx.fillStyle = grayText;
  ctx.font = '11px sans-serif';
  ctx.fillText('Celebrando nova idade', card2X + 36 + boxWidth + 14, statBoxY + 80);
  ctx.fillText('Intercessão no culto dominical', card2X + 36 + boxWidth + 14, statBoxY + 98);

  return canvas.toDataURL('image/png');
}

/**
 * Gera e realiza o download do relatório eclesiástico e rol de membros elaborado em PDF.
 * Inclui cabeçalho institucional, indicadores executivos (KPIs), gráficos de alta
 * resolução, resumo ministerial estatístico, destaque de aniversariantes do mês,
 * rol completo em tabela zebrada e bloco formal de homologação eclesiástica.
 *
 * @param members Lista de membros filtrados a serem exportados
 * @param filterLabel Rótulo do filtro aplicado (ex: "Todos os membros", "Louvor")
 * @param options Opções adicionais de membresia e dados analíticos
 */
export function exportMembersReportPDF(
  members: Member[],
  filterLabel: string,
  options?: MembersReportExportOptions
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Ordena membros alfabeticamente pelo nome completo
  const sorted = [...members].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  const allSource = options?.allMembers || members;

  // Cálculos de engajamento e métricas pastorais
  const withMinistry = sorted.filter((m) => m.ministry && m.ministry.trim() !== '' && m.ministry !== 'Nenhum').length;
  const withoutMinistry = sorted.length - withMinistry;
  const withPhone = sorted.filter((m) => m.phone && m.phone.trim().length >= 4).length;
  const withAddress = sorted.filter((m) => m.address && m.address.trim().length >= 4).length;

  // Aniversariantes do mês corrente
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });
  const birthdaysThisMonthList = sorted
    .filter((m) => {
      if (!m.birthdate || m.birthdate.length < 7) return false;
      const mMonth = Number(m.birthdate.slice(5, 7));
      return mMonth === currentMonth;
    })
    .sort((a, b) => {
      const dayA = Number(a.birthdate.slice(8, 10)) || 0;
      const dayB = Number(b.birthdate.slice(8, 10)) || 0;
      return dayA - dayB;
    });

  // Agrupamento por Ministério / Departamento
  const ministryMap: Record<string, number> = {};
  sorted.forEach((m) => {
    const min = m.ministry && m.ministry.trim() ? m.ministry : 'Membros Gerais';
    ministryMap[min] = (ministryMap[min] || 0) + 1;
  });

  const ministryDistribution = Object.entries(ministryMap)
    .map(([name, count]) => ({
      name,
      count,
      percentage: sorted.length > 0 ? (count / sorted.length) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // =========================================================================
  // 1. CABEÇALHO INSTITUCIONAL ELEGANTE (FAIXA AZUL MARINHO & DOURADO)
  // =========================================================================
  const headerHeight = 24;
  doc.setFillColor(27, 42, 74); // #1B2A4A Navy
  doc.roundedRect(margin, 12, contentWidth, headerHeight, 2, 2, 'F');

  // Faixa decorativa dourada
  doc.setFillColor(184, 134, 59); // #B8863B Gold
  doc.rect(margin, 12 + headerHeight - 1.5, contentWidth, 1.5, 'F');

  // Título e Subtítulo da Igreja
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('IGREJA EVANGÉLICA CONGREGACIONAL DE VILA KENNEDY', margin + 8, 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(226, 184, 116); // Dourado claro
  doc.text('RELATÓRIO ESTATÍSTICO & ROL GERAL DE MEMBROS', margin + 8, 27);

  // Identificação lateral direita
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('IECVK • OFICIAL', margin + contentWidth - 8, 22, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200, 210, 230);
  doc.text('SECRETARIA GERAL & DIRETORIA', margin + contentWidth - 8, 28, { align: 'right' });

  // =========================================================================
  // 2. BARRA DE METADADOS DO DOCUMENTO
  // =========================================================================
  const metaY = 42;
  doc.setFontSize(9.5);
  doc.setTextColor(27, 42, 74);
  doc.setFont('helvetica', 'bold');
  doc.text('Filtro Aplicado: ', margin, metaY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(filterLabel, margin + 28, metaY);

  const emissionDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  doc.text(`Emissão: ${emissionDate}`, margin + contentWidth, metaY, { align: 'right' });

  // Linha separadora
  doc.setDrawColor(220, 215, 205);
  doc.setLineWidth(0.3);
  doc.line(margin, metaY + 4, margin + contentWidth, metaY + 4);

  // =========================================================================
  // 3. QUADRO EXECUTIVO DE INDICADORES (KPIs EM CARDS COLORIDOS)
  // =========================================================================
  const kpiY = metaY + 8;
  const kpiGap = 3;
  const kpiWidth = (contentWidth - kpiGap * 3) / 4;
  const kpiHeight = 22;

  // Card 1: Total do Rol (Azul Marinho)
  doc.setFillColor(244, 246, 249);
  doc.setDrawColor(204, 212, 226);
  doc.roundedRect(margin, kpiY, kpiWidth, kpiHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(27, 42, 74);
  doc.text('TOTAL DO ROL', margin + 5, kpiY + 6);

  doc.setFontSize(12.5);
  doc.text(`${sorted.length}`, margin + 5, kpiY + 13.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(90, 100, 115);
  const rolPercent = allSource.length > 0 ? ((sorted.length / allSource.length) * 100).toFixed(0) : '100';
  doc.text(`${rolPercent}% do cadastro geral`, margin + 5, kpiY + 18.5);

  // Card 2: Engajamento Ministerial (Dourado)
  const card2X = margin + kpiWidth + kpiGap;
  doc.setFillColor(252, 248, 241);
  doc.setDrawColor(234, 217, 185);
  doc.roundedRect(card2X, kpiY, kpiWidth, kpiHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(140, 95, 30);
  doc.text('EM MINISTÉRIOS', card2X + 5, kpiY + 6);

  doc.setFontSize(12.5);
  doc.text(`${withMinistry}`, card2X + 5, kpiY + 13.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 100, 75);
  const engPercent = sorted.length > 0 ? ((withMinistry / sorted.length) * 100).toFixed(0) : '0';
  doc.text(`${engPercent}% engajados`, card2X + 5, kpiY + 18.5);

  // Card 3: Aniversariantes do Mês (Verde)
  const card3X = card2X + kpiWidth + kpiGap;
  doc.setFillColor(243, 247, 244);
  doc.setDrawColor(198, 218, 203);
  doc.roundedRect(card3X, kpiY, kpiWidth, kpiHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(75, 102, 86);
  doc.text('ANIVERSARIANTES', card3X + 5, kpiY + 6);

  doc.setFontSize(12.5);
  doc.text(`${birthdaysThisMonthList.length}`, card3X + 5, kpiY + 13.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 115, 105);
  doc.text(`No mês de ${currentMonthName}`, card3X + 5, kpiY + 18.5);

  // Card 4: Contatos Atualizados (Terracota)
  const card4X = card3X + kpiWidth + kpiGap;
  doc.setFillColor(250, 244, 242);
  doc.setDrawColor(232, 201, 193);
  doc.roundedRect(card4X, kpiY, kpiWidth, kpiHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(166, 67, 45);
  doc.text('CONTATO ATIVO', card4X + 5, kpiY + 6);

  doc.setFontSize(12.5);
  const phonePercent = sorted.length > 0 ? ((withPhone / sorted.length) * 100).toFixed(0) : '0';
  doc.text(`${phonePercent}%`, card4X + 5, kpiY + 13.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(130, 95, 90);
  doc.text(`${withPhone} com telefone`, card4X + 5, kpiY + 18.5);

  // =========================================================================
  // 4. GRÁFICOS ANALÍTICOS INTEGRADOS EM ALTA RESOLUÇÃO (CANVAS 2X DPI)
  // =========================================================================
  const chartImgY = kpiY + kpiHeight + 5;
  const chartImgHeight = 70; // mm

  try {
    const chartDataUrl = generateMembersChartsCanvas(ministryDistribution, {
      total: sorted.length,
      withMinistry,
      withoutMinistry,
      withPhone,
      withAddress,
      birthdaysThisMonth: birthdaysThisMonthList.length,
    });

    if (chartDataUrl) {
      doc.addImage(chartDataUrl, 'PNG', margin, chartImgY, contentWidth, chartImgHeight);
    }
  } catch (err) {
    console.warn('Não foi possível gerar os gráficos de membros no Canvas:', err);
  }

  // =========================================================================
  // 5. QUADRO SINTÉTICO: RESUMO ESTATÍSTICO POR MINISTÉRIO
  // =========================================================================
  const summaryTableY = chartImgY + chartImgHeight + 5;

  const ministryRows: string[][] = ministryDistribution.map((m) => [
    m.name,
    `${m.count} membro${m.count === 1 ? '' : 's'}`,
    `${m.percentage.toFixed(1)}%`,
    m.name === 'Membros Gerais' ? 'Comunhão Geral / Apoio' : 'Atuação Departamental',
  ]);

  if (ministryRows.length > 0) {
    autoTable(doc, {
      startY: summaryTableY,
      head: [['Departamento / Ministério', 'Membros Ativos', '% do Rol Listado', 'Classificação']],
      body: ministryRows,
      styles: {
        fontSize: 8.5,
        cellPadding: 2,
        textColor: [40, 40, 40],
      },
      headStyles: {
        fillColor: [27, 42, 74],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      alternateRowStyles: {
        fillColor: [251, 249, 245],
      },
      columnStyles: {
        1: { halign: 'center', fontStyle: 'bold' },
        2: { halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });
  }

  // =========================================================================
  // 6. QUADRO ESPECIAL: ANIVERSARIANTES DO MÊS ATUAL (SE HOUVER)
  // =========================================================================
  let nextSectionY =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || summaryTableY;

  if (birthdaysThisMonthList.length > 0) {
    if (nextSectionY + 25 > 275) {
      doc.addPage();
      nextSectionY = 20;
    } else {
      nextSectionY += 6;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(75, 102, 86);
    doc.text(`Aniversariantes do Mês Vigente (${currentMonthName.toUpperCase()}):`, margin, nextSectionY);

    const bdayRows = birthdaysThisMonthList.map((m) => {
      const day = m.birthdate.slice(8, 10);
      return [
        `Dia ${day}`,
        m.name,
        m.ministry || 'Membros Gerais',
        m.phone || '—',
        'Felicitações & Intercessão',
      ];
    });

    autoTable(doc, {
      startY: nextSectionY + 2.5,
      head: [['Data', 'Nome Completo', 'Ministério', 'Contato', 'Finalidade Pastoral']],
      body: bdayRows,
      styles: {
        fontSize: 8,
        cellPadding: 1.8,
        textColor: [35, 35, 35],
      },
      headStyles: {
        fillColor: [75, 102, 86], // Verde suave
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      alternateRowStyles: {
        fillColor: [247, 250, 248],
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'center', cellWidth: 22 },
        3: { cellWidth: 28 },
      },
      margin: { left: margin, right: margin },
    });

    nextSectionY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || nextSectionY;
  }

  // =========================================================================
  // 7. ROL COMPLETO E DETALHADO DE MEMBROS (TABELA PRINCIPAL)
  // =========================================================================
  if (nextSectionY + 30 > 275) {
    doc.addPage();
    nextSectionY = 20;
  } else {
    nextSectionY += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(27, 42, 74);
  doc.text('Rol Geral e Detalhamento Cadastral de Membros:', margin, nextSectionY);

  autoTable(doc, {
    startY: nextSectionY + 3,
    head: [['#', 'Nome Completo', 'Ministério', 'Contato', 'Nascimento', 'Admissão', 'Endereço / Bairro']],
    body: sorted.map((m, idx) => [
      String(idx + 1).padStart(2, '0'),
      m.name,
      m.ministry || '—',
      m.phone || '—',
      m.birthdate ? new Date(m.birthdate + 'T00:00:00').toLocaleDateString('pt-BR') : '—',
      m.joinedDate ? new Date(m.joinedDate + 'T00:00:00').toLocaleDateString('pt-BR') : '—',
      m.address || '—',
    ]),
    foot: [
      [
        'TOTAL DE MEMBROS LISTADOS',
        `${sorted.length} membro(s) cadastrado(s)`,
        '',
        '',
        '',
        '',
        `IECVK • Rol Oficial`,
      ],
    ],
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [30, 30, 30],
    },
    headStyles: {
      fillColor: [27, 42, 74],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    footStyles: {
      fillColor: [240, 237, 230],
      textColor: [27, 42, 74],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: [251, 249, 245],
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold', cellWidth: 10 },
      1: { fontStyle: 'bold' },
      2: { cellWidth: 26 },
      3: { cellWidth: 26 },
      4: { halign: 'center', cellWidth: 22 },
      5: { halign: 'center', cellWidth: 22 },
    },
    margin: { left: margin, right: margin },
  });

  // Mensagem se a lista de membros estiver vazia
  if (sorted.length === 0) {
    const emptyY = nextSectionY + 12;
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text('Nenhum membro registrado para este filtro.', margin, emptyY);
  }

  // =========================================================================
  // 8. BLOCO FORMAL DE HOMOLOGAÇÃO ECLESIÁSTICA E ASSINATURAS
  // =========================================================================
  let finalTableY =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || nextSectionY + 20;

  // Se o espaço restante na página for insuficiente (~48mm), quebra para nova página
  if (finalTableY + 48 > 275) {
    doc.addPage();
    finalTableY = 20;
  }

  const signBlockY = finalTableY + 12;

  // Declaração formal eclesiástica
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(
    `Certifico para os devidos fins eclesiásticos e estatutários que o presente rol reflete fielmente os registros do livro de membros desta congregação.`,
    margin,
    signBlockY
  );

  const signLineY = signBlockY + 18;
  const colWidth = contentWidth / 3;

  // Assinatura 1: Secretaria Geral
  doc.setDrawColor(180);
  doc.setLineWidth(0.4);
  doc.line(margin + 4, signLineY, margin + colWidth - 8, signLineY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 42, 74);
  doc.text('Secretaria Geral', margin + colWidth / 2 - 2, signLineY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text('Lavratura e Rol de Membros', margin + colWidth / 2 - 2, signLineY + 7.5, { align: 'center' });

  // Assinatura 2: Pastor Titular / Liderança
  const col2Center = margin + colWidth + colWidth / 2;
  doc.line(margin + colWidth + 4, signLineY, margin + colWidth * 2 - 8, signLineY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 42, 74);
  doc.text('Pastor Presidente / Liderança', col2Center, signLineY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text('Homologação Pastoral', col2Center, signLineY + 7.5, { align: 'center' });

  // Assinatura 3: Conselho de Presbíteros / Diretoria
  const col3Center = margin + colWidth * 2 + colWidth / 2;
  doc.line(margin + colWidth * 2 + 4, signLineY, margin + contentWidth - 4, signLineY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 42, 74);
  doc.text('Conselho de Presbíteros / Diretoria', col3Center, signLineY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text('Aprovação Estatutária', col3Center, signLineY + 7.5, { align: 'center' });

  // =========================================================================
  // 9. RODAPÉ INSTITUCIONAL UNIFICADO EM TODAS AS PÁGINAS
  // =========================================================================
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Linha divisória do rodapé
    doc.setDrawColor(220, 215, 205);
    doc.setLineWidth(0.3);
    doc.line(margin, 287, margin + contentWidth, 287);

    // Texto institucional
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('IECVK • Igreja Evangélica Congregacional de Vila Kennedy — Secretaria Eclesiástica', margin, 291);

    // Numeração de página
    doc.text(`Página ${i} de ${totalPages}`, margin + contentWidth, 291, { align: 'right' });
  }

  // Nome do arquivo gerado
  const safeLabel = filterLabel.replace(/[/\\]/g, '-').replace(/\s+/g, '-').toLowerCase();
  doc.save(`rol-membros-iecvk-${safeLabel}.pdf`);
}


