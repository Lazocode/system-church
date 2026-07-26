import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FinanceEntry } from './types';
import { fmtBRL } from './utils';

export function exportFinanceReportPDF(entries: FinanceEntry[], periodLabel: string) {
  const doc = new jsPDF();
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  const totals = sorted.reduce(
    (acc, e) => {
      if (e.type === 'entrada') acc.entradas += Number(e.amount);
      else acc.saidas += Number(e.amount);
      return acc;
    },
    { entradas: 0, saidas: 0 }
  );

  doc.setFontSize(16);
  doc.setTextColor(27, 42, 74);
  doc.text('Relatório Financeiro', 14, 18);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Período: ${periodLabel}`, 14, 26);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 32);

  doc.setFontSize(12);
  doc.setTextColor(75, 102, 86);
  doc.text(`Entradas: ${fmtBRL(totals.entradas)}`, 14, 44);
  doc.setTextColor(166, 67, 45);
  doc.text(`Saídas: ${fmtBRL(totals.saidas)}`, 14, 51);
  doc.setTextColor(27, 42, 74);
  doc.text(`Saldo: ${fmtBRL(totals.entradas - totals.saidas)}`, 14, 58);

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

  if (sorted.length === 0) {
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('Nenhum lançamento neste período.', 14, 74);
  }

  const safeLabel = periodLabel.replace(/[/\\]/g, '-').replace(/\s+/g, '-').toLowerCase();
  doc.save(`relatorio-financeiro-${safeLabel}.pdf`);
}
