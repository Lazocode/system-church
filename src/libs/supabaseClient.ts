/**
 * ============================================================================
 * CLIENTE SUPABASE & CONFIGURAÇÃO DE PERSISTÊNCIA EM NUVEM
 * ============================================================================
 * Este arquivo inicializa e exporta a instância do cliente Supabase.
 *
 * ESTRATÉGIA RESILIENTE:
 * Para garantir que o aplicativo funcione tanto em ambientes configurados
 * com banco de dados em nuvem quanto em ambientes locais/demonstrações sem
 * credenciais no .env, validamos a presença das chaves:
 * - Se configurado: Conecta-se à nuvem do Supabase.
 * - Se não configurado: O sistema degrada suavemente para LocalStorage sem quebrar.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// URL do projeto Supabase fornecida via variável de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Chave anônima pública (anon key) do projeto Supabase
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Flag booleana que verifica se as variáveis de ambiente necessárias
 * para a conexão com o Supabase foram fornecidas e não estão vazias.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== ''
);

if (!isSupabaseConfigured) {
  console.info(
    'ℹ️ Supabase não configurado. O sistema usará armazenamento local no navegador (localStorage).'
  );
}

/**
 * Instância única do cliente Supabase, ou null se as chaves não estiverem configuradas.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;


