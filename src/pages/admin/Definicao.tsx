import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { 
  Settings, 
  Layers, 
  Ruler, 
  Activity, 
  Table as TableIcon,
  Plus,
  Search,
  ChevronRight,
  Save,
  Trash2,
  Edit2,
  Hash,
  ArrowLeft,
  X,
  MoreVertical,
  ChevronLeft,
  Info,
  ExternalLink,
  Shield,
  FileText,
  DollarSign,
  RefreshCw,
  QrCode,
  CreditCard,
  Link as LinkIcon,
  Key,
  MapPin,
  User
} from 'lucide-react';
import { StandardModal } from '../../components/StandardModal';
import './Definicao.css';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { Subcategoria, Categoria, UnidadeMedida, Company, AccountingAccount } from '../../types';
import { TablePagination } from '../../components/TablePagination';
import { usePagination } from '../../hooks/usePagination';
import { saasService } from '../../services/saasService';

type DefinicaoTab = 'categorias' | 'unidades' | 'parametros' | 'tabelas' | 'pagamentos';

interface LinhaTabela {
  [key: string]: string | number;
}

interface TabelaReferencia {
  id: string;
  nome: string;
  descricao: string;
  ultimaSincronizacao: string;
  colunas: string[];
  dados: LinhaTabela[];
}

