import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  ClipboardList,
  Activity,
  AlertTriangle,
  History,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  X,
  Info,
  Calendar
} from 'lucide-react';
import { ModernModal } from '../../components/ModernModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import { useOfflineQuery } from '../../hooks/useOfflineSync';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useLiveQuery } from 'dexie-react-hooks';
import { RegistroSanitario as RegistroSanitarioType, Animal, Lote, MedicamentoUsado, Insumo } from '../../types';
import { useCompany } from '../../contexts/CompanyContext';
import { useAuth } from '../../contexts/AuthContext';
import { SummaryCard } from '../../components/SummaryCard';
import { SearchableSelect } from '../../components/SearchableSelect';
import { StatusBadge } from '../../components/StatusBadge';
import './Sanidade.css';

export const Sanidade = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [selectedRegistro, setSelectedRegistro] = useState<RegistroSanitarioType | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const { activeCompanyId } = useCompany();
  const { currentOrg } = useAuth();
  
  const [formData, setFormData] = useState<Partial<RegistroSanitarioType>>({
    tipo: 'Tratamento',
    data: new Date().toISOString().substring(0, 10),
    status: 'Concluído'
  });
  
  // Live Queries
  const allRegistros = useLiveQuery(() => db.registrosSanitarios.toArray()) || [];
  const allAnimais = useLiveQuery(() => db.animais.toArray()) || [];
  const allLotes = useLiveQuery(() => db.lotes.toArray()) || [];
  const { data: insumos = [] } = useOfflineQuery<Insumo>(['insumos'], 'estocagem');

  const registros = allRegistros.filter(r => activeCompanyId === 'Todas' || r.empresaId === activeCompanyId);
  const animais = allAnimais.filter(a => activeCompanyId === 'Todas' || a.empresaId === activeCompanyId);
  const lotes = allLotes.filter(l => activeCompanyId === 'Todas' || l.empresaId === activeCompanyId);
  const [columnFilters, setColumnFilters] = useState({
    animal: '',
    doenca: '',
    medicamento: '',
    data: '',
    careencia: '',
    status: 'Todos'
  });

  const handleOpenModal = (registro: RegistroSanitarioType | null = null, viewOnly = false) => {
    if (registro) {
      setSelectedRegistro(registro);
      setFormData({ ...registro });
    } else {
      setSelectedRegistro(null);
      setFormData({
        tipo: 'Tratamento',
        data: new Date().toISOString().substring(0, 10),
        status: 'Concluído',
        empresaId: activeCompanyId !== 'Todas' ? activeCompanyId : undefined
      });
    }
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRegistro(null);
    setIsViewMode(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.animal_id || !formData.doenca_motivo || !formData.data) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const newRegistro: RegistroSanitarioType = {
      ...selectedRegistro!,
      id: selectedRegistro?.id || Math.random().toString(36).substr(2, 9),
      animal_id: formData.animal_id,
      lote_id: formData.lote_id,
      tipo: formData.tipo as any,
      doenca_motivo: formData.doenca_motivo,
      data: formData.data!,
      careencia_fim: formData.careencia_fim!,
      status: formData.status as any,
      medicamentos: formData.medicamentos || [
        { id: '1', nome: 'Medicamento', dose: '1ml', quantidade: 1 }
      ],
      empresaId: formData.empresaId || activeCompanyId,
      tenant_id: currentOrg?.id || 'default'
    };

    await dataService.saveItem('registrosSanitarios', newRegistro);
    handleCloseModal();
  };

  const totals = {
    tratamentos: registros.length,
    emAlerta: registros.filter(r => r.status === 'Agendado').length,
    emCareencia: registros.filter(r => r.careencia_fim && new Date(r.careencia_fim) > new Date()).length
  };

  const filteredData = registros.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    const animalBrinco = r.animal?.toLowerCase() || animais.find(a => a.id === r.animal_id)?.brinco.toLowerCase() || '';
    const meds = r.medicamentos?.map(m => m.nome).join(', ').toLowerCase() || '';
    
    const matchesSearch = animalBrinco.includes(searchLower) || 
      r.doenca_motivo.toLowerCase().includes(searchLower) ||
      meds.includes(searchLower) ||
      r.status.toLowerCase().includes(searchLower) ||
      r.data.toLowerCase().includes(searchLower);
    
    const matchesStatus = filterStatus === 'Todos' || r.status === filterStatus;

    const matchesColumnFilters = 
      (columnFilters.animal === '' || animalBrinco.includes(columnFilters.animal.toLowerCase())) &&
      (columnFilters.doenca === '' || r.doenca_motivo.toLowerCase().includes(columnFilters.doenca.toLowerCase())) &&
      (columnFilters.medicamento === '' || meds.includes(columnFilters.medicamento.toLowerCase())) &&
      (columnFilters.data === '' || r.data.includes(columnFilters.data)) &&
      (columnFilters.careencia === '' || (r.careencia_fim || '').includes(columnFilters.careencia)) &&
      (columnFilters.status === 'Todos' || r.status === columnFilters.status);

    return matchesSearch && matchesStatus && matchesColumnFilters;
  });

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

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/pecuaria/rebanho">Pecuária</Link>
        <ChevronRight size={14} />
        <span>Sanidade</span>
      </nav>
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1>Gestão Sanitária</h1>
            <p className="description">Controle de vacinação, tratamentos individuais e alertas de carência.</p>
          </div>
        </div>
        <div className="action-buttons">
          <button className="btn-premium-outline">
            <History size={20} strokeWidth={3} />
            <span>Histórico Geral</span>
          </button>
          <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
            <Plus size={20} strokeWidth={3} />
            <span>Lançar Tratamento</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <SummaryCard 
          label="Tratamentos Ativos"
          value={totals.tratamentos.toString()}
          icon={ClipboardList}
          color="emerald"
          delay="0s"
        />
        <SummaryCard 
          label="Animais em Carência"
          value={totals.emCareencia.toString()}
          trend={{ value: 'Restrição de abate', type: 'down', icon: Clock }}
          icon={Clock}
          color="rose"
          delay="0.1s"
        />
        <SummaryCard 
          label="Pendências Urgentes"
          value={totals.emAlerta.toString()}
          trend={{ value: 'Reforço necessário', type: 'neutral', icon: AlertTriangle }}
          icon={AlertTriangle}
          color="amber"
          delay="0.2s"
        />
        <SummaryCard 
          label="Cobertura Vacinal"
          value="98.5%"
          trend={{ value: 'Meta: 100%', type: 'neutral', icon: Activity }}
          icon={ShieldCheck}
          color="sky"
          delay="0.3s"
        />
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar animal, doença, medicamento..."
          onToggleAdvanced={() => setIsFiltersOpen(!isFiltersOpen)}
          isAdvancedOpen={isFiltersOpen}
        />

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Animal</th>
                <th>Doença/Motivo</th>
                <th>Medicamento</th>
                <th>Data</th>
                <th>Fim Carência</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'animal', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'doenca', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'medicamento', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'data', type: 'text', placeholder: 'Data...' },
                    { key: 'careencia', type: 'text', placeholder: 'Carência...' },
                    { key: 'status', type: 'select', options: ['Concluído', 'Em Curso', 'Agendado'] }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                />
              )}
            </thead>
            <tbody>
              {paginatedData.map((item) => {
                const animalBrinco = item.animal || animais.find(a => a.id === item.animal_id)?.brinco || '-';
                const medicineList = item.medicamentos?.map(m => m.nome).join(', ') || 'Nenhum';
                const isCareencia = item.careencia_fim && new Date(item.careencia_fim) > new Date();
                
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="animal-cell flex items-center gap-2">
                        <strong className="text-slate-800">{animalBrinco}</strong>
                        <span className="text-slate-400 text-xs font-medium">— {item.tipo}</span>
                      </div>
                    </td>
                    <td><span className="font-extrabold text-slate-700">{item.doenca_motivo}</span></td>
                    <td><span className="text-emerald-600 font-extrabold">{medicineList}</span></td>
                    <td><span className="font-bold text-slate-500">{new Date(item.data).toLocaleDateString('pt-BR')}</span></td>
                    <td>
                      <div className="careencia-info flex items-center gap-2">
                        <span className={isCareencia ? 'text-rose-600 font-black' : 'text-slate-500 font-bold'}>
                          {item.careencia_fim ? new Date(item.careencia_fim).toLocaleDateString('pt-BR') : '-'}
                        </span>
                        {isCareencia && (
                          <div className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full text-[10px] font-black border border-rose-100 uppercase">
                            {Math.ceil((new Date(item.careencia_fim!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="text-right">
                      <div className="actions-cell">
                        <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(item, true)}>
                          <Eye size={18} strokeWidth={3} />
                        </button>
                        <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(item)}>
                          <Edit size={18} strokeWidth={3} />
                        </button>
                        <button className="action-btn-global btn-delete" title="Excluir" onClick={() => dataService.deleteItem('registrosSanitarios', item.id)}>
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
          label="registros"
        />
      </div>

      <ModernModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewMode ? 'Protocolo Realizado' : (selectedRegistro ? 'Editar Registro' : 'Protocolo Sanitário')}
        subtitle={isViewMode ? 'Relatório técnico da intervenção sanitária.' : 'Gestão de carência e segurança alimentar do rebanho.'}
        icon={ShieldCheck}
        footer={
          <>
            <button type="button" className="btn-premium-outline" onClick={handleCloseModal}>
              <X size={18} strokeWidth={3} />
              <span>{isViewMode ? 'Fechar' : 'Cancelar'}</span>
            </button>
            {!isViewMode && (
              <button type="submit" form="sanidade-form" className="btn-premium-solid rose">
                <span>{selectedRegistro ? 'Salvar Alterações' : 'Registrar Manejo'}</span>
                {selectedRegistro ? <CheckCircle2 size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
              </button>
            )}
          </>
        }
      >
        <div className="sidesheet-body-content">
          <form id="sanidade-form" onSubmit={handleSubmit}>
            <div className="modern-form-section">
              <div className="modern-form-row four-cols">
                <div className="modern-form-group col-span-2">
                  <SearchableSelect
                    label="Animal (Brinco)"
                    options={animais.map(a => ({ id: a.id, label: a.brinco, sublabel: `${a.raca} - ${a.peso}kg` }))}
                    value={formData.animal_id || ''}
                    onChange={(val) => setFormData({ ...formData, animal_id: val })}
                    disabled={isViewMode}
                    required
                  />
                </div>
                <div className="modern-form-group">
                  <SearchableSelect
                    label="Lote"
                    options={lotes.map(l => ({ id: l.id, label: l.nome, sublabel: `${l.qtdAnimais} animais` }))}
                    value={formData.lote_id || ''}
                    onChange={(val) => setFormData({ ...formData, lote_id: val })}
                    disabled={isViewMode}
                  />
                </div>
                <div className="modern-form-group">
                  <SearchableSelect
                    label="Tipo de Registro"
                    options={[
                      { id: 'Vacinação', label: 'Vacinação' },
                      { id: 'Tratamento', label: 'Tratamento' },
                      { id: 'Prevenção', label: 'Prevenção' }
                    ]}
                    value={formData.tipo || ''}
                    onChange={(val) => setFormData({ ...formData, tipo: val as any })}
                    disabled={isViewMode}
                    required
                  />
                </div>
              </div>

              <div className="modern-form-group full-width">
                <label>Doença / Motivo</label>
                <div className="modern-input-wrapper">
                  <input 
                    type="text" 
                    className="modern-input text-lg font-bold"
                    value={formData.doenca_motivo || ''} 
                    onChange={(e) => setFormData({ ...formData, doenca_motivo: e.target.value })}
                    disabled={isViewMode} 
                    placeholder="Ex: Pneumonia" 
                    required 
                  />
                  <Activity size={18} className="modern-field-icon" />
                </div>
              </div>

              <div className="modern-form-row four-cols">
                <div className="modern-form-group">
                  <label>Data de Aplicação</label>
                  <div className="modern-input-wrapper">
                    <input 
                      type="date" 
                      className="modern-input"
                      value={formData.data || ''} 
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })} 
                      disabled={isViewMode} 
                      required 
                    />
                    <Calendar size={18} className="modern-field-icon" />
                  </div>
                </div>
                <div className="modern-form-group">
                  <label>Fim da Carência</label>
                  <div className="modern-input-wrapper">
                    <input 
                      type="date" 
                      className="modern-input"
                      value={formData.careencia_fim || ''} 
                      onChange={(e) => setFormData({ ...formData, careencia_fim: e.target.value })} 
                      disabled={isViewMode} 
                    />
                    <Clock size={18} className="modern-field-icon" />
                  </div>
                </div>
                <div className="modern-form-group col-span-2">
                  <SearchableSelect
                    label="Status"
                    options={[
                      { id: 'Concluído', label: 'Concluído' },
                      { id: 'Em Curso', label: 'Em Curso' },
                      { id: 'Agendado', label: 'Agendado' }
                    ]}
                    value={formData.status || ''}
                    onChange={(val) => setFormData({ ...formData, status: val as any })}
                    disabled={isViewMode}
                    required
                  />
                </div>
              </div>

              <div className="modern-form-group full-width">
                <SearchableSelect
                  label="Medicamento / Vacina Principal"
                  options={(insumos as Insumo[]).filter(i => i.categoria.includes('Veterinária') || i.categoria.includes('Medicamento')).map(i => ({ id: i.id, label: i.nome, sublabel: `Saldo: ${i.estoqueAtual} ${i.unidade}` }))}
                  value={formData.medicamentos?.[0]?.id || ''}
                  onChange={(val) => {
                    const insumo = (insumos as Insumo[]).find(i => i.id === val);
                    setFormData({
                      ...formData,
                      medicamentos: [{ id: val, nome: insumo?.nome || '', dose: '1ml', quantidade: 1 }]
                    });
                  }}
                  disabled={isViewMode}
                  required
                />
              </div>

              <div className="modern-form-group full-width">
                <label>Observações Veterinárias</label>
                <div className="modern-input-wrapper">
                  <textarea 
                    className="modern-input"
                    rows={3} 
                    name="obs" 
                    defaultValue={selectedRegistro ? 'Animal em observação no piquete hospital.' : ''} 
                    disabled={isViewMode}
                    placeholder="Descreva detalhes do quadro clínico ou observações de manejo..."
                  ></textarea>
                </div>
              </div>

              <div className="modern-info-tag amber mt-6 full-width">
                 <AlertTriangle size={18} />
                 <div className="flex flex-col">
                   <span className="text-[10px] uppercase opacity-70">Segurança Alimentar</span>
                   <span className="text-sm font-bold">Respeite rigorosamente o período de carência.</span>
                 </div>
              </div>
            </div>
          </form>
        </div>
      </ModernModal>
    </div>
  );
};
