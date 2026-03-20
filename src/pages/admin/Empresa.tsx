import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  X, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  ChevronLeft,
  Info,
  MapPin,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Globe,
  Loader2,
  RefreshCw,
  Shield,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { ModernModal } from '../../components/ModernModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import './Empresa.css';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { Company } from '../../types';

export const Empresa: React.FC = () => {
  const companies = useLiveQuery(() => db.empresas.toArray()) || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [columnFilters, setColumnFilters] = useState({
    empresa: '',
    status: 'Todos',
    estado: 'Todos',
    cidade: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'fiscal' | 'endereco' | 'contato' | 'rural'>('geral');
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [expandedMatrizes, setExpandedMatrizes] = useState<Set<string>>(new Set(['M1']));
  const [isBranch, setIsBranch] = useState(false);
  const [selectedMatrizId, setSelectedMatrizId] = useState<string>('');
  const [isLoadingCnpj, setIsLoadingCnpj] = useState(false);

  const [formData, setFormData] = useState<Partial<Company>>({});

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedMatrizes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedMatrizes(newExpanded);
  };

  const handleOpenModal = (company?: Company, asBranch: boolean = false, parentId: string = '') => {
    if (company) {
      setEditingCompany(company);
      setFormData({ ...company });
      setIsBranch(!company.isMatriz);
      setSelectedMatrizId(company.parentId || '');
    } else {
      setEditingCompany(null);
      setIsBranch(asBranch);
      setSelectedMatrizId(parentId);
      setFormData({
        razaoSocial: '',
        nomeFantasia: '',
        cnpj: '',
        tipoLogradouro: 'Rua',
        estado: 'MT',
        pais: 'Brasil',
        isMatriz: !asBranch,
        parentId: parentId
      });
    }
    setActiveTab('geral');
    setIsModalOpen(true);
  };

  const handleInputChange = (field: keyof Company, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCnpjLookup = async () => {
    if (!formData.cnpj) return;
    
    const cleanCnpj = formData.cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) {
      // Quiet fail for auto-lookup if it doesn't look like a CNPJ
      return;
    }

    setIsLoadingCnpj(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (!response.ok) throw new Error('Não foi possível encontrar este CNPJ.');
      
      const data = await response.json();
      console.log('CNPJ Data:', data);
      
      setFormData(prev => ({
        ...prev,
        razaoSocial: data.razao_social || prev.razaoSocial,
        nomeFantasia: data.nome_fantasia || prev.nomeFantasia || data.razao_social,
        cep: data.cep || prev.cep,
        logradouro: data.logradouro || prev.logradouro,
        numero: data.numero || prev.numero,
        complemento: data.complemento || prev.complemento,
        bairro: data.bairro || prev.bairro,
        cidade: data.municipio || prev.cidade,
        estado: data.uf || prev.estado,
        email: data.email || data.e_mail || data.contato_email || data.email_corporativo || prev.email,
        telefone: data.ddd_telefone_1 ? `(${data.ddd_telefone_1.substring(0,2)}) ${data.ddd_telefone_1.substring(2)}` : prev.telefone,
        pais: 'Brasil',
        cnae: data.cnae_fiscal ? `${String(data.cnae_fiscal).replace(/(\d{4})(\d{1})(\d{2})/, '$1-$2/$3')} - ${data.cnae_fiscal_descricao}` : prev.cnae
      }));
    } catch (error: any) {
      alert(error.message || 'Erro ao consultar CNPJ. Verifique a conexão.');
    } finally {
      setIsLoadingCnpj(false);
    }
  };

  const handleSave = async () => {
    if (!formData.razaoSocial || !formData.cnpj) {
      alert('Razão Social e CPF/CNPJ são obrigatórios');
      return;
    }

    if (editingCompany) {
      const accountData: Company = {
        ...editingCompany,
        ...formData,
        isMatriz: !isBranch,
        parentId: isBranch ? selectedMatrizId : undefined,
      };

      await dataService.saveItem('empresas', accountData);
      
      // Cascade inactivation: if matriz becomes inactive, all its branches become inactive
      if (editingCompany.isMatriz && editingCompany.status === 'Ativa' && formData.status === 'Inativa') {
        const branchesToInactivate = companies.filter((c: Company) => c.parentId === editingCompany.id);
        for (const branch of branchesToInactivate) {
          await dataService.saveItem('empresas', { ...branch, status: 'Inativa' });
        }
      }
    } else {
      const newCompany: Company = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        isMatriz: !isBranch,
        parentId: isBranch ? selectedMatrizId : undefined,
        status: 'Ativa'
      } as Company;
      await dataService.saveItem('empresas', newCompany);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a empresa ${name}?`)) {
      await dataService.deleteItem('empresas', id);
      // Delete branches
      const branchesToDelete = companies.filter((c: Company) => c.parentId === id);
      for (const branch of branchesToDelete) {
        await dataService.deleteItem('empresas', branch.id);
      }
    }
  };

  const matrizes = companies.filter((c: Company) => {
    const matchesSearch = c.isMatriz && (
      c.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.cnpj.includes(searchTerm)
    );
    
    const matchesStatus = filterStatus === 'Todos' || c.status === filterStatus;
    const matchesEstado = filterEstado === 'Todos' || c.estado === filterEstado;

    const matchesColumnFilters = 
      (columnFilters.empresa === '' || c.razaoSocial.toLowerCase().includes(columnFilters.empresa.toLowerCase()) || c.cnpj.includes(columnFilters.empresa)) &&
      (columnFilters.status === 'Todos' || c.status === columnFilters.status) &&
      (columnFilters.estado === 'Todos' || c.estado === columnFilters.estado) &&
      (columnFilters.cidade === '' || c.cidade.toLowerCase().includes(columnFilters.cidade.toLowerCase()));

    return matchesSearch && matchesStatus && matchesEstado && matchesColumnFilters;
  });

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedMatrizes,
    itemsPerPage,
    setItemsPerPage,
    startIndex,
    endIndex,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
  } = usePagination({ data: matrizes, initialItemsPerPage: 10 });

  const getBranches = (matrizId: string) => companies.filter((c: Company) => c.parentId === matrizId);

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/dashboard">Admin</Link>
        <ChevronRight size={14} />
        <span>Empresas & Unidades</span>
      </nav>
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <Building2 size={40} strokeWidth={3} />
          </div>
          <div>
            <h1>Estrutura Organizacional</h1>
            <p className="description">Gestão de matrizes, filiais e unidades produtivas do ecossistema.</p>
          </div>
        </div>
        <div className="header-actions">
           <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
              <span>Nova Matriz</span>
              <Plus size={18} strokeWidth={3} />
           </button>
        </div>
      </div>
      <div className="summary-grid">
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0s' }}>
          <div className="summary-info">
            <span className="summary-label">Total Matrizes</span>
            <span className="summary-value">{companies.filter((c: Company) => c.isMatriz).length.toString().padStart(2, '0')}</span>
            <span className="summary-subtext">Unidades principais</span>
          </div>
          <div className="summary-icon indigo">
            <Building2 size={32} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Total Filiais</span>
            <span className="summary-value">{companies.filter((c: Company) => !c.isMatriz).length.toString().padStart(2, '0')}</span>
            <span className="summary-subtext">Unidades produtivas</span>
          </div>
          <div className="summary-icon emerald">
            <Globe size={32} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Estados</span>
            <span className="summary-value">{new Set(companies.map(c => c.estado)).size.toString().padStart(2, '0')}</span>
            <span className="summary-subtext">Cobertura geográfica</span>
          </div>
          <div className="summary-icon sky">
            <MapPin size={32} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="companies-container">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por Razão Social ou CPF/CNPJ..."
          onToggleAdvanced={() => setIsFiltersOpen(!isFiltersOpen)}
          isAdvancedOpen={isFiltersOpen}
        />

        <div className="hierarchy-list">
          {isFiltersOpen && (
            <div className="column-filters-header px-4 mb-2">
              <table className="w-full">
                <thead>
                  <ColumnFilters
                    columns={[
                      { key: 'empresa', type: 'text', placeholder: 'Filtrar Empresa/CNPJ...' },
                      { key: 'status', type: 'select', options: ['Ativa', 'Inativa'] },
                      { key: 'estado', type: 'select', options: [...new Set(companies.map(c => c.estado))] },
                      { key: 'cidade', type: 'text', placeholder: 'Cidade...' }
                    ]}
                    values={columnFilters}
                    onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                    showActionsPadding={true}
                  />
                </thead>
              </table>
            </div>
          )}
          {paginatedMatrizes.map((matriz: Company, i: number) => (
            <div key={matriz.id} className="matriz-group animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="company-row-premium matriz">
                <div className={`row-content-premium ${matriz.status === 'Inativa' ? 'inactive' : ''}`} onClick={() => toggleExpand(matriz.id)}>
                  <div className="expansion-toggle">
                    {expandedMatrizes.has(matriz.id) ? <ChevronDown size={20} strokeWidth={3} /> : <ChevronRight size={20} strokeWidth={3} />}
                  </div>
                  <div className={`company-badge-icon matriz ${matriz.status === 'Inativa' ? 'grayscale' : ''}`}>
                    <ShieldCheck size={20} strokeWidth={3} />
                  </div>
                  <div className="company-details-main">
                    <div className="name-box">
                      <strong>{matriz.razaoSocial}</strong>
                      <div className="flex gap-2">
                        <span className="badge-matriz-premium">MATRIZ</span>
                        {matriz.status === 'Inativa' && <span className="badge-status-inativa-premium">INATIVA</span>}
                      </div>
                    </div>
                    <span className="sub-info">{matriz.cnpj} • {matriz.cidade}/{matriz.estado}</span>
                  </div>
                </div>
                <div className="row-actions-premium flex gap-2">
                  <button className="action-btn-global btn-add btn-sm" title="Adicionar Filial" onClick={() => handleOpenModal(undefined, true, matriz.id)}>
                    <Plus size={16} strokeWidth={3} />
                  </button>
                  <button className="action-btn-global btn-edit btn-sm" onClick={() => handleOpenModal(matriz)}>
                    <Edit2 size={16} strokeWidth={3} />
                  </button>
                  <button className="action-btn-global btn-delete btn-sm" onClick={() => handleDelete(matriz.id, matriz.razaoSocial)}>
                    <Trash2 size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>
 
              {expandedMatrizes.has(matriz.id) && (
                <div className="branches-list-premium">
                  {getBranches(matriz.id).map((branch: Company) => (
                    <div key={branch.id} className="company-row-premium branch">
                      <div className="row-content-premium">
                        <div className="branch-line-premium"></div>
                        <div className={`company-badge-icon branch ${branch.status === 'Inativa' ? 'grayscale' : ''}`}>
                          <Building2 size={16} />
                        </div>
                        <div className="company-details-main">
                          <div className="name-box">
                            <strong>{branch.nomeFantasia || branch.razaoSocial}</strong>
                            <div className="flex gap-2">
                              <span className="badge-filial-premium">FILIAL</span>
                              {branch.status === 'Inativa' && <span className="badge-status-inativa-premium">INATIVA</span>}
                            </div>
                          </div>
                          <span className="sub-info">{branch.cnpj} • {branch.cidade}/{branch.estado}</span>
                        </div>
                      </div>
                      <div className="row-actions-premium flex gap-2">
                        <button className="action-btn-global btn-edit btn-sm" onClick={() => handleOpenModal(branch)}>
                          <Edit2 size={14} strokeWidth={3} />
                        </button>
                        <button className="action-btn-global btn-delete btn-sm" onClick={() => handleDelete(branch.id, branch.razaoSocial)}>
                          <Trash2 size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {getBranches(matriz.id).length === 0 && (
                    <div className="empty-branches-premium">Nenhuma filial cadastrada para esta unidade.</div>
                  )}
                </div>
              )}
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
          label="matrizes"
        />

      </div>

      <ModernModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingCompany ? 'Editar ' : 'Nova '} ${isBranch ? 'Filial' : 'Matriz'}`}
        subtitle={isBranch ? `Vinculada à matriz: ${matrizes.find(m => m.id === selectedMatrizId)?.razaoSocial}` : 'Configuração completa da unidade principal'}
        icon={Building2}
        footer={
          <>
            <button className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>
              <X size={18} strokeWidth={3} />
              <span>Cancelar</span>
            </button>
            <button className="btn-premium-solid indigo" onClick={handleSave}>
              <span>{editingCompany ? 'Salvar Alterações' : 'Finalizar Cadastro'}</span>
              {isLoadingCnpj ? <Loader2 size={18} className="spinning" /> : (editingCompany ? <CheckCircle2 size={18} strokeWidth={3} /> : <RefreshCw size={18} strokeWidth={3} />)}
            </button>
          </>
        }
      >
        <div className="modal-tabs mb-6">
          <button className={`tab-btn ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')}>Geral</button>
          <button className={`tab-btn ${activeTab === 'fiscal' ? 'active' : ''}`} onClick={() => setActiveTab('fiscal')}>Fiscal</button>
          <button className={`tab-btn ${activeTab === 'endereco' ? 'active' : ''}`} onClick={() => setActiveTab('endereco')}>Endereço</button>
          <button className={`tab-btn ${activeTab === 'contato' ? 'active' : ''}`} onClick={() => setActiveTab('contato')}>Contato</button>
          <button className={`tab-btn ${activeTab === 'rural' ? 'active' : ''}`} onClick={() => setActiveTab('rural')}>Rural</button>
        </div>
 
        <div className="modern-form-section">
          {activeTab === 'geral' && (
            <div className="form-content-active fade-in">
              <div className="modern-form-group full-width">
                <label>Razão Social</label>
                <div className="modern-input-wrapper">
                  <input type="text" className="modern-input text-lg font-bold" value={formData.razaoSocial || ''} onChange={(e) => handleInputChange('razaoSocial', e.target.value)} placeholder="Agropecuária Exemplo LTDA" />
                  <Building2 size={18} className="modern-field-icon" />
                </div>
              </div>
              <div className="modern-form-group full-width">
                <label>Nome Fantasia</label>
                <div className="modern-input-wrapper">
                  <input type="text" className="modern-input" value={formData.nomeFantasia || ''} onChange={(e) => handleInputChange('nomeFantasia', e.target.value)} placeholder="Fazenda Exemplo" />
                  <Globe size={18} className="modern-field-icon" />
                </div>
              </div>
              <div className="modern-form-row">
                <div className="modern-form-group">
                  <label>Tipo de Unidade</label>
                  <select 
                    className="modern-input"
                    value={isBranch ? 'Filial' : 'Matriz'} 
                    onChange={(e) => {
                      const branch = e.target.value === 'Filial';
                      setIsBranch(branch);
                      handleInputChange('isMatriz', !branch);
                      if (!branch) {
                        handleInputChange('parentId', undefined);
                        setSelectedMatrizId('');
                      } else if (matrizes.length > 0 && !selectedMatrizId) {
                        setSelectedMatrizId(matrizes[0].id);
                        handleInputChange('parentId', matrizes[0].id);
                      }
                    }}
                    disabled={!!editingCompany && editingCompany.isMatriz && getBranches(editingCompany.id).length > 0}
                  >
                    <option value="Matriz">Matriz</option>
                    <option value="Filial">Filial</option>
                  </select>
                </div>
                <div className="modern-form-group">
                  <label>Status</label>
                  <select 
                    className={`modern-input ${formData.status === 'Inativa' ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}`}
                    value={formData.status || 'Ativa'} 
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="Ativa">Ativa</option>
                    <option value="Inativa">Inativa</option>
                  </select>
                </div>
              </div>

              <div className="modern-form-row">
                <div className="modern-form-group">
                  <label>Logotipo (URL)</label>
                  <input type="text" className="modern-input" value={formData.logotipo || ''} onChange={(e) => handleInputChange('logotipo', e.target.value)} placeholder="https://..." />
                </div>
                {isBranch && (
                  <div className="modern-form-group">
                    <label>Matriz Vinculada</label>
                    <select 
                      className="modern-input"
                      value={selectedMatrizId} 
                      onChange={(e) => {
                        setSelectedMatrizId(e.target.value);
                        handleInputChange('parentId', e.target.value);
                      }}
                    >
                      <option value="">Selecione a matriz...</option>
                      {matrizes.filter(m => m.id !== editingCompany?.id).map((m: Company) => (
                        <option key={m.id} value={m.id}>{m.razaoSocial}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'fiscal' && (
            <div className="form-content-active fade-in">
              <div className="modern-form-row">
                <div className="modern-form-group">
                  <label>CPF / CNPJ</label>
                  <div className="modern-input-wrapper">
                    <input type="text" className="modern-input" value={formData.cnpj || ''} onChange={(e) => handleInputChange('cnpj', e.target.value)} onBlur={handleCnpjLookup} placeholder="00.000.000/0000-00" />
                    <button className="action-inline-btn" onClick={handleCnpjLookup} disabled={isLoadingCnpj}>{isLoadingCnpj ? <Loader2 size={16} className="spinning" /> : <RefreshCw size={16} />}</button>
                  </div>
                </div>
                <div className="modern-form-group">
                  <label>Inscrição Estadual</label>
                  <input type="text" className="modern-input" value={formData.inscricaoEstadual || ''} onChange={(e) => handleInputChange('inscricaoEstadual', e.target.value)} placeholder="Número ou Isento" />
                </div>
              </div>

              <div className="modern-form-row three-cols">
                <div className="modern-form-group">
                  <label>Inscrição Municipal</label>
                  <input type="text" className="modern-input" value={formData.inscricaoMunicipal || ''} onChange={(e) => handleInputChange('inscricaoMunicipal', e.target.value)} placeholder="Número" />
                </div>
                <div className="modern-form-group">
                  <label>Regime Tributário</label>
                  <select className="modern-input" value={formData.regimeTributario || ''} onChange={(e) => handleInputChange('regimeTributario', e.target.value)}>
                    <option value="">Selecione...</option>
                    <option value="Simples Nacional">Simples Nacional</option>
                    <option value="Lucro Presumido">Lucro Presumido</option>
                    <option value="Lucro Real">Lucro Real</option>
                    <option value="Produtor Rural">Produtor Rural</option>
                  </select>
                </div>
                <div className="modern-form-group">
                  <label>CRT</label>
                  <select className="modern-input" value={formData.crt || '1'} onChange={(e) => handleInputChange('crt', e.target.value)}>
                    <option value="1">1 - Simples Nacional</option>
                    <option value="2">2 - Simples Nacional (Excesso)</option>
                    <option value="3">3 - Regime Normal</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'endereco' && (
            <div className="form-content-active fade-in">
              <div className="modern-form-row three-cols">
                <div className="modern-form-group">
                  <label>CEP</label>
                  <div className="modern-input-wrapper">
                    <input type="text" className="modern-input" value={formData.cep || ''} onChange={(e) => handleInputChange('cep', e.target.value)} placeholder="00000-000" />
                    <Search size={16} className="modern-field-icon" />
                  </div>
                </div>
                <div className="modern-form-group col-span-2">
                  <label>Logradouro / Rua</label>
                  <input type="text" className="modern-input" value={formData.logradouro || ''} onChange={(e) => handleInputChange('logradouro', e.target.value)} />
                </div>
              </div>
              <div className="modern-form-row three-cols">
                <div className="modern-form-group">
                  <label>Número</label>
                  <input type="text" className="modern-input" value={formData.numero || ''} onChange={(e) => handleInputChange('numero', e.target.value)} />
                </div>
                <div className="modern-form-group">
                  <label>Bairro</label>
                  <input type="text" className="modern-input" value={formData.bairro || ''} onChange={(e) => handleInputChange('bairro', e.target.value)} />
                </div>
                <div className="modern-form-group">
                  <label>Cidade</label>
                  <input type="text" className="modern-input" value={formData.cidade || ''} onChange={(e) => handleInputChange('cidade', e.target.value)} />
                </div>
              </div>
              <div className="modern-form-group">
                <label>Estado</label>
                <select className="modern-input" value={formData.estado || 'MT'} onChange={(e) => handleInputChange('estado', e.target.value)}>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="GO">Goiás</option>
                  <option value="SP">São Paulo</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'contato' && (
            <div className="form-content-active fade-in">
              <div className="modern-form-group full-width">
                <label>Responsável Legal</label>
                <div className="modern-input-wrapper">
                  <input type="text" className="modern-input" value={formData.responsavel || ''} onChange={(e) => handleInputChange('responsavel', e.target.value)} placeholder="Nome completo" />
                  <User size={18} className="modern-field-icon" />
                </div>
              </div>
              <div className="modern-form-row">
                <div className="modern-form-group">
                  <label>Telefone</label>
                  <div className="modern-input-wrapper">
                    <input type="text" className="modern-input" value={formData.telefone || ''} onChange={(e) => handleInputChange('telefone', e.target.value)} placeholder="(00) 00000-0000" />
                    <Phone size={18} className="modern-field-icon" />
                  </div>
                </div>
                <div className="modern-form-group">
                  <label>E-mail Corporativo</label>
                  <div className="modern-input-wrapper">
                    <input type="email" className="modern-input" value={formData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="exemplo@empresa.com" />
                    <Mail size={18} className="modern-field-icon" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rural' && (
            <div className="form-content-active fade-in">
              <div className="modern-form-row">
                <div className="modern-form-group">
                  <label>INCRA</label>
                  <input type="text" className="modern-input" value={formData.incra || ''} onChange={(e) => handleInputChange('incra', e.target.value)} />
                </div>
                <div className="modern-form-group">
                  <label>NIRF</label>
                  <input type="text" className="modern-input" value={formData.nirf || ''} onChange={(e) => handleInputChange('nirf', e.target.value)} />
                </div>
              </div>

              <div className="modern-form-row">
                <div className="modern-form-group">
                  <label>Latitude</label>
                  <input type="text" className="modern-input" value={formData.latitude || ''} onChange={(e) => handleInputChange('latitude', e.target.value)} />
                </div>
                <div className="modern-form-group">
                  <label>Longitude</label>
                  <input type="text" className="modern-input" value={formData.longitude || ''} onChange={(e) => handleInputChange('longitude', e.target.value)} />
                </div>
              </div>

              <div className="modern-form-row four-cols">
                <div className="modern-form-group">
                  <label>Área Total (ha)</label>
                  <input type="number" className="modern-input text-center" value={formData.areaTotal || ''} onChange={(e) => handleInputChange('areaTotal', parseFloat(e.target.value))} placeholder="0.00" />
                </div>
                <div className="modern-form-group">
                  <label>Área Pasto (ha)</label>
                  <input type="number" className="modern-input text-center" value={formData.areaPasto || ''} onChange={(e) => handleInputChange('areaPasto', parseFloat(e.target.value))} placeholder="0.00" />
                </div>
                <div className="modern-form-group">
                  <label>Área Reserva (ha)</label>
                  <input type="number" className="modern-input text-center" value={formData.areaReserva || ''} onChange={(e) => handleInputChange('areaReserva', parseFloat(e.target.value))} placeholder="0.00" />
                </div>
                <div className="modern-form-group">
                  <label>Área APP (ha)</label>
                  <input type="number" className="modern-input text-center" value={formData.areaApp || ''} onChange={(e) => handleInputChange('areaApp', parseFloat(e.target.value))} placeholder="0.00" />
                </div>
              </div>

              <div className="info-box-premium mt-6">
                <Globe size={20} />
                <div className="text-sm">
                  <strong>Geolocalização:</strong> As coordenadas são essenciais para o mapeamento das áreas e visualização no Dashboard.
                </div>
              </div>
            </div>
          )}
        </div>
      </ModernModal>
    </div>
  );
};

