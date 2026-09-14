/**
 * ============================================================================
 * TIPOS E INTERFACES GLOBAIS DA APLICAÇÃO (SISTEMA DA IGREJA)
 * ============================================================================
 * Este arquivo centraliza todas as definições de tipos TypeScript compartilhadas
 * pelo sistema, garantindo consistência estrutural entre a camada de dados,
 * formulários e componentes visuais.
 */

/**
 * Papéis de usuário suportados no sistema de controle de acesso (RBAC simplificado):
 * - 'admin': Acesso total ao sistema, incluindo cadastro e gestão de membros.
 * - 'tesouraria': Acesso restrito ao módulo financeiro e painel analítico.
 */
export type Role = 'admin' | 'tesouraria';

/**
 * Representação de um membro da congregação.
 */
export interface Member {
  /** Identificador único do membro (UUID ou string alfanumérica) */
  id: string;
  /** Nome completo do membro */
  name: string;
  /** Telefone ou celular de contato com DDD */
  phone: string;
  /** Endereço de correio eletrônico */
  email: string;
  /** Endereço residencial completo */
  address: string;
  /** Data de nascimento no formato ISO (AAAA-MM-DD) */
  birthdate: string;
  /** Ministério ou departamento em que atua (ex: Louvor, Infantil, Diaconia) */
  ministry: string;
  /** Data de admissão ou batismo como membro (AAAA-MM-DD) */
  joinedDate: string;
  /** Observações ou histórico pastoral sobre o membro */
  notes: string;
}

/**
 * Tipo de transação financeira:
 * - 'entrada': Receitas (dízimos, ofertas, doações).
 * - 'saida': Despesas e custos operacionais (manutenção, contas, missões).
 */
export type FinanceType = 'entrada' | 'saida';

/**
 * Lançamento financeiro individual registrado no livro-caixa da igreja.
 */
export interface FinanceEntry {
  /** Identificador único da transação */
  id: string;
  /** Classificação da movimentação: crédito ('entrada') ou débito ('saida') */
  type: FinanceType;
  /** Categoria do lançamento (ex: 'Dízimo', 'Manutenção') */
  category: string;
  /** Valor monetário da operação em Reais (BRL), sempre positivo */
  amount: number;
  /** Data da efetivação da movimentação no formato ISO (AAAA-MM-DD) */
  date: string;
  /** Descrição detalhada ou finalidade do lançamento */
  description: string;
}

