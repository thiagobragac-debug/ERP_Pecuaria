import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Users, 
  Search, 
  Edit2, 
  Trash2, 
  Shield, 
  Building2, 
  Mail, 
  Lock, 
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  MoreVertical,
  X,
  Plus,
  Filter
} from 'lucide-react';
import { ModernModal } from '../../components/ModernModal';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../contexts/AuthContext';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { Profile, USER_ROLES } from '../../types';
import './Usuario.css';


export const Usuario: React.FC = () => {
  const { user: currentUser } = useAuth();
  const profiles = useLiveQuery(() => db.profiles.toArray()) || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterRole, setFilterRole] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'acesso'>('geral');
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<Partial<Profile>>({
    is_active: true,
    role: 'USER'
  });
  const [loading, setLoading] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    nome: '',
    perfil: 'Todos',
    status: 'Todos'
  });

  useEffect(() => {
    // Initial revalidation
    dataService.revalidate('profiles');
  }, []);

  const handleOpenModal = (profile?: Profile) => {
    if (profile) {
      setEditingProfile(profile);
      setFormData({ ...profile });
    } else {
      setEditingProfile(null);
      setFormData({
        full_name: '',
        is_active: true,
        role: 'USER'
      });
    }
    setActiveTab('geral');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.full_name || !formData.role) {
      alert('Por favor, preencha o nome e selecione o perfil.');
      return;
    }

    try {
      if (editingProfile) {
        const profileData: Profile = {
          ...editingProfile,
          full_name: formData.full_name!,
          role: formData.role!,
          is_active: formData.is_active!
        };

        await dataService.saveItem('profiles', profileData);
      } else {
        alert('Para novos usuários, utilize o convite via e-mail (Supabase Auth).');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Erro ao salvar perfil.');
    }
  };

  const filteredProfiles = profiles.filter((p: Profile) => {
    const matchesSearch = p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'Todos' || p.role === filterRole;
    const matchesStatus = filterStatus === 'Todos' || 
                          (filterStatus === 'Ativo' ? p.is_active : !p.is_active);

    const matchesColumnFilters = 
      (columnFilters.nome === '' || p.full_name?.toLowerCase().includes(columnFilters.nome.toLowerCase()) || p.email?.toLowerCase().includes(columnFilters.nome.toLowerCase())) &&
      (columnFilters.perfil === 'Todos' || p.role === columnFilters.perfil) &&
      (columnFilters.status === 'Todos' || (columnFilters.status === 'Ativo' ? p.is_active : !p.is_active));

    return matchesSearch && matchesRole && matchesStatus && matchesColumnFilters;
  });

  const {
    currentPage,
    totalPages,
    paginatedData,
    itemsPerPage,
    setItemsPerPage,
    startIndex,
    endIndex,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
  } = usePagination({ data: filteredProfiles, initialItemsPerPage: 10 });

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/dashboard">Admin</Link>
        <ChevronRight size={14} />
        <span>Gestão de Acessos</span>
      </nav>
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge primary">
            <Users size={40} strokeWidth={3} />
          </div>
          <div>
            <h1>Controle de Usuários</h1>
            <p className="description">Administração de perfis, permissões e segurança operacional.</p>
          </div>
        </div>
        <div className="header-actions">
           <button className="btn-premium-solid indigo h-11 px-6 flex items-center gap-2" onClick={() => handleOpenModal()}>
              <span>Convidar Usuário</span>
              <Mail size={18} strokeWidth={3} />
           </button>
        </div>
      </div>
      <div className="summary-grid">
        <div className="summary-card animate-slide-up" style={{ animationDelay: '0s' }}>
          <div className="summary-info">
            <span className="summary-label">Total Usuários</span>
            <span className="summary-value">{profiles.length}</span>
            <span className="summary-subtext">Base consolidada</span>
          </div>
          <div className="summary-icon emerald">
            <Users size={36} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Ativos</span>
            <span className="summary-value">{profiles.filter((p: Profile) => p.is_active).length}</span>
            <span className="summary-subtext">Acesso permitido</span>
          </div>
          <div className="summary-icon emerald">
            <CheckCircle2 size={36} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Proprietários Master</span>
            <span className="summary-value">{profiles.filter((p: Profile) => p.role === 'MASTER').length}</span>
            <span className="summary-subtext">Acesso total</span>
          </div>
          <div className="summary-icon emerald">
            <Shield size={36} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="users-container">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por nome ou e-mail..."
          actionsLabel="Filtragem"
        >
          <button 
            className={`btn-premium-outline h-11 px-6 ${isFiltersOpen ? 'filter-active' : ''}`}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter size={18} strokeWidth={3} />
            <span>{isFiltersOpen ? 'Fechar Filtros' : 'Filtros Avançados'}</span>
          </button>
        </TableFilters>


        <div className="users-table-header">
          <span>Usuário</span>
          <span>Perfil</span>
          <span>Acesso</span>
          <span>Status</span>
          <span>Último Acesso</span>
          <span>Ações</span>
        </div>

        {isFiltersOpen && (
          <div className="users-table-header column-filters-tree">
            <span>
              <input 
                type="text" 
                placeholder="Filtrar..." 
                className="column-filter-input"
                value={columnFilters.nome}
                onChange={(e) => setColumnFilters(prev => ({ ...prev, nome: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
              />
            </span>
            <span>
              <select 
                className="column-filter-select"
                value={columnFilters.perfil}
                onChange={(e) => setColumnFilters(prev => ({ ...prev, perfil: e.target.value as any }))}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="Todos">Todos</option>
                <option value="USER">Usuário</option>
                <option value="ADMIN">Administrador</option>
                <option value="MASTER">Master</option>
              </select>
            </span>
            <span></span>
            <span>
              <select 
                className="column-filter-select"
                value={columnFilters.status}
                onChange={(e) => setColumnFilters(prev => ({ ...prev, status: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="Todos">Todos</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </span>
            <span></span>
            <span></span>
          </div>
        )}

        <div className="users-list">
          {loading ? (
             <div className="p-8 text-center text-muted">Carregando usuários...</div>
          ) : paginatedData.map((profile: Profile) => (
            <div key={profile.id} className="user-row hover-row">
              <div className="user-info-cell">
                <div className={`user-avatar-premium ${profile.role === 'MASTER' ? 'master' : ''}`}>
                  {profile.full_name?.charAt(0) || 'U'}
                </div>
                <div className="user-details">
                  <strong>{profile.full_name}</strong>
                  <span className="sub-info">{profile.email || 'Usuário Autenticado'}</span>
                </div>
              </div>
              
              <div className="user-profile-cell">
                <div className={`profile-badge-premium ${profile.role.toLowerCase()}`}>
                  <Shield size={14} strokeWidth={3} className="mr-2" />
                  {USER_ROLES.find(r => r.id === profile.role)?.nome}
                </div>
              </div>

              <div className="user-companies-cell">
                <div className="companies-pill">
                  <Building2 size={14} strokeWidth={3} className="text-emerald-500" />
                  <span>Acesso Global</span>
                </div>
              </div>

              <div className="user-status-cell">
                <span className={`status-badge ${profile.is_active ? 'ativo' : 'inativo'}`}>
                  {profile.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="user-access-cell">
                <div className="access-info">
                  <Calendar size={14} strokeWidth={3} />
                  <span>-</span>
                </div>
              </div>

              <div className="actions-cell">
                <div className="table-actions">
                  {(currentUser?.role === 'MASTER' || profile.id === currentUser?.id) && (
                    <button className="action-btn-global btn-edit" onClick={() => handleOpenModal(profile)} title="Editar">
                      <Edit2 size={16} strokeWidth={3} />
                    </button>
                  )}
                  {currentUser?.role === 'MASTER' && profile.id !== currentUser.id && (
                    <button className="action-btn-global btn-delete" title="Excluir" onClick={() => {}}>
                      <Trash2 size={16} strokeWidth={3} />
                    </button>
                  )}
                </div>
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
          label="usuários"
        />
      </div>

      <ModernModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProfile ? 'Editar Perfil Profissional' : 'Novo Usuário Profissional'}
        subtitle="Configure credenciais e acessos do colaborador"
        icon={UserCheck}
        footer={
          <>
            <button className="btn-modal-cancel" onClick={() => setIsModalOpen(false)}>
              <X size={18} strokeWidth={3} />
              <span>Cancelar</span>
            </button>
            <button className="btn-modal-save" onClick={handleSave}>
              <span>{editingProfile ? 'Salvar Alterações' : 'Confirmar Cadastro'}</span>
              {editingProfile ? <CheckCircle2 size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
            </button>
          </>
        }
      >
        <div className="modal-tabs mb-6">
          <button className={`tab-btn ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')}>Geral</button>
          <button className={`tab-btn ${activeTab === 'acesso' ? 'active' : ''}`} onClick={() => setActiveTab('acesso')}>Perfil & Segurança</button>
        </div>

        <div className="modern-form-section">
          {activeTab === 'geral' && (
            <div className="form-content-active fade-in">
              <div className="modern-form-group full-width">
                <label>Nome Completo</label>
                <div className="modern-input-wrapper">
                  <input type="text" className="modern-input" placeholder="Ex: João da Silva" value={formData.full_name || ''} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
                  <Users size={18} className="modern-field-icon" />
                </div>
              </div>
              <div className="modern-form-group full-width">
                <label>E-mail (Login)</label>
                <div className="modern-input-wrapper">
                  <input type="email" className="modern-input bg-slate-50 cursor-not-allowed" placeholder="contato@empresa.com.br" value={formData.email || ''} disabled />
                  <Mail size={18} className="modern-field-icon" />
                </div>
              </div>

              <div className="modern-form-group full-width mt-4">
                <label>Status do Usuário</label>
                <div className="status-toggle-premium">
                  <button 
                    className={`toggle-btn ${formData.is_active ? 'active' : ''}`} 
                    onClick={() => setFormData({...formData, is_active: true})}
                  >
                    <CheckCircle2 size={16} />
                    <span>Ativo</span>
                  </button>
                  <button 
                    className={`toggle-btn ${!formData.is_active ? 'inactive' : ''}`} 
                    onClick={() => setFormData({...formData, is_active: false})}
                  >
                    <X size={16} />
                    <span>Inativo</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'acesso' && (
            <div className="form-content-active fade-in">
              <div className="modern-form-group full-width">
                <label>Perfil de Acesso</label>
                <div className="profiles-select-grid">
                  {USER_ROLES.filter(r => currentUser?.role === 'MASTER' || r.id !== 'MASTER').map(role => (
                    <div 
                      key={role.id} 
                      className={`profile-card-premium ${formData.role === role.id ? 'selected' : ''}`} 
                      onClick={() => setFormData({...formData, role: role.id as any})}
                    >
                      <div className="check-box">{formData.role === role.id && <CheckCircle2 size={16} />}</div>
                      <Shield size={22} strokeWidth={3} className="profile-icon" />
                      <div className="profile-info">
                        <strong>{role.nome}</strong>
                        <span className="text-[10px] opacity-70">Nível de acesso operacional</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="info-box-premium mt-6">
                <Lock size={20} />
                <div className="text-sm">
                  <strong>Segurança:</strong> O perfil selecionado define quais módulos o usuário poderá acessar. Somente usuários MASTER podem promover outros a MASTER.
                </div>
              </div>
            </div>
          )}
        </div>
      </ModernModal>
    </div>
  );
};

