/**
 * ============================================================================
 * MÓDULO DE LANÇAMENTOS FINANCEIROS (FINANCE VIEW)
 * ============================================================================
 * Exibe o livro-caixa detalhado da congregação:
 * - Listagem cronológica inversa (mais recentes no topo).
 * - Discriminação visual de valores com cores diferenciadas:
 *   - Verde (#4B6656) para entradas / receitas.
 *   - Terracota (#A6432D) para saídas / despesas.
 * - Formatação monetária padronizada em Real (R$).
 * - Adição de novos lançamentos via modal `FinanceForm`.
 * - Exclusão com confirmação preventiva de segurança.
 */

import { useState } from 'react';
import { Plus, Trash2, FileDown } from 'lucide-react';
import { fmtBRL, uid } from '../../utils/utils';
import { exportFinanceReportPDF } from '../../utils/pdfExport';
import EmptyState from '../shared/EmptyState';
import FinanceForm from '../forms/FinanceForm';
import type { FinanceEntry } from '../../types/types';

/**
 * Propriedades do componente Finance.
 */
interface FinanceProps {
  /** Lista completa dos lançamentos contábeis */
  finance: FinanceEntry[];
  /** Callback para atualizar o estado dos lançamentos */
  setFinance: (next: FinanceEntry[]) => void;
}

/**
 * Componente da página de movimentações financeiras.
 */
export default function Finance({ finance, setFinance }: FinanceProps) {
  // Controle de visibilidade do formulário de lançamento
  const [showForm, setShowForm] = useState(false);
  // ID do lançamento com exclusão pendente de confirmação
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Ordena os lançamentos por data decrescente (mais recentes primeiro)
  const sorted = [...finance].sort((a, b) => b.date.localeCompare(a.date));

  /**
   * Adiciona um novo lançamento gerando um identificador único.
   */
  const addEntry = (entry: Omit<FinanceEntry, 'id'>) => {
    setFinance([...finance, { ...entry, id: uid() }]);
    setShowForm(false);
  };

  /**
   * Exclui um lançamento com base no seu ID.
   */
  const removeEntry = (id: string) => {
    setFinance(finance.filter((f) => f.id !== id));
    setConfirmDelete(null);
  };

  return (
    <div>
      {/* Cabeçalho da página e botões de ação */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 style={{ fontFamily: "'Fraunces', serif" }} className="text-2xl font-semibold text-[#1B2A4A]">
          Lançamentos Financeiros ({finance.length})
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportFinanceReportPDF(finance, 'Geral - Todos os Lançamentos', { allFinance: finance })}
            className="flex items-center gap-1.5 bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[#1B2A4A] border border-[#1B2A4A]/20 font-medium text-sm rounded-lg px-4 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B2A4A] shadow-xs"
            title="Exportar balancete completo com gráficos em PDF"
          >
            <FileDown size={16} /> Exportar PDF
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-[#B8863B] hover:bg-[#a3782f] text-[#1B2A4A] font-semibold text-sm rounded-lg px-4 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B2A4A] shadow-sm"
          >
            <Plus size={16} /> Novo Lançamento
          </button>
        </div>
      </div>

      {/* Tabela do livro-caixa ou estado vazio */}
      {sorted.length === 0 ? (
        <EmptyState text="Nenhum lançamento financeiro cadastrado ainda." />
      ) : (
        <div className="bg-white rounded-xl border border-[#1B2A4A]/10 overflow-hidden overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[#6B6B63] bg-[#F7F3EA]/50 border-b border-[#1B2A4A]/10">
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Categoria</th>
                <th className="px-4 py-3 hidden md:table-cell font-semibold">Descrição</th>
                <th className="px-4 py-3 text-right font-semibold">Valor</th>
                <th className="px-4 py-3 w-20 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((f) => (
                <tr
                  key={f.id}
                  className="border-b border-[#1B2A4A]/5 last:border-0 hover:bg-[#F7F3EA]/30 transition-colors"
                >
                  {/* Data formatada no padrão brasileiro */}
                  <td className="px-4 py-3 text-[#6B6B63]">
                    {new Date(f.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </td>

                  {/* Categoria do lançamento */}
                  <td className="px-4 py-3 font-medium text-[#1B2A4A]">{f.category}</td>

                  {/* Descrição com fallback para travessão */}
                  <td className="px-4 py-3 hidden md:table-cell text-[#6B6B63]">
                    {f.description || '—'}
                  </td>

                  {/* Valor monetário com cor e sinal indicativo (+ ou -) */}
                  <td
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    className={`px-4 py-3 text-right font-semibold ${
                      f.type === 'entrada' ? 'text-[#4B6656]' : 'text-[#A6432D]'
                    }`}
                  >
                    {f.type === 'entrada' ? '+ ' : '- '}
                    {fmtBRL(f.amount)}
                  </td>

                  {/* Ação de exclusão */}
                  <td className="px-4 py-3 text-right">
                    {confirmDelete === f.id ? (
                      <div className="flex gap-2 justify-end items-center">
                        <button
                          onClick={() => removeEntry(f.id)}
                          className="text-xs text-[#A6432D] hover:underline font-semibold"
                        >
                          Excluir
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs text-[#6B6B63] hover:underline"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(f.id)}
                        className="p-1.5 rounded-lg hover:bg-[#A6432D]/10 text-[#A6432D] focus:outline-none focus:ring-2 focus:ring-[#B8863B] transition-colors"
                        title="Excluir lançamento"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Lançamento */}
      {showForm && <FinanceForm onCancel={() => setShowForm(false)} onSave={addEntry} />}
    </div>
  );
}

