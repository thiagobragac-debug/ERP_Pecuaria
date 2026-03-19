import React, { useState, useEffect } from 'react';
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
  Clock
} from 'lucide-react';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useLiveQuery } from 'dexie-react-hooks';
import { RegistroSanitario as RegistroSanitarioType, Animal, Lote, MedicamentoUsado } from '../../types';
import './Sanidade.css';

export const Sanidade = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [selectedRegistro, setSelectedRegistro] = useState<RegistroSanitarioType | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);

  // Live Queries
  const registros = useLiveQuery(() => db.registrosSanitarios.toArray()) || [];
  const animais = useLiveQuery(() => db.animais.toArray()) || [];
  const lotes = useLiveQuery(() => db.lotes.toArray()) || [];
  const [columnFilters, setColumnFilters] = useState({
    animal: '',
    doenca: '',
    medicamento: '',
    data: '',
    careencia: '',
    status: 'Todos'
  });

  const handleOpenModal = (registro: RegistroSanitarioType | null = null, viewOnly = false) => {
    setSelectedRegistro(registro);
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
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
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge success">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1>Gestão Sanitária</h1>
            <p className="description">Controle de vacinação, tratamentos individuais e alertas de carência.</p>
          </div>
        </div>
        <div className="action-buttons">
          <button className="btn-premium-outline h-11 px-6 gap-2">
            <History size={20} strokeWidth={3} />
            <span>Histórico Geral</span>
          </button>
          <button className="btn-premium-solid indigo h-11 px-6 gap-2" onClick={() => handleOpenModal()}>
            <Plus size={20} strokeWidth={3} />
            <span>Lançar Tratamento</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card animate-slide-up" style={{ animationDelay: '0s' }}>
          <div className="summary-info">
            <span className="summary-label">Tratamentos Ativos</span>
            <span className="summary-value">{totals.tratamentos}</span>
            <p className="mt-4 text-emerald-600 font-extrabold flex items-center gap-2">
              <ClipboardList size={18} strokeWidth={2.5} /> Mês atual
            </p>
          </div>
          <div className="summary-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <ClipboardList size={36} strokeWidth={3} color="#10b981" />
          </div>
        </div>

        <div className="summary-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Animais em Carência</span>
            <span className="summary-value">{totals.emCareencia}</span>
            <p className="mt-4 text-rose-600 font-extrabold flex items-center gap-2">
              <Clock size={18} strokeWidth={2.5} /> Restrição de abate
            </p>
          </div>
          <div className="summary-icon" style={{ background: 'rgba(244, 63, 94, 0.1)' }}>
            <Clock size={36} strokeWidth={3} color="#f43f5e" />
          </div>
        </div>

        <div className="summary-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Pendências Urgentes</span>
            <span className="summary-value">{totals.emAlerta}</span>
            <p className="mt-4 text-amber-600 font-extrabold flex items-center gap-2">
              <AlertTriangle size={18} strokeWidth={2.5} /> Reforço necessário
            </p>
          </div>
          <div className="summary-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <AlertTriangle size={36} strokeWidth={3} color="#f59e0b" />
          </div>
        </div>

        <div className="summary-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Cobertura Vacinal</span>
            <span className="summary-value">98.5<small className="text-xl text-slate-400">%</small></span>
            <p className="mt-4 text-sky-600 font-extrabold flex items-center gap-2">
              <Activity size={18} strokeWidth={2.5} /> Meta: 100%
            </p>
          </div>
          <div className="summary-icon" style={{ background: 'rgba(14, 165, 233, 0.1)' }}>
            <Activity size={36} strokeWidth={3} color="#0ea5e9" />
          </div>
        </div>
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
                      <span className={`status-badge ${item.status === 'Concluído' ? 'concluido' : item.status === 'Em Curso' ? 'alerta' : 'pendente'}`}>
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

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isViewMode ? 'Visualizar Registro' : (selectedRegistro ? 'Editar Registro' : 'Lançar Tratamento')}
        icon={ShieldCheck}
        size="lg"
        footer={
          <div className="flex gap-3">
            <button className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            {!isViewMode && <button className="btn-premium-solid indigo" form="sanidade-form">Salvar Lançamento</button>}
          </div>
        }
      >
        <div className="modal-body-content p-6">
          <form id="sanidade-form" onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            
            const newRegistro: RegistroSanitarioType = {
              ...selectedRegistro!,
              id: selectedRegistro?.id || Math.random().toString(36).substr(2, 9),
              animal_id: formData.get('animal_id') as string,
              lote_id: formData.get('lote_id') as string,
              tipo: formData.get('tipo') as any,
              doenca_motivo: formData.get('doenca_motivo') as string,
              data: formData.get('data') as string,
              careencia_fim: formData.get('careencia_fim') as string,
              status: formData.get('status') as any,
              medicamentos: [
                { id: '1', nome: formData.get('medicamento') as string, dose: '1ml', quantidade: 1 }
              ],
              tenant_id: 'default'
            };

            await dataService.saveItem('registrosSanitarios', newRegistro);
            setIsModalOpen(false);
          }}>
            <div className="form-grid">
              <div className="form-group col-6">
                <label>Identificação do Animal</label>
                <select name="animal_id" defaultValue={selectedRegistro?.animal_id} disabled={isViewMode} required>
                    <option value="">Selecione...</option>
                    {animais.map(a => (
                        <option key={a.id} value={a.id}>{a.brinco} - {a.raca}</option>
                    ))}
                </select>
              </div>
              <div className="form-group col-6">
                <label>Lote</label>
                <select name="lote_id" defaultValue={selectedRegistro?.lote_id} disabled={isViewMode}>
                    <option value="">Nenhum / Selecione...</option>
                    {lotes.map(l => (
                        <option key={l.id} value={l.id}>{l.nome}</option>
                    ))}
                </select>
              </div>
              <div className="form-group col-6">
                <label>Doença / Motivo</label>
                <input type="text" name="doenca_motivo" defaultValue={selectedRegistro?.doenca_motivo} disabled={isViewMode} placeholder="Ex: Pneumonia" required />
              </div>
              <div className="form-group col-6">
                <label>Tipo de Registro</label>
                <select name="tipo" defaultValue={selectedRegistro?.tipo || 'Tratamento'} disabled={isViewMode} required>
                  <option value="Vacinação">Vacinação</option>
                  <option value="Tratamento">Tratamento</option>
                  <option value="Prevenção">Prevenção</option>
                </select>
              </div>
              <div className="form-group col-4">
                <label>Data da Aplicação</label>
                <input type="date" name="data" defaultValue={selectedRegistro?.data || new Date().toLocaleDateString('en-CA')} disabled={isViewMode} required />
              </div>
              <div className="form-group col-4">
                <label>Fim do Período de Carência</label>
                <input type="date" name="careencia_fim" defaultValue={selectedRegistro?.careencia_fim} disabled={isViewMode} />
              </div>
              <div className="form-group col-4">
                <label>Status</label>
                <select name="status" defaultValue={selectedRegistro?.status || 'Concluído'} disabled={isViewMode} required>
                  <option value="Concluído">Concluído</option>
                  <option value="Em Curso">Em Curso</option>
                  <option value="Agendado">Agendado</option>
                </select>
              </div>
              <div className="form-group col-12">
                <label>Medicamento / Vacina Principal</label>
                <input type="text" name="medicamento" defaultValue={selectedRegistro?.medicamentos?.[0]?.nome} disabled={isViewMode} placeholder="Ex: Terramicina 50mg" required />
              </div>
              <div className="form-group col-12">
                <label>Observações Veterinárias</label>
                <textarea rows={3} name="obs" defaultValue={selectedRegistro ? 'Animal em observação no piquete hospital.' : ''} disabled={isViewMode}></textarea>
              </div>
              <div className="form-group col-12">
                <div className="info-box info">
                  <CheckCircle2 size={18} />
                  <p><strong>Atenção:</strong> Respeite rigorosamente o período de carência indicado pelo fabricante para garantir a segurança alimentar.</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </StandardModal>
    </div>
  );
};

