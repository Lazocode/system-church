/**
 * ============================================================================
 * PAINEL ANALÍTICO & DASHBOARD FINANCEIRO INTELIGENTE
 * ============================================================================
 * Centraliza as métricas analíticas, diagnósticos e gráficos da IECVK:
 * - Diagnóstico executivo da saúde financeira (autoexplicativo em português claro).
 * - Indicadores-chave (KPIs) com badges contextuais, porcentagens e detalhamento.
 * - Gráfico de Barras com Tooltip analítico que calcula o resultado líquido mensal.
 * - Gráfico de Rosca interativo com alternância entre Despesas e Receitas,
 *   acompanhado de legenda detalhada com valores em R$, % e barras proporcionais.
 * - Extrato rápido das movimentações do período com classificação e status.
 * - Guia didático de auxílio contábil para pastores e tesoureiros.
 * - Exportação de relatório formal em PDF com gráficos em alta resolução.
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
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  FileDown,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Calendar,
  Layers,
  PieChart as PieIcon,
  BarChart3,
  ListOrdered,
} from 'lucide-react';
import { PALETTE } from '../../constants/constants';
import { fmtBRL, monthLabel, fullMonthLabel } from '../../utils/utils';
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
  /** Saldo do mês (entradas - saidas) */
  saldo: number;
  /** Rótulo formatado para exibição visual (ex: "Jan/26") */
  label: string;
}

interface CategoryDatum {
  /** Nome da categoria */
  name: string;
  /** Valor total acumulado */
  value: number;
  /** Quantidade de transações */
  count: number;
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

  /** Alternância do gráfico de categoria: 'saida' ou 'entrada' */
  const [categoryType, setCategoryType] = useState<'saida' | 'entrada'>('saida');

  /** Alternador para exibição do guia explicativo */
  const [showGuide, setShowGuide] = useState(false);

  // ------------------------------------------
  // MEMOIZAÇÕES E PROCESSAMENTO DE DADOS
  // ------------------------------------------

  /**
   * Extrai e ordena todos os meses/anos únicos presentes no histórico financeiro.
   */
  const months = useMemo(() => {
    const set = new Set(finance.map((f) => f.date.slice(0, 7)));
    return Array.from(set).sort();
  }, [finance]);

  /**
   * Atalhos dos 3 meses mais recentes para seleção rápida.
   */
  const recentMonths = useMemo(() => {
    return months.slice(-3).reverse();
  }, [months]);

  /**
   * Filtra os lançamentos financeiros com base no período selecionado.
   */
  const filtered = useMemo(() => {
    return period === 'all'
      ? finance
      : finance.filter((f) => f.date.slice(0, 7) === period);
  }, [finance, period]);

