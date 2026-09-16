/**
 * ============================================================================
 * MÓDULO DE GESTÃO DE MEMBROS (MEMBERS VIEW)
 * ============================================================================
 * Esta tela permite a administração completa dos membros da igreja:
 * - Listagem tabular responsiva dos membros cadastrados.
 * - Busca textual dinâmica em tempo real (filtrando por nome).
 * - Filtro por departamento ou ministério (Louvor, Infantil, Jovens, etc.).
 * - Cadastro e edição por meio do modal `MemberForm`.
 * - Exclusão com confirmação em duas etapas para evitar perdas acidentais.
 * - Exportação da lista filtrada para documento PDF estruturado.
 */

import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, FileDown, Users, Award, Cake, Phone } from 'lucide-react';
import { MINISTRIES } from '../../constants/constants';
import { uid } from '../../utils/utils';
import { exportMembersReportPDF } from '../../utils/pdfExport';
import EmptyState from '../shared/EmptyState';
import MemberForm, { type MemberFormData } from '../forms/MemberForm';
import type { Member } from '../../types/types';

/**
 * Propriedades do componente Members.
 */
interface MembersProps {
  /** Lista completa dos membros em memória */
  members: Member[];
  /** Callback para atualização da lista de membros */
  setMembers: (next: Member[]) => void;
}

/**
 * Componente da página de membros.
 */
