import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Shield, 
  Users, 
  Beef, 
  Package, 
  DollarSign, 
  FileText, 
  Truck, 
  ShoppingCart, 
  TrendingUp,
  X,
  Edit2,
  Trash2,
  Check,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Info,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import './PerfilUsuario.css';

interface Perfil {
  id: string;
  nome: string;
  descricao: string;
  permissoes: Record<string, 'nenhum' | 'visualizar' | 'total'>;
}

const modulosSistema = [
  { id: 'dashboard', nome: 'Dashboard', icon: LayoutDashboard },
  { id: 'admin', nome: 'Administração', icon: Users },
  { id: 'pecuaria', nome: 'Pecuária', icon: Beef },
  { id: 'maquinas', nome: 'Máquina & Frota', icon: Truck },
  { id: 'compras', nome: 'Compra & Cotação', icon: ShoppingCart },
  { id: 'vendas', nome: 'Venda & CRM', icon: TrendingUp },
  { id: 'estoque', nome: 'Estoque', icon: Package },
  { id: 'financeiro', nome: 'Financeiro', icon: DollarSign },
  { id: 'contabil', nome: 'Contábil & Fiscal', icon: FileText },
];

const mockPerfis: Perfil[] = [
  { 
    id: '1', 
    nome: 'Administrador', 
    descricao: 'Acesso total a todos os módulos do sistema.', 
    permissoes: modulosSistema.reduce((acc, m) => ({ ...acc, [m.id]: 'total' }), {})
  },
  { 
    id: '2', 
    nome: 'Gerente de Pecuária', 
    descricao: 'Gestão de rebanho, nutrição e sanidade.', 
    permissoes: {
      dashboard: 'total',
      pecuaria: 'total',
      estoque: 'visualizar'
    }
  },
  { 
    id: '3', 
    nome: 'Auxiliar Administrativo', 
    descricao: 'Lançamentos financeiros e consultas básicas.', 
    permissoes: {
      dashboard: 'visualizar',
      financeiro: 'total',
      contabil: 'visualizar'
    }
  },
];

export const PerfilUsuario: React.FC = () => {
  const [perfis, setPerfis] = useState<Perfil[]>(mockPerfis);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerfil, setEditingPerfil] = useState<Perfil | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    permissoes: {} as Record<string, 'nenhum' | 'visualizar' | 'total'>
  });

  const handleOpenModal = (perfil?: Perfil) => {
    if (perfil) {
      setEditingPerfil(perfil);
      setFormData({
        nome: perfil.nome,
        descricao: perfil.descricao,
        permissoes: perfil.permissoes
      });
    } else {
      setEditingPerfil(null);
      setFormData({
        nome: '',
        descricao: '',
        permissoes: {}
      });
    }
    setIsModalOpen(true);
  };

  const setPermission = (moduloId: string, level: 'nenhum' | 'visualizar' | 'total') => {
    setFormData((prev: any) => ({
      ...prev,
      permissoes: {
        ...prev.permissoes,
        [moduloId]: level
      }
    }));
  };

  const filteredPerfis = perfis.filter((p: Perfil) => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedPerfis,
    itemsPerPage,
    setItemsPerPage,
    startIndex,
    endIndex,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
  } = usePagination({ data: filteredPerfis, initialItemsPerPage: 10 });

  return (
    <div className="perfil-usuario-wrapper">
      <div className="page-header-row">
        <div className="header-left">
          <h1>Perfis de Usuário</h1>
          <p>Gerencie papéis e permissões de acesso aos módulos</p>
        </div>
        <div className="header-actions">
          <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
            <Plus size={18} strokeWidth={3} />
            <span>Novo Perfil</span>
          </button>
        </div>
      </div>

      <div className="accounts-container">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por nome ou descrição..."
        />

        <div className="profiles-table-header">
          <span>Nome do Perfil</span>
          <span>Descrição do Acesso</span>
          <span style={{ textAlign: 'right' }}>Ações</span>
        </div>

        <div className="profiles-list">
          {paginatedPerfis.map((perfil: Perfil, i: number) => (
            <div key={perfil.id} className="profile-row-premium animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="profile-info-cell">
                <div className="profile-avatar-premium">
                  <Shield size={20} strokeWidth={3} />
                </div>
                <div className="profile-details">
                  <strong>{perfil.nome}</strong>
                  <span className="mod-count">{Object.keys(perfil.permissoes).filter(k => perfil.permissoes[k] !== 'nenhum').length} módulos ativos</span>
                </div>
              </div>
              <div className="profile-description-premium">{perfil.descricao}</div>
              <div className="actions-cell-premium">
                <button className="action-btn-global btn-edit" onClick={() => handleOpenModal(perfil)}>
                  <Edit2 size={16} strokeWidth={3} />
                </button>
                <button className="action-btn-global btn-delete">
                  <Trash2 size={16} strokeWidth={3} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={totalItems}
          onPageChange={goToPage}
          onNextPage={nextPage}
          onPrevPage={prevPage}
          onItemsPerPageChange={setItemsPerPage}
          label="registros"
        />
      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPerfil ? 'Editar Perfil' : 'Novo Perfil de Usuário'}
        size="lg"
        icon={ShieldCheck}
      >
        <div className="modal-body-premium">
          <div className="form-grid-premium">
            <div className="form-group-premium full-width">
              <label>Nome do Perfil</label>
              <input 
                type="text" 
                placeholder="Ex: Consultor Financeiro" 
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
              />
            </div>
            
            <div className="form-group-premium full-width">
              <label>Descrição</label>
              <input 
                type="text" 
                placeholder="Informe a finalidade deste perfil" 
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              />
            </div>

            <div className="form-group-premium full-width">
              <label style={{ marginBottom: '12px', display: 'block' }}>Níveis de Acesso por Módulo</label>
              <div className="permission-grid-premium">
                {modulosSistema.map((modulo) => {
                  const level = formData.permissoes[modulo.id] || 'nenhum';
                  
                  return (
                    <div key={modulo.id} className={`permission-card-premium ${level !== 'nenhum' ? 'active' : ''}`}>
                      <div className="permission-card-header">
                        <div className="permission-icon-wrapper">
                          <modulo.icon size={20} strokeWidth={3} />
                        </div>
                        <span className="permission-label">{modulo.nome}</span>
                      </div>
                      
                      <div className="permission-toggle-premium">
                        <button 
                          type="button"
                          className={`level-btn ${level === 'nenhum' ? 'selected none' : ''}`}
                          onClick={() => setPermission(modulo.id, 'nenhum')}
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                        <button 
                          type="button"
                          className={`level-btn ${level === 'visualizar' ? 'selected view' : ''}`}
                          onClick={() => setPermission(modulo.id, 'visualizar')}
                        >
                          Ver
                        </button>
                        <button 
                          type="button"
                          className={`level-btn ${level === 'total' ? 'selected full' : ''}`}
                          onClick={() => setPermission(modulo.id, 'total')}
                        >
                          Total
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="info-box-premium">
              <Lock size={20} strokeWidth={3} />
              <p>As permissões definidas aqui serão aplicadas a todos os usuários vinculados a este perfil.</p>
            </div>
          </div>
        </div>
        <div className="modal-footer-premium flex gap-3">
          <button className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
          <button className="btn-premium-solid indigo" onClick={() => setIsModalOpen(false)}>
            <ShieldCheck size={18} strokeWidth={3} />
            <span>Salvar Perfil</span>
          </button>
        </div>
      </StandardModal>
    </div>
  );
};