  /**
   * Calcula totais consolidados e contagens do período filtrado.
   */
  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, f) => {
        const val = Number(f.amount) || 0;
        if (f.type === 'entrada') {
          acc.entradas += val;
          acc.countEntradas += 1;
        } else {
          acc.saidas += val;
          acc.countSaidas += 1;
        }
        return acc;
      },
      { entradas: 0, saidas: 0, countEntradas: 0, countSaidas: 0 }
    );
  }, [filtered]);

  const saldoLiquido = totals.entradas - totals.saidas;
  const isSuperavit = saldoLiquido >= 0;

  /**
   * Métricas percentuais e proporções de saúde financeira.
   */
  const healthMetrics = useMemo(() => {
    const { entradas, saidas } = totals;
    if (entradas === 0 && saidas === 0) {
      return {
        retentionRate: 0,
        expenseRate: 0,
        status: 'neutral' as const,
        statusTitle: 'Sem Movimentação',
        statusDesc: 'Ainda não há registros suficientes no período selecionado.',
      };
    }

    if (entradas === 0 && saidas > 0) {
      return {
        retentionRate: 0,
        expenseRate: 100,
        status: 'deficit' as const,
        statusTitle: 'Déficit no Período',
        statusDesc: 'Houve apenas saídas no período sem registro de arrecadação.',
      };
    }

    const expenseRate = (saidas / entradas) * 100;
    const retentionRate = Math.max(0, 100 - expenseRate);

    if (expenseRate <= 70) {
      return {
        retentionRate,
        expenseRate,
        status: 'healthy' as const,
        statusTitle: 'Superávit Saudável',
        statusDesc: `As receitas superaram as despesas com excelente margem. A igreja reteve ${retentionRate.toFixed(1)}% do arrecadado como reserva livre.`,
      };
    } else if (expenseRate <= 100) {
      return {
        retentionRate,
        expenseRate,
        status: 'moderate' as const,
        statusTitle: 'Equilíbrio Financeiro',
        statusDesc: `As contas estão equilibradas, comprometendo ${expenseRate.toFixed(1)}% das entradas com custos operacionais.`,
      };
    } else {
      return {
        retentionRate: 0,
        expenseRate,
        status: 'deficit' as const,
        statusTitle: 'Déficit no Período',
        statusDesc: `As saídas superaram as entradas em ${fmtBRL(Math.abs(saldoLiquido))}. É recomendável atenção às despesas correntes.`,
      };
    }
  }, [totals, saldoLiquido]);

  /**
   * Agrupa e calcula entradas e saídas por mês para o gráfico comparativo.
   */
  const monthlyData: MonthlyDatum[] = useMemo(() => {
    const map: Record<string, { ym: string; entradas: number; saidas: number }> = {};

    finance.forEach((f) => {
      const ym = f.date.slice(0, 7);
      if (!map[ym]) map[ym] = { ym, entradas: 0, saidas: 0 };
      const val = Number(f.amount) || 0;
      map[ym][f.type === 'entrada' ? 'entradas' : 'saidas'] += val;
    });

    return Object.values(map)
      .sort((a, b) => a.ym.localeCompare(b.ym))
      .slice(-12)
      .map((d) => ({
        ...d,
        saldo: d.entradas - d.saidas,
        label: monthLabel(d.ym),
      }));
  }, [finance]);

  // Encontra mês de maior receita e de maior despesa
  const monthlyHighlights = useMemo(() => {
    if (monthlyData.length === 0) return null;
    const peakEntrada = [...monthlyData].sort((a, b) => b.entradas - a.entradas)[0];
    const peakSaida = [...monthlyData].sort((a, b) => b.saidas - a.saidas)[0];
    return { peakEntrada, peakSaida };
  }, [monthlyData]);

  /**
   * Agrupa saídas por categoria.
   */
  const expenseByCategory: CategoryDatum[] = useMemo(() => {
    const map: Record<string, { value: number; count: number }> = {};

    filtered
      .filter((f) => f.type === 'saida')
      .forEach((f) => {
        if (!map[f.category]) map[f.category] = { value: 0, count: 0 };
        map[f.category].value += Number(f.amount) || 0;
        map[f.category].count += 1;
      });

    return Object.entries(map)
      .map(([name, data]) => ({ name, value: data.value, count: data.count }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  /**
   * Agrupa entradas por categoria.
   */
  const incomeByCategory: CategoryDatum[] = useMemo(() => {
    const map: Record<string, { value: number; count: number }> = {};

    filtered
      .filter((f) => f.type === 'entrada')
      .forEach((f) => {
        if (!map[f.category]) map[f.category] = { value: 0, count: 0 };
        map[f.category].value += Number(f.amount) || 0;
        map[f.category].count += 1;
      });

    return Object.entries(map)
      .map(([name, data]) => ({ name, value: data.value, count: data.count }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  // Categoria ativa selecionada no alternador
  const activeCategoryList = categoryType === 'saida' ? expenseByCategory : incomeByCategory;
  const activeCategoryTotal = categoryType === 'saida' ? totals.saidas : totals.entradas;

  // Categoria líder de receita e despesa
  const topIncomeCategory = incomeByCategory[0];
  const topExpenseCategory = expenseByCategory[0];

  // Texto formatado do período
  const periodLabel = period === 'all' ? 'Todos os períodos' : fullMonthLabel(period);

  // Lançamentos mais recentes para a visualização de extrato sintético
  const recentTransactions = useMemo(() => {
    return [...filtered]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [filtered]);

  // ------------------------------------------
  // HANDLERS / AÇÕES
  // ------------------------------------------

  const handleExportPDF = () => {
    exportFinanceReportPDF(filtered, periodLabel, {
      periodKey: period,
      allFinance: finance,
      monthlyData,
      expenseByCategory,
      incomeByCategory,
    });
  };

  // ------------------------------------------
  // RENDERIZAÇÃO DA INTERFACE
  // ------------------------------------------

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-0 py-2">
      
      {/* ========================================================================= */}
      {/* 1. CABEÇALHO DO PAINEL COM SELETOR MODERNO E BOTÃO PDF                    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#1B2A4A]/10 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8863B]">
              Gestão de Tesouraria
            </span>
            <span className="text-[#1B2A4A]/20">•</span>
            <span className="text-xs text-[#6B6B63]">IECVK</span>
          </div>

          <h2
            style={{ fontFamily: "'Fraunces', serif" }}
            className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] tracking-tight"
          >
            Painel Financeiro
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B63] mt-1">
            Acompanhamento analítico e autoexplicativo das movimentações da congregação.
          </p>
        </div>

        {/* Controles de Período e Exportação */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Seletor Dropdown com Ícone de Calendário */}
          <div className="relative min-w-[190px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B6B63]">
              <Calendar size={15} />
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm font-semibold bg-[#FAF8F5] hover:bg-white text-[#1B2A4A] border border-[#1B2A4A]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B8863B] focus:border-transparent transition-all cursor-pointer shadow-2xs"
            >
              <option value="all">Todo o Histórico</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {fullMonthLabel(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Botão de Exportação de Balancete PDF */}
          <button
            onClick={handleExportPDF}
            disabled={filtered.length === 0}
            className="flex items-center justify-center gap-2 bg-[#1B2A4A] hover:bg-[#253963] active:bg-[#121E36] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-xl px-4 py-2.5 shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-[#B8863B] cursor-pointer"
            title="Baixar balancete oficial em PDF com gráficos e assinaturas"
          >
            <FileDown size={16} />
            <span>Exportar Relatório</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CHIPS DE FILTRO RÁPIDO                                                 */}
      {/* ========================================================================= */}
      {months.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[#6B6B63] font-medium mr-1 flex items-center gap-1">
            <Layers size={13} /> Filtrar por:
          </span>

          <button
            type="button"
            onClick={() => setPeriod('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              period === 'all'
                ? 'bg-[#1B2A4A] text-white shadow-2xs'
                : 'bg-white text-[#1B2A4A] border border-[#1B2A4A]/15 hover:bg-[#FAF8F5]'
            }`}
          >
            Todo o Histórico
          </button>

          {recentMonths.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPeriod(m)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                period === m
                  ? 'bg-[#1B2A4A] text-white shadow-2xs'
                  : 'bg-white text-[#1B2A4A] border border-[#1B2A4A]/15 hover:bg-[#FAF8F5]'
              }`}
            >
              {monthLabel(m)}
            </button>
          ))}

          {/* Botão para ativar guia explicativo */}
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="ml-auto text-xs text-[#8A5F1E] hover:text-[#1B2A4A] flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <HelpCircle size={14} />
            <span>{showGuide ? 'Ocultar Explicações' : 'Como entender este painel?'}</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GUIA DIDÁTICO / AUTOEXPLICATIVO (EXPANSÍVEL)                               */}
      {/* ========================================================================= */}
      {showGuide && (
        <div className="bg-[#FAF7F2] border border-[#B8863B]/30 rounded-2xl p-5 text-xs text-[#1B2A4A] space-y-2 animate-fadeIn shadow-2xs">
          <div className="flex items-center justify-between font-bold text-sm text-[#8A5F1E]">
            <span>Guia Rápido de Interpretação Financeira:</span>
            <button
              onClick={() => setShowGuide(false)}
              className="text-[#6B6B63] hover:text-[#1B2A4A] text-xs font-semibold cursor-pointer"
            >
              Fechar
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="bg-white p-3 rounded-xl border border-[#1B2A4A]/10">
              <p className="font-bold text-[#4B6656] mb-1">Entradas (Receitas)</p>
              <p className="text-[#6B6B63] leading-relaxed">
                Total de dízimos, ofertas e doações recebidas no período. Demonstra a fidelidade e arrecadação dos membros.
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#1B2A4A]/10">
              <p className="font-bold text-[#A6432D] mb-1">Saídas (Despesas)</p>
              <p className="text-[#6B6B63] leading-relaxed">
                Gastos com manutenção do templo, serviços, missões e ações sociais. Indica o custo operacional da congregação.
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#1B2A4A]/10">
              <p className="font-bold text-[#1B2A4A] mb-1">Saldo Líquido</p>
              <p className="text-[#6B6B63] leading-relaxed">
                Resultado real (Entradas menos Saídas). Se positivo, representa sobra em caixa para novos projetos ou reserva.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. BANNER DE SÍNTESE & SAÚDE FINANCEIRA (AUTOEXPLICATIVO)                   */}
      {/* ========================================================================= */}
      <div
        className={`rounded-2xl p-5 sm:p-6 border transition-all ${
          healthMetrics.status === 'healthy'
            ? 'bg-gradient-to-r from-[#F4F8F5] to-white border-[#4B6656]/30'
            : healthMetrics.status === 'moderate'
            ? 'bg-gradient-to-r from-[#FAF8F2] to-white border-[#B8863B]/30'
            : healthMetrics.status === 'deficit'
            ? 'bg-gradient-to-r from-[#FAF4F3] to-white border-[#A6432D]/30'
            : 'bg-white border-[#1B2A4A]/10'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                healthMetrics.status === 'healthy'
                  ? 'bg-[#4B6656] text-white'
                  : healthMetrics.status === 'moderate'
                  ? 'bg-[#B8863B] text-white'
                  : healthMetrics.status === 'deficit'
                  ? 'bg-[#A6432D] text-white'
                  : 'bg-[#1B2A4A] text-white'
              }`}
            >
              {healthMetrics.status === 'healthy' ? (
                <CheckCircle2 size={24} />
              ) : healthMetrics.status === 'moderate' ? (
                <TrendingUp size={24} />
              ) : healthMetrics.status === 'deficit' ? (
                <AlertTriangle size={24} />
              ) : (
                <Wallet size={24} />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B63]">
                  Diagnóstico do Período ({periodLabel})
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    healthMetrics.status === 'healthy'
                      ? 'bg-[#4B6656]/15 text-[#304d3d] border-[#4B6656]/30'
                      : healthMetrics.status === 'moderate'
                      ? 'bg-[#B8863B]/15 text-[#7c5417] border-[#B8863B]/30'
                      : healthMetrics.status === 'deficit'
                      ? 'bg-[#A6432D]/15 text-[#86301c] border-[#A6432D]/30'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {healthMetrics.statusTitle}
                </span>
              </div>

              <p className="text-sm font-medium text-[#1B2A4A] mt-1 leading-relaxed max-w-3xl">
                {healthMetrics.statusDesc}
              </p>
            </div>
          </div>

          {/* Indicadores Rápidos em Pílulas */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 border-t md:border-t-0 md:border-l border-[#1B2A4A]/10 pt-3 md:pt-0 md:pl-5 w-full md:w-auto">
            <div>
              <p className="text-[11px] text-[#6B6B63] font-semibold uppercase">Retenção de Caixa</p>
              <p className="text-base font-bold text-[#4B6656]">
                {healthMetrics.retentionRate.toFixed(1)}%
              </p>
            </div>
            <div className="h-8 w-px bg-[#1B2A4A]/10" />
            <div>
              <p className="text-[11px] text-[#6B6B63] font-semibold uppercase">Comprometimento</p>
              <p className="text-base font-bold text-[#A6432D]">
                {healthMetrics.expenseRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CARDS DE INDICADORES (KPIS) MODERNOS E AUTOEXPLICATIVOS                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Entradas */}
        <StatCard
          label="Total de Entradas"
          value={fmtBRL(totals.entradas)}
          color="#4B6656"
          Icon={ArrowUpCircle}
          badge={{
            text: `${totals.countEntradas} registro${totals.countEntradas === 1 ? '' : 's'}`,
            type: 'positive',
          }}
          description={
            topIncomeCategory
              ? `Principal fonte: ${topIncomeCategory.name} (${fmtBRL(topIncomeCategory.value)})`
              : 'Nenhuma receita registrada no período.'
          }
        />

        {/* Card 2: Saídas */}
        <StatCard
          label="Total de Saídas"
          value={fmtBRL(totals.saidas)}
          color="#A6432D"
          Icon={ArrowDownCircle}
          badge={{
            text: `${totals.countSaidas} pagamento${totals.countSaidas === 1 ? '' : 's'}`,
            type: 'negative',
          }}
          description={
            topExpenseCategory
              ? `Maior despesa: ${topExpenseCategory.name} (${fmtBRL(topExpenseCategory.value)})`
              : 'Nenhum pagamento registrado no período.'
          }
        />

        {/* Card 3: Saldo Líquido */}
        <StatCard
          label="Saldo Líquido em Caixa"
          value={fmtBRL(saldoLiquido)}
          color="#1B2A4A"
          Icon={Wallet}
          highlight={true}
          badge={{
            text: isSuperavit ? 'Superávit' : 'Déficit',
            type: isSuperavit ? 'accent' : 'negative',
          }}
          description={
            isSuperavit
              ? 'Saldo livre para reserva de emergência e ministérios.'
              : 'Atenção: saídas superam o montante de arrecadação.'
          }
        />
      </div>

      {/* ========================================================================= */}
      {/* 5. SEÇÃO DE GRÁFICOS ANALÍTICOS AUTOEXPLICATIVOS                          */}
      {/* ========================================================================= */}
      {finance.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-[#1B2A4A]/10 shadow-xs">
          <EmptyState text="Nenhum lançamento registrado no sistema. Cadastre as movimentações na aba Financeiro." />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* GRÁFICO 1 (COLUNA ESQUERDA - 7 COLS): EVOLUÇÃO MENSAL (ENTRADAS VS SAÍDAS) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#1B2A4A]/10 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1B2A4A]/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1B2A4A]/5 flex items-center justify-center text-[#1B2A4A]">
                    <BarChart3 size={17} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1B2A4A]">
                      Evolução Mensal (Entradas vs Saídas)
                    </h3>
                    <p className="text-xs text-[#6B6B63]">
                      Comparativo de arrecadação e despesas mês a mês
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-[#6B6B63] bg-[#FAF8F5] border border-[#1B2A4A]/10 px-2.5 py-1 rounded-full">
                  Últimos {monthlyData.length} meses
                </span>
              </div>

              {/* Área do Gráfico */}
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1B2A4A0A" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: '#6B6B63' }}
                      axisLine={{ stroke: '#E5DFD5' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#6B6B63' }}
                      axisLine={false}
                      tickLine={false}
                      width={65}
                      tickFormatter={(v) =>
                        v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
                      }
                    />
                    <Tooltip
                      content={({ active, payload, label }: any) => {
                        if (active && payload && payload.length) {
                          const ent = (payload.find((p: any) => p.dataKey === 'entradas')?.value as number) || 0;
                          const sai = (payload.find((p: any) => p.dataKey === 'saidas')?.value as number) || 0;
                          const sal = ent - sai;
                          return (
                            <div className="bg-[#121E36] text-white p-3 rounded-xl shadow-lg text-xs space-y-1.5 border border-white/10">
                              <p className="font-bold border-b border-white/15 pb-1 text-[#FAF8F5]">
                                {label}
                              </p>
                              <div className="flex items-center justify-between gap-4 text-[#A1D9B5]">
                                <span>Entradas:</span>
                                <span className="font-mono font-semibold">{fmtBRL(ent)}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-[#FFB4A2]">
                                <span>Saídas:</span>
                                <span className="font-mono font-semibold">{fmtBRL(sai)}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/10 text-white font-bold">
                                <span>Resultado:</span>
                                <span
                                  className={`font-mono ${
                                    sal >= 0 ? 'text-[#85E3A7]' : 'text-[#FF8A80]'
                                  }`}
                                >
                                  {fmtBRL(sal)}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span className="text-xs font-semibold text-[#1B2A4A] ml-1">
                          {value === 'entradas' ? 'Entradas' : 'Saídas'}
                        </span>
                      )}
                    />
                    <Bar
                      dataKey="entradas"
                      name="entradas"
                      fill="#4B6656"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                    <Bar
                      dataKey="saidas"
                      name="saidas"
                      fill="#A6432D"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rodapé do Card com Destaques Analíticos */}
            {monthlyHighlights && (
              <div className="mt-3 pt-3 border-t border-[#1B2A4A]/5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6B6B63]">
                <div>
                  Maior arrecadação:{' '}
                  <strong className="text-[#4B6656]">
                    {monthlyHighlights.peakEntrada.label} (
                    {fmtBRL(monthlyHighlights.peakEntrada.entradas)})
                  </strong>
                </div>
                <div>
                  Maior saída:{' '}
                  <strong className="text-[#A6432D]">
                    {monthlyHighlights.peakSaida.label} (
                    {fmtBRL(monthlyHighlights.peakSaida.saidas)})
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* GRÁFICO 2 (COLUNA DIREITA - 5 COLS): DISTRIBUIÇÃO POR CATEGORIA COM LEGENDA RICA */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#1B2A4A]/10 shadow-xs flex flex-col justify-between">
            <div>
              {/* Cabeçalho do Card com Alternador de Saídas/Entradas */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1B2A4A]/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1B2A4A]/5 flex items-center justify-center text-[#1B2A4A]">
                    <PieIcon size={17} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1B2A4A]">Composição</h3>
                    <p className="text-xs text-[#6B6B63]">Por categoria de lançamento</p>
                  </div>
                </div>

                {/* Alternador de Saídas ou Entradas */}
                <div className="flex items-center bg-[#FAF8F5] p-0.5 rounded-lg border border-[#1B2A4A]/15 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setCategoryType('saida')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      categoryType === 'saida'
                        ? 'bg-[#A6432D] text-white shadow-2xs'
                        : 'text-[#6B6B63] hover:text-[#1B2A4A]'
                    }`}
                  >
                    Saídas
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryType('entrada')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      categoryType === 'entrada'
                        ? 'bg-[#4B6656] text-white shadow-2xs'
                        : 'text-[#6B6B63] hover:text-[#1B2A4A]'
                    }`}
                  >
                    Entradas
                  </button>
                </div>
              </div>

              {/* Rosca Central + Legenda Detalhada */}
              {activeCategoryList.length === 0 ? (
                <div className="h-[280px] flex flex-col items-center justify-center text-xs text-[#6B6B63] bg-[#FAF8F5] rounded-xl border border-dashed border-[#1B2A4A]/15 p-4 text-center">
                  <p className="font-semibold text-sm text-[#1B2A4A] mb-1">
                    Sem movimentações deste tipo
                  </p>
                  <p>
                    Nenhuma {categoryType === 'saida' ? 'despesa' : 'receita'} registrada no
                    período selecionado ({periodLabel}).
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Rosca com Centro Informativo */}
                  <div className="h-[160px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activeCategoryList}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={48}
                          outerRadius={75}
                          paddingAngle={3}
                          stroke="#FFFFFF"
                          strokeWidth={2}
                        >
                          {activeCategoryList.map((_, i) => (
                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: number) => [fmtBRL(v), 'Valor']}
                          contentStyle={{
                            backgroundColor: '#121E36',
                            borderRadius: '8px',
                            color: '#FFF',
                            border: 'none',
                            fontSize: '11px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Texto no meio da rosca */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] uppercase font-bold text-[#6B6B63] tracking-wider">
                        {categoryType === 'saida' ? 'Despesas' : 'Receitas'}
                      </span>
                      <span className="text-xs font-bold font-mono text-[#1B2A4A]">
                        {fmtBRL(activeCategoryTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Legenda Analítica com Valores, Porcentagens e Barras de Progresso */}
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {activeCategoryList.map((cat, idx) => {
                      const pct =
                        activeCategoryTotal > 0
                          ? (cat.value / activeCategoryTotal) * 100
                          : 0;
                      const color = PALETTE[idx % PALETTE.length];

                      return (
                        <div key={cat.name} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: color }}
                              />
                              <span className="font-semibold text-[#1B2A4A] truncate">
                                {cat.name}
                              </span>
                              <span className="text-[10px] text-[#8C8A82]">
                                ({cat.count}x)
                              </span>
                            </div>

                            <div className="flex items-center gap-2 font-mono text-xs">
                              <span className="text-[#6B6B63] font-normal">
                                {pct.toFixed(1)}%
                              </span>
                              <span className="font-bold text-[#1B2A4A]">
                                {fmtBRL(cat.value)}
                              </span>
                            </div>
                          </div>

                          {/* Mini Barra Proporcional */}
                          <div className="h-1.5 w-full bg-[#FAF7F2] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-[#1B2A4A]/5 text-[11px] text-[#6B6B63]">
              Exibindo a distribuição percentual de {activeCategoryList.length} categoria(s).
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. QUADRO SINTÉTICO DAS ÚLTIMAS MOVIMENTAÇÕES DO PERÍODO                   */}
      {/* ========================================================================= */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-[#1B2A4A]/10 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1B2A4A]/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1B2A4A]/5 flex items-center justify-center text-[#1B2A4A]">
                <ListOrdered size={17} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1B2A4A]">
                  Movimentações Recentes do Período
                </h3>
                <p className="text-xs text-[#6B6B63]">
                  Últimos lançamentos registrados em {periodLabel}
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold text-[#6B6B63]">
              {filtered.length} movimentação(ões) no total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1B2A4A]/10 text-[#6B6B63] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Categoria</th>
                  <th className="py-2.5 px-3">Histórico</th>
                  <th className="py-2.5 px-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B2A4A]/5">
                {recentTransactions.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-2.5 px-3 text-[#6B6B63] whitespace-nowrap">
                      {new Date(item.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                          item.type === 'entrada'
                            ? 'bg-[#4B6656]/15 text-[#3b5947]'
                            : 'bg-[#A6432D]/15 text-[#86301c]'
                        }`}
                      >
                        {item.type === 'entrada' ? (
                          <>
                            <ArrowUpCircle size={11} /> Entrada
                          </>
                        ) : (
                          <>
                            <ArrowDownCircle size={11} /> Saída
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#1B2A4A] whitespace-nowrap">
                      {item.category}
                    </td>
                    <td className="py-2.5 px-3 text-[#6B6B63] max-w-xs truncate">
                      {item.description || '—'}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap ${
                        item.type === 'entrada' ? 'text-[#4B6656]' : 'text-[#A6432D]'
                      }`}
                    >
                      {item.type === 'entrada' ? '+ ' : '- '}
                      {fmtBRL(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
