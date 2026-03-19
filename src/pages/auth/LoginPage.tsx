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
  TrendingUp
} from 'lucide-react';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
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

          {!isForgotPassword ? (
            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="error-message animate-shake">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">E-mail Corporativo</label>
                <div className="input-with-icon">
                  <input 
                    id="email"
                    type="email" 
                    placeholder="seu.nome@horizonte.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail size={18} className="field-icon" />
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="password">Senha de Segurança</label>
                  <span className="forgot-link" onClick={() => setIsForgotPassword(true)}>Esqueceu a senha?</span>
                </div>
                <div className="input-with-icon">
                  <input 
                    id="password"
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Lock size={18} className="field-icon" />
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Manter-me conectado
                </label>
              </div>

              <button 
                type="submit" 
                className="login-btn" 
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
          ) : (
            <div className="forgot-password-view">
              {!resetSent ? (
                <form onSubmit={handleForgotPassword} className="login-form">
                  <div className="form-group">
                    <label htmlFor="reset-email">E-mail de Recuperação</label>
                    <div className="input-with-icon">
                      <input 
                        id="reset-email"
                        type="email" 
                        placeholder="seu.email@empresa.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                      <Mail size={18} className="field-icon" />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="login-btn" 
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
                    className="btn-premium-outline w-full" 
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
                    className="btn-premium-solid indigo w-full" 
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

