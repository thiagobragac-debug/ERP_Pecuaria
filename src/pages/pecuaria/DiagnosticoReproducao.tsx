import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Stethoscope, 
  Search, 
  SearchCheck, 
  Baby, 
  Activity, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Camera,
  ChevronRight,
  Info,
  History,
  Save,
  Trash2,
  RefreshCw,
  Clock,
  Filter
} from 'lucide-react';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import './DiagnosticoReproducao.css';

interface FemeaPendente {
  id: string;
  animal: string;
  protocolo: string;
  dataInseminacao: string;
  dgPrevisto: string;
  diasPosInseminacao: number;
  tecnicoResponsavel: string;
  lote: string;
}

const mockPendentes: FemeaPendente[] = [
  { id: '101', animal: 'VAC-8820', protocolo: 'IATF 3 Manejos', dataInseminacao: '2024-03-08', dgPrevisto: '2024-04-01', diasPosInseminacao: 32, tecnicoResponsavel: 'Dr. Roberto Santos', lote: 'Matrizes Primíparas' },
  { id: '102', animal: 'VAC-9905', protocolo: 'IATF 3 Manejos', dataInseminacao: '2024-03-08', dgPrevisto: '2024-04-01', diasPosInseminacao: 32, tecnicoResponsavel: 'Dr. Roberto Santos', lote: 'Matrizes Primíparas' },
  { id: '103', animal: 'VAC-4412', protocolo: 'IA Convencional', dataInseminacao: '2024-03-05', dgPrevisto: '2024-04-05', diasPosInseminacao: 35, tecnicoResponsavel: 'Dra. Luana Melo', lote: 'Novilhas Nelore' },
];

