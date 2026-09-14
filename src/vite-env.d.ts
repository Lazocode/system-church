/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_ACCESS_CODE_ADMIN: string;
  readonly VITE_ACCESS_CODE_TESOURARIA: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
