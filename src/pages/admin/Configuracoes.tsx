import React, { useState } from 'react';
import { 
  Settings, 
  Palette, 
  ShieldCheck, 
  Bell, 
  Globe, 
  Database, 
  Link as LinkIcon,
  Save,
  RefreshCw,
  Mail,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  Upload,
  PieChart,
  Activity,
  Monitor,
  Laptop,
  Tablet,
  MessageSquare,
  DollarSign,
  Package,
  Clock,
  Landmark,
  Copy,
  Download,
  History,
  User,
  Calendar,
  Server,
  HardDrive,
  Search,
  ChevronRight,
  CreditCard,
  Zap
} from 'lucide-react';
import './Configuracoes.css';
import { PricingCard } from '../../components/saas/PricingCard';
import { SaaSPaymentModal } from '../../components/saas/SaaSPaymentModal';
import { SubscriptionStatus } from '../../components/saas/SubscriptionStatus';
import { saasService } from '../../services/saasService';
import { SaaSPlan, SaasSubscription } from '../../types';

type SettingsTab = 'geral' | 'identidade' | 'seguranca' | 'notificacoes' | 'integracoes' | 'backup' | 'assinatura';

export const Configuracoes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('geral');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [plans, setPlans] = useState<SaaSPlan[]>([]);
  const [currentSub, setCurrentSub] = useState<{ subscription: SaasSubscription, plan: SaaSPlan } | null>(null);
   const [isLoadingSaaS, setIsLoadingSaaS] = useState(false);
  const [selectedPlanForPix, setSelectedPlanForPix] = useState<SaaSPlan | null>(null);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);

  React.useEffect(() => {
    const loadSaaS = async () => {
      setIsLoadingSaaS(true);
      try {
        const [plansData, subData] = await Promise.all([
          saasService.getPlans(),
          saasService.getCurrentSubscription()
        ]);
        setPlans(plansData);
        if (subData) setCurrentSub({ subscription: subData.subscription, plan: subData.plan });
      } catch (error) {
        console.error('Error loading SaaS data:', error);
      } finally {
        setIsLoadingSaaS(false);
      }
    };
    loadSaaS();
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Configurações salvas com sucesso!');
    }, 1500);
  };

  const SidebarItem: React.FC<{ tab: SettingsTab; icon: any; label: string }> = ({ tab, icon: Icon, label }) => (
    <button 
      className={`sidebar-item ${activeTab === tab ? 'active' : ''}`}
      onClick={() => setActiveTab(tab)}
    >
      <Icon size={20} strokeWidth={3} />
      <span>{label}</span>
      {activeTab === tab && <div className="active-indicator" />}
    </button>
  );

  return (
    <div className="configuracoes-wrapper">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge emerald">
            <Settings size={40} strokeWidth={3} />
          </div>
          <div className="title-info">
            <h1>Configurações do Sistema</h1>
            <p className="description">Gerencie preferências globais, segurança e identidade da plataforma</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-premium-solid indigo h-11 px-8 gap-2" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <RefreshCw size={18} className="spinning" /> : <Save size={18} strokeWidth={3} />}
            <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </div>

      <div className="settings-container">
        <aside className="settings-sidebar">
          <SidebarItem tab="geral" icon={Settings} label="Geral" />
          <SidebarItem tab="identidade" icon={Palette} label="Identidade Visual" />
          <SidebarItem tab="seguranca" icon={ShieldCheck} label="Segurança" />
          <SidebarItem tab="notificacoes" icon={Bell} label="Notificações" />
          <SidebarItem tab="integracoes" icon={LinkIcon} label="Integrações" />
          <SidebarItem tab="backup" icon={Database} label="Backup & Logs" />
          <SidebarItem tab="assinatura" icon={CreditCard} label="Assinatura & Plano" />
        </aside>

        <main className="settings-content scrollable">
          {activeTab === 'geral' && (
            <div className="settings-section">
              <div className="config-section-header">
                <div className="icon-badge emerald" style={{ width: 48, height: 48 }}>
                  <Globe size={32} strokeWidth={3} />
                </div>
                <div>
                  <h3>Configurações Gerais</h3>
                  <p style={{ margin: 0 }}>Defina informações básicas e preferências regionais.</p>
                </div>
              </div>
              
              <div className="settings-grid">
                <div className="settings-group">
                  <label>Nome do Sistema</label>
                  <input type="text" defaultValue="Pecuária 4.0 Pro" placeholder="Ex: Meu ERP Agrícola" />
                </div>
                <div className="settings-group">
                  <label>Fuso Horário</label>
                  <select defaultValue="GMT-3">
                    <option value="GMT-3">(GMT-03:00) Brasília, São Paulo</option>
                    <option value="GMT-4">(GMT-04:00) Cuiabá, Manaus</option>
                  </select>
                </div>
                <div className="settings-group">
                  <label>Formato de Data</label>
                  <select defaultValue="DD/MM/YYYY">
                    <option value="DD/MM/YYYY">DD/MM/AAAA</option>
                    <option value="MM/DD/YYYY">MM/DD/AAAA</option>
                  </select>
                </div>
                <div className="settings-group">
                  <label>Moeda Padrão</label>
                  <select defaultValue="BRL">
                    <option value="BRL">Real (R$)</option>
                    <option value="USD">Dólar (US$)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'identidade' && (
            <div className="settings-section">
              <div className="config-section-header">
                <div className="icon-badge emerald" style={{ width: 48, height: 48 }}>
                  <Palette size={32} strokeWidth={3} />
                </div>
                <div>
                  <h3>Identidade Visual & Branding</h3>
                  <p style={{ margin: 0 }}>Personalize a experiência visual para refletir a marca da sua fazenda.</p>
                </div>
              </div>

              <div className="branding-grid">
                <div className="branding-card">
                  <div className="card-header-simple">
                    <label className="section-label">Logotipo da Plataforma</label>
                  </div>
                  <div className="logo-preview-box">
                    <div className="preview-label">Versão Horizontal (Principal)</div>
                    <img src="https://via.placeholder.com/180x45?text=Pecuária+4.0" alt="Preview" />
                    <button className="btn-premium-outline">
                      <Upload size={16} strokeWidth={3} />
                      <span>Enviar Nova Logo</span>
                    </button>
                    <span className="helper-text">Recomendado: PNG ou SVG, fundo transparente (300x80px)</span>
                  </div>
                </div>

                <div className="branding-card">
                  <div className="card-header-simple">
                    <label className="section-label">Sistema de Cores</label>
                  </div>
                  <div className="color-inputs">
                    <div className="color-item">
                      <div className="color-info-group">
                        <span>Cor Primária</span>
                        <small>Botões, ícones ativos e destaques</small>
                      </div>
                      <div className="color-picker-wrapper">
                        <input type="color" defaultValue="#10b981" />
                        <code>#10B981</code>
                      </div>
                    </div>
                    <div className="color-item">
                      <div className="color-info-group">
                        <span>Cor Secundária</span>
                        <small>Menus e elementos secundários</small>
                      </div>
                      <div className="color-picker-wrapper">
                        <input type="color" defaultValue="#34d399" />
                        <code>#34D399</code>
                      </div>
                    </div>
                    <div className="color-item">
                      <div className="color-info-group">
                        <span>Cor de Sucesso</span>
                        <small>Indicadores positivos e lucros</small>
                      </div>
                      <div className="color-picker-wrapper">
                        <input type="color" defaultValue="#10b981" />
                        <code>#10B981</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="white-label-section">
                <div className="white-label-toggle custom-switch-container">
                  <div className="toggle-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <ShieldCheck size={20} strokeWidth={3} className="text-emerald-500" />
                      <strong>Modo White-Label Profissional</strong>
                    </div>
                    <span>Remove referências ao desenvolvedor e habilita sua marca exclusiva nos relatórios em PDF.</span>
                  </div>
                  <div className="custom-switch">
                    <input type="checkbox" id="whiteLabel" defaultChecked />
                    <label htmlFor="whiteLabel"></label>
                  </div>
                </div>
              </div>

              <div className="branding-preview-section">
                <div className="section-title-with-icon">
                  <Eye size={20} strokeWidth={3} />
                  <label className="section-label">Pré-visualização em Tempo Real</label>
                </div>
                <div className="preview-container">
                  <div className="ui-mockup">
                    <div className="mockup-header">
                      <div className="mockup-logo" style={{ background: 'linear-gradient(90deg, #10b981, #34d399)' }}></div>
                      <div className="mockup-nav">
                        <div className="mockup-nav-item"></div>
                        <div className="mockup-nav-item"></div>
                        <div className="mockup-nav-item"></div>
                      </div>
                    </div>
                    <div className="mockup-content">
                      <div className="mockup-card">
                        <div className="mockup-title"></div>
                        <div className="mockup-text"></div>
                        <div className="mockup-text"></div>
                        <div className="mockup-text" style={{ width: '60%' }}></div>
                        <div className="mockup-button" style={{ background: '#10b981' }}>Botão Principal</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seguranca' && (
            <div className="settings-section">
              <div className="config-section-header">
                <div className="icon-badge emerald" style={{ width: 48, height: 48 }}>
                  <ShieldCheck size={32} strokeWidth={3} />
                </div>
                <div>
                  <h3>Segurança e Políticas de Acesso</h3>
                  <p style={{ margin: 0 }}>Gerencie o isolamento de dados e autenticação avançada do sistema.</p>
                </div>
              </div>

              <div className="security-health-section">
                <div className="health-info">
                  <div className="health-score-circle">
                    <span>95</span>
                  </div>
                  <div className="health-text">
                    <h4>Nível de Segurança: Excelente</h4>
                    <p>Sua plataforma segue as melhores práticas de proteção de dados e isolamento.</p>
                  </div>
                </div>
                <div className="health-actions">
                  <button className="btn-premium-outline px-6 gap-2" style={{ display: 'flex', alignItems: 'center' }}>
                    <Activity size={18} strokeWidth={3} />
                    <span>Auditoria Rápida</span>
                  </button>
                </div>
              </div>

              <div className="security-grid">
                <div className="security-card active">
                  <div className="card-header">
                    <Smartphone size={32} strokeWidth={3} />
                    <h4>Autenticação em Dois Fatores (2FA)</h4>
                  </div>
                  <p>Exigir um código secundário via app (Google/Microsoft Auth) para todos os gestores.</p>
                  <div className="security-card-footer">
                    <span className="status-indicator enabled">Obrigatório</span>
                    <div className="custom-switch">
                      <input type="checkbox" id="2faAdmin" defaultChecked />
                      <label htmlFor="2faAdmin"></label>
                    </div>
                  </div>
                </div>

                <div className="security-card">
                  <div className="card-header">
                    <Lock size={32} strokeWidth={3} />
                    <h4>Complexidade de Senha</h4>
                  </div>
                  <p>Habilitar política de senhas fortes (Caracteres especiais, números e maiúsculas).</p>
                  <div className="security-card-footer">
                    <span className="status-indicator enabled">Ativo</span>
                    <div className="custom-switch">
                      <input type="checkbox" id="passComplex" defaultChecked />
                      <label htmlFor="passComplex"></label>
                    </div>
                  </div>
                </div>

                <div className="security-card">
                  <div className="card-header">
                    <Globe size={32} strokeWidth={3} />
                    <h4>Restrição de IP Geográfico</h4>
                  </div>
                  <p>Permitir acesso apenas de IPs provenientes do Brasil para reduzir riscos de ataques.</p>
                  <div className="security-card-footer">
                    <span className="status-indicator disabled">Inativo</span>
                    <div className="custom-switch">
                      <input type="checkbox" id="geoLimit" />
                      <label htmlFor="geoLimit"></label>
                    </div>
                  </div>
                </div>

                <div className="security-card">
                  <div className="card-header">
                    <EyeOff size={32} strokeWidth={3} />
                    <h4>Obsfucação de Dados Sensíveis</h4>
                  </div>
                  <p>Ocultar CPFs e dados bancários em relatórios para usuários comuns.</p>
                  <div className="security-card-footer">
                    <span className="status-indicator enabled">Ativo</span>
                    <div className="custom-switch">
                      <input type="checkbox" id="dataHide" defaultChecked />
                      <label htmlFor="dataHide"></label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sessions-list">
                <div className="sessions-list-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Activity size={20} strokeWidth={3} className="text-emerald-500" />
                    <strong>Dispositivos e Sessões Ativas</strong>
                  </div>
                  <button className="btn-premium-outline btn-danger py-2 px-4">Revogar Todas as Outras</button>
                </div>
                <div className="session-item-container">
                  <div className="session-row">
                    <div className="session-icon-wrapper active">
                      <Laptop size={22} strokeWidth={3} />
                    </div>
                    <div className="session-info">
                      <div className="session-info-header">
                        <strong>Chrome no Windows 11</strong>
                        <span className="current-session-badge">Sua sessão atual</span>
                      </div>
                      <div className="session-metadata">
                        <span>Cuiabá, Mato Grosso</span>
                        <div className="metadata-dot"></div>
                        <span>IP: 177.85.24.xx</span>
                      </div>
                    </div>
                    <div className="session-actions">
                      <span className="last-activity">Ativo agora</span>
                      <span className="status-indicator enabled">Online</span>
                    </div>
                  </div>

                  <div className="session-row">
                    <div className="session-icon-wrapper">
                      <Smartphone size={22} strokeWidth={3} />
                    </div>
                    <div className="session-info">
                      <div className="session-info-header">
                        <strong>Safari no iPhone 15 Pro</strong>
                      </div>
                      <div className="session-metadata">
                        <span>São Paulo, SP</span>
                        <div className="metadata-dot"></div>
                        <span>IP: 189.45.122.xx</span>
                      </div>
                    </div>
                    <div className="session-actions">
                      <span className="last-activity">Último acesso: há 14 min</span>
                      <button className="action-btn-global btn-delete">Encerrar</button>
                    </div>
                  </div>

                  <div className="session-row">
                    <div className="session-icon-wrapper">
                      <Tablet size={22} strokeWidth={3} />
                    </div>
                    <div className="session-info">
                      <div className="session-info-header">
                        <strong>Trabalho (iPad Pro)</strong>
                      </div>
                      <div className="session-metadata">
                        <span>Cuiabá, Mato Grosso</span>
                        <div className="metadata-dot"></div>
                        <span>IP: 177.85.24.xx</span>
                      </div>
                    </div>
                    <div className="session-actions">
                      <span className="last-activity">Último acesso: ontem às 21:45</span>
                      <button className="action-btn-global btn-delete">Encerrar</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-group mt-40">
                <div className="label-row">
                  <label>Expiração Automática de Sessão</label>
                  <span className="helper-text">Usuários inativos serão deslogados.</span>
                </div>
                <select defaultValue="120" style={{ maxWidth: '240px' }}>
                  <option value="30">30 Minutos</option>
                  <option value="60">1 Hora</option>
                  <option value="120">2 Horas (Recomendado)</option>
                  <option value="480">8 Horas</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'notificacoes' && (
            <div className="settings-section">
              <div className="config-section-header">
                <div className="icon-badge emerald" style={{ width: 48, height: 48 }}>
                  <Bell size={32} strokeWidth={3} />
                </div>
                <div>
                  <h3>Canais & Alertas Inteligentes</h3>
                  <p style={{ margin: 0 }}>Configure como e quando você deseja ser avisado sobre eventos da sua fazenda.</p>
                </div>
              </div>

              <div className="notification-channels">
                <div className="channel-card">
                  <div className="channel-icon-badge">
                    <Mail size={32} strokeWidth={3} />
                  </div>
                  <h4>E-mail</h4>
                  <span className="channel-status active">Conectado</span>
                  <div className="custom-switch">
                    <input type="checkbox" id="emailStatus" defaultChecked />
                    <label htmlFor="emailStatus"></label>
                  </div>
                </div>

                <div className="channel-card">
                  <div className="channel-icon-badge" style={{ color: '#25D366' }}>
                    <MessageSquare size={32} strokeWidth={3} />
                  </div>
                  <h4>WhatsApp</h4>
                  <span className="channel-status active">API Ativa</span>
                  <div className="custom-switch">
                    <input type="checkbox" id="waStatus" defaultChecked />
                    <label htmlFor="waStatus"></label>
                  </div>
                </div>

                <div className="channel-card">
                  <div className="channel-icon-badge">
                    <Bell size={32} strokeWidth={3} />
                  </div>
                  <h4>Push Browser</h4>
                  <span className="channel-status inactive">Desabilitado</span>
                  <div className="custom-switch">
                    <input type="checkbox" id="pushStatus" />
                    <label htmlFor="pushStatus"></label>
                  </div>
                </div>
              </div>

              <div className="section-title-with-icon mt-40">
                <Settings size={20} strokeWidth={3} className="text-emerald-500" />
                <label className="section-label">Categorias de Alertas</label>
              </div>

              <div className="notification-categories">
                <div className="category-row">
                  <div className="category-main">
                    <div className="category-icon">
                      <DollarSign size={20} strokeWidth={3} />
                    </div>
                    <div className="category-text">
                      <h4>Gestão Financeira</h4>
                      <p>Contas a pagar/receber, fluxo de caixa e faturamento.</p>
                    </div>
                  </div>
                  <div className="category-options">
                    <span className="option-pill active">E-mail</span>
                    <span className="option-pill active">WhatsApp</span>
                  </div>
                </div>

                <div className="category-row">
                  <div className="category-main">
                    <div className="category-icon">
                      <PieChart size={20} strokeWidth={3} />
                    </div>
                    <div className="category-text">
                      <h4>Manejo & Rebanho</h4>
                      <p>Protocolos sanitários, pesagens e alertas de carência.</p>
                    </div>
                  </div>
                  <div className="category-options">
                    <span className="option-pill">E-mail</span>
                    <span className="option-pill active">WhatsApp</span>
                  </div>
                </div>

                <div className="category-row">
                  <div className="category-main">
                    <div className="category-icon">
                      <Package size={20} strokeWidth={3} />
                    </div>
                    <div className="category-text">
                      <h4>Estoque & Compras</h4>
                      <p>Nível crítico de insumos e cotações finalizadas.</p>
                    </div>
                  </div>
                  <div className="category-options">
                    <span className="option-pill active">E-mail</span>
                    <span className="option-pill">WhatsApp</span>
                  </div>
                </div>
              </div>

              <div className="settings-group mt-40">
                <div className="label-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={18} strokeWidth={3} className="text-emerald-500" />
                    <label>Horário Silencioso (Não Perturbe)</label>
                  </div>
                  <span className="helper-text">Silencia alertas no WhatsApp entre estes horários.</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <input type="time" defaultValue="22:00" style={{ maxWidth: '140px' }} />
                  <span>até</span>
                  <input type="time" defaultValue="06:00" style={{ maxWidth: '140px' }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integracoes' && (
            <div className="settings-section">
              <div className="config-section-header">
                <div className="icon-badge emerald" style={{ width: 48, height: 48 }}>
                  <LinkIcon size={32} strokeWidth={3} />
                </div>
                <div>
                  <h3>Ecossistema de Integrações</h3>
                  <p style={{ margin: 0 }}>Conecte seu ERP a serviços externos para automação máxima.</p>
                </div>
              </div>

              <div className="integrations-marketplace">
                <div className="integration-card">
                  <div className="integration-header">
                    <div className="integration-logo">
                      <Globe size={24} strokeWidth={3} />
                    </div>
                    <div className="integration-info">
                      <h4>Cotações CEPEA</h4>
                      <span>Dados do Agronegócio</span>
                    </div>
                  </div>
                  <p>Sincronização automática de preços da Arroba do Boi e insumos agrícolas em tempo real.</p>
                  <div className="integration-footer">
                    <div className="integration-status connected">
                      <div className="status-dot online"></div> Conectado
                    </div>
                    <button className="btn-premium-outline">Configurar</button>
                  </div>
                </div>

                <div className="integration-card">
                  <div className="integration-header">
                    <div className="integration-logo" style={{ color: '#0047bb' }}>
                      <Landmark size={24} strokeWidth={3} />
                    </div>
                    <div className="integration-info">
                      <h4>Open Banking (PIX)</h4>
                      <span>Gestão de Pagamentos</span>
                    </div>
                  </div>
                  <p>Emissão de boletos híbridos e conciliação bancária automática via APIs seguras.</p>
                  <div className="integration-footer">
                    <div className="integration-status connected">
                      <div className="status-dot online"></div> Conectado
                    </div>
                    <button className="btn-premium-outline">Configurar</button>
                  </div>
                </div>

                <div className="integration-card">
                  <div className="integration-header">
                    <div className="integration-logo">
                      <Database size={24} strokeWidth={3} />
                    </div>
                    <div className="integration-info">
                      <h4>ERP Sync Service</h4>
                      <span>Infraestrutura</span>
                    </div>
                  </div>
                  <p>Sincronia entre o sistema de campo e o escritório central para dados offline.</p>
                  <div className="integration-footer">
                    <div className="integration-status disconnected">
                      <div className="status-dot"></div> Desconectado
                    </div>
                    <button className="btn-premium-solid indigo">Conectar</button>
                  </div>
                </div>
              </div>

              <div className="section-title-with-icon">
                <Lock size={18} strokeWidth={3} className="text-emerald-500" />
                <label className="section-label">Gestão de API & Webhooks</label>
              </div>

              <div className="api-management-list">
                <div className="api-key-row">
                  <div className="key-main">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <strong>Produção - Mobile App</strong>
                      <span className="scope-badge">Full Access</span>
                    </div>
                    <code>pk_live_51Pq7Y...XXXXX</code>
                  </div>
                  <div className="session-actions">
                    <button className="btn-icon-alt"><Copy size={16} strokeWidth={3} /></button>
                    <button className="action-btn-global btn-delete">Revogar</button>
                  </div>
                </div>

                <div className="api-key-row">
                  <div className="key-main">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <strong>Sandbox - Testes de Integração</strong>
                      <span className="scope-badge">Read Only</span>
                    </div>
                    <code>pk_test_92BvX...YYYYY</code>
                  </div>
                  <div className="session-actions">
                    <button className="btn-icon-alt"><Copy size={16} strokeWidth={3} /></button>
                    <button className="action-btn-global btn-delete">Revogar</button>
                  </div>
                </div>
              </div>

              <div className="webhooks-section mt-40">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <label className="section-label" style={{ margin: 0 }}>Webhook Monitor Tool</label>
                  <button className="btn-premium-outline">+ Adicionar Endpoint</button>
                </div>
                <div className="session-row" style={{ border: '1px solid var(--border-color)', borderRadius: '16px', background: 'white' }}>
                  <div className="session-icon-wrapper active">
                    <Globe size={22} strokeWidth={3} />
                  </div>
                  <div className="session-info">
                    <strong>https://hooks.slack.com/services/T000...</strong>
                    <div className="session-metadata">
                      <span>Eventos: pesagem.concluida, animal.nascimento</span>
                      <div className="metadata-dot"></div>
                      <span style={{ color: 'var(--success)' }}>Sucesso: 100% (24h)</span>
                    </div>
                  </div>
                  <div className="session-actions">
                    <button className="action-btn-global btn-delete">Remover</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="settings-section">
              <div className="config-section-header">
                <div className="icon-badge emerald" style={{ width: 48, height: 48 }}>
                  <Database size={32} strokeWidth={3} />
                </div>
                <div>
                  <h3>Centro de Dados & Auditoria</h3>
                  <p style={{ margin: 0 }}>Gerencie backups na nuvem e monitore o histórico de ações críticas.</p>
                </div>
              </div>

              <div className="backup-dashboard">
                <div className="backup-health-card">
                  <span className="card-label">Status da Nuvem</span>
                  <div className="card-value">
                    <Server size={24} strokeWidth={3} className="text-emerald-500" />
                    <span>Saudável</span>
                  </div>
                  <div className="card-subtext">Última sincronia: Hoje às 03:00</div>
                </div>

                <div className="backup-health-card">
                  <span className="card-label">Armazenamento</span>
                  <div className="card-value">
                    <span>45.2 GB</span>
                  </div>
                  <div className="storage-progress-container">
                    <div className="storage-progress-bar" style={{ width: '65%' }}></div>
                  </div>
                  <div className="card-subtext">65% do plano de 70 GB utilizado.</div>
                </div>

                <div className="backup-health-card">
                  <span className="card-label">Retenção</span>
                  <div className="card-value">
                    <Clock size={24} strokeWidth={3} className="text-emerald-500" />
                    <span>30 Dias</span>
                  </div>
                  <div className="card-subtext">Histórico de versões garantido.</div>
                </div>
              </div>

              <div className="audit-log-container">
                <div className="audit-log-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <History size={20} strokeWidth={3} className="text-emerald-500" />
                    <strong>Histórico de Auditoria</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="search-box-mini" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid var(--border-color)', padding: '4px 12px', borderRadius: '8px' }}>
                      <Search size={14} strokeWidth={3} className="text-muted" />
                      <input type="text" placeholder="Filtrar por usuário ou ação..." style={{ border: 'none', outline: 'none', fontSize: '0.85rem' }} />
                    </div>
                    <button className="btn-icon-alt"><Download size={16} strokeWidth={3} /></button>
                  </div>
                </div>

                <div className="audit-rows-container">
                  <div className="audit-row">
                    <span className="audit-time">16:20:45</span>
                    <div className="audit-user">
                      <div className="user-avatar-mini">RS</div>
                      <strong>Ricardo Santos</strong>
                    </div>
                    <span className="audit-action">Alterou política de autenticação 2FA</span>
                    <span className="audit-category-tag security">Segurança</span>
                  </div>

                  <div className="audit-row">
                    <span className="audit-time">14:15:32</span>
                    <div className="audit-user">
                      <div className="user-avatar-mini" style={{ background: '#f59e0b' }}>AC</div>
                      <strong>Ana Costa</strong>
                    </div>
                    <span className="audit-action">Excluiu registro de animal ID #9982 (Lote de Engorda)</span>
                    <span className="audit-category-tag system">Sistema</span>
                  </div>

                  <div className="audit-row">
                    <span className="audit-time">10:05:12</span>
                    <div className="audit-user">
                      <div className="user-avatar-mini" style={{ background: '#10b981' }}>ML</div>
                      <strong>Marcos Lima</strong>
                    </div>
                    <span className="audit-action">Aprovou pedido de compra #772 (Nutrição)</span>
                    <span className="audit-category-tag finance">Financeiro</span>
                  </div>

                  <div className="audit-row">
                    <span className="audit-time">Ontem</span>
                    <div className="audit-user">
                      <div className="user-avatar-mini">RS</div>
                      <strong>Ricardo Santos</strong>
                    </div>
                    <span className="audit-action">Iniciou processo de Backup Manual (Full Snap)</span>
                    <span className="audit-category-tag system">Sistema</span>
                  </div>
                </div>
                <div style={{ padding: '16px 32px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <button className="btn-premium-outline py-2 px-6">Ver histórico completo <ChevronRight size={14} /></button>
                </div>
              </div>

              <div className="section-title-with-icon mt-48">
                <HardDrive size={20} className="text-indigo" />
                <label className="section-label">Portabilidade & Exportação</label>
              </div>

              <div className="export-grid">
                <div className="export-item-card">
                  <div className="export-icon">
                    <Download size={20} />
                  </div>
                  <div className="export-details">
                    <strong>Exportar Rebanho</strong>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>XLSX, CSV, JSON</p>
                  </div>
                </div>

                <div className="export-item-card">
                  <div className="export-icon">
                    <Download size={20} />
                  </div>
                  <div className="export-details">
                    <strong>Movimentação Financeira</strong>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>PDF, XLSX</p>
                  </div>
                </div>

                <div className="export-item-card">
                  <div className="export-icon">
                    <Download size={20} />
                  </div>
                  <div className="export-details">
                    <strong>Estrutura de Estoque</strong>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>JSON Full Dump</p>
                  </div>
                </div>
              </div>

              <div className="settings-group mt-48" style={{ background: 'rgba(79, 70, 229, 0.05)', padding: '32px', borderRadius: '20px', border: '1px dashed var(--primary-indigo)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0' }}>Backup Crítico Imediato</h4>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Gera um snapshot completo de todos os módulos e salva em cofre frio.</p>
                  </div>
                  <button className="btn-premium-solid indigo py-3 px-8">Rodar Full Backup</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assinatura' && (
            <div className="settings-section fade-in">
              <div className="config-section-header">
                <div className="icon-badge indigo" style={{ width: 48, height: 48 }}>
                  <Zap size={24} />
                </div>
                <div>
                  <h3>Gestão de Assinatura</h3>
                  <p style={{ margin: 0 }}>Controle seu plano, faturamento e limites de uso da plataforma.</p>
                </div>
              </div>

              {currentSub ? (
                <SubscriptionStatus 
                  subscription={currentSub.subscription} 
                  plan={currentSub.plan}
                  usage={{ animals: 1240, users: 4 }} // Mock usage for demo
                />
              ) : (
                <div className="alert-box info mb-6" style={{ background: 'rgba(79, 70, 229, 0.05)', padding: '20px', borderRadius: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Info size={20} className="text-indigo" />
                  <p style={{ margin: 0 }}>Você ainda não possui uma organização configurada. Selecione um plano abaixo para começar.</p>
                </div>
              )}

              <div className="section-title-with-icon mb-6">
                <CreditCard size={20} className="text-indigo" />
                <label className="section-label" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Planos Disponíveis</label>
              </div>

              <div className="pricing-grid">
                {plans.map((plan: SaaSPlan) => (
                  <PricingCard 
                    key={plan.id}
                    plan={plan}
                    featured={plan.nome === 'Silver'}
                    isCurrent={currentSub?.plan.id === plan.id}
                    onSelect={(p: SaaSPlan) => {
                      setSelectedPlanForPix(p);
                      setIsPixModalOpen(true);
                    }}
                  />
                ))}
                {plans.length === 0 && !isLoadingSaaS && (
                   <p className="text-muted">Carregando planos da nuvem...</p>
                )}
              </div>

              {selectedPlanForPix && (
            <SaaSPaymentModal 
              isOpen={isPixModalOpen}
              onClose={() => {
                setIsPixModalOpen(false);
                setSelectedPlanForPix(null);
              }}
              planName={selectedPlanForPix.nome}
              amount={selectedPlanForPix.preco_mensal}
              onConfirm={() => {
                alert('Solicitação de pagamento recebida! Validaremos seu comprovante em instantes.');
                setIsPixModalOpen(false);
                setSelectedPlanForPix(null);
              }}
            />
          )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

