// ---------------------------------------------------------------------------
// Camada de armazenamento dos dados — agora conectada ao Supabase.
//
// Os dados ficam num banco de dados real na nuvem, compartilhados entre
// todas as pessoas que acessam o sistema, em qualquer aparelho.
//
// Configuração necessária: crie um arquivo .env na raiz do projeto (veja
// .env.example) com a URL e a chave do seu projeto Supabase.
// ---------------------------------------------------------------------------

import { supabase } from '../libs/supabaseClient';

const TABLE_MAP: Record<string, string> = {
  'church-members': 'members',
  'church-finance': 'finance_entries',
};

export async function getData<T>(key: string): Promise<T[]> {
  const table = TABLE_MAP[key];
  try {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.error(`Erro ao ler dados de "${table}":`, error.message);
      return [];
    }
    return (data as T[]) ?? [];
  } catch (e) {
    console.error('Erro ao ler dados:', e);
    return [];
  }
}

export async function setData<T extends { id: string }>(key: string, value: T[]): Promise<boolean> {
  const table = TABLE_MAP[key];
  try {
    // Descobre quais registros existiam antes, pra saber o que foi removido.
    const { data: existing, error: fetchError } = await supabase.from(table).select('id');
    if (fetchError) {
      console.error(`Erro ao verificar dados de "${table}":`, fetchError.message);
      return false;
    }

    const existingIds = (existing ?? []).map((r: { id: string }) => r.id);
    const newIds = value.map((v) => v.id);
    const idsToDelete = existingIds.filter((id) => !newIds.includes(id));

    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase.from(table).delete().in('id', idsToDelete);
      if (deleteError) {
        console.error(`Erro ao remover registros de "${table}":`, deleteError.message);
        return false;
      }
    }

    if (value.length > 0) {
      const { error: upsertError } = await supabase.from(table).upsert(value);
      if (upsertError) {
        console.error(`Erro ao salvar dados em "${table}":`, upsertError.message);
        return false;
      }
    }

    return true;
  } catch (e) {
    console.error('Erro ao salvar dados:', e);
    return false;
  }
}
