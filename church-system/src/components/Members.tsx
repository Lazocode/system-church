import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, FileDown } from 'lucide-react';
import { MINISTRIES } from '../constants';
import { uid } from '../utils';
import { exportMembersReportPDF } from '../pdfExport';
import EmptyState from './shared/EmptyState';
import MemberForm from './MemberForm';
import type { Member } from '../types';

interface MembersProps {
  members: Member[];
  setMembers: (next: Member[]) => void;
}

export default function Members({ members, setMembers }: MembersProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [search, setSearch] = useState('');
  const [ministryFilter, setMinistryFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) &&
      (ministryFilter === 'all' || m.ministry === ministryFilter)
  );

  const saveMember = (data: Omit<Member, 'id'>) => {
    if (editing) {
      setMembers(members.map((m) => (m.id === editing.id ? { ...data, id: editing.id } : m)));
    } else {
      setMembers([...members, { ...data, id: uid() }]);
    }
    setShowForm(false);
    setEditing(null);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
    setConfirmDelete(null);
  };

  const filterLabel =
    ministryFilter === 'all' && !search
      ? 'Todos os membros'
      : `${ministryFilter === 'all' ? 'Todos os ministérios' : ministryFilter}${search ? ` · busca "${search}"` : ''}`;

  const handleExportPDF = () => {
    exportMembersReportPDF(filtered, filterLabel);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 style={{ fontFamily: "'Fraunces', serif" }} className="text-2xl text-[#1B2A4A]">
          Membros ({members.length})
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 bg-[#1B2A4A] hover:bg-[#34456B] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8863B]"
          >
            <FileDown size={16} /> Exportar PDF
          </button>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-1.5 bg-[#B8863B] hover:bg-[#a3782f] text-[#1B2A4A] font-medium text-sm rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]"
          >
            <Plus size={16} /> Novo membro
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B63]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#1B2A4A]/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]"
          />
        </div>
        <select
          value={ministryFilter}
          onChange={(e) => setMinistryFilter(e.target.value)}
          className="text-sm border border-[#1B2A4A]/15 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#B8863B]"
        >
          <option value="all">Todos os ministérios</option>
          {MINISTRIES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState text={members.length === 0 ? 'Nenhum membro cadastrado ainda.' : 'Nenhum membro encontrado com esse filtro.'} />
      ) : (
        <div className="bg-white rounded-xl border border-[#1B2A4A]/10 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[#6B6B63] border-b border-[#1B2A4A]/10">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3 hidden md:table-cell">Contato</th>
                <th className="px-4 py-3 hidden lg:table-cell">Ministério</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-[#1B2A4A]/5 last:border-0">
                  <td className="px-4 py-3 font-medium text-[#1B2A4A]">{m.name}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-[#6B6B63]">{m.phone || m.email || '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-[#6B6B63]">{m.ministry || '—'}</td>
                  <td className="px-4 py-3">
                    {confirmDelete === m.id ? (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => removeMember(m.id)} className="text-xs text-[#A6432D] font-medium">Confirmar</button>
                        <button onClick={() => setConfirmDelete(null)} className="text-xs text-[#6B6B63]">Cancelar</button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { setEditing(m); setShowForm(true); }}
                          className="p-1.5 rounded hover:bg-[#1B2A4A]/5 text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#B8863B]"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(m.id)}
                          className="p-1.5 rounded hover:bg-[#A6432D]/10 text-[#A6432D] focus:outline-none focus:ring-2 focus:ring-[#B8863B]"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <MemberForm initial={editing} onCancel={() => { setShowForm(false); setEditing(null); }} onSave={saveMember} />
      )}
    </div>
  );
}
