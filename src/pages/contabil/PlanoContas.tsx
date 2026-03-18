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
import { TableFilters } from '../../components/TableFilters';
import './PlanoContas.css';

export interface Conta {
  id: string;
  codigo: string;
  nome: string;
  nivel: number;
  tipo: 'Sintética' | 'Analítica';
  flagCaixa: boolean;
  flagEstoque: boolean;
  flagControle: boolean;
  paiId: string | null;
  expanded?: boolean;
}

export const mockContas: Conta[] = [
  { id: '1', codigo: '1', nome: 'Ativo', nivel: 1, tipo: 'Sintética', flagCaixa: false, flagEstoque: false, flagControle: true, paiId: null, expanded: true },
  { id: '2', codigo: '1.1', nome: 'Ativo Circulante', nivel: 2, tipo: 'Sintética', flagCaixa: false, flagEstoque: false, flagControle: true, paiId: '1', expanded: true },
  { id: '3', codigo: '1.1.01', nome: 'Disponibilidades', nivel: 3, tipo: 'Sintética', flagCaixa: false, flagEstoque: false, flagControle: true, paiId: '2', expanded: true },
  { id: '4', codigo: '1.1.01.01', nome: 'Bancos Conta Movimento', nivel: 4, tipo: 'Sintética', flagCaixa: false, flagEstoque: false, flagControle: true, paiId: '3', expanded: true },
  { id: '5', codigo: '1.1.01.01.0001', nome: 'Banco do Brasil - CC', nivel: 5, tipo: 'Analítica', flagCaixa: true, flagEstoque: false, flagControle: false, paiId: '4' },
  { id: '6', codigo: '1.1.01.01.0002', nome: 'Itaú Unibanco - CC', nivel: 5, tipo: 'Analítica', flagCaixa: true, flagEstoque: false, flagControle: false, paiId: '4' },
  { id: '7', codigo: '1.1.02', nome: 'Estoques', nivel: 3, tipo: 'Sintética', flagCaixa: false, flagEstoque: true, flagControle: true, paiId: '2', expanded: true },
  { id: '8', codigo: '1.1.02.01', nome: 'Estoque de Insumos', nivel: 4, tipo: 'Sintética', flagCaixa: false, flagEstoque: true, flagControle: true, paiId: '7', expanded: true },
  { id: '9', codigo: '1.1.02.01.0001', nome: 'Produtos e Insumos Secos', nivel: 5, tipo: 'Analítica', flagCaixa: false, flagEstoque: true, flagControle: false, paiId: '8' },
  { id: '10', codigo: '2', nome: 'Passivo', nivel: 1, tipo: 'Sintética', flagCaixa: false, flagEstoque: false, flagControle: true, paiId: null },
  { id: '11', codigo: '3', nome: 'Patrimônio Líquido', nivel: 1, tipo: 'Sintética', flagCaixa: false, flagEstoque: false, flagControle: true, paiId: null },
  { id: '12', codigo: '5', nome: 'Custos de Produção', nivel: 1, tipo: 'Sintética', flagCaixa: false, flagEstoque: false, flagControle: true, paiId: null, expanded: true },
  { id: '13', codigo: '5.1', nome: 'Custos Diretos', nivel: 2, tipo: 'Sintética', flagCaixa: false, flagEstoque: false, flagControle: true, paiId: '12', expanded: true },
  { id: '14', codigo: '5.1.01', nome: 'Nutrição Animal', nivel: 3, tipo: 'Analítica', flagCaixa: false, flagEstoque: false, flagControle: false, paiId: '13' },
  { id: '15', codigo: '5.1.02', nome: 'Mão de Obra Direta', nivel: 3, tipo: 'Analítica', flagCaixa: false, flagEstoque: false, flagControle: false, paiId: '13' },
  { id: '16', codigo: '6', nome: 'Despesas Operacionais', nivel: 1, tipo: 'Sintética', flagCaixa: false, flagEstoque: false, flagControle: true, paiId: null, expanded: true },
  { id: '17', codigo: '6.1', nome: 'Despesas Administrativas', nivel: 2, tipo: 'Sintética', flagCaixa: false, flagEstoque: false, flagControle: true, paiId: '16', expanded: true },
  { id: '18', codigo: '6.1.01', nome: 'Energia e Água', nivel: 3, tipo: 'Analítica', flagCaixa: false, flagEstoque: false, flagControle: false, paiId: '17' },
];

