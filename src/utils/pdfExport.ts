/**
 * ============================================================================
 * EXPORTAÇÃO DE RELATÓRIOS EM FORMATO PDF
 * ============================================================================
 * Este módulo utiliza as bibliotecas `jspdf` e `jspdf-autotable` para criar
 * relatórios formatados prontos para impressão ou arquivamento pastoral/contábil:
 *
 * 1. `exportFinanceReportPDF`: Gera o balancete analítico com resumo de receitas,
 *    despesas, saldo consolidado e tabela detalhada das transações.
 * 2. `exportMembersReportPDF`: Gera a lista congregação de membros com contatos,
 *    ministérios e dados cadastrais.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FinanceEntry, Member } from '../types/types';
import { fmtBRL } from './utils';

/**
 * Gera e realiza o download do relatório financeiro consolidado em PDF.
 *
 * @param entries Lista de lançamentos financeiros a serem exportados
 * @param periodLabel Rótulo de identificação do período filtrado (ex: "Mar/2026" ou "Todos os períodos")
 */
export function exportFinanceReportPDF(entries: FinanceEntry[], periodLabel: string) {
  const doc = new jsPDF();
  
  // Ordena os lançamentos em ordem cronológica (mais antigos primeiro para leitura de extrato)
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  // Calcula os subtotais de receitas e despesas
  const totals = sorted.reduce(
    (acc, e) => {
      if (e.type === 'entrada') acc.entradas += Number(e.amount);
      else acc.saidas += Number(e.amount);
      return acc;
    },
    { entradas: 0, saidas: 0 }
  );

  // --- CABEÇALHO DO DOCUMENTO ---
  doc.setFontSize(16);
  doc.setTextColor(27, 42, 74); // Azul marinho institucional
  doc.text('Relatório Financeiro', 14, 18);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Período: ${periodLabel}`, 14, 26);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 32);

  // --- BLOCO DE INDICADORES (KPIs) ---
  doc.setFontSize(12);
  doc.setTextColor(75, 102, 86); // Verde para entradas
  doc.text(`Entradas: ${fmtBRL(totals.entradas)}`, 14, 44);
  
  doc.setTextColor(166, 67, 45); // Terracota para saídas
  doc.text(`Saídas: ${fmtBRL(totals.saidas)}`, 14, 51);
  
  doc.setTextColor(27, 42, 74);
  doc.text(`Saldo: ${fmtBRL(totals.entradas - totals.saidas)}`, 14, 58);

  // --- TABELA DE LANÇAMENTOS ---
  autoTable(doc, {
    startY: 66,
    head: [['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor']],
    body: sorted.map((e) => [
      new Date(e.date + 'T00:00:00').toLocaleDateString('pt-BR'),
      e.type === 'entrada' ? 'Entrada' : 'Saída',
      e.category,
      e.description || '—',
      (e.type === 'entrada' ? '+ ' : '- ') + fmtBRL(e.amount),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [27, 42, 74] },
    columnStyles: { 4: { halign: 'right' } },
  });

  // Mensagem caso não haja registros no período
  if (sorted.length === 0) {
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('Nenhum lançamento neste período.', 14, 74);
  }

  // Gera nome de arquivo amigável para download
  const safeLabel = periodLabel.replace(/[/\\]/g, '-').replace(/\s+/g, '-').toLowerCase();
  doc.save(`relatorio-financeiro-${safeLabel}.pdf`);
}

/**
 * Gera e realiza o download do relatório de membros em PDF.
 *
 * @param members Lista de membros filtrados
 * @param filterLabel Rótulo do filtro aplicado (ex: "Louvor", "Todos os membros")
 */
export function exportMembersReportPDF(members: Member[], filterLabel: string) {
  const doc = new jsPDF();
  
  // Ordena membros alfabeticamente pelo nome completo
  const sorted = [...members].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  // --- CABEÇALHO DO DOCUMENTO ---
  doc.setFontSize(16);
  doc.setTextColor(27, 42, 74);
  doc.text('Lista de Membros', 14, 18);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Filtro: ${filterLabel}`, 14, 26);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 32);
  doc.text(`Total: ${sorted.length} membro${sorted.length === 1 ? '' : 's'}`, 14, 38);

  // --- TABELA DE MEMBROS ---
  autoTable(doc, {
    startY: 46,
    head: [['Nome', 'Contato', 'Ministério', 'Nascimento', 'E-mail', 'Endereço']],
    body: sorted.map((m) => [
      m.name,
      m.phone || '—',
      m.ministry || '—',
      m.birthdate ? new Date(m.birthdate + 'T00:00:00').toLocaleDateString('pt-BR') : '—',
      m.email || '—',
      m.address || '—',
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [27, 42, 74] },
  });

  // Mensagem caso a lista esteja vazia
  if (sorted.length === 0) {
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('Nenhum membro encontrado.', 14, 54);
  }

  // Gera nome de arquivo amigável para download
  const safeLabel = filterLabel.replace(/[/\\]/g, '-').replace(/\s+/g, '-').toLowerCase();
  doc.save(`lista-membros-${safeLabel}.pdf`);
}

