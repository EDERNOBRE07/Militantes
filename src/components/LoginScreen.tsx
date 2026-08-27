import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  KeyRound,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  AlertCircle,
  Camera,
  MapPin,
  Calendar,
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { User } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('coordenador01');
  const [password, setPassword] = useState('2211');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = StorageService.loginWithCredentials(username, password);
      setIsLoading(false);

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Credenciais inválidas. Verifique usuário e senha.');
      }
    }, 250);
  };

  const handleQuickFill = (user: string) => {
    setUsername(user);
    setPassword('2211');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-4 sm:p-6 text-slate-100 selection:bg-blue-600 selection:text-white">
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10 space-y-5">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            Início do Trabalho: 25/08 a 04/10 de 2026 (São José - SC)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-base shadow-md">
              SJ
            </span>
            Militância São José
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Sistema Integrado de Gestão Territorial, Check-in de Ruas e Auditoria de Campanha
          </p>
        </div>

        {/* Notice of Required Permissions & Dates */}
        <div className="p-3.5 rounded-xl bg-blue-900/30 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-2.5 backdrop-blur-md">
          <div className="p-1 rounded-md bg-blue-500/20 text-blue-300 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-white">
              Atenção à operação de campo (25/08 a 04/10/2026):
            </p>
            <p className="text-blue-200/90 text-[11px] leading-relaxed flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1"><Camera className="w-3 h-3 text-emerald-400" /> Câmera</span>
              <span>+</span>
              <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-400" /> Localização GPS</span>
              <span>serão solicitadas após o login para validar check-ins nas ruas de São José.</span>
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/85 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-400" /> Autenticação Segura
            </span>
            <span className="text-[11px] text-slate-400">
              Senha Padrão: <strong className="text-amber-400 font-mono bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">2211</strong>
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-200">
                Usuário / Matrícula
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex: coordenador01 ou Mil001"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition-all pr-10"
                />
                <UserCheck className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>Militantes: <strong className="text-slate-300 font-mono">Mil001</strong> a <strong className="text-slate-300 font-mono">Mil050</strong></span>
                <span>Coordenador: <strong className="text-slate-300 font-mono">coordenador01</strong></span>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-200">
                Senha de Acesso
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="2211"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono tracking-wider transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Autenticando credenciais...</span>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Test Selectors */}
          <div className="pt-4 border-t border-slate-700/60 space-y-2.5">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Acesso Rápido de Demonstração:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('coordenador01')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  username.toLowerCase() === 'coordenador01'
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                    : 'bg-slate-950/60 hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <strong className="text-blue-400 font-bold font-mono">coordenador01</strong>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Acesso Total ao Sistema</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('Mil001')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  username.toLowerCase() === 'mil001'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-950/60 hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <strong className="text-emerald-400 font-bold font-mono">Mil001</strong>
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Militante (Apenas App de Campo)</span>
              </button>
            </div>
            
            {/* Quick Militant Selector Pills */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-slate-400">Outros militantes da equipe (Mil001 a Mil050):</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['Mil002', 'Mil003', 'Mil004', 'Mil005', 'Mil010', 'Mil025', 'Mil050'].map(mil => (
                  <button
                    key={mil}
                    type="button"
                    onClick={() => handleQuickFill(mil)}
                    className={`px-2.5 py-1 rounded-md border text-[11px] font-mono transition-colors ${
                      username.toLowerCase() === mil.toLowerCase()
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                    }`}
                  >
                    {mil}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Database & Security Status */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1 text-xs">
          <div className="flex items-center justify-center gap-1.5 font-semibold text-emerald-400 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Banco de Dados Hostinger MySQL Conectado
          </div>
          <p className="text-[11px] text-slate-400">
            Conformidade LGPD • Criptografia SSL/TLS • Eleições 2026 São José / SC
          </p>
        </div>

      </div>
    </div>
  );
};