export const PlanoContas: React.FC = () => {
  const [contas, setContas] = useState<Conta[]>(mockContas);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [filterNatureza, setFilterNatureza] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConta, setEditingConta] = useState<Conta | null>(null);
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

  const handleOpenModal = (conta?: Conta, viewOnly: boolean = false) => {
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

    const accountData = {
      ...formData,
      nivel: calculatedNivel,
      tipo: calculatedTipo
    };

    if (editingConta) {
      setContas(prev => prev.map(c => c.id === editingConta.id ? { ...c, ...accountData } : c));
    } else {
      const newAccount: Conta = {
        ...accountData,
        id: (Date.now()).toString(),
      };
      setContas(prev => [...prev, newAccount]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      setContas(prev => prev.filter(c => c.id !== id));
    }
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setContas(prev => prev.map(c => 
      c.id === id ? { ...c, expanded: !c.expanded } : c
    ));
  };

  const getVisibleContas = () => {
    const visible: Conta[] = [];
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

    return visible.filter(c => {
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
                style={{ paddingLeft: `${(conta.nivel - 1) * 44 + 24}px` }}
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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isViewMode ? 'Visualizar Conta' : editingConta ? 'Editar Conta' : 'Nova Conta Contábil'}</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
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
                
                <div className="form-group">
                  <label>Tipo de Conta</label>
                  <select 
                    value={formData.tipo}
                    disabled={true}
                    className="bg-gray-50"
                  >
                    <option value="Sintética">Sintética (Grupo)</option>
                    <option value="Analítica">Analítica (Lançamento)</option>
                  </select>
                  <span className="text-xs text-green-700 italic mt-1">
                    * Definido automaticamente pelo nível ({formData.nivel})
                  </span>
                </div>

                <div className="form-group full-width">
                  <label>Nome da Conta</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Banco do Brasil - Safra" 
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    disabled={isViewMode}
                  />
                </div>

                <div className="form-group">
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

                <div className="form-group">
                  <label>Natureza</label>
                  <select disabled={isViewMode}>
                    <option>Devedora</option>
                    <option>Credora</option>
                  </select>
                </div>

                <div className="flags-section">
                  <div className={`flag-item ${isViewMode ? 'disabled' : ''}`} onClick={() => !isViewMode && setFormData({...formData, flagControle: !formData.flagControle})}>
                    <div className={`checkbox-custom ${formData.flagControle ? 'checked' : ''}`}>
                      {formData.flagControle && <Check size={14} color="white" />}
                    </div>
                    <span>Conta Controle</span>
                  </div>
                  
                  <div className={`flag-item ${isViewMode ? 'disabled' : ''}`} onClick={() => !isViewMode && setFormData({...formData, flagCaixa: !formData.flagCaixa})}>
                    <div className={`checkbox-custom ${formData.flagCaixa ? 'checked' : ''}`}>
                      {formData.flagCaixa && <Check size={14} color="white" />}
                    </div>
                    <span>Caixa/Banco</span>
                  </div>

                  <div className={`flag-item ${isViewMode ? 'disabled' : ''}`} onClick={() => !isViewMode && setFormData({...formData, flagEstoque: !formData.flagEstoque})}>
                    <div className={`checkbox-custom ${formData.flagEstoque ? 'checked' : ''}`}>
                      {formData.flagEstoque && <Check size={14} color="white" />}
                    </div>
                    <span>Estoque</span>
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer flex gap-3">
              <button className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>
                {isViewMode ? 'Fechar' : 'Cancelar'}
              </button>
              {!isViewMode && (
                <button className="btn-premium-solid indigo" onClick={handleSave}>
                  <span>{editingConta ? 'Salvar Alterações' : 'Salvar Conta'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

