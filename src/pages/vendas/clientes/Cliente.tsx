import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  X, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Info,
  MapPin,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Globe,
  Loader2,
  RefreshCw,
  TrendingUp,
  CreditCard,
  Briefcase,
  Filter,
  Download,
  AlertCircle,
  CheckCircle2,
  Building2,
  ChevronLeft,
  Eye,
  DollarSign,
  Activity,
  Tag,
  SearchCode
} from 'lucide-react';
import { ModernModal } from '../../../components/ModernModal';
import { TablePagination } from '../../../components/TablePagination';
import { TableFilters } from '../../../components/TableFilters';
import { usePagination } from '../../../hooks/usePagination';
import { ColumnFilters } from '../../../components/ColumnFilters';
import { useOfflineQuery, useOfflineMutation } from '../../../hooks/useOfflineSync';
import { SummaryCard } from '../../../components/SummaryCard';
import { StatusBadge } from '../../../components/StatusBadge';
import { Cliente as ClienteType } from '../../../types';



import './Cliente.css';

export const Cliente: React.FC = () => {
  const { data: clientes = [] } = useOfflineQuery<ClienteType>(['clientes'], 'clientes');
  const saveClienteMutation = useOfflineMutation<ClienteType>('clientes', [['clientes']]);
  const deleteClienteMutation = useOfflineMutation<ClienteType>('clientes', [['clientes']]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'fiscal' | 'endereco' | 'contato' | 'comercial'>('geral');
  const [editingClient, setEditingClient] = useState<ClienteType | null>(null);
  const [isLoadingCnpj, setIsLoadingCnpj] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  // Filters state
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRegime, setFilterRegime] = useState('');
  const [columnFilters, setColumnFilters] = useState({
    nome: '',
    documento: '',
    localizacao: '',
    limite: '',
    status: 'Todos'
  });

  const [formData, setFormData] = useState<Partial<ClienteType>>({});

  const handleOpenModal = (client?: ClienteType, viewOnly = false) => {
    setIsViewMode(viewOnly);
    if (client) {
      setEditingClient(client);
      setFormData({ ...client });
    } else {
      setEditingClient(null);
      setFormData({
        nome: '',
        nomeFantasia: '',
        documento: '',
        tipoLogradouro: 'Rua',
        estado: 'MT',
        pais: 'Brasil',
        cPais: '1058',
        cMun: '',
        status: 'Ativo',
        limiteCredito: 0,
        condicaoPagamento: 'À Vista'
      });
    }
    setActiveTab('geral');
    setIsModalOpen(true);
  };

  const handleInputChange = (field: keyof ClienteType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCnpjLookup = async () => {
    if (!formData.documento) return;
    
    const cleanDoc = formData.documento.replace(/\D/g, '');
    if (cleanDoc.length !== 14) return;

    setIsLoadingCnpj(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanDoc}`);
      if (!response.ok) throw new Error('Não foi possível encontrar este CNPJ.');
      
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        nome: data.razao_social || prev.nome,
        nomeFantasia: data.nome_fantasia || prev.nomeFantasia || data.razao_social,
        cep: data.cep || prev.cep,
        logradouro: data.logradouro || prev.logradouro,
        numero: data.numero || prev.numero,
        complemento: data.complemento || prev.complemento,
        bairro: data.bairro || prev.bairro,
        cidade: data.municipio || prev.cidade,
        estado: data.uf || prev.estado,
        cMun: data.ibge || prev.cMun,
        email: data.email || data.e_mail || prev.email,
        telefone: data.ddd_telefone_1 ? `(${data.ddd_telefone_1.substring(0,2)}) ${data.ddd_telefone_1.substring(2)}` : prev.telefone,
        pais: 'Brasil',
        cPais: '1058',
        cnae: data.cnae_fiscal ? `${String(data.cnae_fiscal).replace(/(\d{4})(\d{1})(\d{2})/, '$1-$2/$3')} - ${data.cnae_fiscal_descricao}` : prev.cnae
      }));
    } catch (error: any) {
      alert(error.message || 'Erro ao consultar CNPJ.');
    } finally {
      setIsLoadingCnpj(false);
    }
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.documento) {
      alert('Nome/Razão Social e CPF/CNPJ são obrigatórios');
      return;
    }

    const updatedClient: ClienteType = {
      ...(editingClient || {}),
      ...formData,
      id: editingClient?.id || Math.random().toString(36).substr(2, 9),
      tenant_id: 'default'
    } as ClienteType;

    await saveClienteMutation.mutateAsync(updatedClient);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Deseja realmente excluir o cliente "${name}"?`)) {
      await deleteClienteMutation.mutateAsync({ id } as any);
    }
  };

  const filteredClients = clientes.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      c.nome.toLowerCase().includes(searchLower) || 
      c.documento.includes(searchTerm) ||
      c.nomeFantasia?.toLowerCase().includes(searchLower) ||
      c.cidade?.toLowerCase().includes(searchLower) ||
      c.estado?.toLowerCase().includes(searchLower) ||
      (c.email && c.email.toLowerCase().includes(searchLower)) ||
      (c.telefone && c.telefone.toLowerCase().includes(searchLower)) ||
      (c.responsavel && c.responsavel.toLowerCase().includes(searchLower)) ||
      c.regimeTributario?.toLowerCase().includes(searchLower) ||
      c.status.toLowerCase().includes(searchLower) ||
      c.limiteCredito.toString().includes(searchLower);
    const matchesStatus = filterStatus === 'Todos' || !filterStatus ? true : c.status === filterStatus;
    const matchesRegime = filterRegime === 'Todos' || !filterRegime ? true : c.regimeTributario === filterRegime;

    return matchesSearch && matchesStatus && matchesRegime;
  });

  const regimes = Array.from(new Set(clientes.map(c => c.regimeTributario)));

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
  } = usePagination({ data: filteredClients, initialItemsPerPage: 10 });

  // KPIs
  const totalClients = clientes.length;
  const activeClients = clientes.filter(c => c.status === 'Ativo').length;
  const totalLimit = clientes.reduce((acc, current) => acc + current.limiteCredito, 0);
  const avgLimit = totalClients > 0 ? totalLimit / totalClients : 0;

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/vendas">Vendas & Comercial</Link>
        <ChevronRight size={14} />
        <span>Clientes</span>
      </nav>
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <Users size={32} />
          </div>
          <div>
            <h1>Gestão de Clientes</h1>
            <p className="description">Cadastre e gerencie sua carteira de clientes e parceiros.</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-premium-outline">
            <span>Relatórios</span>
            <Download size={18} strokeWidth={3} />
          </button>
          <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
            <span>Novo Cliente</span>
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <SummaryCard 
          label="Total de Clientes"
          value={totalClients.toString().padStart(2, '0')}
          icon={Users}
          color="blue"
          delay="0s"
          subtext="Base cadastrada"
        />
        <SummaryCard 
          label="Clientes Ativos"
          value={activeClients.toString().padStart(2, '0')}
          icon={ShieldCheck}
          color="indigo"
          delay="0.1s"
          trend={{ value: 'Em operação', type: 'up', icon: ShieldCheck }}
        />
        <SummaryCard 
          label="Limite Total"
          value={`R$ ${(totalLimit/1000).toFixed(0)}k`}
          icon={CreditCard}
          color="amber"
          delay="0.2s"
          subtext="Crédito concedido"
        />
        <SummaryCard 
          label="Média de Limite"
          value={`R$ ${(avgLimit/1000).toFixed(1)}k`}
          icon={Activity}
          color="blue"
          delay="0.3s"
          subtext="Por cliente"
        />
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por Nome, Fantasia ou CPF/CNPJ..."
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


        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente / Razão Social</th>
                <th>CPF / CNPJ</th>
                <th>Localização</th>
                <th>Limite</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'nome', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'documento', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'localizacao', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'limite', type: 'text', placeholder: 'Valor...' },
                    { key: 'status', type: 'select', options: ['Ativo', 'Inativo', 'Bloqueado'] }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                  showActionsPadding={true}
                />
              )}
            </thead>
            <tbody>
              {paginatedData.map((client) => (
                <tr key={client.id}>
                  <td>
                    <div className="client-cell">
                      <div className={`client-avatar status-${client.status.toLowerCase()}`}>
                        <User size={16} />
                      </div>
                      <div className="client-name-cell">
                        <span className="font-bold">{client.nome}</span>
                        <span className="text-muted small">{client.nomeFantasia}</span>
                      </div>
                    </div>
                  </td>
                  <td>{client.documento}</td>
                  <td>{client.cidade}/{client.estado}</td>
                  <td>R$ {client.limiteCredito.toLocaleString('pt-BR')}</td>
                  <td>
                    <span className={`status-badge stock-${client.status === 'Ativo' ? 'ok' : (client.status === 'Inativo' ? 'baixo' : 'critico')}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="actions-cell">
                      <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(client, true)}>
                        <Eye size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(client)}>
                        <Edit size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-delete" title="Excluir" onClick={() => handleDelete(client.id, client.nome)}>
                        <Trash2 size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">Nenhum cliente encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
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
          label="clientes"
        />
      </div>

      <ModernModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${isViewMode ? 'Visualizar' : (editingClient ? 'Editar' : 'Novo')} Cliente`}
        subtitle="Preencha os dados cadastrais do cliente"
        icon={User}
        footer={
          <>
            <button className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>
              <X size={18} strokeWidth={3} />
              <span>{isViewMode ? 'Fechar' : 'Cancelar'}</span>
            </button>
            {!isViewMode && (
              <button className="btn-premium-solid indigo" onClick={handleSave}>
                <span>{editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}</span>
                {editingClient ? <CheckCircle2 size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
              </button>
            )}
          </>
        }
      >
        <div className="modal-tabs mb-6">
          <button className={`tab-btn ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')}>Geral</button>
          <button className={`tab-btn ${activeTab === 'endereco' ? 'active' : ''}`} onClick={() => setActiveTab('endereco')}>Endereço</button>
          <button className={`tab-btn ${activeTab === 'contato' ? 'active' : ''}`} onClick={() => setActiveTab('contato')}>Contato</button>
          <button className={`tab-btn ${activeTab === 'fiscal' ? 'active' : ''}`} onClick={() => setActiveTab('fiscal')}>Fiscal</button>
          <button className={`tab-btn ${activeTab === 'comercial' ? 'active' : ''}`} onClick={() => setActiveTab('comercial')}>Comercial</button>
        </div>

        <div className="modal-content-scrollable">
          <div className="form-sections-grid">
            {activeTab === 'geral' && (
              <div className="form-section">
                <div className="form-section-title">
                  <User size={16} />
                  <span>Identificação Básica</span>
                </div>
                <div className="form-grid">
                  <div className="form-group col-12">
                    <label>Nome / Razão Social</label>
                    <input type="text" value={formData.nome || ''} onChange={(e) => handleInputChange('nome', e.target.value)} placeholder="Nome completo ou Razão Social" disabled={isViewMode} />
                  </div>
                </div>

                <div className="form-divider" />

                <div className="form-grid">
                  <div className="form-group col-8">
                    <label>Nome Fantasia / Apelido</label>
                    <input type="text" value={formData.nomeFantasia || ''} onChange={(e) => handleInputChange('nomeFantasia', e.target.value)} placeholder="Como o cliente é conhecido" disabled={isViewMode} />
                  </div>
                  <div className="form-group col-4">
                    <label>Status</label>
                    <select value={formData.status || 'Ativo'} onChange={(e) => handleInputChange('status', e.target.value)} disabled={isViewMode}>
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Bloqueado">Bloqueado</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'endereco' && (
              <div className="form-section">
                <div className="form-section-title">
                  <MapPin size={16} />
                  <span>Localização e Endereço</span>
                </div>
                <div className="form-grid">
                  <div className="form-group col-3">
                    <label>Tipo</label>
                    <select value={formData.tipoLogradouro || 'Rua'} onChange={(e) => handleInputChange('tipoLogradouro', e.target.value)} disabled={isViewMode}>
                      <option value="Rua">Rua</option>
                      <option value="Avenida">Avenida</option>
                      <option value="Rodovia">Rodovia</option>
                      <option value="Estrada">Estrada</option>
                    </select>
                  </div>
                  <div className="form-group col-9">
                    <label>Logradouro / Rua</label>
                    <input type="text" value={formData.logradouro || ''} onChange={(e) => handleInputChange('logradouro', e.target.value)} placeholder="Nome da rua/avenida" disabled={isViewMode} />
                  </div>
                </div>

                <div className="form-divider" />

                <div className="form-grid">
                  <div className="form-group col-2">
                    <label>Número</label>
                    <input type="text" value={formData.numero || ''} onChange={(e) => handleInputChange('numero', e.target.value)} placeholder="SN" disabled={isViewMode} />
                  </div>
                  <div className="form-group col-3">
                    <label>CEP</label>
                    <input type="text" value={formData.cep || ''} onChange={(e) => handleInputChange('cep', e.target.value)} placeholder="00000-000" disabled={isViewMode} />
                  </div>
                  <div className="form-group col-7">
                    <label>Complemento</label>
                    <input type="text" value={formData.complemento || ''} onChange={(e) => handleInputChange('complemento', e.target.value)} placeholder="Apto, Sala, Referência..." disabled={isViewMode} />
                  </div>
                  <div className="form-group col-4">
                    <label>Bairro</label>
                    <input type="text" value={formData.bairro || ''} onChange={(e) => handleInputChange('bairro', e.target.value)} placeholder="Bairro" disabled={isViewMode} />
                  </div>
                  <div className="form-group col-6">
                    <label>Cidade</label>
                    <input type="text" value={formData.cidade || ''} onChange={(e) => handleInputChange('cidade', e.target.value)} placeholder="Cidade" disabled={isViewMode} />
                  </div>
                  <div className="form-group col-2">
                    <label>UF</label>
                    <input type="text" value={formData.estado || ''} onChange={(e) => handleInputChange('estado', e.target.value)} placeholder="UF" disabled={isViewMode} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contato' && (
              <div className="form-section">
                <div className="form-section-title">
                  <Phone size={16} />
                  <span>Canais de Comunicação</span>
                </div>
                <div className="form-grid">
                  <div className="form-group col-6">
                    <label>Pessoa de Contato</label>
                    <div className="input-with-icon">
                      <User size={18} className="icon-field" />
                      <input type="text" value={formData.responsavel || ''} onChange={(e) => handleInputChange('responsavel', e.target.value)} placeholder="Nome do contato principal" disabled={isViewMode} />
                    </div>
                  </div>
                  <div className="form-group col-3">
                    <label>Telefone</label>
                    <div className="input-with-icon">
                      <Phone size={18} className="icon-field" />
                      <input type="text" value={formData.telefone || ''} onChange={(e) => handleInputChange('telefone', e.target.value)} placeholder="(00) 00000-0000" disabled={isViewMode} />
                    </div>
                  </div>
                  <div className="form-group col-3">
                    <label>E-mail</label>
                    <div className="input-with-icon">
                      <Mail size={18} className="icon-field" />
                      <input type="email" value={formData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="exemplo@email.com" disabled={isViewMode} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'fiscal' && (
              <div className="form-section">
                <div className="form-section-title">
                  <Building2 size={16} />
                  <span>Tributação e Documentos</span>
                </div>
                <div className="form-grid">
                  <div className="form-group col-4">
                    <label>CPF / CNPJ</label>
                    <div className="input-with-button">
                      <input 
                        type="text" 
                        value={formData.documento || ''} 
                        onChange={(e) => handleInputChange('documento', e.target.value)} 
                        onBlur={handleCnpjLookup}
                        placeholder="000.000.000-00" 
                        disabled={isViewMode}
                      />
                      <button 
                        type="button" 
                        className="lookup-btn" 
                        onClick={handleCnpjLookup} 
                        disabled={isLoadingCnpj || isViewMode || !formData.documento}
                      >
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-divider" />

                <div className="form-grid">
                  <div className="form-group col-4">
                    <label>Inscrição Estadual</label>
                    <input type="text" value={formData.inscricaoEstadual || ''} onChange={(e) => handleInputChange('inscricaoEstadual', e.target.value)} placeholder="Número ou Isento" disabled={isViewMode} />
                  </div>
                  <div className="form-group col-4">
                    <label>Regime Tributário</label>
                    <select value={formData.regimeTributario || ''} onChange={(e) => handleInputChange('regimeTributario', e.target.value)} disabled={isViewMode}>
                      <option value="">Selecione...</option>
                      <option value="Simples Nacional">Simples Nacional</option>
                      <option value="Lucro Presumido">Lucro Presumido</option>
                      <option value="Lucro Real">Lucro Real</option>
                      <option value="Produtor Rural">Produtor Rural</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'comercial' && (
              <div className="form-section">
                <div className="form-section-title">
                  <TrendingUp size={16} />
                  <span>Condições Comerciais</span>
                </div>
                <div className="form-grid">
                  <div className="form-group col-3">
                    <label>Limite de Crédito</label>
                    <div className="input-with-icon">
                      <CreditCard size={18} className="icon-field" />
                      <input type="number" value={formData.limiteCredito || 0} onChange={(e) => handleInputChange('limiteCredito', Number(e.target.value))} disabled={isViewMode} />
                    </div>
                  </div>
                  <div className="form-group col-3">
                    <label>Condição Pagamento</label>
                    <div className="input-with-icon">
                      <Briefcase size={18} className="icon-field" />
                      <input type="text" value={formData.condicaoPagamento || ''} onChange={(e) => handleInputChange('condicaoPagamento', e.target.value)} placeholder="Ex: 30/60 dias" disabled={isViewMode} />
                    </div>
                  </div>
                  <div className="form-group col-6">
                    {/* Spacing */}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ModernModal>
    </div>
  );
};

