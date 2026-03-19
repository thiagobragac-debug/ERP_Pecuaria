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
import { useCompany } from '../../contexts/CompanyContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { Reproducao as ReproducaoType, Animal, Lote } from '../../types';
import './DiagnosticoReproducao.css';

// Interfaces removed as we use from types

export const DiagnosticoReproducao: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { activeCompanyId } = useCompany();
  
  // Live Queries
  const allReproducoes = useLiveQuery(() => db.reproducao.toArray()) || [];
  const allAnimais = useLiveQuery(() => db.animais.toArray()) || [];
  const allLotes = useLiveQuery(() => db.lotes.toArray()) || [];

  const reproducoes = allReproducoes.filter(r => activeCompanyId === 'Todas' || r.empresaId === activeCompanyId);
  const animais = allAnimais.filter(a => activeCompanyId === 'Todas' || a.empresaId === activeCompanyId);
  const lotes = allLotes.filter(l => activeCompanyId === 'Todas' || l.empresaId === activeCompanyId);

  // Filter for females pending diagnosis
  const pendentes = reproducoes.filter(r => r.status === 'Em Protocolo');

  const [selectedAnimal, setSelectedAnimal] = useState<ReproducaoType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    animal: '',
    protocolo: 'Todos',
    lote: 'Todos'
  });
  
  // Diagnóstico Form State
  const [status, setStatus] = useState<'Prenhe' | 'Vazia' | 'Inconclusiva'>('Prenhe');
  const [idadeGestacional, setIdadeGestacional] = useState<number>(0);
  const [sexagem, setSexagem] = useState<'Indefinido' | 'Macho' | 'Fêmea'>('Indefinido');
  const [obs, setObs] = useState('');

  const handleSelectAnimal = (repro: ReproducaoType) => {
    setSelectedAnimal(repro);
    
    // Calculate days since insemination (D0)
    const d0 = new Date(repro.dataInicio);
    const today = new Date();
    const diffDays = Math.max(0, Math.ceil((today.getTime() - d0.getTime()) / (1000 * 60 * 60 * 24)));
    
    setIdadeGestacional(diffDays);
    setStatus('Prenhe');
    setSexagem('Indefinido');
    setObs('');
  };

  const handleSave = async () => {
    if (!selectedAnimal) return;
    setIsSaving(true);
    
    try {
      const updatedReproducao: ReproducaoType = {
        ...selectedAnimal,
        status: status === 'Inconclusiva' ? 'Em Protocolo' : status as any,
        // In a real scenario, we might want to store the diagnosis details (sexing, obs, etc.) 
        // in a separate history or extended fields. For now, we update the status.
        created_at: new Date().toISOString()
      };
      
      await dataService.saveItem('reproducao', updatedReproducao);
      
      setSelectedAnimal(null);
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving diagnosis:', error);
      setIsSaving(false);
    }
  };

  const filteredPendentes = pendentes.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const animal = animais.find(a => a.id === p.animal_id);
    const animalBrinco = animal?.brinco.toLowerCase() || '';
    const loteNome = lotes.find(l => l.id === animal?.lote_id)?.nome.toLowerCase() || '';

    const matchesSearch = animalBrinco.includes(searchLower) || 
           p.protocolo.toLowerCase().includes(searchLower) ||
           loteNome.includes(searchLower) ||
           p.dataInicio.toLowerCase().includes(searchLower) ||
           p.previsaoDiagnostico.toLowerCase().includes(searchLower);

    const matchesColumnFilters = 
      (columnFilters.animal === '' || animalBrinco.includes(columnFilters.animal.toLowerCase())) &&
      (columnFilters.protocolo === 'Todos' || p.protocolo === columnFilters.protocolo) &&
      (columnFilters.lote === 'Todos' || loteNome.includes(columnFilters.lote.toLowerCase()));

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
                  { key: 'protocolo', type: 'select', options: Array.from(new Set(pendentes.map(p => p.protocolo))) },
                  { key: 'lote', type: 'select', options: Array.from(new Set(lotes.map(l => l.nome))) }
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
                  <h3>{animais.find(a => a.id === p.animal_id)?.brinco || '-'}</h3>
                  <span className="lote-tag">{lotes.find(l => l.id === animais.find(a => a.id === p.animal_id)?.lote_id)?.nome || '-'}</span>
                </div>
                <div className="card-details">
                  <span>{p.protocolo}</span>
                  <div className="days-badge">
                    <History size={12} />
                    {Math.ceil((new Date().getTime() - new Date(p.dataInicio).getTime()) / (1000 * 60 * 60 * 24))} dias
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
                    <h2>{animais.find(a => a.id === selectedAnimal.animal_id)?.brinco || '-'}</h2>
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

