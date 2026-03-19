import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Download, 
  Printer, 
  Eye, 
  Edit2, 
  Trash2, 
  X,
  Check,
  AlertCircle,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { AccountingAccount } from '../../types';
import { StandardModal } from '../../components/StandardModal';
import { TableFilters } from '../../components/TableFilters';
import './PlanoContas.css';

export const PlanoContas: React.FC = () => {
  const contas = useLiveQuery(() => db.plano_contas.toArray()) || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [filterNatureza, setFilterNatureza] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConta, setEditingConta] = useState<AccountingAccount | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    nome: '',
    tipo: 'Todos',
    controle: 'Todos',
    caixa: 'Todos',
    estoque: 'Todos'
  });

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    codigo: '',
    nome: '',
    tipo: 'Analítica' as 'Sintética' | 'Analítica',
    flagCaixa: false,
    flagEstoque: false,
    flagControle: false,
    paiId: '' as string | null,
    nivel: 1
  });

  const handleOpenModal = (conta?: AccountingAccount, viewOnly: boolean = false) => {
    if (conta) {
      setEditingConta(conta);
      setFormData({
        id: conta.id,
        codigo: conta.codigo,
        nome: conta.nome,
        tipo: conta.tipo,
        flagCaixa: conta.flagCaixa,
        flagEstoque: conta.flagEstoque,
        flagControle: conta.flagControle,
        paiId: conta.paiId,
        nivel: conta.nivel
      });
      setIsViewMode(viewOnly);
    } else {
      setEditingConta(null);
      setFormData({
        id: '',
        codigo: '',
        nome: '',
        tipo: 'Analítica',
        flagCaixa: false,
        flagEstoque: false,
        flagControle: false,
        paiId: null,
        nivel: 1
      });
      setIsViewMode(false);
    }
    setIsModalOpen(true);
  };

  const getLevelFromCode = (code: string) => {
    if (!code) return 1;
    const parts = code.split('.');
    return Math.min(parts.length, 5);
  };

  const handleSave = () => {
    if (!formData.codigo || !formData.nome) {
      alert('Por favor, preencha o código e o nome da conta.');
      return;
    }

    const calculatedNivel = getLevelFromCode(formData.codigo);
    const calculatedTipo = (calculatedNivel === 5 ? 'Analítica' : 'Sintética') as 'Sintética' | 'Analítica';

    const accountData: AccountingAccount = {
      ...formData,
      id: editingConta ? editingConta.id : Date.now().toString(),
      nivel: calculatedNivel,
      tipo: calculatedTipo
    };

    dataService.saveItem('plano_contas', accountData);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      dataService.deleteItem('plano_contas', id);
    }
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const conta = contas.find(c => c.id === id);
    if (conta) {
      dataService.saveItem('plano_contas', { ...conta, expanded: !conta.expanded });
    }
  };

  const getVisibleContas = () => {
    const visible: AccountingAccount[] = [];
    const addChildren = (paiId: string | null) => {
      const children = contas.filter(c => c.paiId === paiId);
      children.forEach(child => {
        visible.push(child);
        if (child.expanded) {
          addChildren(child.id);
        }
      });
    };
    addChildren(null);

    return visible.filter((c: AccountingAccount) => {
      const matchesSearch = 
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.codigo.includes(searchTerm) ||
        c.tipo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTipoFilter = filterTipo === 'Todos' || c.tipo === filterTipo;
      const matchesNatureza = filterNatureza === 'Todos' || (filterNatureza === 'Caixa/Banco' ? c.flagCaixa : filterNatureza === 'Estoque' ? c.flagEstoque : c.flagControle);

      const matchesColumnFilters = 
        (columnFilters.nome === '' || c.nome.toLowerCase().includes(columnFilters.nome.toLowerCase()) || c.codigo.includes(columnFilters.nome)) &&
        (columnFilters.tipo === 'Todos' || c.tipo === columnFilters.tipo) &&
        (columnFilters.controle === 'Todos' || (columnFilters.controle === 'Sim' ? c.flagControle : !c.flagControle)) &&
        (columnFilters.caixa === 'Todos' || (columnFilters.caixa === 'Sim' ? c.flagCaixa : !c.flagCaixa)) &&
        (columnFilters.estoque === 'Todos' || (columnFilters.estoque === 'Sim' ? c.flagEstoque : !c.flagEstoque));

      return matchesSearch && matchesTipoFilter && matchesNatureza && matchesColumnFilters;
    });
  };

  const visibleContas = getVisibleContas();

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/contabil/plano">Contabilidade & Fiscal</Link>
        <ChevronRight size={14} />
        <span>Plano de Contas</span>
      </nav>

      <div className="page-header-row">
        <div className="header-left">
          <h1>Plano de Contas</h1>
          <p>Estrutura hierárquica e contábil da fazenda</p>
        </div>
        <div className="header-actions">
          <button className="btn-premium-outline">
            <Download size={18} strokeWidth={3} />
            <span>Exportar</span>
          </button>
          <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
            <Plus size={18} strokeWidth={3} />
            <span>Nova Conta</span>
          </button>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por código ou nome..."
          actionsLabel="Filtragem"
        >
          <button 
            className={`btn-premium-outline h-11 px-4 ${isFiltersOpen ? 'filter-active' : ''}`}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter size={18} strokeWidth={3} />
            <span>{isFiltersOpen ? 'Fechar Filtros' : 'Filtros Avançados'}</span>
          </button>
          <button className="action-btn-global h-11 px-6">
            <Printer size={18} strokeWidth={3} />
          </button>
        </TableFilters>


        <div className="tree-header">
          <span>Código / Nome</span>
          <span>Tipo</span>
          <span>Controle</span>
          <span className="text-center">Caixa</span>
          <span className="text-center">Estoque</span>
          <span>Ações</span>
        </div>

        {isFiltersOpen && (
          <div className="tree-header column-filters-tree">
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
                value={columnFilters.tipo}
                onChange={(e) => setColumnFilters(prev => ({ ...prev, tipo: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="Todos">Todos</option>
                <option value="Sintética">Sintética</option>
                <option value="Analítica">Analítica</option>
              </select>
            </span>
            <span>
              <select 
                className="column-filter-select"
                value={columnFilters.controle}
                onChange={(e) => setColumnFilters(prev => ({ ...prev, controle: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="Todos">Todos</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </span>
            <span className="text-center">
              <select 
                className="column-filter-select"
                value={columnFilters.caixa}
                onChange={(e) => setColumnFilters(prev => ({ ...prev, caixa: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="Todos">Todos</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </span>
            <span className="text-center">
              <select 
                className="column-filter-select"
                value={columnFilters.estoque}
                onChange={(e) => setColumnFilters(prev => ({ ...prev, estoque: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="Todos">Todos</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </span>
            <span></span>
          </div>
        )}

        <div className="tree-content">
          {visibleContas.map((conta) => {
            const hasChildren = contas.some(c => c.paiId === conta.id);
            
            return (
              <div 
                key={conta.id} 
                className={`account-row level-${conta.nivel} ${conta.tipo === 'Analítica' ? 'analitica' : ''}`}
                style={{ paddingLeft: `${((conta.nivel || 1) - 1) * 44 + 24}px` }}
              >
                <div className="account-info">
                  {hasChildren ? (
                    <button className="expander-btn" onClick={(e) => toggleExpand(conta.id, e)}>
                      {conta.expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                  ) : (
                    <div className="spacer-icon analitica-dot">
                      <div className="dot" />
                    </div>
                  )}
                  <span className="account-code">{conta.codigo}</span>
                  <span style={{ 
                    margin: conta.tipo === 'Analítica' ? '0 6px 0 0' : '0 10px', 
                    color: '#888', 
                    fontWeight: conta.tipo === 'Analítica' ? 'bold' : 'normal' 
                  }}>
                    {conta.tipo === 'Analítica' ? '.' : '-'}
                  </span>
                  <span className="account-name">{conta.nome}</span>
                </div>
                
                <div>
                  <span className={`badge ${conta.tipo === 'Sintética' ? 'blue' : 'green'}`}>
                    {conta.tipo}
                  </span>
                </div>

                <div className="text-center">
                  <div className={`flag-dot ${conta.flagControle ? 'active' : 'inactive'}`} />
                </div>

                <div className="text-center">
                  <div className={`flag-dot ${conta.flagCaixa ? 'active' : 'inactive'}`} />
                </div>

                <div className="text-center">
                  <div className={`flag-dot ${conta.flagEstoque ? 'active' : 'inactive'}`} />
                </div>

                <div className="actions-cell">
                  <button className="action-btn-global" onClick={() => handleOpenModal(conta, true)} title="Visualizar">
                    <Eye size={16} strokeWidth={3} />
                  </button>
                  <button className="action-btn-global" onClick={() => handleOpenModal(conta)} title="Editar">
                    <Edit2 size={16} strokeWidth={3} />
                  </button>
                  <button className="action-btn-global btn-delete" onClick={(e) => handleDelete(conta.id, e)} title="Excluir">
                    <Trash2 size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isViewMode ? 'Visualizar Conta' : editingConta ? 'Editar Conta' : 'Nova Conta Contábil'}
        subtitle="Gerencie a estrutura hierárquica do plano de contas"
        icon={FileText}
        size="lg"
        footer={
          <div className="flex gap-3">
            <button className="btn-premium-outline px-8" onClick={() => setIsModalOpen(false)}>
              {isViewMode ? 'Fechar' : 'Cancelar'}
            </button>
            {!isViewMode && (
              <button className="btn-premium-solid indigo px-8" onClick={handleSave}>
                <span>{editingConta ? 'Salvar Alterações' : 'Salvar Conta'}</span>
              </button>
            )}
          </div>
        }
      >
        <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group mb-4">
            <label>Código Estrutural</label>
            <input 
              type="text" 
              placeholder="#.#.##.##.####" 
              value={formData.codigo}
              onChange={(e) => {
                const newCode = e.target.value;
                const newLevel = getLevelFromCode(newCode);
                setFormData({
                  ...formData, 
                  codigo: newCode,
                  nivel: newLevel,
                  tipo: newLevel === 5 ? 'Analítica' : 'Sintética'
                });
              }}
              disabled={isViewMode}
            />
          </div>
          
          <div className="form-group mb-4">
            <label>Tipo de Conta</label>
            <select 
              value={formData.tipo}
              disabled={true}
              className="bg-gray-50 cursor-not-allowed"
            >
              <option value="Sintética">Sintética (Grupo)</option>
              <option value="Analítica">Analítica (Lançamento)</option>
            </select>
            <span className="text-xs text-blue-600 font-semibold mt-1 block">
              * Definido automaticamente pelo nível ({formData.nivel})
            </span>
          </div>

          <div className="form-group col-12 mb-4">
            <label>Nome da Conta</label>
            <input 
              type="text" 
              placeholder="Ex: Banco do Brasil - Safra" 
              value={formData.nome || ''}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              disabled={isViewMode}
            />
          </div>

          <div className="form-group mb-4">
            <label>Conta Pai</label>
            <select 
              value={formData.paiId || ''}
              onChange={(e) => setFormData({...formData, paiId: e.target.value || null})}
              disabled={isViewMode}
            >
              <option value="">Nenhuma</option>
              {contas.filter(c => c.tipo === 'Sintética' && c.id !== formData.id).map(c => (
                <option key={c.id} value={c.id}>{c.codigo} - {c.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-group mb-4">
            <label>Natureza</label>
            <select disabled={isViewMode}>
              <option>Devedora</option>
              <option>Credora</option>
            </select>
          </div>

          <div className="col-12 mt-4">
            <div className="flex gap-6 items-center flex-wrap">
              <div 
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${formData.flagControle ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100'} ${isViewMode ? 'opacity-70 pointer-events-none' : ''}`}
                onClick={() => setFormData({...formData, flagControle: !formData.flagControle})}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 ${formData.flagControle ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'}`}>
                  {formData.flagControle && <Check size={14} color="white" strokeWidth={4} />}
                </div>
                <span className="font-bold text-slate-700">Conta Controle</span>
              </div>
              
              <div 
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${formData.flagCaixa ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100'} ${isViewMode ? 'opacity-70 pointer-events-none' : ''}`}
                onClick={() => setFormData({...formData, flagCaixa: !formData.flagCaixa})}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 ${formData.flagCaixa ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                  {formData.flagCaixa && <Check size={14} color="white" strokeWidth={4} />}
                </div>
                <span className="font-bold text-slate-700">Caixa/Banco</span>
              </div>

              <div 
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${formData.flagEstoque ? 'border-blue-500 bg-blue-50' : 'border-slate-100'} ${isViewMode ? 'opacity-70 pointer-events-none' : ''}`}
                onClick={() => setFormData({...formData, flagEstoque: !formData.flagEstoque})}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 ${formData.flagEstoque ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
                  {formData.flagEstoque && <Check size={14} color="white" strokeWidth={4} />}
                </div>
                <span className="font-bold text-slate-700">Estoque</span>
              </div>
            </div>
          </div>
        </form>
      </StandardModal>
    </div>
  );
};

