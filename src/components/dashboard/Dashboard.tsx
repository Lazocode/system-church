/**
 * ============================================================================
 * PAINEL ANALÍTICO / DASHBOARD FINANCEIRO
 * ============================================================================
 * Centraliza as métricas analíticas e visuais da saúde financeira da congregação:
 * - Indicadores-chave (KPIs): Total de Entradas, Total de Saídas e Saldo Líquido.
 * - Gráfico de Barras (Recharts): Comparativo mensal de Entradas vs Saídas.
 * - Gráfico de Rosca / Pizza (Recharts): Distribuição de despesas por categoria.
 * - Filtro dinâmico por período (mês específico ou histórico consolidado).
 * - Exportação de relatório contábil em PDF através do `exportFinanceReportPDF`.
 */

import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Wallet, FileDown } from 'lucide-react';
import { PALETTE } from '../../constants/constants';
import { fmtBRL, monthLabel } from '../../utils/utils';
import { exportFinanceReportPDF } from '../../utils/pdfExport';
import StatCard from '../shared/StatCard';
import EmptyState from '../shared/EmptyState';
import type { FinanceEntry } from '../../types/types';

// ==========================================
// INTERFACES & TIPAGENS
// ==========================================

interface DashboardProps {
  /** Lista completa de lançamentos financeiros */
  finance: FinanceEntry[];
}

interface MonthlyDatum {
  /** Ano e Mês no formato YYYY-MM */
  ym: string;
  /** Soma das entradas no mês */
  entradas: number;
  /** Soma das saídas no mês */
  saidas: number;
  /** Rótulo formatado para exibição visual (ex: "Jan/26") */
  label: string;
}

interface CategoryDatum {
  /** Nome da categoria */
  name: string;
  /** Valor total gasto na categoria */
  value: number;
}


// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function Dashboard({ finance }: DashboardProps) {
  // ------------------------------------------
  // ESTADOS LOCAIS
  // ------------------------------------------
  
  /** Filtro de período selecionado ('all' para todos ou 'YYYY-MM') */
  const [period, setPeriod] = useState<string>('all');

  // ------------------------------------------
  // MEMOIZACÕES E PROCESSAMENTO DE DADOS
  // ------------------------------------------

  /**
   * Extrai e ordena todos os meses/anos únicos presentes no histórico financeiro.
   */
  const months = useMemo(() => {
    const set = new Set(finance.map((f) => f.date.slice(0, 7)));
    return Array.from(set).sort();
  }, [finance]);

  /**
   * Filtra os lançamentos financeiros com base no período selecionado no dropdown.
   */
  const filtered = period === 'all' 
    ? finance 
    : finance.filter((f) => f.date.slice(0, 7) === period);

  /**
   * Calcula o total consolidado de entradas e saídas do período filtrado.
   */
  const totals = filtered.reduce(
    (acc, f) => {
      if (f.type === 'entrada') acc.entradas += Number(f.amount);
      else acc.saidas += Number(f.amount);
      return acc;
    },
    { entradas: 0, saidas: 0 }
  );

  /**
   * Agrupa e calcula as entradas e saídas por mês para alimentar o gráfico de barras.
   * Retorna até os últimos 12 meses registrados.
   */
  const monthlyData: MonthlyDatum[] = useMemo(() => {
    const map: Record<string, { ym: string; entradas: number; saidas: number }> = {};
    
    finance.forEach((f) => {
      const ym = f.date.slice(0, 7);
      if (!map[ym]) map[ym] = { ym, entradas: 0, saidas: 0 };
      map[ym][f.type === 'entrada' ? 'entradas' : 'saidas'] += Number(f.amount);
    });

    return Object.values(map)
      .sort((a, b) => a.ym.localeCompare(b.ym))
      .slice(-12)
      .map((d) => ({ ...d, label: monthLabel(d.ym) }));
  }, [finance]);

  /**
   * Agrupa os gastos de saídas por categoria para alimentar o gráfico de distribuição (rosca).
   */
  const expenseByCategory: CategoryDatum[] = useMemo(() => {
    const map: Record<string, number> = {};
    
    filtered
      .filter((f) => f.type === 'saida')
      .forEach((f) => {
        map[f.category] = (map[f.category] || 0) + Number(f.amount);
      });

    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // Texto formatado do período para exibição em títulos e no relatório PDF
  const periodLabel = period === 'all' ? 'Todos os períodos' : monthLabel(period);

  // ------------------------------------------
  // HANDLERS / AÇÕES DO USUÁRIO
  // ------------------------------------------

  /**
   * Dispara a geração e o download do relatório em PDF dos lançamentos filtrados.
   */
  const handleExportPDF = () => {
    exportFinanceReportPDF(filtered, periodLabel);
  };

  // ------------------------------------------
  // RENDERIZAÇÃO DA INTERFACE
  // ------------------------------------------

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-1 sm:px-0 py-2">
      
      {/* 1. CABEÇALHO DO PAINEL E CONTROLES */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#1B2A4A]/10">
        <div>
          <h2 style={{ fontFamily: "'Fraunces', serif" }} className="text-3xl font-bold text-[#1B2A4A] tracking-tight">
            Painel Financeiro
          </h2>
          <p className="text-xs text-[#6B6B63] mt-0.5">Visão geral das receitas e despesas registradas</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
          {/* Seletor de Período (Mês/Ano) */}
          <div className="relative flex-1 sm:flex-initial min-w-[180px]">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full text-sm border border-[#1B2A4A]/20 rounded-xl px-3.5 py-2.5 bg-white text-[#1B2A4A] font-medium shadow-sm hover:border-[#B8863B] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all cursor-pointer"
            >
              <option value="all">Todos os períodos</option>
              {months.map((m) => (
                <option key={m} value={m}>{monthLabel(m)}</option>
              ))}
            </select>
          </div>

          {/* Botão para Exportação de Relatório PDF */}
          <button
            onClick={handleExportPDF}
            disabled={filtered.length === 0}
            className="flex items-center justify-center gap-2 bg-[#1B2A4A] hover:bg-[#253963] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 text-white text-sm font-semibold rounded-xl px-4 py-2.5 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#B8863B]"
          >
            <FileDown size={18} className="stroke-[2.2]" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* 2. CARDS DE RESUMO FINANCEIRO (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard label="Entradas" value={fmtBRL(totals.entradas)} color="#4B6656" Icon={ArrowUpCircle} />
        <StatCard label="Saídas" value={fmtBRL(totals.saidas)} color="#A6432D" Icon={ArrowDownCircle} />
        <StatCard label="Saldo Líquido" value={fmtBRL(totals.entradas - totals.saidas)} color="#1B2A4A" Icon={Wallet} />
      </div>

      {/* 3. SEÇÃO DE GRÁFICOS / ESTADO VAZIO */}
      {finance.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-[#1B2A4A]/10 shadow-sm">
          <EmptyState text="Nenhum lançamento ainda. Adicione o primeiro na aba Financeiro." />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Gráfico 1: Comparativo Mensal de Entradas vs Saídas */}
          <div className="bg-white rounded-2xl p-6 border border-[#1B2A4A]/10 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1B2A4A]/5">
              <h3 className="text-base font-bold text-[#1B2A4A]">Entradas vs Saídas</h3>
              <span className="text-xs font-medium text-[#6B6B63] bg-[#1B2A4A]/5 px-2.5 py-1 rounded-full">Últimos meses</span>
            </div>
            
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1B2A4A0A" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B6B63' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6B6B63' }} axisLine={false} tickLine={false} width={75} tickFormatter={(v) => fmtBRL(Number(v))} />
                <Tooltip 
                  formatter={(v: number) => [fmtBRL(v), '']} 
                  contentStyle={{ backgroundColor: '#1B2A4A', borderRadius: '10px', color: '#FFF', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                  itemStyle={{ color: '#FFF', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }} />
                <Bar dataKey="entradas" name="Entradas" fill="#4B6656" radius={[6, 6, 0, 0]} barSize={20} />
                <Bar dataKey="saidas" name="Saídas" fill="#A6432D" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico 2: Distribuição de Despesas por Categoria */}
          <div className="bg-white rounded-2xl p-6 border border-[#1B2A4A]/10 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1B2A4A]/5">
              <h3 className="text-base font-bold text-[#1B2A4A]">Saídas por Categoria</h3>
              <span className="text-xs font-medium text-[#6B6B63] bg-[#1B2A4A]/5 px-2.5 py-1 rounded-full">{periodLabel}</span>
            </div>

            {expenseByCategory.length === 0 ? (
              <div className="h-[280px] flex flex-col items-center justify-center text-sm text-[#6B6B63] bg-gray-50/50 rounded-xl border border-dashed border-[#1B2A4A]/10">
                <p className="font-medium">Sem saídas registradas no período selecionado.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie 
                    data={expenseByCategory} 
                    dataKey="value" 
                    nameKey="name" 
                    innerRadius={55}
                    outerRadius={90} 
                    paddingAngle={3}
                    label={(d) => d.name}
                  >
                    {expenseByCategory.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(v: number) => [fmtBRL(v), 'Valor']} 
                    contentStyle={{ backgroundColor: '#1B2A4A', borderRadius: '10px', color: '#FFF', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                    itemStyle={{ color: '#FFF', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
