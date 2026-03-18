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
  Filter
} from 'lucide-react';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import './Empresa.css';

import { Company } from '../../types/definitions';
import { INITIAL_COMPANIES } from '../../data/initialData';

export const Empresa: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
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

  const handleSave = () => {
    if (!formData.razaoSocial || !formData.cnpj) {
      alert('Razão Social e CPF/CNPJ são obrigatórios');
      return;
    }

    if (editingCompany) {
      const oldStatus = editingCompany.status;
      const newStatus = formData.status;
      
      setCompanies((prev: Company[]) => {
        let updated = prev.map((c: Company) => c.id === editingCompany.id ? { ...c, ...formData } as Company : c);
        
        // Cascade inactivation: if matriz becomes inactive, all its branches become inactive
        if (editingCompany.isMatriz && oldStatus === 'Ativa' && newStatus === 'Inativa') {
          updated = updated.map(c => c.parentId === editingCompany.id ? { ...c, status: 'Inativa' } : c);
        }
        
        return updated;
      });
    } else {
      const newCompany: Company = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        isMatriz: !isBranch,
        parentId: isBranch ? selectedMatrizId : undefined,
        status: 'Ativa'
      } as Company;
      setCompanies((prev: Company[]) => [...prev, newCompany]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Deseja realmente excluir a empresa "${name}"? Todas as filiais relacionadas também perderão o vínculo.`)) {
      setCompanies(prev => prev.filter(c => c.id !== id && c.parentId !== id));
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
      <div className="summary-grid">
        <div className="summary-card animate-slide-up" style={{ animationDelay: '0s' }}>
          <div className="summary-info">
            <span className="summary-label">Total Matrizes</span>
            <span className="summary-value">{companies.filter(c => c.isMatriz).length}</span>
            <span className="summary-subtext">Unidades principais</span>
          </div>
          <div className="summary-icon emerald">
            <Building2 size={36} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Total Filiais</span>
            <span className="summary-value">{companies.filter(c => !c.isMatriz).length}</span>
            <span className="summary-subtext">Unidades produtivas</span>
          </div>
          <div className="summary-icon emerald">
            <Globe size={36} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Estados Atendidos</span>
            <span className="summary-value">{new Set(companies.map(c => c.estado)).size}</span>
            <span className="summary-subtext">Cobertura geográfica</span>
          </div>
          <div className="summary-icon emerald">
            <MapPin size={36} strokeWidth={3} />
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
                            {branch.status === 'Inativa' && <span className="badge-status-inativa-premium">INATIVA</span>}
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

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingCompany ? 'Editar ' : 'Nova '} ${isBranch ? 'Filial' : 'Matriz'}`}
        subtitle={isBranch ? `Vinculada à matriz: ${matrizes.find(m => m.id === selectedMatrizId)?.razaoSocial}` : 'Configuração completa da unidade principal'}
        icon={Building2}
        size="lg"
        footer={
          <div className="footer-actions flex gap-3">
            <button className="btn-premium-outline px-8" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button className="btn-premium-solid indigo px-8 flex items-center gap-2" onClick={handleSave}>
              {isLoadingCnpj ? <Loader2 size={18} className="spinning" /> : <RefreshCw size={18} strokeWidth={3} />}
              <span>Finalizar Cadastro</span>
            </button>
          </div>
        }
      >
        <div className="modal-tabs mb-6">
          <button className={`tab-btn ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')}>Geral</button>
          <button className={`tab-btn ${activeTab === 'fiscal' ? 'active' : ''}`} onClick={() => setActiveTab('fiscal')}>Fiscal</button>
          <button className={`tab-btn ${activeTab === 'endereco' ? 'active' : ''}`} onClick={() => setActiveTab('endereco')}>Endereço</button>
          <button className={`tab-btn ${activeTab === 'contato' ? 'active' : ''}`} onClick={() => setActiveTab('contato')}>Contato</button>
          <button className={`tab-btn ${activeTab === 'rural' ? 'active' : ''}`} onClick={() => setActiveTab('rural')}>Rural</button>
        </div>
 
        <div className="modal-body-content">
          {activeTab === 'geral' && (
            <div className="form-grid">
              <div className="form-group col-12">
                <label>Razão Social</label>
                <input type="text" value={formData.razaoSocial || ''} onChange={(e) => handleInputChange('razaoSocial', e.target.value)} placeholder="Agropecuária Exemplo LTDA" />
              </div>
              <div className="form-group col-12">
                <label>Nome Fantasia</label>
                <input type="text" value={formData.nomeFantasia || ''} onChange={(e) => handleInputChange('nomeFantasia', e.target.value)} placeholder="Fazenda Exemplo" />
              </div>
              <div className="form-group col-6">
                <label>Status</label>
                <select 
                  value={formData.status || 'Ativa'} 
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className={formData.status === 'Inativa' ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}
                >
                  <option value="Ativa">Ativa</option>
                  <option value="Inativa">Inativa</option>
                </select>
              </div>
              <div className="form-group col-6">
                <label>Logotipo (URL)</label>
                <input type="text" value={formData.logotipo || ''} onChange={(e) => handleInputChange('logotipo', e.target.value)} placeholder="https://..." />
              </div>
              {isBranch && (
                <div className="form-group col-6">
                  <label>Matriz Vinculada</label>
                  <select value={selectedMatrizId} onChange={(e) => setSelectedMatrizId(e.target.value)} disabled={!!editingCompany}>
                    {matrizes.map((m: Company) => <option key={m.id} value={m.id}>{m.razaoSocial}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}
 
          {activeTab === 'fiscal' && (
            <div className="form-grid">
              <div className="form-group col-6">
                <label>CPF / CNPJ</label>
                <div className="input-with-action">
                  <input type="text" value={formData.cnpj || ''} onChange={(e) => handleInputChange('cnpj', e.target.value)} onBlur={handleCnpjLookup} placeholder="00.000.000/0000-00" />
                  <button className="action-inline-btn" onClick={handleCnpjLookup} disabled={isLoadingCnpj}>{isLoadingCnpj ? <Loader2 size={16} className="spinning" /> : <RefreshCw size={16} />}</button>
                </div>
              </div>
              <div className="form-group col-6">
                <label>Inscrição Estadual</label>
                <input type="text" value={formData.inscricaoEstadual || ''} onChange={(e) => handleInputChange('inscricaoEstadual', e.target.value)} placeholder="Número ou Isento" />
              </div>
              <div className="form-group col-6">
                <label>Inscrição Municipal</label>
                <input type="text" value={formData.inscricaoMunicipal || ''} onChange={(e) => handleInputChange('inscricaoMunicipal', e.target.value)} placeholder="Número" />
              </div>
              <div className="form-group col-6">
                <label>Regime Tributário</label>
                <select value={formData.regimeTributario || ''} onChange={(e) => handleInputChange('regimeTributario', e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="Simples Nacional">Simples Nacional</option>
                  <option value="Lucro Presumido">Lucro Presumido</option>
                  <option value="Lucro Real">Lucro Real</option>
                  <option value="Produtor Rural">Produtor Rural</option>
                </select>
              </div>
            </div>
          )}
 
          {activeTab === 'endereco' && (
            <div className="form-grid">
              <div className="form-group col-4">
                <label>CEP</label>
                <input type="text" value={formData.cep || ''} onChange={(e) => handleInputChange('cep', e.target.value)} placeholder="00000-000" />
              </div>
              <div className="form-group col-8">
                <label>Logradouro / Rua</label>
                <input type="text" value={formData.logradouro || ''} onChange={(e) => handleInputChange('logradouro', e.target.value)} />
              </div>
              <div className="form-group col-4">
                <label>Número</label>
                <input type="text" value={formData.numero || ''} onChange={(e) => handleInputChange('numero', e.target.value)} />
              </div>
              <div className="form-group col-8">
                <label>Bairro</label>
                <input type="text" value={formData.bairro || ''} onChange={(e) => handleInputChange('bairro', e.target.value)} />
              </div>
              <div className="form-group col-6">
                <label>Cidade</label>
                <input type="text" value={formData.cidade || ''} onChange={(e) => handleInputChange('cidade', e.target.value)} />
              </div>
              <div className="form-group col-6">
                <label>Estado</label>
                <select value={formData.estado || 'MT'} onChange={(e) => handleInputChange('estado', e.target.value)}>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="GO">Goiás</option>
                  <option value="SP">São Paulo</option>
                </select>
              </div>
            </div>
          )}
 
          {activeTab === 'contato' && (
            <div className="form-grid">
              <div className="form-group col-12">
                <label>Responsável Legal</label>
                <div className="input-with-icon">
                  <User size={18} strokeWidth={3} className="icon-field" />
                  <input type="text" value={formData.responsavel || ''} onChange={(e) => handleInputChange('responsavel', e.target.value)} placeholder="Nome completo" />
                </div>
              </div>
              <div className="form-group col-6">
                <label>Telefone</label>
                <div className="input-with-icon">
                  <Phone size={18} strokeWidth={3} className="icon-field" />
                  <input type="text" value={formData.telefone || ''} onChange={(e) => handleInputChange('telefone', e.target.value)} placeholder="(00) 00000-0000" />
                </div>
              </div>
              <div className="form-group col-6">
                <label>E-mail Corporativo</label>
                <div className="input-with-icon">
                  <Mail size={18} strokeWidth={3} className="icon-field" />
                  <input type="email" value={formData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="exemplo@empresa.com" />
                </div>
              </div>
            </div>
          )}
 
          {activeTab === 'rural' && (
            <div className="form-grid">
              <div className="form-group col-6">
                <label>INCRA</label>
                <input type="text" value={formData.incra || ''} onChange={(e) => handleInputChange('incra', e.target.value)} />
              </div>
              <div className="form-group col-6">
                <label>NIRF</label>
                <input type="text" value={formData.nirf || ''} onChange={(e) => handleInputChange('nirf', e.target.value)} />
              </div>
              <div className="form-group col-6">
                <label>Latitude</label>
                <input type="text" value={formData.latitude || ''} onChange={(e) => handleInputChange('latitude', e.target.value)} />
              </div>
              <div className="form-group col-6">
                <label>Longitude</label>
                <input type="text" value={formData.longitude || ''} onChange={(e) => handleInputChange('longitude', e.target.value)} />
              </div>
              <div className="form-group col-12">
                <div className="info-box info">
                  <Globe size={18} strokeWidth={3} />
                  <p>As coordenadas são essenciais para o mapeamento das áreas e visualização no Dashboard.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </StandardModal>
    </div>
  );
};