export const DiagnosticoReproducao: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [pendentes, setPendentes] = useState<FemeaPendente[]>(mockPendentes);
  const [selectedAnimal, setSelectedAnimal] = useState<FemeaPendente | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterProtocolo, setFilterProtocolo] = useState('Todos');
  const [columnFilters, setColumnFilters] = useState({
    animal: '',
    protocolo: 'Todos',
    lote: 'Todos'
  });
  
  // Diagnóstico Form State
  const [status, setStatus] = useState<'Pendentes' | 'Prenhe' | 'Vazia' | 'Inconclusiva'>('Pendentes');
  const [idadeGestacional, setIdadeGestacional] = useState<number>(0);
  const [sexagem, setSexagem] = useState<'Indefinido' | 'Macho' | 'Fêmea'>('Indefinido');
  const [obs, setObs] = useState('');

  const handleSelectAnimal = (animal: FemeaPendente) => {
    setSelectedAnimal(animal);
    setIdadeGestacional(animal.diasPosInseminacao);
    setStatus('Prenhe');
    setSexagem('Indefinido');
    setObs('');
  };

  const handleSave = () => {
    if (!selectedAnimal) return;
    setIsSaving(true);
    setTimeout(() => {
      setPendentes(prev => prev.filter(p => p.id !== selectedAnimal.id));
      setSelectedAnimal(null);
      setIsSaving(false);
      alert('Diagnóstico registrado com sucesso!');
    }, 1200);
  };

  const filteredPendentes = pendentes.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = p.animal.toLowerCase().includes(searchLower) || 
           p.protocolo.toLowerCase().includes(searchLower) ||
           p.lote.toLowerCase().includes(searchLower) ||
           p.dataInseminacao.toLowerCase().includes(searchLower) ||
           p.dgPrevisto.toLowerCase().includes(searchLower) ||
           p.tecnicoResponsavel.toLowerCase().includes(searchLower);

    const matchesColumnFilters = 
      (columnFilters.animal === '' || p.animal.toLowerCase().includes(columnFilters.animal.toLowerCase())) &&
      (columnFilters.protocolo === 'Todos' || p.protocolo === columnFilters.protocolo) &&
      (columnFilters.lote === 'Todos' || p.lote === columnFilters.lote);

    return matchesSearch && matchesColumnFilters;
  });

  return (
    <div className="page-container fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <button className="btn-premium-outline back-btn-std h-10 px-3" onClick={onBack}>
            <ArrowLeft size={20} strokeWidth={3} />
          </button>
          <div className="icon-badge violet">
            <Stethoscope size={40} strokeWidth={3} />
          </div>
          <div>
            <h1>Sessão de Diagnóstico de Gestação (DG)</h1>
            <p className="description">Registro técnico de ultrassonografia e sexagem fetal</p>
          </div>
        </div>
        <div className="diag-stats card glass thin">
          <div className="stat">
            <Clock size={16} strokeWidth={3} />
            <span>Pendentes: <strong>{pendentes.length}</strong></span>
          </div>
          <div className="stat">
            <Activity size={16} strokeWidth={3} />
            <span>Sessão: <strong>{new Date().toLocaleDateString('pt-BR')}</strong></span>
          </div>
        </div>
      </div>

      <div className="diag-main-grid">
        <div className="diag-list-side">
          <TableFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Buscar por animal ou lote..."
          >
            <button 
              className={`btn-premium-outline h-11 px-6 gap-2 ${isFiltersOpen ? 'filter-active' : ''}`}
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <Filter size={18} strokeWidth={3} />
              <span>{isFiltersOpen ? 'Fechar' : 'Filtros'}</span>
            </button>
          </TableFilters>

          {isFiltersOpen && (
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 mt-4 rounded-xl border border-slate-200/60 shadow-sm">
              <ColumnFilters
                columns={[
                  { key: 'animal', type: 'text', placeholder: 'Filtrar animal...' },
                  { key: 'protocolo', type: 'select', options: Array.from(new Set(mockPendentes.map(p => p.protocolo))) },
                  { key: 'lote', type: 'select', options: Array.from(new Set(mockPendentes.map(p => p.lote))) }
                ]}
                values={columnFilters}
                onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                showActionsPadding={false}
              />
            </div>
          )}


          <div className="pendentes-list">
            {filteredPendentes.map((p) => (
              <div 
                key={p.id} 
                className={`pendente-card card glass ${selectedAnimal?.id === p.id ? 'active' : ''}`}
                onClick={() => handleSelectAnimal(p)}
              >
                <div className="card-top">
                  <h3>{p.animal}</h3>
                  <span className="lote-tag">{p.lote}</span>
                </div>
                <div className="card-details">
                  <span>{p.protocolo}</span>
                  <div className="days-badge">
                    <History size={12} />
                    {p.diasPosInseminacao} dias
                  </div>
                </div>
                <ChevronRight className="chevron" size={18} />
              </div>
            ))}

            {filteredPendentes.length === 0 && (
              <div className="empty-state">
                <SearchCheck size={48} strokeWidth={3} />
                <p>Nenhuma fêmea aguardando diagnóstico para os critérios selecionados.</p>
              </div>
            )}
          </div>
        </div>

        <div className="diag-form-side">
          {selectedAnimal ? (
            <div className="diagnostic-form card glass animate-scale">
               <div className="form-header">
                  <div className="animal-display">
                    <span className="label">Diagnosticando:</span>
                    <h2>{selectedAnimal.animal}</h2>
                  </div>
                  <div className="ultrasound-icon">
                    <Camera size={24} strokeWidth={3} />
                  </div>
               </div>

               <div className="form-content">
                  <div className="result-selector">
                    <label>Resultado da Gestação</label>
                    <div className="status-options">
                      <button 
                        className={`status-btn prenhe ${status === 'Prenhe' ? 'active' : ''}`}
                        onClick={() => setStatus('Prenhe')}
                      >
                        Prenhe
                      </button>
                      <button 
                        className={`status-btn vazia ${status === 'Vazia' ? 'active' : ''}`}
                        onClick={() => setStatus('Vazia')}
                      >
                        Vazia
                      </button>
                      <button 
                        className={`status-btn inconclusiva ${status === 'Inconclusiva' ? 'active' : ''}`}
                        onClick={() => setStatus('Inconclusiva')}
                      >
                        Re-DG
                      </button>
                    </div>
                  </div>

                  {status === 'Prenhe' && (
                    <div className="pregnancy-details animate-fade-in">
                       <div className="detail-row">
                          <div className="form-group flex-1">
                            <label>Idade Gestacional (dias)</label>
                            <div className="input-with-icon">
                              <Calendar size={18} className="field-icon" />
                              <input 
                                type="number" 
                                value={idadeGestacional} 
                                onChange={(e) => setIdadeGestacional(parseInt(e.target.value))}
                              />
                            </div>
                          </div>
                          <div className="form-group flex-1">
                            <label>Previsão de Parto</label>
                            <div className="prediction-box">
                               <strong>
                                  {new Date(Date.now() + (285 - idadeGestacional) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                               </strong>
                               <small>Estimativa (285 dias)</small>
                            </div>
                          </div>
                       </div>

                       <div className="sexing-selector">
                          <label>Sexagem Fetal</label>
                          <div className="sex-options">
                             <button className={sexagem === 'Indefinido' ? 'active' : ''} onClick={() => setSexagem('Indefinido')}>Indefinido</button>
                             <button className={sexagem === 'Macho' ? 'active' : ''} onClick={() => setSexagem('Macho')}>
                               <Baby size={16} /> Macho
                             </button>
                             <button className={sexagem === 'Fêmea' ? 'active' : ''} onClick={() => setSexagem('Fêmea')}>
                               <Baby size={16} /> Fêmea
                             </button>
                          </div>
                       </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Observações do Exame</label>
                    <textarea 
                      placeholder="Anote detalhes da vesícula gestacional, batimentos ou anomalias..." 
                      value={obs}
                      onChange={(e) => setObs(e.target.value)}
                    />
                  </div>
               </div>

               <div className="form-footer">
                   <button className="btn-premium-outline h-11 px-8 font-bold" onClick={() => setSelectedAnimal(null)}>Descartar</button>
                   <button className="btn-premium-solid indigo h-11 px-8 font-bold gap-2" onClick={handleSave} disabled={isSaving}>
                     {isSaving ? <RefreshCw size={18} strokeWidth={3} className="spinning" /> : <Save size={18} strokeWidth={3} />}
                     <span>Confirmar Diagnóstico</span>
                   </button>
               </div>
            </div>
          ) : (
            <div className="no-selection card glass dashed">
              <Stethoscope size={64} strokeWidth={3} />
              <h3>Selecione uma fêmea na lista</h3>
              <p>Clique em um animal para iniciar o registro do diagnóstico reprodutivo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

