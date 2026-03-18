import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Beef, 
  Truck, 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  DollarSign, 
  FileText,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  Home,
  Building2,
  LogOut,
  Settings2,
  Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

// Mapping modules to profile permission keys
const MODULE_PERMISSIONS: Record<string, string> = {
  'Painel Master': 'master',
  'Administração': 'admin',
  'Pecuária': 'pecuaria',
  'Máquina & Frota': 'maquinas',
  'Compra & Cotação': 'compras',
  'Venda & CRM': 'vendas',
  'Estoque': 'estoque',
  'Financeiro e Banco': 'financeiro',
  'Contábil & Fiscal': 'contabil'
};

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<string, string[]> = {
  'MASTER': ['master', 'admin', 'pecuaria', 'maquinas', 'compras', 'vendas', 'estoque', 'financeiro', 'contabil'],
  'ADMIN': ['admin', 'pecuaria', 'maquinas', 'compras', 'vendas', 'estoque', 'financeiro', 'contabil'],
  'USER': ['pecuaria', 'estoque']
};

interface NavItem {
  title: string;
  icon: any;
  path?: string;
  roleRequired?: 'MASTER' | 'ADMIN' | 'USER';
  subItems?: { title: string, path: string }[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
  {
    title: 'Painel Master',
    icon: ShieldCheck,
    roleRequired: 'MASTER',
    subItems: [
      { title: 'Usuários do Sistema', path: '/admin/users' },
      { title: 'Gestão SaaS', path: '/admin/saas' },
      { title: 'Cadastro de Perfil', path: '/admin/profiles' },
      { title: 'Cadastro de Empresa', path: '/admin/companies' },
      { title: 'Definição', path: '/admin/definicao' },
    ]
  },
  { 
    title: 'Administração', 
    icon: Settings2,
    subItems: [
      { title: 'Gestão de Equipe', path: '/equipe' },
      { title: 'Configurações', path: '/admin/settings' }
    ]
  },
  { 
    title: 'Pecuária', 
    icon: Beef,
    subItems: [
      { title: 'Rebanho', path: '/pecuaria/rebanho' },
      { title: 'Lote', path: '/pecuaria/lotes' },
      { title: 'Pasto', path: '/pecuaria/pastos' },
      { title: 'Pesagem & GMD', path: '/pecuaria/pesagens' },
      { title: 'Confinamento', path: '/pecuaria/confinamento' },
      { title: 'Reprodução', path: '/pecuaria/reproducao' },
      { title: 'Nutrição', path: '/pecuaria/nutricao' },
      { title: 'Sanidade', path: '/pecuaria/sanidade' },
      { title: 'Abate', path: '/pecuaria/abate' },
      { title: 'Relatórios', path: '/pecuaria/relatorios' }
    ]
  },
  { 
    title: 'Máquina & Frota', 
    icon: Truck, 
    subItems: [
      { title: 'Gestão de Ativos', path: '/maquinas' },
      { title: 'Abastecimento', path: '/maquinas/abastecimento' },
      { title: 'Manutenção', path: '/maquinas/manutencao' }
    ]
  },
  { 
    title: 'Compra & Cotação', 
    icon: ShoppingCart, 
    subItems: [
      { title: 'Cadastro de Fornecedores', path: '/compras/fornecedores' },
      { title: 'Solicitação de Compra', path: '/compras/solicitacoes' },
      { title: 'Mapa de Cotação', path: '/compras/cotacoes' },
      { title: 'Pedido de Compra', path: '/compras/pedidos' },
      { title: 'Notas de Entrada', path: '/compras/notas-entrada' }
    ]
  },
  { 
    title: 'Venda & CRM', 
    icon: TrendingUp, 
    subItems: [
      { title: 'Pedidos de Venda', path: '/vendas/pedidos' },
      { title: 'Notas de Saída', path: '/vendas/notas-saida' },
      { title: 'Contratos e Futuro', path: '/vendas/contratos' }
    ]
  },
  { 
    title: 'Estoque', 
    icon: Package, 
    subItems: [
      { title: 'Cadastro de Insumo', path: '/estoque/insumos' },
      { title: 'Movimentação Manual', path: '/estoque/movimentacao' },
      { title: 'Inventário Periódico', path: '/estoque/inventario' }
    ]
  },
  { 
    title: 'Financeiro e Banco', 
    icon: DollarSign, 
    subItems: [
      { title: 'Contas Bancárias', path: '/financeiro/bancos' },
      { title: 'Extrato Bancário', path: '/financeiro/bancos?modal=extrato' },
      { title: 'Fluxo de Caixa', path: '/financeiro/fluxo' },
      { title: 'Contas a Pagar', path: '/financeiro/contas-pagar' },
      { title: 'Contas a Receber', path: '/financeiro/contas-receber' },
      { title: 'Transferências', path: '/financeiro/bancos?modal=transfer' }
    ]
  },
  { 
    title: 'Contábil & Fiscal', 
    icon: FileText, 
    subItems: [
      { title: 'Plano de Contas', path: '/contabil/plano' },
      { title: 'Livro Caixa', path: '/contabil/livro-caixa' },
      { title: 'Apuração Imposto', path: '/contabil/impostos' },
      { title: 'Planejamento', path: '/contabil/planejamento' }
    ]
  }
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { logout, user } = useAuth();
  const [openMenus, setOpenMenus] = useState<string[]>(['Painel Master', 'Administração', 'Pecuária']);

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title) 
        : [...prev, title]
    );
  };

  const hasPermission = (item: NavItem) => {
    if (!user) return false;
    
    // Check specific role requirement if defined
    if (item.roleRequired && user.role !== item.roleRequired) return false;

    // Default module-based mapping
    const moduleKey = MODULE_PERMISSIONS[item.title];
    if (moduleKey) {
      const perms = ROLE_PERMISSIONS[user.role] || [];
      return perms.includes(moduleKey);
    }
    
    return true;
  };

  const filteredNavItems = navItems.filter(hasPermission);

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <span className="logo">Pecuária 4.0</span>}
        <button className="collapse-btn" onClick={toggleSidebar}>
          {collapsed ? <ChevronRight size={20} /> : <X size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {filteredNavItems.map((item) => (
          <div key={item.title} className="nav-group">
            {item.subItems ? (
              <>
                <button 
                  className={`nav-item ${openMenus.includes(item.title) ? 'open' : ''}`}
                  onClick={() => toggleMenu(item.title)}
                >
                  <item.icon size={22} className="nav-icon" />
                  {!collapsed && (
                    <>
                      <span className="nav-label">{item.title}</span>
                      <ChevronDown size={16} className={`arrow ${openMenus.includes(item.title) ? 'rotate' : ''}`} />
                    </>
                  )}
                </button>
                {!collapsed && openMenus.includes(item.title) && (
                  <div className="sub-menu">
                    {item.subItems.map((sub) => (
                      <NavLink 
                        key={sub.path} 
                        to={sub.path} 
                        className={(navData: any) => `sub-nav-item ${navData.isActive ? 'active' : ''}`}
                      >
                        {sub.title}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink 
                to={item.path!} 
                className={(navData: any) => `nav-item ${navData.isActive ? 'active' : ''}`}
              >
                <item.icon size={22} className="nav-icon" />
                {!collapsed && <span className="nav-label">{item.title}</span>}
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={logout}>
          <LogOut size={22} className="nav-icon" />
          {!collapsed && <span className="nav-label">Sair do Sistema</span>}
        </button>
      </div>
    </aside>
  );
};
