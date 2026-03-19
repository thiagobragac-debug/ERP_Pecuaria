import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, 
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
  Users,
  ShieldCheck,
  Globe,
  Loader2,
  RefreshCw,
  TrendingUp,
  CreditCard,
  Briefcase,
  Filter,
  Download,
  Eye,
  DollarSign,
  Activity,
  ChevronLeft,
  Building2,
  Tag,
  SearchCode,
  FileText
} from 'lucide-react';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useLiveQuery } from 'dexie-react-hooks';

import { Supplier } from '../../types';

export const Fornecedor: React.FC = () => {
  const suppliers = useLiveQuery(() => db.fornecedores.toArray()) || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'fiscal' | 'endereco' | 'contato' | 'comercial'>('geral');
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isLoadingCnpj, setIsLoadingCnpj] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  // Filters state
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRegime, setFilterRegime] = useState('');
  const [columnFilters, setColumnFilters] = useState({
    nome: '',
    documento: '',
    localizacao: '',
    prazoEntregaMedio: '',
    status: 'Todos'
  });

  const [formData, setFormData] = useState<Partial<Supplier>>({});

  const handleOpenModal = (supplier?: Supplier, viewOnly = false) => {
    setIsViewMode(viewOnly);
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({ ...supplier });
    } else {
      setEditingSupplier(null);
      setFormData({
        nome: '',
        nomeFantasia: '',
        documento: '',
        tipoLogradouro: 'Rua',
        estado: 'MT',
        pais: 'Brasil',
        cPais: '1058',
        cMun: '',
        indIEDest: '9',
        status: 'Ativo',
        condicaoPagamentoPadrao: '30 dias',
        prazoEntregaMedio: '7 dias'
      });
    }
    setActiveTab('geral');
    setIsModalOpen(true);
  };

  const handleInputChange = (field: keyof Supplier, value: any) => {
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

    const updatedSupplier: Supplier = {
      ...(editingSupplier || {}),
      ...formData,
      id: editingSupplier?.id || Math.random().toString(36).substr(2, 9),
      tenant_id: 'default'
    } as Supplier;

    await dataService.saveItem('fornecedores', updatedSupplier);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Deseja realmente excluir o fornecedor "${name}"?`)) {
      await dataService.deleteItem('fornecedores', id);
    }
  };

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = 
      s.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.documento.includes(searchTerm) ||
      (s.cidade?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (s.estado?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (s.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (s.telefone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (s.responsavel?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus ? s.status === filterStatus : true;
    const matchesRegime = filterRegime ? s.regimeTributario === filterRegime : true;

    return matchesSearch && matchesStatus && matchesRegime;
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
  } = usePagination({ data: filteredSuppliers, initialItemsPerPage: 10 });

  // KPIs
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'Ativo').length;

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/compras">Compra & Cotação</Link>
        <ChevronRight size={14} />
        <span>Fornecedores</span>
      </nav>

      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <Truck size={32} />
          </div>
          <div>
            <h1>Gestão de Fornecedores</h1>
            <p className="description">Cadastre e gerencie sua rede de parceiros e fornecedores.</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-premium-outline">
            <Download size={18} strokeWidth={3} />
            <span>Relatórios</span>
          </button>
          <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
            <Plus size={18} strokeWidth={3} />
            <span>Novo Fornecedor</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card card glass animate-slide-up">
          <div className="summary-info">
            <span className="summary-label">Total Fornecedores</span>
            <span className="summary-value">{totalSuppliers.toString().padStart(2, '0')}</span>
            <span className="summary-subtext">Base cadastrada</span>
          </div>
          <div className="summary-icon blue">
            <Users size={24} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Fornecedores Ativos</span>
            <span className="summary-value">{activeSuppliers.toString().padStart(2, '0')}</span>
            <span className="summary-trend up">
              <ShieldCheck size={14} /> Parceiros ativos
            </span>
          </div>
          <div className="summary-icon indigo">
            <ShieldCheck size={24} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Compras (30d)</span>
            <span className="summary-value">R$ 88k</span>
            <span className="summary-subtext">Volume negociado</span>
          </div>
          <div className="summary-icon orange">
            <CreditCard size={24} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Prazo Médio</span>
            <span className="summary-value">05 Dias</span>
            <span className="summary-subtext">Para recebimento</span>
          </div>
          <div className="summary-icon blue">
            <Activity size={24} />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar fornecedor, CNPJ, produto..."
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
                <th>Fornecedor / Razão Social</th>
                <th>CPF / CNPJ</th>
                <th>Localização</th>
                <th>Prazo Médio</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'nome', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'documento', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'localizacao', type: 'text', placeholder: 'Cidade/UF...' },
                    { key: 'prazoEntregaMedio', type: 'text', placeholder: 'Prazo...' },
                    { key: 'status', type: 'select', options: ['Ativo', 'Inativo', 'Suspenso'] }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                  showActionsPadding={true}
                />
              )}
            </thead>
            <tbody>
              {paginatedData.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="client-cell">
                      <div className={`client-avatar status-${s.status.toLowerCase()}`}>
                        <Building2 size={16} />
                      </div>
                      <div className="client-name-cell flex items-center gap-2">
                        <span className="font-bold text-slate-800">{s.nome}</span>
                        <span className="text-slate-400 text-xs">— {s.nomeFantasia}</span>
                      </div>
                    </div>
                  </td>
                  <td>{s.documento}</td>
                  <td>{s.cidade}/{s.estado}</td>
                  <td>{s.prazoEntregaMedio}</td>
                  <td>
                    <span className={`status-badge stock-${s.status === 'Ativo' ? 'ok' : (s.status === 'Inativo' ? 'baixo' : 'critico')}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="actions-cell">
                      <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(s, true)}>
                        <Eye size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(s)}>
                        <Edit size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-delete" title="Excluir" onClick={() => handleDelete(s.id, s.nome)}>
                        <Trash2 size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">Nenhum fornecedor encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
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
            label="fornecedores"
          />
        </div>

      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${isViewMode ? 'Visualizar' : (editingSupplier ? 'Editar' : 'Novo')} Fornecedor`}
        subtitle="Informações detalhadas para parcerias e suprimentos"
        icon={Truck}
        size="lg"
        footer={
          <>
            <button className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>
              {isViewMode ? 'Fechar' : 'Cancelar'}
            </button>
            {!isViewMode && (
              <button className="btn-premium-solid indigo" onClick={handleSave}>
                <Plus size={18} strokeWidth={3} />
                <span>{editingSupplier ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}</span>
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

        <div className="form-sections-grid">
          {activeTab === 'geral' && (
            <div className="form-section">
              <div className="form-grid">
                <div className="form-group col-12">
                  <label>Razão Social / Nome Completo</label>
                  <div className="input-with-icon">
                    <input type="text" value={formData.nome || ''} onChange={(e) => handleInputChange('nome', e.target.value)} placeholder="Nome oficial" disabled={isViewMode} />
                    <Building2 size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-8">
                  <label>Nome Fantasia / Apelido</label>
                  <div className="input-with-icon">
                    <input type="text" value={formData.nomeFantasia || ''} onChange={(e) => handleInputChange('nomeFantasia', e.target.value)} placeholder="Nome fantasia" disabled={isViewMode} />
                    <Tag size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-4">
                  <label>Status</label>
                  <div className="input-with-icon">
                    <select value={formData.status || 'Ativo'} onChange={(e) => handleInputChange('status', e.target.value)} disabled={isViewMode}>
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Bloqueado">Bloqueado</option>
                    </select>
                    <Activity size={18} className="field-icon" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fiscal' && (
            <div className="form-section">
              <div className="form-grid">
                <div className="form-group col-4">
                  <label>CPF / CNPJ</label>
                  <div className="input-with-button">
                    <div className="input-with-icon w-full">
                      <input type="text" value={formData.documento || ''} onChange={(e) => handleInputChange('documento', e.target.value)} onBlur={handleCnpjLookup} placeholder="00.000.000/0000-00" disabled={isViewMode} />
                      <SearchCode size={18} className="field-icon" />
                    </div>
                    <button className="lookup-btn" onClick={handleCnpjLookup} disabled={isLoadingCnpj || isViewMode}>{isLoadingCnpj ? <Loader2 size={16} className="spinning" /> : <RefreshCw size={16} />}</button>
                  </div>
                </div>
                <div className="form-group col-4">
                  <label>Inscrição Estadual</label>
                  <div className="input-with-icon">
                    <input type="text" value={formData.inscricaoEstadual || ''} onChange={(e) => handleInputChange('inscricaoEstadual', e.target.value)} placeholder="Número ou Isento" disabled={isViewMode} />
                    <FileText size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-4">
                  <label>Regime Tributário</label>
                  <div className="input-with-icon">
                    <select value={formData.regimeTributario || ''} onChange={(e) => handleInputChange('regimeTributario', e.target.value)} disabled={isViewMode}>
                      <option value="">Selecione...</option>
                      <option value="Simples Nacional">Simples Nacional</option>
                      <option value="Lucro Presumido">Lucro Presumido</option>
                      <option value="Lucro Real">Lucro Real</option>
                    </select>
                    <DollarSign size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-4">
                  <label>Indicador IE Destinatário</label>
                  <div className="input-with-icon">
                    <select value={formData.indIEDest || '9'} onChange={(e) => handleInputChange('indIEDest', e.target.value)} disabled={isViewMode}>
                      <option value="1">1 - Contribuinte ICMS</option>
                      <option value="2">2 - Contribuinte Isento</option>
                      <option value="9">9 - Não Contribuinte</option>
                    </select>
                    <Activity size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-12">
                  <label>CNAE (Atividade Principal)</label>
                  <div className="input-with-icon">
                    <input type="text" value={formData.cnae || ''} onChange={(e) => handleInputChange('cnae', e.target.value)} placeholder="Código e descrição da atividade" disabled={isViewMode} />
                    <Tag size={18} className="field-icon" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'endereco' && (
            <div className="form-section">
              <div className="form-grid">
                <div className="form-group col-3">
                  <label>Tipo</label>
                  <div className="input-with-icon">
                    <select value={formData.tipoLogradouro || 'Rua'} onChange={(e) => handleInputChange('tipoLogradouro', e.target.value)} disabled={isViewMode}>
                      <option value="Rua">Rua</option>
                      <option value="Avenida">Avenida</option>
                      <option value="Rodovia">Rodovia</option>
                      <option value="Estrada">Estrada</option>
                    </select>
                    <MapPin size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-9">
                  <label>Logradouro / Rua</label>
                  <div className="input-with-icon">
                    <input type="text" value={formData.logradouro || ''} onChange={(e) => handleInputChange('logradouro', e.target.value)} placeholder="Nome da rua" disabled={isViewMode} />
                    <Globe size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-2">
                  <label>Número</label>
                  <div className="input-with-icon">
                    <input type="text" value={formData.numero || ''} onChange={(e) => handleInputChange('numero', e.target.value)} placeholder="SN" disabled={isViewMode} />
                  </div>
                </div>
                <div className="form-group col-3">
                  <label>CEP</label>
                  <div className="input-with-icon">
                    <input type="text" value={formData.cep || ''} onChange={(e) => handleInputChange('cep', e.target.value)} placeholder="00000-000" disabled={isViewMode} />
                    <MapPin size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-7">
                  <label>Bairro</label>
                  <div className="input-with-icon">
                    <input type="text" value={formData.bairro || ''} onChange={(e) => handleInputChange('bairro', e.target.value)} placeholder="Bairro" disabled={isViewMode} />
                    <MapPin size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-8">
                  <label>Cidade</label>
                  <div className="input-with-icon">
                    <input type="text" value={formData.cidade || ''} onChange={(e) => handleInputChange('cidade', e.target.value)} placeholder="Cidade" disabled={isViewMode} />
                    <Building2 size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-4">
                  <label>Estado / UF</label>
                  <div className="input-with-icon">
                    <input type="text" value={formData.estado || ''} onChange={(e) => handleInputChange('estado', e.target.value)} placeholder="UF" disabled={isViewMode} />
                    <MapPin size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-4">
                  <label>Cód. Município (IBGE)</label>
                  <div className="input-with-icon">
                    <input type="text" value={formData.cMun || ''} onChange={(e) => handleInputChange('cMun', e.target.value)} placeholder="Ex: 5103403" disabled={isViewMode} />
                    <Building2 size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-4">
                  <label>País</label>
                  <div className="input-with-icon">
                    <input type="text" value={formData.pais || 'Brasil'} onChange={(e) => handleInputChange('pais', e.target.value)} placeholder="Brasil" disabled={isViewMode} />
                    <Globe size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-4">
                  <label>Cód. País</label>
                  <div className="input-with-icon">
                    <input type="text" value={formData.cPais || '1058'} onChange={(e) => handleInputChange('cPais', e.target.value)} placeholder="1058" disabled={isViewMode} />
                    <Building2 size={18} className="field-icon" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contato' && (
             <div className="form-section">
               <div className="form-grid">
                 <div className="form-group col-6">
                   <label>Responsável / Contato</label>
                   <div className="input-with-icon">
                     <input type="text" value={formData.responsavel || ''} onChange={(e) => handleInputChange('responsavel', e.target.value)} placeholder="Nome contato" disabled={isViewMode} />
                     <User size={18} className="field-icon" />
                   </div>
                 </div>
                 <div className="form-group col-6">
                   <label>Telefone</label>
                   <div className="input-with-icon">
                     <input type="text" value={formData.telefone || ''} onChange={(e) => handleInputChange('telefone', e.target.value)} placeholder="(00) 00000-0000" disabled={isViewMode} />
                     <Phone size={18} className="field-icon" />
                   </div>
                 </div>
                 <div className="form-group col-12">
                   <label>E-mail Comercial</label>
                   <div className="input-with-icon">
                     <input type="email" value={formData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="email@vendas.com" disabled={isViewMode} />
                     <Mail size={18} className="field-icon" />
                   </div>
                 </div>
               </div>
             </div>
          )}

          {activeTab === 'comercial' && (
            <div className="form-section">
              <div className="form-grid">
                <div className="form-group col-6">
                  <label>Condição de Pagamento Padrao</label>
                  <div className="input-with-icon">
                    <select value={formData.condicaoPagamentoPadrao || ''} onChange={(e) => handleInputChange('condicaoPagamentoPadrao', e.target.value)} disabled={isViewMode}>
                      <option value="À Vista">À Vista</option>
                      <option value="30 dias">30 dias</option>
                    </select>
                    <CreditCard size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-6">
                  <label>Prazo Médio Entrega</label>
                  <div className="input-with-icon">
                    <input type="text" value={formData.prazoEntregaMedio || ''} onChange={(e) => handleInputChange('prazoEntregaMedio', e.target.value)} placeholder="Ex: 5 dias" disabled={isViewMode} />
                    <Briefcase size={18} className="field-icon" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </StandardModal>
    </div>
  );
};

