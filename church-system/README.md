# Sistema da Igreja

Sistema interno para cadastro de membros e controle financeiro. Acesso restrito
por código, sem cadastro público.

## Como rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Como gerar a versão de produção

```bash
npm run build
```

Os arquivos finais ficam na pasta `dist/`, prontos para publicar em qualquer
serviço de hospedagem estática (Vercel, Netlify, GitHub Pages, etc.).

## Estrutura do projeto

```
src/
  main.tsx            ponto de entrada
  App.tsx             tela principal, login e navegação
  types.ts            tipos: Member, FinanceEntry, Role
  storage.ts          funções de leitura/escrita no Supabase
  supabaseClient.ts   configuração da conexão com o Supabase
  constants.ts        códigos de acesso, categorias, cores
  utils.ts            formatação de moeda, datas, id
  components/
    Login.tsx
    Sidebar.tsx
    TopBar.tsx
    Dashboard.tsx      painel com gráficos
    Members.tsx        lista e gestão de membros
    MemberForm.tsx
    Finance.tsx        lançamentos financeiros
    FinanceForm.tsx
    shared/            componentes pequenos reutilizados (Field, StatCard, EmptyState)
```

Projeto em TypeScript: `npm run build` roda a checagem de tipos (`tsc`) antes de gerar os arquivos finais.

## Antes de publicar: configure os códigos de acesso

Os códigos ficam no arquivo `.env` (não em `constants.ts`, e não vão pro
GitHub por causa do `.gitignore`):

```
VITE_ACCESS_CODE_ADMIN=escolha-uma-senha-para-administracao
VITE_ACCESS_CODE_TESOURARIA=escolha-uma-senha-para-tesouraria
```

Escolha senhas suas e reinicie o `npm run dev` depois de editar o `.env`.

## Como conectar ao banco de dados (Supabase)

Os dados agora ficam salvos num banco de dados real, compartilhado entre
todas as pessoas que usam o sistema, em qualquer aparelho. Siga estes passos:

1. Crie uma conta gratuita em [supabase.com](https://supabase.com) e crie um novo projeto.
2. No painel do projeto, vá em **SQL Editor** → **New query**, cole o conteúdo do arquivo `supabase-setup.sql` (na raiz deste projeto) e clique em **Run**. Isso cria as tabelas de membros e financeiro.
3. Vá em **Project Settings** → **API**. Copie a **Project URL** e a chave **anon public**.
4. Na raiz do projeto, copie o arquivo `.env.example` para um novo arquivo chamado `.env`, e cole os valores copiados:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```
5. Rode `npm install` (se ainda não rodou) e depois `npm run dev`.

O arquivo `.env` nunca deve ser publicado no GitHub — ele já está listado no `.gitignore`, então isso é automático.

### Segurança

As tabelas são criadas com acesso liberado para leitura e escrita (sem exigir
login do Supabase), pra manter o mesmo nível de simplicidade do acesso por
código que já existia. Isso é adequado para uso interno com poucas pessoas de
confiança. Se no futuro quiser reforçar isso com autenticação de verdade
(cada pessoa com login próprio no banco), dá pra evoluir as políticas de
segurança do Supabase — posso ajudar nessa hora.

## Segurança

O acesso por código neste projeto é uma proteção simples do lado do
navegador — suficiente para uso interno entre pessoas de confiança, mas não
substitui um sistema de login de verdade. Não é recomendado para dados muito
sensíveis sem essa migração para um backend com autenticação real.
