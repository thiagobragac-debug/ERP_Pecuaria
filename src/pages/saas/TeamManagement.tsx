import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { saasService } from '../../services/saasService';
import { SaasMember } from '../../types';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  MoreVertical, 
  Search, 
  Filter, 
  ShieldCheck, 
  UserCheck, 
  Clock,
  ExternalLink,
  X
} from 'lucide-react';
import { ModernModal } from '../../components/ModernModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import './TeamManagement.css';

export const TeamManagement = () => {
  const { currentOrg } = useAuth();
  const [members, setMembers] = useState<SaasMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterRole, setFilterRole] = useState('Todos');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');
  const [columnFilters, setColumnFilters] = useState({
    nome: '',
    role: 'Todos',
    status: 'Todos',
    created_at: ''
  });

  useEffect(() => {
    if (currentOrg) {
      loadMembers();
    }
  }, [currentOrg]);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      if (currentOrg) {
        const data = await saasService.getOrganizationMembers(currentOrg.id);
        setMembers(data);
      }
    } catch (err) {
      console.error('Error loading members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'Todos' || m.role === filterRole;

    const matchesColumnFilters = 
      (columnFilters.nome === '' || m.user?.full_name?.toLowerCase().includes(columnFilters.nome.toLowerCase()) || m.user?.email?.toLowerCase().includes(columnFilters.nome.toLowerCase())) &&
      (columnFilters.role === 'Todos' || m.role === columnFilters.role) &&
      (columnFilters.created_at === '' || new Date(m.created_at).toLocaleDateString('pt-BR').includes(columnFilters.created_at));

    return matchesSearch && matchesRole && matchesColumnFilters;
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
  } = usePagination({ data: filteredMembers, initialItemsPerPage: 10 });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentOrg) {
        await saasService.inviteMember(inviteEmail, inviteRole, currentOrg.id);
        alert(`Convite enviado com sucesso para ${inviteEmail}`);
        setShowInviteModal(false);
        setInviteEmail('');
      }
    } catch (err) {
      console.error('Error inviting member:', err);
      alert('Erro ao enviar convite. Tente novamente.');
    }
  };

  return (
    <div className="team-container page-container fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <Users size={32} strokeWidth={3} />
          </div>
          <div>
            <h1>Gestão de Equipe</h1>
            <p className="description">
              Empresa: <span className="text-emerald-600 font-extrabold">{currentOrg?.nome}</span> • Organize seu time e permissões
            </p>
          </div>
        </div>
        <button 
          className="btn-premium-solid indigo"
          onClick={() => setShowInviteModal(true)}
        >
          <UserPlus size={20} strokeWidth={3} />
          <span>Convidar Membro</span>
        </button>
      </div>

      <div className="members-stats">
        <div className="stat-card total">
          <div className="stat-icon">
            <Users size={32} strokeWidth={3} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Membros Ativos</span>
            <span className="stat-value">{isLoading ? '...' : members.length}</span>
          </div>
        </div>
        
        <div className="stat-card admins">
          <div className="stat-icon">
            <ShieldCheck size={32} strokeWidth={3} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Gestores / Admin</span>
            <span className="stat-value">
              {isLoading ? '...' : members.filter(m => m.role === 'ADMIN' || m.role === 'OWNER').length}
            </span>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">
            <Clock size={32} strokeWidth={3} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Convites Pendentes</span>
            <span className="stat-value">0</span>
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por nome ou e-mail..."
          actionsLabel="Filtragem"
        >
          <button 
            className={`btn-premium-outline ${isFiltersOpen ? 'filter-active' : ''}`}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter size={18} strokeWidth={3} />
            <span>{isFiltersOpen ? 'Fechar Filtros' : 'Filtros Avançados'}</span>
          </button>
        </TableFilters>


        {members.length === 0 && !isLoading ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Users size={80} strokeWidth={1} />
            </div>
            <h3>Sua equipe aparecerá aqui</h3>
            <p className="text-slate-500 font-semibold max-w-md mx-auto mt-2">
              Convide seus colaboradores para gerenciar juntos os dados e operações da sua fazenda.
            </p>
            <button 
              className="btn-premium-solid indigo"
              onClick={() => setShowInviteModal(true)}
            >
              <UserPlus size={22} strokeWidth={3} />
              <span>Convidar Primeiro Membro</span>
            </button>
          </div>
        ) : (
          <>
            <table className="members-table">
              <thead>
                <tr>
                  <th>Membro e Identificação</th>
                  <th>Privilégio</th>
                  <th>Status</th>
                  <th>Membro Desde</th>
                  <th style={{ width: '80px' }}></th>
                </tr>
                {isFiltersOpen && (
                  <ColumnFilters
                    columns={[
                      { key: 'nome', type: 'text', placeholder: 'Filtrar...' },
                      { key: 'role', type: 'select', options: ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] },
                      { key: 'status', type: 'text', placeholder: 'Status...' },
                      { key: 'created_at', type: 'text', placeholder: 'Data...' }
                    ]}
                    values={columnFilters}
                    onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                    showActionsPadding={true}
                  />
                )}
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="loading-row">
                      <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500"></div>
                        <span className="text-muted font-bold">Localizando membros da equipe...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedData.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="member-info">
                        <div className="member-avatar">
                          {member.user?.avatar_url ? (
                            <img src={member.user.avatar_url} alt="" />
                          ) : (
                            <UserCheck size={28} strokeWidth={2.5} className="text-emerald-500" />
                          )}
                        </div>
                        <div>
                          <div className="member-full-name">{member.user?.full_name || 'Usuário'}</div>
                          <div className="member-email">{member.user?.email || 'Sem e-mail cadastrado'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={`role-badge ${member.role.toLowerCase()}`}>
                        <Shield size={16} strokeWidth={2.5} />
                        <span>{member.role === 'OWNER' ? 'Proprietário' : member.role === 'ADMIN' ? 'Administrador' : member.role === 'MEMBER' ? 'Editor' : 'Visualizador'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="status-indicator">Ativo agora</div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-bold text-main">
                          {new Date(member.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-xs text-muted">Acesso via Convite</span>
                      </div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn-global btn-edit" title="Gerenciar Membro">
                          <MoreVertical size={18} strokeWidth={3} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4">
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
                label="membros"
              />
            </div>
          </>
        )}
      </div>

      <ModernModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Convidar Novo Membro"
        subtitle="O convidado receberá um e-mail para acessar esta empresa"
        icon={UserPlus}
        footer={
          <>
            <button className="btn-premium-outline" onClick={() => setShowInviteModal(false)}>
              <X size={18} strokeWidth={3} />
              <span>Cancelar</span>
            </button>
            <button className="btn-premium-solid indigo" onClick={(e) => {
              const form = document.getElementById('invite-form') as HTMLFormElement;
              if (form) form.requestSubmit();
            }}>
              <span>Enviar Convite</span>
              <Mail size={18} strokeWidth={3} />
            </button>
          </>
        }
      >
        <form id="invite-form" onSubmit={handleInvite} className="modal-content-scrollable">
          <div className="form-sections-grid">
            <div className="form-section">
              <div className="form-section-title">
                <Mail size={16} />
                <span>Destinatário</span>
              </div>
              <div className="form-grid mb-6">
                <div className="form-group col-12">
                  <label>E-mail do Convidado</label>
                  <div className="input-with-icon">
                    <Mail size={18} strokeWidth={3} className="icon-field" />
                    <input 
                      type="email" 
                      placeholder="exemplo@email.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">
                <Shield size={16} />
                <span>Papel e Permissões</span>
              </div>
              <div className="form-grid mb-6">
                <div className="form-group col-12">
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { id: 'ADMIN', label: 'Administrador', icon: ShieldCheck, color: 'text-blue-400', desc: 'Acesso total ao sistema, gestão de membros e faturamento.' },
                      { id: 'MEMBER', label: 'Editor / Membro', icon: UserCheck, color: 'text-emerald-400', desc: 'Pode gerenciar animais, lotes, dietas e lançamentos financeiros.' },
                      { id: 'VIEWER', label: 'Apenas Leitura', icon: ExternalLink, color: 'text-slate-400', desc: 'Acesso para ver dados e relatórios, sem permissão de alteração.' }
                    ].map((role) => (
                      <label 
                        key={role.id}
                        className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden ${inviteRole === role.id ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                        onClick={() => setInviteRole(role.id as any)}
                      >
                        <input 
                          type="radio" 
                          name="role" 
                          className="hidden"
                          checked={inviteRole === role.id}
                          readOnly
                        />
                        <div className={`mt-1 ${role.color}`}>
                          <role.icon size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                          <div className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                            {role.label}
                            {inviteRole === role.id && <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
                          </div>
                          <div className="text-sm text-slate-500 font-semibold leading-relaxed mt-1">{role.desc}</div>
                        </div>
                        {inviteRole === role.id && <div className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-slate-900"><UserCheck size={14} strokeWidth={4} /></div>}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </ModernModal>
    </div>
  );
};