export default function Members({ members, setMembers }: MembersProps) {
  // Controle de visibilidade do modal de formulário
  const [showForm, setShowForm] = useState(false);
  // Membro selecionado para edição (ou null se for novo cadastro)
  const [editing, setEditing] = useState<Member | null>(null);
  // Termo de busca textual por nome
  const [search, setSearch] = useState('');
  // Ministério selecionado no filtro ('all' para todos)
  const [ministryFilter, setMinistryFilter] = useState('all');
  // ID do membro que está aguardando confirmação de exclusão
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  /**
   * Filtra membros com base no termo de busca e ministério selecionado.
   */
  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) &&
      (ministryFilter === 'all' || m.ministry === ministryFilter)
  );

  /**
   * Salva um membro (novo ou editado).
   */
  const saveMember = (data: MemberFormData) => {
    if (editing) {
      setMembers(members.map((m) => (m.id === editing.id ? { ...data, id: editing.id } : m)));
    } else {
      setMembers([...members, { ...data, id: uid() }]);
    }
    setShowForm(false);
    setEditing(null);
  };

  /**
   * Remove um membro após a confirmação do usuário.
   */
  const removeMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
    setConfirmDelete(null);
  };

  // Monta o rótulo descritivo do filtro atual para inserção no cabeçalho do PDF
  const filterLabel =
    ministryFilter === 'all' && !search
      ? 'Todos os membros'
      : `${ministryFilter === 'all' ? 'Todos os ministérios' : ministryFilter}${search ? ` · busca "${search}"` : ''}`;

  // Métricas rápidas para autoexplicação do rol de membresia
  const totalCount = members.length;
  const withMinistryCount = members.filter(
    (m) => m.ministry && m.ministry !== 'Nenhum' && m.ministry.trim() !== ''
  ).length;
  const currentMonth = new Date().getMonth() + 1;
  const birthdaysThisMonthCount = members.filter(
    (m) => m.birthdate && Number(m.birthdate.slice(5, 7)) === currentMonth
  ).length;
  const withPhoneCount = members.filter(
    (m) => m.phone && m.phone.trim().length >= 4
  ).length;

  /**
   * Dispara a geração e download do relatório PDF com gráficos e indicadores.
   */
  const handleExportPDF = () => {
    exportMembersReportPDF(filtered, filterLabel, { allMembers: members });
  };

  return (
    <div>
      {/* Cabeçalho da página com contador e botões de ação */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 style={{ fontFamily: "'Fraunces', serif" }} className="text-2xl font-semibold text-[#1B2A4A]">
            Rol de Membros
          </h2>
          <p className="text-xs text-[#6B6B63] mt-0.5">
            Cadastro geral, ministérios e registros eclesiásticos da congregação
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportPDF}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 bg-[#1B2A4A] hover:bg-[#283C66] active:bg-[#142038] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg px-4 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-[#B8863B] shadow-sm hover:shadow"
            title="Exportar relatório eclesiástico completo em PDF (com gráficos e estatísticas)"
          >
            <FileDown size={16} className="text-[#B8863B]" />
            <span>Exportar Relatório PDF</span>
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="flex items-center gap-1.5 bg-[#B8863B] hover:bg-[#a3782f] active:bg-[#8f6825] text-[#1B2A4A] font-semibold text-sm rounded-lg px-4 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B2A4A] shadow-sm"
          >
            <Plus size={16} /> Novo Membro
          </button>
        </div>
      </div>

      {/* Faixa de Indicadores Rápidos (Autoexplicativo) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-[#FAF8F5] border border-[#1B2A4A]/10 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-[#6B6B63] mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Membros no Rol</span>
            <Users size={16} className="text-[#1B2A4A]" />
          </div>
          <div className="text-xl font-bold text-[#1B2A4A]">{totalCount}</div>
          <p className="text-[11px] text-[#6B6B63] mt-0.5">
            {filtered.length !== totalCount ? `${filtered.length} visíveis no filtro` : 'Congregação ativa'}
          </p>
        </div>

        <div className="bg-[#FAF8F5] border border-[#1B2A4A]/10 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-[#6B6B63] mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Em Ministérios</span>
            <Award size={16} className="text-[#B8863B]" />
          </div>
          <div className="text-xl font-bold text-[#1B2A4A]">
            {withMinistryCount}{' '}
            <span className="text-xs font-normal text-[#6B6B63]">
              ({totalCount > 0 ? Math.round((withMinistryCount / totalCount) * 100) : 0}%)
            </span>
          </div>
          <p className="text-[11px] text-[#6B6B63] mt-0.5">Atuando em departamentos</p>
        </div>

        <div className="bg-[#FAF8F5] border border-[#1B2A4A]/10 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-[#6B6B63] mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Aniversariantes</span>
            <Cake size={16} className="text-[#4B6656]" />
          </div>
          <div className="text-xl font-bold text-[#4B6656]">{birthdaysThisMonthCount}</div>
          <p className="text-[11px] text-[#6B6B63] mt-0.5">Comemorando este mês</p>
        </div>

        <div className="bg-[#FAF8F5] border border-[#1B2A4A]/10 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-[#6B6B63] mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Contato Ativo</span>
            <Phone size={16} className="text-[#A6432D]" />
          </div>
          <div className="text-xl font-bold text-[#1B2A4A]">
            {withPhoneCount}{' '}
            <span className="text-xs font-normal text-[#6B6B63]">
              ({totalCount > 0 ? Math.round((withPhoneCount / totalCount) * 100) : 0}%)
            </span>
          </div>
          <p className="text-[11px] text-[#6B6B63] mt-0.5">Com celular / WhatsApp</p>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B63]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar membro por nome…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#1B2A4A]/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]"
          />
        </div>
        <select
          value={ministryFilter}
          onChange={(e) => setMinistryFilter(e.target.value)}
          className="text-sm border border-[#1B2A4A]/15 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#B8863B]"
        >
          <option value="all">Todos os ministérios</option>
          {MINISTRIES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Tabela de Membros ou Estado Vazio */}
      {filtered.length === 0 ? (
        <EmptyState
          text={
            members.length === 0
              ? 'Nenhum membro cadastrado ainda.'
              : 'Nenhum membro encontrado com os filtros selecionados.'
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#1B2A4A]/10 overflow-hidden overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[#6B6B63] bg-[#F7F3EA]/50 border-b border-[#1B2A4A]/10">
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 hidden md:table-cell font-semibold">Contato</th>
                <th className="px-4 py-3 hidden lg:table-cell font-semibold">Ministério</th>
                <th className="px-4 py-3 w-28 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-[#1B2A4A]/5 last:border-0 hover:bg-[#F7F3EA]/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-[#1B2A4A]">{m.name}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-[#6B6B63]">
                    {m.phone || m.email || '—'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-[#6B6B63]">
                    {m.ministry ? (
                      <span className="inline-block px-2 py-0.5 rounded text-xs bg-[#1B2A4A]/5 text-[#1B2A4A] font-medium">
                        {m.ministry}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {confirmDelete === m.id ? (
                      <div className="flex gap-2 justify-end items-center">
                        <button
                          onClick={() => removeMember(m.id)}
                          className="text-xs text-[#A6432D] hover:underline font-semibold"
                        >
                          Excluir
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs text-[#6B6B63] hover:underline"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5 justify-end items-center">
                        <button
                          onClick={() => {
                            setEditing(m);
                            setShowForm(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-[#1B2A4A]/5 text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#B8863B] transition-colors"
                          title="Editar cadastro"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(m.id)}
                          className="p-1.5 rounded-lg hover:bg-[#A6432D]/10 text-[#A6432D] focus:outline-none focus:ring-2 focus:ring-[#B8863B] transition-colors"
                          title="Excluir membro"
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

      {/* Modal de Formulário */}
      {showForm && (
        <MemberForm
          initial={editing}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSave={saveMember}
        />
      )}
    </div>
  );
}

