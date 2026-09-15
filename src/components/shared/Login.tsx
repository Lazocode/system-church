/**
 * ============================================================================
 * TELA DE AUTENTICAÇÃO / LOGIN INSTITUCIONAL
 * ============================================================================
 * Portal de acesso restrito da Igreja Evangélica Congregacional de Vila Kennedy (IECVK).
 * Design institucional sóbrio e autêntico:
 * - Layout dividido (brand panel editorial + formulário de acesso).
 * - Exibição/ocultação de senha (toggle de visibilidade).
 * - Indicadores claros dos perfis autorizados (Administração e Tesouraria).
 * - Tipografia solene com citação bíblica e dados de segurança.
 */

import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { ACCESS_CODES } from '../../constants/constants';
import type { Role } from '../../types/types';

/**
 * Propriedades do componente Login.
 */
interface LoginProps {
  /** Callback acionado ao validar com sucesso a credencial informada */
  onLogin: (role: Role) => void;
}

/**
 * Componente da tela de autenticação institucional da congregação.
 */
export default function Login({ onLogin }: LoginProps) {
  // Código digitado pelo usuário
  const [code, setCode] = useState('');
  // Controle de visibilidade da senha
  const [showPassword, setShowPassword] = useState(false);
  // Mensagem de erro amigável
  const [error, setError] = useState('');
  // Animação sutil de feedback ao errar
  const [shake, setShake] = useState(false);

  /**
   * Processa a validação das credenciais institucionais.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Por favor, informe a chave de acesso.');
      return;
    }

    // Perfil Administrador Geral
    if (ACCESS_CODES.admin && trimmed === ACCESS_CODES.admin) {
      onLogin('admin');
      return;
    }

    // Perfil Tesouraria & Finanças
    if (ACCESS_CODES.tesouraria && trimmed === ACCESS_CODES.tesouraria) {
      onLogin('tesouraria');
      return;
    }

    // Credencial não reconhecida
    setError('Chave de acesso inválida. Confirme com a diretoria ou secretaria da igreja.');
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] text-[#1B2A4A] flex flex-col justify-between">
      {/* Barra superior institucional discreta */}
      <header className="border-b border-[#1B2A4A]/10 bg-white/70 backdrop-blur-xs py-3.5 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#1B2A4A] text-[#B8863B] font-serif font-bold text-sm flex items-center justify-center shadow-xs">
              VK
            </div>
            <div>
              <p className="text-xs tracking-wider uppercase font-semibold text-[#1B2A4A]">
                Igreja Evangélica Congregacional
              </p>
              <p className="text-[11px] text-[#6B6B63] -mt-0.5">Vila Kennedy • Rio de Janeiro</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#6B6B63]">
            <ShieldCheck size={14} className="text-[#4B6656]" />
            <span>Portal Interno de Gestão</span>
          </div>
        </div>
      </header>

      {/* Conteúdo Central: Painel Dividido */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl bg-white border border-[#1B2A4A]/15 shadow-sm rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
          
          {/* Painel Esquerdo: Identidade Institucional & Citação */}
          <div className="md:col-span-5 bg-[#121E36] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Linha decorativa dourada superior */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B8863B] via-[#D4AF37] to-[#B8863B]" />

            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white/10 text-[#E2B874] text-xs font-medium tracking-wide mb-6">
                <span>GESTÃO ECLESIÁSTICA</span>
              </div>

              <h1
                style={{ fontFamily: "'Fraunces', serif" }}
                className="text-2xl sm:text-3xl font-semibold leading-snug text-[#FAF8F5] mb-3"
              >
                Cuidado contábil.
              </h1>

              <p className="text-xs sm:text-sm text-[#C8D1E0] leading-relaxed">
                Acesso unificado ao rol de membros, balancetes da tesouraria e registros oficiais da congregação.
              </p>
            </div>

            {/* Versículo bíblico como princípio de gestão */}
            <div className="my-8 pt-6 border-t border-white/10">
              <blockquote className="text-xs sm:text-sm italic text-[#EAE6DF] leading-relaxed mb-2 font-serif">
                “Tudo, porém, seja feito com decência e ordem.”
              </blockquote>
              <cite className="not-italic text-[11px] font-semibold text-[#B8863B] tracking-wide uppercase">
                1 Coríntios 14:40
              </cite>
            </div>

            {/* Nota de rodapé da coluna esquerda */}
            <div className="text-[11px] text-[#8D9CB5] flex items-center justify-between">
              <span>IECVK • Oficial</span>
            </div>
          </div>

          {/* Painel Direito: Formulário Autêntico de Entrada */}
          <div className="md:col-span-7 p-8 sm:p-12 bg-white flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto">
              
              <div className="mb-6">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[#B8863B]">
                  Autenticação Obrigatória
                </span>
                <h2
                  style={{ fontFamily: "'Fraunces', serif" }}
                  className="text-2xl font-semibold text-[#1B2A4A] mt-1"
                >
                  Entrar no sistema
                </h2>
                <p className="text-xs sm:text-sm text-[#6B6B63] mt-1.5 leading-relaxed">
                  Digite a chave de acesso
                </p>
              </div>

              {/* Formulário */}
              <form onSubmit={handleSubmit} className={shake ? 'animate-[shake_0.4s]' : ''}>
                
                {/* Mensagem de Erro com Ícone */}
                {error && (
                  <div className="mb-5 p-3.5 rounded-lg bg-[#A6432D]/10 border border-[#A6432D]/30 flex items-start gap-2.5 text-[#A6432D]">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p className="text-xs font-medium leading-relaxed">{error}</p>
                  </div>
                )}

                {/* Campo de Chave de Acesso */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="access-key" className="text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide">
                      Chave de Acesso
                    </label>
                    <span className="text-[11px] text-[#6B6B63]">Liderança autorizada</span>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B6B63]">
                      <KeyRound size={17} />
                    </div>

                    <input
                      id="access-key"
                      type={showPassword ? 'text' : 'password'}
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Informe a sua chave de segurança"
                      className="w-full pl-10 pr-11 py-3 text-sm text-[#1B2A4A] bg-[#FAF8F5] border border-[#1B2A4A]/20 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8863B] focus:border-transparent transition-colors placeholder:text-[#9A9890]"
                      autoFocus
                    />

                    {/* Botão para alternar visibilidade */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6B6B63] hover:text-[#1B2A4A] transition-colors focus:outline-none"
                      title={showPassword ? 'Ocultar chave' : 'Exibir chave'}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Botão Principal de Login */}
                <button
                  type="submit"
                  className="w-full mt-2 bg-[#1B2A4A] hover:bg-[#253961] active:bg-[#121E36] text-white font-medium text-sm py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8863B] focus:ring-offset-2 shadow-xs cursor-pointer"
                >
                  <span>Acessar Painel</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Guia informativo dos papéis autorizados */}
              <div className="mt-8 pt-6 border-t border-[#1B2A4A]/10 text-xs text-[#6B6B63]">
                <p className="font-semibold text-[#1B2A4A] mb-1.5">Níveis de credenciamento disponíveis:</p>
                <ul className="space-y-1 text-[11px] leading-relaxed">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1B2A4A]"></span>
                    <span><strong>Administração Geral:</strong> Acesso pleno ao rol de membros e finanças.</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8863B]"></span>
                    <span><strong>Tesouraria:</strong> Acesso ao livro-caixa, lançamentos e demonstrativos.</span>
                  </li>
                </ul>

                <p className="mt-4 text-[11px] text-[#8C8A82]">
                  Dúvidas ou perda de chave? Solicite assistência à Secretaria da IECVK.
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Rodapé institucional com informações formais */}
      <footer className="py-4 px-6 text-center text-xs text-[#8C8A82] border-t border-[#1B2A4A]/10 bg-white/50">
        <p>
          Igreja Evangélica Congregacional de Vila Kennedy • Sistema Oficial de Gestão Integrada
        </p>
      </footer>
    </div>
  );
}


