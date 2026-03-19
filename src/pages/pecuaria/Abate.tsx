import React, { useState, useMemo } from 'react';
import { 
  Beef, 
  Truck, 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  TrendingDown, 
  Scale, 
  DollarSign,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
  FileText,
  AlertCircle,
  Hash,
  Layers
} from 'lucide-react';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useLiveQuery } from 'dexie-react-hooks';
import { Abate as AbateType, Lote } from '../../types';
import { useCompany } from '../../contexts/CompanyContext';
import './Abate.css';

export const Abate = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterFrigorifico, setFilterFrigorifico] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAbate, setSelectedAbate] = useState<AbateType | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const { activeCompanyId } = useCompany();
  
  // Live Queries
  const allAbates = useLiveQuery(() => db.abates.toArray()) || [];
  const allLotes = useLiveQuery(() => db.lotes.toArray()) || [];

  const abates = allAbates.filter(a => activeCompanyId === 'Todas' || a.empresaId === activeCompanyId);
  const lotes = allLotes.filter(l => activeCompanyId === 'Todas' || l.empresaId === activeCompanyId);
  const [columnFilters, setColumnFilters] = useState({
    data: '',
    lote: 'Todos',
    frigorifico: 'Todos',
    qtd: '',
    peso: '',
    quebra: '',
    status: 'Todos'
  });

  const stats = useMemo(() => {
    const totalAnimais = abates.reduce((acc, a) => acc + a.quantidade, 0);
    const realizado = abates.filter(a => a.status === 'Realizado').length;
    const pesoMedioGeral = (abates.reduce((acc, a) => acc + a.pesoMedioCampo, 0) / abates.length || 0).toFixed(1);
    
    return { totalAnimais, realizado, pesoMedioGeral };
  }, [abates]);

  const filteredData = abates.filter(a => {
    const searchLower = searchTerm.toLowerCase();
    const loteNome = lotes.find(l => l.id === a.lote_id)?.nome.toLowerCase() || '';
    
    const matchesSearch = loteNome.includes(searchLower) ||
                         a.frigorifico.toLowerCase().includes(searchLower) ||
                         a.status.toLowerCase().includes(searchLower) ||
                         a.quantidade.toString().includes(searchLower) ||
                         a.pesoMedioCampo.toString().includes(searchLower) ||
                         a.data.toLowerCase().includes(searchLower);
    const matchesStatus = filterStatus === 'Todos' || a.status === filterStatus;
    const matchesFrigorifico = filterFrigorifico === 'Todos' || a.frigorifico === filterFrigorifico;
    
    const matchesColumnFilters = 
      (columnFilters.data === '' || a.data.includes(columnFilters.data)) &&
      (columnFilters.lote === 'Todos' || a.lote_id === columnFilters.lote) &&
      (columnFilters.frigorifico === 'Todos' || a.frigorifico === columnFilters.frigorifico) &&
      (columnFilters.qtd === '' || a.quantidade.toString().includes(columnFilters.qtd)) &&
      (columnFilters.peso === '' || a.pesoMedioCampo.toString().includes(columnFilters.peso)) &&
      (columnFilters.status === 'Todos' || a.status === columnFilters.status);

    return matchesSearch && matchesStatus && matchesFrigorifico && matchesColumnFilters;
  });

  const frigorificos = Array.from(new Set(abates.map(a => a.frigorifico)));

  const { 
    currentPage, 
    totalPages, 
    paginatedData, 
    itemsPerPage,
    goToPage, 
    nextPage, 
    prevPage, 
    setItemsPerPage,
    startIndex, 
    endIndex, 
    totalItems 
  } = usePagination({ data: filteredData, initialItemsPerPage: 10 });

  const handleOpenModal = (abate: AbateType | null = null, viewOnly = false) => {
    setSelectedAbate(abate);
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAbate(null);
    setIsViewMode(false);
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge emerald">
            <Beef size={40} strokeWidth={3} />
          </div>
          <div>
            <h1>Gestão de Abate</h1>
            <p className="description">Controle de saídas, projeção de rendimento e acerto com frigoríficos.</p>
          </div>
        </div>
        <div className="action-buttons">
          <button className="btn-premium-outline h-11 px-6 gap-2">
             <FileText size={20} strokeWidth={3} />
             <span>Relatórios</span>
          </button>
          <button className="btn-premium-solid indigo h-11 px-6 gap-2" onClick={() => handleOpenModal()}>
            <Plus size={20} strokeWidth={3} />
            <span>Programar Abate</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card animate-slide-up" style={{ animationDelay: '0s' }}>
           <div className="summary-info">
              <span className="summary-label">Total para Abate</span>
              <span className="summary-value">{stats.totalAnimais} <small className="text-xl text-slate-400">cab.</small></span>
            <p className="mt-4 text-emerald-600 font-extrabold flex items-center gap-2">
              <Calendar size={18} strokeWidth={2.5} /> Agendados/mês
            </p>
           </div>
           <div className="summary-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <Beef size={36} strokeWidth={3} color="#10b981" />
           </div>
        </div>
        <div className="summary-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
           <div className="summary-info">
              <span className="summary-label">Peso Médio Proj.</span>
              <span className="summary-value">{stats.pesoMedioGeral} <small className="text-xl text-slate-400">kg</small></span>
            <p className="mt-4 text-sky-600 font-extrabold flex items-center gap-2">
              <Scale size={18} strokeWidth={2.5} /> Peso vivo estimado
            </p>
           </div>
           <div className="summary-icon" style={{ background: 'rgba(14, 165, 233, 0.1)' }}>
              <Scale size={36} strokeWidth={3} color="#0ea5e9" />
           </div>
        </div>
        <div className="summary-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
           <div className="summary-info">
              <span className="summary-label">Quebra Média</span>
              <span className="summary-value">4.75 <small className="text-xl text-slate-400">%</small></span>
            <p className="mt-4 text-rose-600 font-extrabold flex items-center gap-2">
              <TrendingDown size={18} strokeWidth={2.5} /> Perda de transporte
            </p>
           </div>
           <div className="summary-icon" style={{ background: 'rgba(244, 63, 94, 0.1)' }}>
              <TrendingDown size={36} strokeWidth={3} color="#f43f5e" />
           </div>
        </div>
        <div className="summary-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
           <div className="summary-info">
              <span className="summary-label">Valor Médio @</span>
              <span className="summary-value">285 <small className="text-xl text-slate-400">R$</small></span>
            <p className="mt-4 text-amber-600 font-extrabold flex items-center gap-2">
              <DollarSign size={18} strokeWidth={2.5} /> Preço recebido
            </p>
           </div>
           <div className="summary-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
              <DollarSign size={36} strokeWidth={3} color="#f59e0b" />
           </div>
        </div>
      </div>

      <div className="abate-main-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por lote, frigorífico, romaneio..."
          onToggleAdvanced={() => setIsFiltersOpen(!isFiltersOpen)}
          isAdvancedOpen={isFiltersOpen}
        />

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Lote / Origem</th>
                <th>Frigorífico</th>
                <th>Qtd</th>
                <th>Peso Médio Campo</th>
                <th>Quebra Est.</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'data', type: 'text', placeholder: 'Data...' },
                    { key: 'lote', type: 'select', options: lotes.map(l => ({ value: l.id, label: l.nome })) as any },
                    { key: 'frigorifico', type: 'select', options: frigorificos },
                    { key: 'qtd', type: 'text', placeholder: 'Qtd...' },
                    { key: 'peso', type: 'text', placeholder: 'Peso...' },
                    { key: 'quebra', type: 'text', placeholder: 'Quebra...' },
                    { key: 'status', type: 'select', options: ['Pendente', 'Aguardando GTA', 'Realizado'] }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                />
              )}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.map((item) => {
                const loteNome = lotes.find(l => l.id === item.lote_id)?.nome || '-';
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td><span className="font-bold text-slate-500">{new Date(item.data).toLocaleDateString('pt-BR')}</span></td>
                    <td>
                      <div className="lote-info-cell flex items-center gap-2">
                         <span className="text-slate-800 font-black text-base">{loteNome}</span>
                         <span className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Invernada Norte</span>
                      </div>
                    </td>
                    <td><span className="font-extrabold text-slate-600">{item.frigorifico}</span></td>
                    <td><span className="badge secondary text-lg">{item.quantidade}</span></td>
                    <td>
                       <div className="weight-row flex items-center gap-3">
                          <span className="main font-bold text-slate-700">{item.pesoMedioCampo} <small className="text-xs text-slate-500">kg</small></span>
                          <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                          <span className="secondary font-black text-emerald-600">{(item.pesoMedioCampo / 30).toFixed(1)} @</span>
                       </div>
                    </td>
                    <td>
                       <div className="yield-info flex items-center gap-2">
                          <strong className="text-rose-600 text-base">{item.quebraEstimada}%</strong>
                          <div className="bg-slate-100 text-[10px] font-black text-slate-500 uppercase px-2 py-0.5 rounded border border-slate-200">
                            Est: {item.pesoLiquidoProjetado}kg
                          </div>
                       </div>
                    </td>
                    <td>
                      <span className={`slaughter-status-pill ${item.status.toLowerCase().replace(' ', '-')}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="actions-cell">
                        <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(item, true)}>
                          <Eye size={18} strokeWidth={3} />
                        </button>
                        <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(item)}>
                          <Edit size={18} strokeWidth={3} />
                        </button>
                        <button className="action-btn-global btn-delete" title="Excluir" onClick={() => dataService.deleteItem('abates', item.id)}>
                          <Trash2 size={18} strokeWidth={3} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
          label="abates"
        />
      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewMode ? 'Detalhes da Programação' : (selectedAbate ? 'Editar Abate' : 'Novo Abate')}
        subtitle="Controle de embarque e rendimento de carcaça."
        icon={Beef}
        size="lg"
        footer={
          <div className="flex gap-3">
            <button type="button" className="btn-premium-outline" onClick={handleCloseModal}>Cancelar</button>
            {!isViewMode && <button type="submit" form="abate-form" className="btn-premium-solid indigo">Confirmar Programação</button>}
          </div>
        }
      >
        <div className="form-sections-grid">
          <form id="abate-form" onSubmit={async (e) => { 
            e.preventDefault(); 
            const formData = new FormData(e.currentTarget);
            
            const quantidade = parseInt(formData.get('quantidade') as string);
            const pesoMedioCampo = parseFloat(formData.get('pesoMedioCampo') as string);
            const quebraEstimada = parseFloat(formData.get('quebraEstimada') as string);
            const pesoLiquidoProjetado = pesoMedioCampo * (1 - quebraEstimada / 100);

            const newAbate: AbateType = {
              ...selectedAbate!,
              id: selectedAbate?.id || Math.random().toString(36).substr(2, 9),
              lote_id: formData.get('lote_id') as string,
              data: formData.get('data') as string,
              frigorifico: formData.get('frigorifico') as string,
              quantidade: quantidade,
              pesoMedioCampo: pesoMedioCampo,
              quebraEstimada: quebraEstimada,
              pesoLiquidoProjetado: pesoLiquidoProjetado,
              status: formData.get('status') as any || 'Pendente',
              valorArroba: parseFloat(formData.get('valorArroba') as string),
              empresaId: activeCompanyId !== 'Todas' ? activeCompanyId : (selectedAbate?.empresaId || undefined),
              tenant_id: 'default'
            };

            await dataService.saveItem('abates', newAbate);
            handleCloseModal(); 
          }}>
            <div className="form-section">
              <h4>Identificação de Embarque</h4>
              <div className="form-grid">
                <div className="form-group col-6">
                  <label>Lote de Origem</label>
                  <div className="input-with-icon">
                    <select name="lote_id" defaultValue={selectedAbate?.lote_id} disabled={isViewMode} required>
                      <option value="">Selecione o lote...</option>
                      {lotes.map(l => (
                          <option key={l.id} value={l.id}>{l.nome}</option>
                      ))}
                    </select>
                    <Layers size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-6">
                  <label>Data de Embarque</label>
                  <div className="input-with-icon">
                    <input type="date" name="data" defaultValue={selectedAbate?.data || new Date().toLocaleDateString('en-CA')} disabled={isViewMode} required />
                    <Calendar size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-8">
                  <label>Frigorífico / Destino</label>
                  <div className="input-with-icon">
                    <input type="text" name="frigorifico" defaultValue={selectedAbate?.frigorifico} disabled={isViewMode} placeholder="Ex: JBS Unidade X" required />
                    <Truck size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-4">
                  <label>Quantidade (Cab.)</label>
                  <div className="input-with-icon">
                    <input type="number" name="quantidade" defaultValue={selectedAbate?.quantidade} disabled={isViewMode} required placeholder="0" />
                    <Beef size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-12">
                  <label>Status</label>
                  <div className="input-with-icon">
                    <select name="status" defaultValue={selectedAbate?.status} disabled={isViewMode} required>
                        <option value="Pendente">Pendente</option>
                        <option value="Aguardando GTA">Aguardando GTA</option>
                        <option value="Realizado">Realizado</option>
                    </select>
                    <AlertCircle size={18} className="field-icon" />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section mt-6">
              <h4>Projeção de Rendimento</h4>
              <div className="form-grid">
                <div className="form-group col-4">
                  <label>Peso Médio Campo (kg)</label>
                  <div className="input-with-icon">
                    <input type="number" name="pesoMedioCampo" step="0.1" defaultValue={selectedAbate?.pesoMedioCampo} disabled={isViewMode} required placeholder="0.0" />
                    <Scale size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-4">
                  <label>Quebra de Jejum Est. (%)</label>
                  <div className="input-with-icon">
                    <input type="number" name="quebraEstimada" step="0.1" defaultValue={selectedAbate?.quebraEstimada || 4.5} disabled={isViewMode} required />
                    <TrendingDown size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-4">
                  <label>Valor da @ (R$)</label>
                  <div className="input-with-icon">
                    <input type="number" name="valorArroba" step="0.01" defaultValue={selectedAbate?.valorArroba} disabled={isViewMode} placeholder="R$ 0,00" />
                    <DollarSign size={18} className="field-icon" />
                  </div>
                </div>
              </div>

              <div className="abate-summary-box mt-6">
                <h4>Resumo do Romaneio de Embarque</h4>
                <div className="summary-details">
                  <div className="summary-row">
                    <span className="label">Peso Total Campo</span>
                    <span className="value">
                      {selectedAbate ? (selectedAbate.quantidade * selectedAbate.pesoMedioCampo).toLocaleString() : '0'} kg
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="label">Peso Líquido Est.</span>
                    <span className="value">
                      {selectedAbate ? (selectedAbate.quantidade * selectedAbate.pesoLiquidoProjetado).toLocaleString() : '0'} kg
                    </span>
                  </div>
                  <div className="summary-row total">
                    <span className="label">Receita Prevista</span>
                    <span className="value">
                      {selectedAbate?.valorArroba ? `R$ ${(selectedAbate.quantidade * (selectedAbate.pesoLiquidoProjetado / 30) * selectedAbate.valorArroba).toLocaleString()}` : 'R$ 0,00'}
                    </span>
                  </div>
                </div>
              </div>

              {!isViewMode && (
                <div className="info-box info-indigo mt-6">
                  <AlertCircle size={18} />
                  <p>Ao salvar, o sistema irá gerar automaticamente um alerta para emissão da GTA e baixa no estoque (caso integrados).</p>
                </div>
              )}
            </div>
          </form>
        </div>
      </StandardModal>
    </div>
  );
};

