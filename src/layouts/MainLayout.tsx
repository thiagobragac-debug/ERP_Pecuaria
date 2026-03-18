import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { 
  Bell, Search, User, LogOut, ChevronDown, Settings, CreditCard, Shield,
  Home, Beef, Users, Layers, Map, Scale, Baby, Apple, ShieldCheck, Truck,
  ShoppingCart, TrendingUp, Package, DollarSign, LayoutList, FileText,
  BookOpen
} from 'lucide-react';
import './Layout.css';
import { useAuth } from '../contexts/AuthContext';
import { OrganizationSwitcher } from '../components/saas/OrganizationSwitcher';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: Home },
    { label: 'Rebanho', path: '/pecuaria/rebanho', icon: Beef },
    { label: 'Lotes', path: '/pecuaria/lotes', icon: Layers },
    { label: 'Pastos', path: '/pecuaria/pastos', icon: Map },
    { label: 'Pesagens', path: '/pecuaria/pesagens', icon: Scale },
    { label: 'Nutrição', path: '/pecuaria/nutricao', icon: Apple },
    { label: 'Sanidade', path: '/pecuaria/sanidade', icon: ShieldCheck },
    { label: 'Máquinas', path: '/maquinas', icon: Truck },
    { label: 'Financeiro', path: '/financeiro/fluxo', icon: DollarSign },
    { label: 'Cadastro de Insumos', path: '/estoque/insumos', icon: Package },
    { label: 'Movimentação de Estoque', path: '/estoque/movimentacao', icon: Package },
    { label: 'Inventário Periódico', path: '/estoque/inventario', icon: Package },
    { label: 'Vendas', path: '/vendas/pedidos', icon: ShoppingCart },
    { label: 'Compras', path: '/compras/pedidos', icon: LayoutList },
    { label: 'Configurações', path: '/admin/settings', icon: Settings },
    { label: 'Contábil', path: '/contabil/livro-caixa', icon: BookOpen },
  ];

  const filteredResults = navItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: 'Nova Pesagem Registrada', time: '5 min atrás', type: 'info' },
    { id: 2, title: 'Alerta de Sanidade: Lote 04', time: '1h atrás', type: 'warning' },
    { id: 3, title: 'Pagamento Confirmado', time: '2h atrás', type: 'success' },
  ];

  return (
    <div className="app-container">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={`main-content ${collapsed ? 'expanded' : ''}`}>
        <header className="top-header glass">
          <div className="header-left">
            <OrganizationSwitcher />
          </div>
          
          <div className="header-center">
            <div className="search-container-premium" ref={searchRef}>
              <div className="search-bar-premium">
                <input 
                  type="text" 
                  placeholder="Buscar no sistema..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                />
                <div className="search-actions-right">
                  <div className="search-shortcut">
                    <span>⌘</span>
                    <span>K</span>
                  </div>
                  <div className="search-divider"></div>
                  <Search size={18} className="search-icon-right" />
                </div>
              </div>

              {showSearchResults && filteredResults.length > 0 && (
                <div className="search-results-dropdown glass animate-slide-up">
                  {filteredResults.map((item, idx) => (
                    <button 
                      key={idx} 
                      className="search-result-item"
                      onClick={() => {
                        navigate(item.path);
                        setSearchQuery('');
                        setShowSearchResults(false);
                      }}
                    >
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="header-right">
            <div className="header-actions-premium">
              <div className="notification-wrapper">
                <button 
                  className={`notification-btn-new ${showNotifications ? 'active' : ''}`} 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  title="Notificações"
                >
                  <Bell size={20} />
                  <span className="notification-pulse"></span>
                </button>

                {showNotifications && (
                  <div className="dropdown-menu-premium notifications-dropdown glass floating animate-slide-up">
                    <div className="dropdown-header-custom">
                      <span>Notificações</span>
                      <span className="mark-read">Limpar tudo</span>
                    </div>
                    <div className="dropdown-content-custom">
                      {notifications.map(n => (
                        <div key={n.id} className="notification-item-custom">
                          <div className={`notification-dot ${n.type}`}></div>
                          <div className="notification-info">
                            <p className="notif-title">{n.title}</p>
                            <p className="notif-time">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="user-profile-wrapper">
                <div 
                  className={`user-profile-premium ${showProfileMenu ? 'active' : ''}`}
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                >
                  <div className="user-avatar-wrapper">
                    <div className="avatar-premium">
                      {user?.name?.charAt(0) || <User size={20} />}
                    </div>
                    <div className="status-indicator online"></div>
                  </div>
                  <div className="user-details-premium">
                    <span className="user-name-new">{user?.name || 'Visitante'}</span>
                    <span className="user-role-new">{user?.role || 'Acesso Limitado'}</span>
                  </div>
                  <ChevronDown size={14} className={`dropdown-arrow ${showProfileMenu ? 'rotate' : ''}`} />
                </div>

                {showProfileMenu && (
                  <div className="dropdown-menu-premium profile-dropdown glass floating animate-slide-up">
                    <div className="dropdown-group">
                      <button className="dropdown-item-custom" onClick={() => { navigate('/admin/profiles'); setShowProfileMenu(false); }}>
                        <User size={16} /> Meu Perfil
                      </button>
                      <button className="dropdown-item-custom" onClick={() => { navigate('/admin/settings'); setShowProfileMenu(false); }}>
                        <Settings size={16} /> Configurações
                      </button>
                      <button className="dropdown-item-custom" onClick={() => { navigate('/admin/definicao'); setShowProfileMenu(false); }}>
                        <CreditCard size={16} /> Faturamento
                      </button>
                      <button className="dropdown-item-custom" onClick={() => { navigate('/admin/definicao'); setShowProfileMenu(false); }}>
                        <Shield size={16} /> Segurança
                      </button>
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-group">
                      <button className="dropdown-item-custom logout-item" onClick={handleLogout}>
                        <LogOut size={16} /> Sair do Sistema
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
