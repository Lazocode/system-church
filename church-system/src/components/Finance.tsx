import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { fmtBRL, uid } from '../utils';
import EmptyState from './shared/EmptyState';
import FinanceForm from './FinanceForm';
import type { FinanceEntry } from '../types';

interface FinanceProps {
  finance: FinanceEntry[];
  setFinance: (next: FinanceEntry[]) => void;
}

export default function Finance({ finance, setFinance }: FinanceProps) {
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const sorted = [...finance].sort((a, b) => b.date.localeCompare(a.date));

  const addEntry = (entry: Omit<FinanceEntry, 'id'>) => {
    setFinance([...finance, { ...entry, id: uid() }]);
    setShowForm(false);
  };
  const removeEntry = (id: string) => {
    setFinance(finance.filter((f) => f.id !== id));
    setConfirmDelete(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 style={{ fontFamily: "'Fraunces', serif" }} className="text-2xl text-[#1B2A4A]">
          Lançamentos financeiros
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-[#B8863B] hover:bg-[#a3782f] text-[#1B2A4A] font-medium text-sm rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]"
        >
          <Plus size={16} /> Novo lançamento
        </button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState text="Nenhum lançamento cadastrado ainda." />
      ) : (
        <div className="bg-white rounded-xl border border-[#1B2A4A]/10 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[#6B6B63] border-b border-[#1B2A4A]/10">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 hidden md:table-cell">Descrição</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((f) => (
                <tr key={f.id} className="border-b border-[#1B2A4A]/5 last:border-0">
                  <td className="px-4 py-3 text-[#6B6B63]">
                    {new Date(f.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">{f.category}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-[#6B6B63]">{f.description || '—'}</td>
                  <td
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    className={`px-4 py-3 text-right font-medium ${f.type === 'entrada' ? 'text-[#4B6656]' : 'text-[#A6432D]'}`}
                  >
                    {f.type === 'entrada' ? '+' : '-'} {fmtBRL(f.amount)}
                  </td>
                  <td className="px-4 py-3">
                    {confirmDelete === f.id ? (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => removeEntry(f.id)} className="text-xs text-[#A6432D] font-medium">Sim</button>
                        <button onClick={() => setConfirmDelete(null)} className="text-xs text-[#6B6B63]">Não</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(f.id)}
                        className="p-1.5 rounded hover:bg-[#A6432D]/10 text-[#A6432D] float-right focus:outline-none focus:ring-2 focus:ring-[#B8863B]"
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

      {showForm && <FinanceForm onCancel={() => setShowForm(false)} onSave={addEntry} />}
    </div>
  );
}
