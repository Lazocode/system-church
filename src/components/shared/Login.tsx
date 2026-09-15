/**
 * ============================================================================
 * TELA DE AUTENTICAÇÃO / LOGIN
 * ============================================================================
 * Ponto de entrada do sistema que restringe o acesso por meio de códigos/senhas
 * predefinidas:
 * - Código de Admin -> Libera o papel 'admin' (acesso irrestrito: membros + finanças).
 * - Código de Tesouraria -> Libera o papel 'tesouraria' (acesso ao financeiro e painel).
 *
 * Inclui:
 * - Validação em tempo real.
 * - Animação CSS de tremor ('shake') caso o código esteja incorreto.
 * - Botões de acesso rápido para facilitar demonstrações e testes em pré-visualização.
 */

import React, { useState } from 'react';
import { Church, Lock } from 'lucide-react';
import { ACCESS_CODES } from '../../constants/constants';
import type { Role } from '../../types/types';

/**
 * Propriedades do componente Login.
 */
interface LoginProps {
  /** Callback acionado ao validar com sucesso o código do usuário */
  onLogin: (role: Role) => void;
}

/**
 * Componente da tela de login institucional.
 */
export default function Login({ onLogin }: LoginProps) {
  // Estado do campo de senha digitado
  const [code, setCode] = useState('');
  // Mensagem de erro de autenticação
  const [error, setError] = useState('');
  // Gatilho para a animação de vibração/tremor em caso de senha inválida
  const [shake, setShake] = useState(false);

  /**
   * Processa a tentativa de login comparando o código informado com as constantes do sistema.
   */
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    // Validação para acesso como Administrador Geral
    if (ACCESS_CODES.admin && code === ACCESS_CODES.admin) {
      onLogin('admin');
      return;
    }

    // Validação para acesso como Tesouraria
    if (ACCESS_CODES.tesouraria && code === ACCESS_CODES.tesouraria) {
      onLogin('tesouraria');
      return;
    }

    // Feedback visual de código incorreto
    setError('Código incorreto. Confira com a liderança da igreja.');
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#1B2A4A] px-4">
      <form
        onSubmit={submit}
        className={`relative w-full max-w-sm bg-[#F7F3EA] rounded-2xl shadow-2xl p-8 transition-transform ${
          shake ? 'animate-[shake_0.4s]' : ''
        }`}
      >
        {/* Cabeçalho do formulário com logo e título */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#B8863B] flex items-center justify-center mb-3 shadow-md">
            <Church size={22} className="text-[#1B2A4A]" />
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif" }} className="text-2xl font-semibold text-[#1B2A4A]">
            IECVK
          </h1>
          <p className="text-sm text-[#6B6B63] mt-1">Acesso restrito à liderança</p>
        </div>

        {/* Campo de inserção do código de acesso */}
        <label htmlFor="code" className="block text-xs font-medium text-[#6B6B63] mb-1.5 uppercase tracking-wide">
          Código de acesso
        </label>
        <div className="relative mb-2">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B63]" />
          <input
            id="code"
            type="password"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError('');
            }}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#1B2A4A]/15 bg-white focus:outline-none focus:ring-2 focus:ring-[#B8863B] text-sm"
            placeholder="Digite sua senha de acesso"
            autoFocus
          />
        </div>

        {/* Exibição de mensagem de erro */}
        {error && <p className="text-[#A6432D] text-sm mb-2 font-medium">{error}</p>}

        {/* Botão de confirmação de login */}
        <button
          type="submit"
          className="w-full mt-3 bg-[#1B2A4A] hover:bg-[#34456B] text-white rounded-lg py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8863B] focus:ring-offset-2 shadow-sm"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}

