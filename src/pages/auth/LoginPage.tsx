import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Loader2, 
  AlertCircle,
  Cpu,
  Globe,
  Database,
  TrendingUp,
  Building2,
  Check,
  ChevronRight
} from 'lucide-react';
import { useCompany } from '../../contexts/CompanyContext';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { setActiveCompanyId, companies } = useCompany();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isSelectingCompany, setIsSelectingCompany] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      // After login, show company selection
      setIsSelectingCompany(true);
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCompany = (id: string) => {
    setActiveCompanyId(id);
    navigate('/');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      setResetSent(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="login-wrapper">
      <div className="login-background">
        <div className="gradient-sphere sphere-1"></div>
        <div className="gradient-sphere sphere-2"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-section">
              <div className="logo-badge">
                <Cpu size={32} className="logo-icon" />
              </div>
              <div className="logo-text">
                <h1>Pecuária 4.0</h1>
                <span>Advanced Intelligence ERP</span>
              </div>
            </div>
            <p className="welcome-text">
              {isForgotPassword 
                ? 'Insira seu e-mail para recuperar o acesso à sua conta.' 
                : 'Bem-vindo ao futuro da gestão agroindustrial. Por favor, identifique-se.'}
            </p>
          </div>

          {isSelectingCompany ? (
            <div className="company-selection-view animate-fade-in">
              <h2 className="selection-title">Selecione a Unidade</h2>
              <p className="selection-subtitle">Escolha qual unidade você deseja gerenciar nesta sessão.</p>
              
              <div className="company-cards-grid">
                <div 
                  className="company-selection-card all-units group"
                  onClick={() => handleSelectCompany('Todas')}
                >
                  <div className="card-icon all">
                    <Globe size={24} />
                  </div>
                  <div className="card-info">
                    <h3>Todas as Unidades</h3>
                    <p>Visão consolidada do grupo</p>
                  </div>
                  <ChevronRight size={20} className="arrow" />
                </div>

                {companies.map(company => (
                  <div 
                    key={company.id} 
                    className="company-selection-card group"
                    onClick={() => handleSelectCompany(company.id)}
                  >
                    <div className="card-icon unit">
                      <Building2 size={24} />
                    </div>
                    <div className="card-info">
                      <h3>{company.nomeFantasia}</h3>
                      <p>{company.cidade} - {company.estado}</p>
                    </div>
                    <ChevronRight size={20} className="arrow" />
                  </div>
                ))}
              </div>

              <button 
                className="btn-back-login"
                onClick={() => setIsSelectingCompany(false)}
              >
                Voltar para o Login
              </button>
            </div>
          ) : isForgotPassword ? (
            <div className="forgot-password-view">
              {!resetSent ? (
                <form onSubmit={handleForgotPassword} className="login-form">
                  <div className="form-group mb-6">
                    <label htmlFor="reset-email" className="block text-sm font-bold text-slate-700 mb-2">E-mail de Recuperação</label>
                    <div className="input-with-icon relative">
                      <input 
                        id="reset-email"
                        type="email" 
                        placeholder="seu.email@empresa.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="login-btn w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all mb-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 size={20} className="spinning" />
                    ) : (
                      <span>Recuperar Senha</span>
                    )}
                  </button>

                  <button 
                    type="button" 
                    className="w-full py-3 rounded-xl font-bold text-slate-500 hover:text-indigo-600 transition-all" 
                    onClick={() => setIsForgotPassword(false)}
                  >
                    Voltar ao Login
                  </button>
                </form>
              ) : (
                <div className="reset-success animate-fade-in text-center py-8">
                  <div className="success-icon mb-4 text-emerald-500">
                    <ShieldCheck size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">E-mail Enviado!</h3>
                  <p className="text-slate-500 mb-6">
                    Se este e-mail estiver cadastrado, você receberá instruções para resetar sua senha em instantes.
                  </p>
                  <button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-black" 
                    onClick={() => {
                      setIsForgotPassword(false);
                      setResetSent(false);
                    }}
                  >
                    Voltar ao Login
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="error-message animate-shake bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-6 border border-red-100">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group mb-5">
                <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">E-mail Corporativo</label>
                <div className="input-with-icon relative">
                  <input 
                    id="email"
                    type="email" 
                    placeholder="seu.nome@horizonte.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-white"
                  />
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="form-group mb-5">
                <div className="label-row flex justify-between items-center mb-2">
                  <label htmlFor="password" className="text-sm font-bold text-slate-700">Senha de Segurança</label>
                  <span className="forgot-link text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer" onClick={() => setIsForgotPassword(true)}>Esqueceu a senha?</span>
                </div>
                <div className="input-with-icon relative">
                  <input 
                    id="password"
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-white"
                  />
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="form-options mb-6">
                <label className="checkbox-container flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="hidden"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                    {rememberMe && <Check size={14} className="text-white" />}
                  </div>
                  <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">Manter-me conectado</span>
                </label>
              </div>

              <button 
                type="submit" 
                className="login-btn w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="spinning" />
                    <span>Validando Protocolos...</span>
                  </>
                ) : (
                  <>
                    <span>Acessar Ecossistema</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="login-footer">
            <div className="security-badges">
              <div className="badge-item">
                <ShieldCheck size={14} />
                <span>SSL Encrypted</span>
              </div>
              <div className="badge-item">
                <Database size={14} />
                <span>Secure Data</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-info-section animate-fade-in">
          <div className="info-grid">
            <div className="info-item">
              <Globe size={24} />
              <h3>Cloud Global</h3>
              <p>Sincronização em tempo real entre unidades.</p>
            </div>
            <div className="info-item">
              <TrendingUp size={24} />
              <h3>Análise de Dados</h3>
              <p>Insights baseados em IA para sua produção.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="version-info">
        Pecuária 4.0 v1.2-build | Global Support: 0800 400 4000
      </div>
    </div>
  );
};

