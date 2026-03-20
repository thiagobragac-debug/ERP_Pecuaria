import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  MoreHorizontal,
  X,
  Package,
  User,
  Info,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Warehouse,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Movimentacao.css';
import { ModernModal } from '../../components/ModernModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import { useOfflineQuery, useOfflineMutation } from '../../hooks/useOfflineSync';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { db } from '../../services/db';
import { useCompany } from '../../contexts/CompanyContext';
import { MovimentacaoEstoque as MovimentacaoType, Company, Insumo } from '../../types';
import { SummaryCard } from '../../components/SummaryCard';
import { StatusBadge } from '../../components/StatusBadge';
import { SearchableSelect } from '../../components/SearchableSelect';


export const Movimentacao = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    insumo: '',
    localEstoque: 'Todos os Locais',
    tipo: 'Todos',
    status: 'Todos',
    responsavel: ''
  });

  const { user: currentUser, currentOrg } = useAuth();
  const { activeCompanyId: selectedEmpresaId, setActiveCompanyId, companies: empresasList } = useCompany();

  const isOnline = useOnlineStatus();
  const { data: movimentacoes = [], isLoading } = useOfflineQuery<MovimentacaoType>(['movimentacoes_estoque'], 'movimentacoes_estoque');
  const { data: insumos = [] } = useOfflineQuery<Insumo>(['insumos'], 'insumos');
  
  const saveMovMutation = useOfflineMutation<MovimentacaoType>('movimentacoes_estoque', [['movimentacoes_estoque']]);
  const saveInsumoMutation = useOfflineMutation<Insumo>('insumos', [['insumos']]);

  const [selectedMov, setSelectedMov] = useState<MovimentacaoType | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [movType, setMovType] = useState<'Entrada' | 'Saída' | 'Transferência'>('Entrada');
  
  const [formData, setFormData] = useState<Partial<MovimentacaoType>>({
    tipo: 'Entrada',
    data: new Date().toISOString().substring(0, 16),
    status: 'Processado'
  });

  const handleOpenModal = (mov: MovimentacaoType | null = null, viewOnly = false) => {
    if (mov) {
      setSelectedMov(mov);
      setFormData({ ...mov });
      setMovType(mov.tipo);
    } else {
      setSelectedMov(null);
      setFormData({
        tipo: 'Entrada',
        data: new Date().toISOString().substring(0, 16),
        status: 'Processado',
        empresaId: selectedEmpresaId !== 'Todas' ? selectedEmpresaId : undefined
      });
      setMovType('Entrada');
    }
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMov(null);
    setIsViewMode(false);
  };

  const handleSave = async () => {
    if (!formData.insumo_id || !formData.quantidade || !formData.local_origem) {
      alert('Por favor, preencha todos os campos obrigatórios (Produto, Quantidade, Local).');
      return;
    }

    try {
      const finalMov: MovimentacaoType = {
        id: selectedMov?.id || Math.random().toString(36).substr(2, 9),
        tipo: movType,
        insumo_id: formData.insumo_id!,
        insumo_nome: formData.insumo_nome!,
        quantidade: Number(formData.quantidade),
        unidade: formData.unidade || 'un',
        data: formData.data || new Date().toISOString(),
        responsavel: formData.responsavel || 'Usuário Atual',
        motivo: formData.motivo || 'Ajuste manual',
        local_origem: formData.local_origem!,
        local_destino: movType === 'Transferência' ? formData.local_destino : undefined,
        status: formData.status || 'Processado',
        empresaId: formData.empresaId || selectedEmpresaId,
        tenant_id: currentOrg?.id || 'default'
      };

      // Atomic update logic: Save movement and update stock
      await saveMovMutation.mutateAsync(finalMov);
      
      const insumo = insumos.find(i => i.id === finalMov.insumo_id);
      if (insumo) {
        const updatedInsumo = { ...insumo };
        const qty = finalMov.quantidade;
        
        // Ensure maps exist
        updatedInsumo.estoquePorLocal = { ...insumo.estoquePorLocal };
        
        if (movType === 'Entrada') {
          updatedInsumo.estoqueAtual += qty;
          updatedInsumo.estoquePorLocal[finalMov.local_origem] = (updatedInsumo.estoquePorLocal[finalMov.local_origem] || 0) + qty;
          updatedInsumo.ultimaEntrada = finalMov.data;
        } else if (movType === 'Saída') {
          updatedInsumo.estoqueAtual -= qty;
          updatedInsumo.estoquePorLocal[finalMov.local_origem] = (updatedInsumo.estoquePorLocal[finalMov.local_origem] || 0) - qty;
        } else if (movType === 'Transferência' && finalMov.local_destino) {
          // Subtract from origin, add to destination
          updatedInsumo.estoquePorLocal[finalMov.local_origem] = (updatedInsumo.estoquePorLocal[finalMov.local_origem] || 0) - qty;
          updatedInsumo.estoquePorLocal[finalMov.local_destino] = (updatedInsumo.estoquePorLocal[finalMov.local_destino] || 0) + qty;
          // Global balance remains same
        }

        // Update status based on new balance
        if (updatedInsumo.estoqueAtual <= 0) updatedInsumo.status = 'Crítico';
        else if (updatedInsumo.estoqueAtual <= updatedInsumo.estoqueMinimo) updatedInsumo.status = 'Baixo';
        else updatedInsumo.status = 'Ok';

        await saveInsumoMutation.mutateAsync(updatedInsumo);
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving movement:', error);
      alert('Erro ao salvar movimentação.');
    }
  };

  const totalEntradas = movimentacoes
    .filter(m => m.tipo === 'Entrada')
    .reduce((acc, m) => acc + m.quantidade, 0);

  const totalSaidas = movimentacoes
    .filter(m => m.tipo === 'Saída')
    .reduce((acc, m) => acc + m.quantidade, 0);

  const filteredData = movimentacoes.filter(m => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = m.insumo_nome.toLowerCase().includes(searchLower) ||
                         m.motivo.toLowerCase().includes(searchLower) ||
                         m.responsavel.toLowerCase().includes(searchLower) ||
                         m.local_origem.toLowerCase().includes(searchLower) ||
                         (m.local_destino && m.local_destino.toLowerCase().includes(searchLower)) ||
                         m.tipo.toLowerCase().includes(searchLower) ||
                         m.status.toLowerCase().includes(searchLower) ||
                         m.quantidade.toString().includes(searchLower) ||
                         m.unidade.toLowerCase().includes(searchLower);

    const matchesColumnFilters =
      (columnFilters.insumo === '' || m.insumo_nome.toLowerCase().includes(columnFilters.insumo.toLowerCase())) &&
      (columnFilters.localEstoque === 'Todos os Locais' || m.local_origem === columnFilters.localEstoque) &&
      (columnFilters.tipo === 'Todos' || m.tipo === columnFilters.tipo) &&
      (columnFilters.status === 'Todos' || m.status === columnFilters.status) &&
      (columnFilters.responsavel === '' || m.responsavel.toLowerCase().includes(columnFilters.responsavel.toLowerCase()));

    const matchesEmpresa = selectedEmpresaId === 'Todas' || m.empresaId === selectedEmpresaId;

    return matchesSearch && matchesColumnFilters && matchesEmpresa;
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
  } = usePagination({ data: filteredData, initialItemsPerPage: 10 });

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/estoque">Estoque & Inventário</Link>
        <ChevronRight size={14} />
        <span>Movimentação</span>
      </nav>

      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <ArrowLeftRight size={32} strokeWidth={3} />
          </div>
          <div>
            <h1>Movimentação de Estoque</h1>
            <p className="description">Registro manual de entradas, saídas e ajustes de inventário.</p>
          </div>
        </div>
        <div className="connectivity-section mr-4">
          <div className={`online-badge ${isOnline ? 'online' : 'offline'}`}>
            <ArrowLeftRight size={12} />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        <div className="action-buttons">
          <button className="btn-premium-outline">
            <Download size={18} strokeWidth={3} />
            <span>Relatório de Movimento</span>
          </button>
          <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
            <Plus size={18} strokeWidth={3} />
            <span>Nova Movimentação</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <SummaryCard 
          label="Entradas (30 dias)"
          value={`${totalEntradas.toLocaleString('pt-BR')} ${insumos[0]?.unidade || 'kg'}`}
          trend={{ value: '+12% vs mês ant.', type: 'up', icon: TrendingUp }}
          icon={TrendingUp}
          color="emerald"
          delay="0s"
        />
        <SummaryCard 
          label="Saídas (30 dias)"
          value={`${totalSaidas.toLocaleString('pt-BR')} ${insumos[0]?.unidade || 'kg'}`}
          trend={{ value: '-5% vs mês ant.', type: 'down', icon: TrendingDown }}
          icon={TrendingDown}
          color="rose"
          delay="0.1s"
        />
        <SummaryCard 
          label="Ajustes / Perdas"
          value="R$ 1.240,00"
          subtext="Valor acumulado"
          icon={AlertTriangle}
          color="amber"
          delay="0.2s"
        />
        <SummaryCard 
          label="Giro de Estoque"
          value="1.4x"
          subtext="Média mensal"
          icon={Activity}
          color="sky"
          delay="0.3s"
        />
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por insumo, motivo ou responsável..."
          actionsLabel="Filtragem"
        >
          <button
            className={`btn-premium-outline ${isFiltersOpen ? 'filter-active' : ''}`}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter size={18} strokeWidth={3} />
            <span>{isFiltersOpen ? 'Fechar Filtros' : 'Filtros Avançados'}</span>
          </button>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Unidade:</span>
            <select
              className="select-premium-minimal"
              value={selectedEmpresaId}
              onChange={(e) => setActiveCompanyId(e.target.value)}
            >
              <option value="Todas">Todas as Unidades</option>
              {empresasList.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nomeFantasia}</option>
              ))}
            </select>
          </div>
        </TableFilters>


        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Insumo</th>
                <th>Local</th>
                <th>Quantidade</th>
                <th>Data / Hora</th>
                <th>Responsável</th>
                <th>Motivo</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'tipo', type: 'select', options: ['Entrada', 'Saída', 'Transferência'] },
                    { key: 'insumo', type: 'text', placeholder: 'Insumo...' },
                    { key: 'localEstoque', type: 'select', options: ['Depósito Central', 'Farmácia Veterinária', 'Galpão de Nutrição'] },
                    { key: 'quantidade', type: 'empty' },
                    { key: 'data', type: 'empty' },
                    { key: 'responsavel', type: 'text', placeholder: 'Responsável...' },
                    { key: 'motivo', type: 'text', placeholder: 'Motivo...' },
                    { key: 'status', type: 'select', options: ['Processado', 'Pendente', 'Cancelado'] }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                />
              )}
            </thead>
            <tbody>
              {paginatedData.map((mov) => (
                <tr key={mov.id}>
                  <td>
                    <span className={`movement-type ${mov.tipo.toLowerCase()}`}>
                        {mov.tipo === 'Entrada' ? <ArrowUpRight size={14} /> : 
                         mov.tipo === 'Saída' ? <ArrowDownLeft size={14} /> : 
                         <ArrowLeftRight size={14} />}
                        {mov.tipo}
                    </span>
                  </td>
                  <td className="font-bold">{mov.insumo_nome}</td>
                  <td>
                    <div className="location-cell">
                      <Warehouse size={14} />
                      {mov.tipo === 'Transferência' ? (
                        <span className="transfer-path">
                          {mov.local_origem} <ChevronRight size={12} /> {mov.local_destino}
                        </span>
                      ) : mov.local_origem}
                    </div>
                  </td>
                  <td className="font-semibold text-primary">{mov.quantidade} {mov.unidade}</td>
                  <td>
                    <div className="datetime-cell">
                        <span className="date">{new Date(mov.data).toLocaleDateString('pt-BR')}</span>
                        <span className="time">{new Date(mov.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </td>
                  <td>
                    <div className="user-info-cell">
                        <User size={14} />
                        {mov.responsavel}
                    </div>
                  </td>
                  <td title={mov.motivo} className="truncate-cell">{mov.motivo}</td>
                  <td>
                    <StatusBadge status={mov.status} />
                  </td>
                  <td className="text-right">
                    <div className="table-actions">
                      <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(mov, true)}>
                        <Eye size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(mov)}>
                        <Edit size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-delete" title="Excluir" onClick={() => {}}>
                        <Trash2 size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
          label="movimentações"
        />
      </div>

      <ModernModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewMode ? 'Detalhes da Movimentação' : (selectedMov ? 'Editar Movimentação' : 'Nova Movimentação')}
        subtitle="O ajuste manual de estoque impacta diretamente o saldo físico e financeiro."
        icon={ArrowLeftRight}
        footer={
          <>
            <button type="button" className="btn-premium-outline" onClick={handleCloseModal}>
              <X size={18} strokeWidth={3} />
              <span>{isViewMode ? 'Fechar' : 'Cancelar'}</span>
            </button>
            {!isViewMode && (
              <button type="button" className="btn-premium-solid indigo" onClick={handleSave}>
                <span>{selectedMov ? 'Salvar Alterações' : 'Confirmar Lançamento'}</span>
                {selectedMov ? <CheckCircle2 size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
              </button>
            )}
          </>
        }
      >
        <div className="modern-form-section">
          <div className="modern-form-group full-width mb-6">
            <label>Tipo de Movimento</label>
            <div className={`modern-radio-group ${isViewMode ? 'disabled' : ''}`}>
              <button 
                type="button"
                className={`modern-radio-item ${movType === 'Entrada' ? 'active emerald' : ''}`}
                onClick={() => !isViewMode && setMovType('Entrada')}
              >
                <ArrowUpRight size={16} />
                <span>Entrada</span>
              </button>
              <button 
                type="button"
                className={`modern-radio-item ${movType === 'Saída' ? 'active rose' : ''}`}
                onClick={() => !isViewMode && setMovType('Saída')}
              >
                <ArrowDownLeft size={16} />
                <span>Saída</span>
              </button>
              <button 
                type="button"
                className={`modern-radio-item ${movType === 'Transferência' ? 'active indigo' : ''}`}
                onClick={() => !isViewMode && setMovType('Transferência')}
              >
                <ArrowLeftRight size={16} />
                <span>Transferência</span>
              </button>
            </div>
          </div>

          <div className="modern-form-row three-cols">
            <div className="modern-form-group col-span-2">
              <SearchableSelect
                label="Insumo / Produto"
                options={insumos.map(i => ({ id: i.id!, label: i.nome, sublabel: `Saldo: ${i.estoqueAtual} ${i.unidade}` }))}
                value={formData.insumo_id || ''}
                onChange={(val) => {
                  const insumo = insumos.find(i => i.id === val);
                  setFormData({
                    ...formData,
                    insumo_id: val,
                    insumo_nome: insumo?.nome,
                    unidade: insumo?.unidade
                  });
                }}
                disabled={isViewMode}
                required
              />
            </div>
            <div className="modern-form-group">
              <label>Quantidade</label>
              <div className="modern-input-wrapper">
                <input 
                  type="number" 
                  className="modern-input"
                  step="0.01" 
                  value={formData.quantidade || ''} 
                  onChange={(e) => setFormData({...formData, quantidade: parseFloat(e.target.value) || 0})}
                  disabled={isViewMode} 
                  required 
                  placeholder="0,00"
                />
                <span className="modern-unit-label">{formData.unidade || 'un'}</span>
              </div>
            </div>
          </div>

          <div className="modern-form-row">
            <div className="modern-form-group">
              <label>Data / Hora</label>
              <div className="modern-input-wrapper">
                <input 
                  type="datetime-local" 
                  className="modern-input"
                  value={formData.data || ''} 
                  onChange={(e) => setFormData({...formData, data: e.target.value})}
                  disabled={isViewMode} 
                  required 
                />
                <Calendar size={18} className="modern-field-icon" />
              </div>
            </div>
            <div className="modern-form-group">
              <label>Responsável</label>
              <div className="modern-input-wrapper">
                <input 
                  type="text" 
                  className="modern-input"
                  value={formData.responsavel || ''} 
                  onChange={(e) => setFormData({...formData, responsavel: e.target.value})}
                  disabled={isViewMode} 
                  required 
                />
                <User size={18} className="modern-field-icon" />
              </div>
            </div>
          </div>

          <div className="modern-form-group full-width mt-4">
            <label>Motivo / Justificativa</label>
            <div className="modern-input-wrapper">
              <input 
                type="text" 
                className="modern-input"
                value={formData.motivo || ''} 
                onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                disabled={isViewMode} 
                required 
                placeholder="Ex: Quebra de lote, erro de lançamento..." 
              />
              <Info size={18} className="modern-field-icon" />
            </div>
          </div>

          <div className="modal-divider my-6 border-b border-slate-100" />

          <div className="modern-form-row">
            <div className="modern-form-group">
              <label>{movType === 'Transferência' ? 'Local de Origem' : 'Almoxarifado'}</label>
              <div className="modern-input-wrapper">
                <select 
                  className="modern-input pr-10"
                  disabled={isViewMode} 
                  value={formData.local_origem || ''} 
                  onChange={(e) => setFormData({...formData, local_origem: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  <option>Depósito Central</option>
                  <option>Farmácia Veterinária</option>
                  <option>Galpão de Nutrição</option>
                </select>
                <Warehouse size={18} className="modern-field-icon" />
              </div>
            </div>

            {movType === 'Transferência' && (
              <div className="modern-form-group">
                <label>Local de Destino</label>
                <div className="modern-input-wrapper">
                  <select 
                    className="modern-input pr-10"
                    disabled={isViewMode} 
                    value={formData.local_destino || ''} 
                    onChange={(e) => setFormData({...formData, local_destino: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option>Depósito Central</option>
                    <option>Farmácia Veterinária</option>
                    <option>Galpão de Nutrição</option>
                  </select>
                  <Warehouse size={18} className="modern-field-icon" />
                </div>
              </div>
            )}
          </div>

          {!isViewMode && (
            <div className={`info-box-premium mt-6 ${movType === 'Transferência' ? 'blue' : 'amber'}`}>
              <div className="flex gap-3">
                {movType === 'Transferência' ? <Info size={18} /> : <AlertTriangle size={18} />}
                <div className="text-sm">
                  {movType === 'Transferência' 
                    ? 'A saída do local de origem será feita pelo custo médio atual. O local de destino recalculará seu custo médio com base neste valor.'
                    : 'Movimentações manuais não possuem rastreabilidade automática via outros módulos. Use com cautela.'}
                </div>
              </div>
            </div>
          )}
        </div>
      </ModernModal>
    </div>
  );
};