export const Definicao: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DefinicaoTab>('categorias');
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(null);
  const [selectedTable, setSelectedTable] = useState<TabelaReferencia | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'categoria' | 'subcategoria' | 'unidade'>('categoria');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', sigla: '', tipo: 'Peso', empresaCnpj: '', contaContabilId: '' });
  // Data from Dexie
  const categories = useLiveQuery(() => db.categorias_definicao.toArray()) || [];
  const unidades = useLiveQuery(() => db.unidades_medida.toArray()) || [];
  const planoContas = useLiveQuery(() => db.plano_contas.toArray()) || [];
  const companies = useLiveQuery(() => db.empresas.toArray()) || [];

  const [paymentConfig, setPaymentConfig] = useState<any>({
    pix: { is_active: true, pix_key: '', merchant_name: '', merchant_city: '' },
    card: { is_active: false, checkout_url: '' },
    boleto: { is_active: false, instructions: '', link_template: '' }
  });
  const [isSavingPix, setIsSavingPix] = useState(false);

  useEffect(() => {
    if (activeTab === 'pagamentos') {
      loadPaymentConfig();
    }
  }, [activeTab]);

  const loadPaymentConfig = async () => {
    try {
      const config = await saasService.getPaymentConfig();
      if (config) setPaymentConfig(config);
    } catch (err) {
      console.error('Error loading payment config:', err);
    }
  };

  const handleSavePayment = async () => {
    setIsSavingPix(true);
    try {
      await saasService.updatePaymentConfig(paymentConfig);
      alert('Configurações de pagamento atualizadas com sucesso!');
    } catch (err) {
      console.error('Error saving payment config:', err);
      alert('Erro ao salvar as configurações.');
    } finally {
      setTimeout(() => setIsSavingPix(false), 800);
    }
  };

  useEscapeKey(() => {
    if (isModalOpen) setIsModalOpen(false);
  });

  const [tabelasReferencia] = useState<TabelaReferencia[]>([
    {
      id: 't1',
      nome: 'IBGE - Estados & Municípios',
      descricao: 'Códigos oficiais para padronização de notas fiscais e relatórios governamentais.',
      ultimaSincronizacao: '12/03/2026 09:15',
      colunas: ['Código', 'Estado', 'UF', 'Região'],
      dados: [
        { 'Código': '11', 'Estado': 'Rondônia', 'UF': 'RO', 'Região': 'Norte' },
        { 'Código': '12', 'Estado': 'Acre', 'UF': 'AC', 'Região': 'Norte' },
        { 'Código': '13', 'Estado': 'Amazonas', 'UF': 'AM', 'Região': 'Norte' },
        { 'Código': '15', 'Estado': 'Pará', 'UF': 'PA', 'Região': 'Norte' },
        { 'Código': '35', 'Estado': 'São Paulo', 'UF': 'SP', 'Região': 'Sudeste' },
        { 'Código': '41', 'Estado': 'Paraná', 'UF': 'PR', 'Região': 'Sul' },
        { 'Código': '51', 'Estado': 'Mato Grosso', 'UF': 'MT', 'Região': 'Centro-Oeste' },
        { 'Código': '52', 'Estado': 'Goiás', 'UF': 'GO', 'Região': 'Centro-Oeste' }
      ]
    },
    {
      id: 't2',
      nome: 'Metas Zootécnicas - GMD',
      descricao: 'Referência de ganho de médio diário por raça, sexo e sistema de manejo.',
      ultimaSincronizacao: '10/03/2026 14:30',
      colunas: ['Raça', 'Fase', 'Manejo', 'Meta GMD (kg)'],
      dados: [
        { 'Raça': 'Nelore', 'Fase': 'Recria', 'Manejo': 'Pasto + Supl.', 'Meta GMD (kg)': 0.550 },
        { 'Raça': 'Nelore', 'Fase': 'Engorda', 'Manejo': 'Confinamento', 'Meta GMD (kg)': 1.450 },
        { 'Raça': 'Angus', 'Fase': 'Recria', 'Manejo': 'Pasto Intensivo', 'Meta GMD (kg)': 0.850 },
        { 'Raça': 'Cruzamento', 'Fase': 'Terminação', 'Manejo': 'TIP', 'Meta GMD (kg)': 1.100 }
      ]
    },
    {
      id: 't3',
      nome: 'Calendário Sanitário Padrão',
      descricao: 'Protocolos recomendados de vacinação e vermifugação por época do ano.',
      ultimaSincronizacao: '05/03/2026 11:00',
      colunas: ['Evento', 'Período', 'Público Alvo', 'Obrigatório'],
      dados: [
        { 'Evento': 'Vacinação contra Aftosa', 'Período': 'Maio/Novembro', 'Público Alvo': 'Todo o Rebanho', 'Obrigatório': 'Sim' },
        { 'Evento': 'Brucelose', 'Período': 'Contínuo', 'Público Alvo': 'Fêmeas 3-8 meses', 'Obrigatório': 'Sim' },
        { 'Evento': 'Raiva', 'Período': 'Anual', 'Público Alvo': 'Zonas de Risco', 'Obrigatório': 'Não' },
        { 'Evento': 'Clostridioses', 'Período': 'Desmame', 'Público Alvo': 'Bezerros', 'Obrigatório': 'Não' }
      ]
    }
  ]);

  // Categories Pagination
  const {
    currentPage: currentCatPage,
    totalPages: totalCatPages,
    paginatedData: paginatedCategories,
    itemsPerPage: catItemsPerPage,
    setItemsPerPage: setCatItemsPerPage,
    startIndex: catStartIndex,
    endIndex: catEndIndex,
    totalItems: totalCatItems,
    goToPage: goToCatPage,
    nextPage: nextCatPage,
    prevPage: prevCatPage,
  } = usePagination({ 
    data: categories.filter((c: Categoria) => c.nome.toLowerCase().includes(searchTerm.toLowerCase())), 
    initialItemsPerPage: 10 
  });

  // Units Pagination
  const {
    currentPage: currentUnitPage,
    totalPages: totalUnitPages,
    paginatedData: paginatedUnidades,
    itemsPerPage: unitItemsPerPage,
    setItemsPerPage: setUnitItemsPerPage,
    startIndex: unitStartIndex,
    endIndex: unitEndIndex,
    totalItems: totalUnitItems,
    goToPage: goToUnitPage,
    nextPage: nextUnitPage,
    prevPage: prevUnitPage,
  } = usePagination({ 
    data: unidades.filter((u: UnidadeMedida) => u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || u.sigla.toLowerCase().includes(searchTerm.toLowerCase())), 
    initialItemsPerPage: 10 
  });

  // Tables Pagination
  const {
    currentPage: currentTablePage,
    totalPages: totalTablePages,
    paginatedData: paginatedTables,
    itemsPerPage: tableItemsPerPage,
    setItemsPerPage: setTableItemsPerPage,
    startIndex: tableStartIndex,
    endIndex: tableEndIndex,
    totalItems: totalTableItems,
    goToPage: goToTablePage,
    nextPage: nextTablePage,
    prevPage: prevTablePage,
  } = usePagination({ 
    data: tabelasReferencia.filter((t: TabelaReferencia) => t.nome.toLowerCase().includes(searchTerm.toLowerCase())), 
    initialItemsPerPage: 10 
  });

  const handleOpenModal = (type: 'categoria' | 'subcategoria' | 'unidade', item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    if (type === 'unidade') {
        setFormData({ 
            nome: item?.nome || '', 
            sigla: item?.sigla || '', 
            tipo: item?.tipo || 'Peso', 
            descricao: '', 
            empresaCnpj: '',
            contaContabilId: ''
        });
    } else {
        setFormData({ 
            nome: item?.nome || '', 
            descricao: item?.descricao || '', 
            sigla: '', 
            tipo: '', 
            empresaCnpj: item?.empresaCnpj || '',
            contaContabilId: item?.contaContabilId || ''
        });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (modalType === 'categoria') {
        if (editingItem) {
            dataService.saveItem('categorias_definicao', { ...editingItem, nome: formData.nome });
        } else {
            const newCat: Categoria = {
                id: Math.random().toString(36).substr(2, 9),
                id_cor: 'text-gray-600',
                nome: formData.nome,
                subcategoriasCount: 0,
                subcategorias: []
            };
            dataService.saveItem('categorias_definicao', newCat);
        }
    } else if (modalType === 'subcategoria' && selectedCategory) {
        if (editingItem) {
            const updatedSub = selectedCategory.subcategorias.map((s: Subcategoria) => 
                s.id === editingItem.id ? { ...s, ...formData } : s
            );
            const updatedCat = { ...selectedCategory, subcategorias: updatedSub };
            dataService.saveItem('categorias_definicao', updatedCat);
            setSelectedCategory(updatedCat);
        } else {
            const newSub: Subcategoria = {
                id: Math.random().toString(36).substr(2, 9),
                nome: formData.nome,
                descricao: formData.descricao,
                status: 'Ativo',
                empresaCnpj: formData.empresaCnpj,
                contaContabilId: formData.contaContabilId
            };
            const updatedCat = { 
                ...selectedCategory, 
                subcategorias: [...selectedCategory.subcategorias, newSub],
                subcategoriasCount: (selectedCategory.subcategoriasCount || 0) + 1
            };
            dataService.saveItem('categorias_definicao', updatedCat);
            setSelectedCategory(updatedCat);
        }
    } else if (modalType === 'unidade') {
        if (editingItem) {
            dataService.saveItem('unidades_medida', { ...editingItem, nome: formData.nome, sigla: formData.sigla, tipo: formData.tipo });
        } else {
            const newUnit: UnidadeMedida = {
                id: Math.random().toString(36).substr(2, 9),
                sigla: formData.sigla,
                nome: formData.nome,
                tipo: formData.tipo
            };
            dataService.saveItem('unidades_medida', newUnit);
        }
    }
    setIsModalOpen(false);
  };

  const handleDeleteSub = (id: string) => {
    if (!selectedCategory) return;
    const updatedSub = selectedCategory.subcategorias.filter((s: Subcategoria) => s.id !== id);
    const updatedCat = { 
        ...selectedCategory, 
        subcategorias: updatedSub,
        subcategoriasCount: updatedSub.length
    };
    dataService.saveItem('categorias_definicao', updatedCat);
    setSelectedCategory(updatedCat);
  };

  const handleDeleteCategory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir esta categoria e todas as suas subcategorias?')) {
        dataService.deleteItem('categorias_definicao', id);
    }
  };

  const handleEditCategory = (e: React.MouseEvent, cat: Categoria) => {
    e.stopPropagation();
    handleOpenModal('categoria', cat);
  };

  const handleDeleteUnit = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta unidade de medida?')) {
        dataService.deleteItem('unidades_medida', id);
    }
  };

  const TabItem: React.FC<{ tab: DefinicaoTab; icon: any; label: string }> = ({ tab, icon: Icon, label }) => (
    <button 
      className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
      onClick={() => {
        setActiveTab(tab);
        setSelectedCategory(null);
        setSelectedTable(null);
        setSearchTerm('');
      }}
    >
      <Icon size={20} strokeWidth={3} />
      <span>{label}</span>
      {activeTab === tab && <div className="active-indicator" />}
    </button>
  );

  return (
    <div className="definicao-wrapper">
      <nav className="subpage-breadcrumb">
        <Link to="/admin/usuarios">Admin</Link>
        <ChevronRight size={14} />
        <span>Definições & Parâmetros</span>
      </nav>
      <div className="page-header-row">
        <div className="header-left">
          <h1>Definições e Parâmetros</h1>
          <p className="text-slate-500 font-semibold mt-1">Gerencie taxonomias, unidades e índices técnicos do sistema</p>
        </div>
        <div className="header-actions">
          <button className="btn-premium-solid indigo h-11 px-6 gap-2" onClick={() => handleOpenModal(activeTab === 'unidades' ? 'unidade' : selectedCategory ? 'subcategoria' : 'categoria')}>
            <Plus size={18} strokeWidth={3} /> 
            <span>{activeTab === 'unidades' ? 'Nova Unidade' : selectedCategory ? 'Nova Subcategoria' : 'Nova Categoria'}</span>
          </button>
        </div>
      </div>

      <div className="definicao-container">
        <aside className="definicao-sidebar">
          <TabItem tab="categorias" icon={Layers} label="Categorias" />
          <TabItem tab="unidades" icon={Ruler} label="Unidades de Medida" />
          <TabItem tab="parametros" icon={Activity} label="Parâmetros Técnicos" />
          <TabItem tab="pagamentos" icon={DollarSign} label="Pagamento & PIX" />
          <TabItem tab="tabelas" icon={TableIcon} label="Tabelas de Referência" />
        </aside>

        <main className="definicao-content">
          {activeTab === 'categorias' && (
            <div className="content-section fade-in">
              {!selectedCategory ? (
                <>
                  <div className="section-header">
                    <div>
                        <h3>Categorias Customizadas</h3>
                        <p>Gerencie os agrupamentos globais do sistema</p>
                    </div>
                    <div className="input-with-icon search-box-refined">
                      <Search size={18} className="field-icon" />
                      <input 
                        type="text" 
                        placeholder="Buscar categorias..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="data-grid">
                    {paginatedCategories.map((cat: Categoria, i: number) => (
                      <div key={cat.id} className="data-card-premium animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => setSelectedCategory(cat)}>
                        <div className="card-info-premium">
                          <div className={`icon-wrapper-premium ${cat.id_cor.replace('text-', 'bg-').replace('-600', '-100')} ${cat.id_cor}`}>
                            <Layers size={24} strokeWidth={3} />
                          </div>
                          <div>
                            <h4>{cat.nome}</h4>
                            <span className="sub-count">{cat.subcategoriasCount} subcategorias</span>
                          </div>
                        </div>
                        <div className="card-actions-premium flex gap-2">
                          <button className="action-btn-global btn-edit btn-sm" onClick={(e) => handleEditCategory(e, cat)}>
                            <Edit2 size={16} strokeWidth={3} />
                          </button>
                          <button className="action-btn-global btn-delete btn-sm" onClick={(e) => handleDeleteCategory(e, cat.id)}>
                            <Trash2 size={16} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <TablePagination
                    currentPage={currentCatPage}
                    totalPages={totalCatPages}
                    itemsPerPage={catItemsPerPage}
                    startIndex={catStartIndex}
                    endIndex={catEndIndex}
                    totalItems={totalCatItems}
                    onPageChange={goToCatPage}
                    onNextPage={nextCatPage}
                    onPrevPage={prevCatPage}
                    onItemsPerPageChange={setCatItemsPerPage}
                    label="categorias"
                  />

                </>
              ) : (
                <div className="drill-down-view">
                   <div className="section-header drill-down-header">
                    <div className="header-left-drill">
                        <button className="btn-back" onClick={() => setSelectedCategory(null)}>
                            <ArrowLeft size={20} strokeWidth={3} />
                        </button>
                        <div>
                            <div className="breadcrumb">Categorias / {selectedCategory.nome}</div>
                            <h3>{selectedCategory.nome}</h3>
                        </div>
                    </div>
                    <div className="input-with-icon search-box-refined">
                      <Search size={18} strokeWidth={3} className="field-icon" />
                      <input 
                        type="text" 
                        placeholder={`Buscar em ${selectedCategory.nome}...`} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="table-wrapper card">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Nome da Subcategoria</th>
                                <th>Descrição</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedCategory.subcategorias
                                .filter((s: Subcategoria) => s.nome?.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((sub: Subcategoria) => (
                                <tr key={sub.id}>
                                    <td><strong>{sub.nome}</strong></td>
                                    <td>{sub.descricao}</td>
                                    <td>
                                        <span className={`status-badge ${sub.status.toLowerCase()}`}>
                                            {sub.status}
                                        </span>
                                        {sub.contaContabilId && (
                                            <div className="account-link-badge">
                                                <small>Conta: {planoContas.find(c => c.id === sub.contaContabilId)?.nome}</small>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal('subcategoria', sub)}>
                                                <Edit2 size={16} strokeWidth={3} />
                                            </button>
                                            <button className="action-btn-global btn-delete" title="Excluir" onClick={() => handleDeleteSub(sub.id)}>
                                                <Trash2 size={16} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'unidades' && (
            <div className="content-section fade-in">
              <div className="section-header">
                <div>
                   <h3>Unidades de Medida</h3>
                   <p>Configure as unidades utilizadas em pesagens, áreas e estoque.</p>
                </div>
                <div className="input-with-icon search-box-refined">
                  <Search size={18} className="field-icon" />
                  <input 
                    type="text" 
                    placeholder="Buscar unidades..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-wrapper card">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Sigla</th>
                      <th>Nome por Extenso</th>
                      <th>Tipo</th>
                      <th style={{ textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUnidades.map((unit: UnidadeMedida) => (
                        <tr key={unit.id}>
                            <td><strong className="text-emerald-600">{unit.sigla}</strong></td>
                            <td>{unit.nome}</td>
                            <td>
                                <span className="unit-type-tag">{unit.tipo}</span>
                            </td>
                            <td>
                                <div className="table-actions">
                                    <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal('unidade', unit)}>
                                        <Edit2 size={16} strokeWidth={3} />
                                    </button>
                                    <button className="action-btn-global btn-delete" title="Excluir" onClick={() => handleDeleteUnit(unit.id)}>
                                        <Trash2 size={16} strokeWidth={3} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TablePagination
                currentPage={currentUnitPage}
                totalPages={totalUnitPages}
                itemsPerPage={unitItemsPerPage}
                startIndex={unitStartIndex}
                endIndex={unitEndIndex}
                totalItems={totalUnitItems}
                onPageChange={goToUnitPage}
                onNextPage={nextUnitPage}
                onPrevPage={prevUnitPage}
                onItemsPerPageChange={setUnitItemsPerPage}
                label="registros"
              />
            </div>
          )}

          {activeTab === 'parametros' && (
            <div className="content-section">
              <div className="section-header">
                <h3>Parâmetros Técnicos</h3>
                <p>Defina índices de conversão e metas globais de desempenho.</p>
              </div>

              <div className="params-grid">
                <div className="param-item">
                  <label>Peso da Arroba (kg)</label>
                  <div className="input-group">
                    <input type="number" defaultValue="15" />
                    <span className="unit">kg</span>
                  </div>
                </div>
                <div className="param-item">
                  <label>Rendimento de Carcaça Padrão (%)</label>
                  <div className="input-group">
                    <input type="number" defaultValue="52" />
                    <span className="unit">%</span>
                  </div>
                </div>
                <div className="param-item">
                  <label>Intervalo de Pesagem (dias)</label>
                  <div className="input-group">
                    <input type="number" defaultValue="30" />
                    <span className="unit">dias</span>
                  </div>
                </div>
              </div>
              <div className="">
                <button className="btn-premium-solid indigo h-11 px-8 gap-2">
                  <Save size={18} strokeWidth={3} />
                  <span>Salvar Parâmetros</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'tabelas' && (
            <div className="content-section fade-in">
              {!selectedTable ? (
                <>
                  <div className="section-header">
                    <div>
                      <h3>Tabelas de Referência</h3>
                      <p>Dicionários técnicos e bibliotecas sincronizadas com fontes externas.</p>
                    </div>
                    <div className="input-with-icon search-box-refined">
                      <Search size={18} className="field-icon" />
                      <input 
                        type="text" 
                        placeholder="Buscar tabelas..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="data-grid tables-grid">
                    {paginatedTables.map((tabela: TabelaReferencia, i: number) => (
                      <div key={tabela.id} className="data-card-premium table-card-premium animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => setSelectedTable(tabela)}>
                        <div className="card-info-premium">
                          <div className="icon-wrapper-premium bg-emerald-50 text-emerald-600 border border-emerald-100">
                             <TableIcon size={24} strokeWidth={3} />
                          </div>
                          <div className="table-details-premium">
                            <h4>{tabela.nome}</h4>
                            <p className="table-desc-premium">{tabela.descricao}</p>
                            <div className="sync-status-premium">
                                <Activity size={14} strokeWidth={3} />
                                <span>Última sincronia: {tabela.ultimaSincronizacao}</span>
                            </div>
                          </div>
                        </div>
                        <div className="card-actions-premium">
                          <button 
                            className={`action-btn-global btn-view btn-icon ${isSyncing === tabela.id ? 'syncing' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsSyncing(tabela.id);
                                setTimeout(() => setIsSyncing(null), 2000);
                            }}
                          >
                            <Activity size={16} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <TablePagination
                    currentPage={currentTablePage}
                    totalPages={totalTablePages}
                    itemsPerPage={tableItemsPerPage}
                    startIndex={tableStartIndex}
                    endIndex={tableEndIndex}
                    totalItems={totalTableItems}
                    onPageChange={goToTablePage}
                    onNextPage={nextTablePage}
                    onPrevPage={prevTablePage}
                    onItemsPerPageChange={setTableItemsPerPage}
                    label="tabelas"
                  />

                </>
              ) : (
                <div className="drill-down-view">
                   <div className="section-header drill-down-header">
                    <div className="header-left-drill">
                        <button className="btn-back" onClick={() => setSelectedTable(null)}>
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="breadcrumb">Tabelas / {selectedTable.nome}</div>
                            <h3>{selectedTable.nome}</h3>
                        </div>
                    </div>
                    <div className="input-with-icon search-box-refined">
                      <Search size={18} className="field-icon" />
                      <input 
                        type="text" 
                        placeholder={`Buscar em ${selectedTable.nome}...`} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="table-wrapper card">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                {selectedTable.colunas.map(col => (
                                    <th key={col}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {selectedTable.dados
                                .filter(linha => 
                                    Object.values(linha).some(val => val.toString().toLowerCase().includes(searchTerm.toLowerCase()))
                                )
                                .map((linha, idx) => (
                                <tr key={idx}>
                                    {selectedTable.colunas.map((col, cIdx) => (
                                        <td key={cIdx}>
                                            {cIdx === 0 ? <strong>{linha[col]}</strong> : linha[col]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pagamentos' && (
            <div className="content-section fade-in">
              <div className="section-header">
                <div>
                  <h3>Gestão de Cobranças & Pagamentos (SaaS)</h3>
                  <p>Habilite e configure os métodos de recebimento disponíveis para os usuários.</p>
                </div>
              </div>

              <div className="payment-methods-grid mt-6">
                {/* PIX SECTION */}
                <div className="card-premium p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="icon-badge sm emerald">
                        <QrCode size={20} strokeWidth={3} />
                      </div>
                      <h4 style={{ margin: 0 }}>Recebimento via PIX</h4>
                    </div>
                    <div className="custom-switch">
                      <input 
                        type="checkbox" 
                        id="pixToggle" 
                        checked={paymentConfig.pix.is_active}
                        onChange={(e) => setPaymentConfig({
                          ...paymentConfig,
                          pix: { ...paymentConfig.pix, is_active: e.target.checked }
                        })}
                      />
                      <label htmlFor="pixToggle"></label>
                    </div>
                  </div>

                  <div className="form-grid-premium">
                    <div className="form-group-premium full-width">
                      <label>Chave PIX</label>
                      <div className="input-with-icon">
                        <input 
                          type="text" 
                          value={paymentConfig.pix.pix_key}
                          onChange={(e) => setPaymentConfig({
                            ...paymentConfig,
                            pix: { ...paymentConfig.pix, pix_key: e.target.value }
                          })}
                          placeholder="E-mail, CPF, CNPJ ou Aleatória"
                        />
                        <Hash size={18} strokeWidth={3} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group-premium">
                      <label>Beneficiário</label>
                      <div className="input-with-icon">
                        <input 
                          type="text" 
                          value={paymentConfig.pix.merchant_name}
                          onChange={(e) => setPaymentConfig({
                            ...paymentConfig,
                            pix: { ...paymentConfig.pix, merchant_name: e.target.value }
                          })}
                        />
                        <User size={18} strokeWidth={3} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group-premium">
                      <label>Cidade</label>
                      <div className="input-with-icon">
                        <input 
                          type="text" 
                          value={paymentConfig.pix.merchant_city}
                          onChange={(e) => setPaymentConfig({
                            ...paymentConfig,
                            pix: { ...paymentConfig.pix, merchant_city: e.target.value }
                          })}
                        />
                        <MapPin size={18} strokeWidth={3} className="field-icon" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CREDIT CARD SECTION */}
                <div className="card-premium p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="icon-badge sm emerald">
                        <CreditCard size={20} strokeWidth={3} />
                      </div>
                      <h4 style={{ margin: 0 }}>Cartão de Crédito</h4>
                    </div>
                    <div className="custom-switch">
                      <input 
                        type="checkbox" 
                        id="cardToggle" 
                        checked={paymentConfig.card.is_active}
                        onChange={(e) => setPaymentConfig({
                          ...paymentConfig,
                          card: { ...paymentConfig.card, is_active: e.target.checked }
                        })}
                      />
                      <label htmlFor="cardToggle"></label>
                    </div>
                  </div>

                  <div className="form-grid-premium">
                    <div className="form-group-premium full-width">
                      <label>Link de Checkout Externo (URL)</label>
                      <div className="input-with-icon">
                        <input 
                          type="text" 
                          value={paymentConfig.card.checkout_url}
                          onChange={(e) => setPaymentConfig({
                            ...paymentConfig,
                            card: { ...paymentConfig.card, checkout_url: e.target.value }
                          })}
                          placeholder="Ex: https://buy.stripe.com/..."
                        />
                        <LinkIcon size={18} className="field-icon" />
                      </div>
                      <small className="text-slate-500 font-semibold">Utilize o Stripe Payment Links ou Mercado Pago Checkout para taxas reduzidas.</small>
                    </div>
                  </div>
                </div>

                {/* CHECKOUT TRANSPARENTE SECTION */}
                <div className="card-premium p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="icon-badge sm text-blue-600 bg-blue-50">
                        <LinkIcon size={20} strokeWidth={3} />
                      </div>
                      <h4 style={{ margin: 0 }}>Checkout Transparente</h4>
                    </div>
                    <div className="custom-switch">
                      <input 
                        type="checkbox" 
                        id="transparentCheckoutToggle" 
                        checked={paymentConfig.transparent_checkout.is_active}
                        onChange={(e) => setPaymentConfig({
                          ...paymentConfig,
                          transparent_checkout: { ...paymentConfig.transparent_checkout, is_active: e.target.checked }
                        })}
                      />
                      <label htmlFor="transparentCheckoutToggle"></label>
                    </div>
                  </div>

                  <div className="form-grid-premium">
                    <div className="form-group-premium full-width">
                      <label>URL do Endpoint de Pagamento</label>
                      <div className="input-with-icon">
                        <input 
                          type="text" 
                          value={paymentConfig.transparent_checkout.endpoint_url}
                          onChange={(e) => setPaymentConfig({
                            ...paymentConfig,
                            transparent_checkout: { ...paymentConfig.transparent_checkout, endpoint_url: e.target.value }
                          })}
                          placeholder="Ex: https://api.seupagamento.com/checkout"
                        />
                        <LinkIcon size={18} className="field-icon" />
                      </div>
                      <small className="text-slate-500 font-semibold">Integre com seu próprio gateway de pagamento para uma experiência de checkout totalmente personalizada.</small>
                    </div>
                    <div className="form-group-premium full-width">
                      <label>Chave de API (Secret Key)</label>
                      <div className="input-with-icon">
                        <input 
                          type="password" 
                          value={paymentConfig.transparent_checkout.api_key}
                          onChange={(e) => setPaymentConfig({
                            ...paymentConfig,
                            transparent_checkout: { ...paymentConfig.transparent_checkout, api_key: e.target.value }
                          })}
                          placeholder="Sua chave secreta do gateway de pagamento"
                        />
                        <Key size={18} className="field-icon" />
                      </div>
                      <small className="text-slate-500 font-semibold">Mantenha esta chave segura. Ela é usada para autenticar suas requisições.</small>
                    </div>
                  </div>
                </div>

                {/* BOLETO SECTION */}
                <div className="card-premium p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="icon-badge sm emerald">
                        <FileText size={20} />
                      </div>
                      <h4 style={{ margin: 0 }}>Boleto Bancário</h4>
                    </div>
                    <div className="custom-switch">
                      <input 
                        type="checkbox" 
                        id="boletoToggle" 
                        checked={paymentConfig.boleto.is_active}
                        onChange={(e) => setPaymentConfig({
                          ...paymentConfig,
                          boleto: { ...paymentConfig.boleto, is_active: e.target.checked }
                        })}
                      />
                      <label htmlFor="boletoToggle"></label>
                    </div>
                  </div>

                  <div className="form-grid-premium">
                    <div className="form-group-premium full-width">
                      <label>Instruções para o Usuário</label>
                      <div className="input-with-icon textarea-icon">
                        <textarea 
                          rows={3}
                          value={paymentConfig.boleto.instructions}
                          onChange={(e) => setPaymentConfig({
                            ...paymentConfig,
                            boleto: { ...paymentConfig.boleto, instructions: e.target.value }
                          })}
                          placeholder="Como o usuário deve proceder para pagar via boleto?"
                        />
                        <Info size={18} className="field-icon" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-start">
                <button 
                  className="btn-premium-solid indigo px-8" 
                  onClick={handleSavePayment}
                  disabled={isSavingPix}
                >
                  {isSavingPix ? <RefreshCw size={18} className="spinning" /> : <Save size={18} strokeWidth={3} />}
                  <span>{isSavingPix ? 'Salvando...' : 'Salvar Todas as Configurações'}</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingItem ? 'Editar' : 'Nova'} ${modalType === 'categoria' ? 'Categoria' : modalType === 'subcategoria' ? 'Subcategoria' : 'Unidade'}`}
        size="md"
        icon={modalType === 'unidade' ? Ruler : modalType === 'subcategoria' ? Layers : Settings}
      >
        <div className="modal-body-premium">
          {modalType === 'unidade' ? (
            <div className="form-grid-premium">
                <div className="form-group-premium">
                    <label>Sigla</label>
                    <div className="input-with-icon">
                        <input 
                            type="text" 
                            value={formData.sigla}
                            onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                            placeholder="Ex: kg"
                        />
                        <Ruler size={18} className="field-icon" />
                    </div>
                </div>
                <div className="form-group-premium">
                    <label>Nome por Extenso</label>
                    <div className="input-with-icon">
                        <input 
                            type="text" 
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            placeholder="Ex: Quilograma"
                        />
                        <FileText size={18} className="field-icon" />
                    </div>
                </div>
                <div className="form-group-premium full-width">
                    <label>Tipo de Grandeza</label>
                    <div className="input-with-icon">
                        <select 
                            value={formData.tipo}
                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        >
                            <option value="Peso">Peso</option>
                            <option value="Peso (Rural)">Peso (Rural)</option>
                            <option value="Área">Área</option>
                            <option value="Volume">Volume</option>
                            <option value="Quantidade">Quantidade</option>
                            <option value="Tempo">Tempo</option>
                        </select>
                        <Layers size={18} className="field-icon" />
                    </div>
                </div>
            </div>
          ) : (
            <div className="form-grid-premium">
              <div className="form-group-premium full-width">
                <label>Nome</label>
                <div className="input-with-icon">
                    <input 
                    type="text" 
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder={`Ex: ${modalType === 'categoria' ? 'Patrimônio' : 'Vacas Nelore'}`}
                    />
                    <Layers size={18} className="field-icon" />
                </div>
              </div>
              
              <div className="form-group-premium full-width">
                <label>Descrição</label>
                <textarea 
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva a finalidade desta classificação..."
                  rows={3}
                />
              </div>
              
              {selectedCategory?.nome === 'Locais de Estoque' && modalType === 'subcategoria' && (
                <div className="form-group-premium full-width">
                  <label>Empresa Responsável</label>
                  <select 
                    value={formData.empresaCnpj}
                    onChange={(e) => setFormData({ ...formData, empresaCnpj: e.target.value })}
                  >
                    <option value="">Selecione a empresa...</option>
                    {companies
                      .filter((c: Company) => c.status === 'Ativa')
                      .map((company: Company) => (
                        <option key={company.id} value={company.cnpj}>
                          {company.nomeFantasia || company.razaoSocial} ({company.cnpj})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {(selectedCategory?.nome === 'Locais de Estoque' || selectedCategory?.nome === 'Contas de Resultado' || selectedCategory?.nome === 'Insumos' || selectedCategory?.nome === 'Centros de Custo') && modalType === 'subcategoria' && (
                <div className="form-group-premium full-width">
                  <label>Vínculo Plano de Contas</label>
                  <select 
                    value={formData.contaContabilId}
                    onChange={(e) => setFormData({ ...formData, contaContabilId: e.target.value })}
                    required
                  >
                    <option value="">Selecione a conta analítica...</option>
                    {planoContas
                      .filter((c: AccountingAccount) => {
                        if (selectedCategory?.nome === 'Locais de Estoque') return c.flagEstoque && c.tipo === 'Analítica';
                        return (c.codigo.startsWith('5') || c.codigo.startsWith('6')) && c.tipo === 'Analítica';
                      })
                      .map((account: AccountingAccount) => (
                        <option key={account.id} value={account.id}>
                          {account.codigo} - {account.nome}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="info-box-premium">
                <Info size={20} />
                <p>As alterações feitas aqui afetam globalmente o comportamento dos módulos vinculados.</p>
              </div>

              <div className="modal-footer-premium flex gap-3">
                <button className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button className="btn-premium-solid indigo" onClick={handleSave}>
                  <Save size={18} strokeWidth={3} />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </StandardModal>
    </div>
  );
};

