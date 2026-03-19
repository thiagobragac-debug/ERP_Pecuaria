import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Utensils, 
  Search, 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Save, 
  RefreshCw,
  Info,
  ThermometerSun,
  CloudRain
} from 'lucide-react';
import { TableFilters } from '../../components/TableFilters';
import { useCompany } from '../../contexts/CompanyContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { Confinamento as ConfinamentoType, Lote } from '../../types';
import './MonitorCocho.css';

// Interfaces simplified for DB integration
interface CurralMonitor extends ConfinamentoType {
  escoreAtual: number;
  tratoSugerido: number;
  historicoConsumo: number[];
}

export const MonitorCocho: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { activeCompanyId } = useCompany();
  
  // Live Queries
  const allConfinamentos = useLiveQuery(() => db.confinamento.toArray()) || [];
  const allLotes = useLiveQuery(() => db.lotes.toArray()) || [];

  const confinamentos = allConfinamentos.filter(c => activeCompanyId === 'Todas' || c.empresaId === activeCompanyId);
  const lotes = allLotes.filter(l => activeCompanyId === 'Todas' || l.empresaId === activeCompanyId);

  const [localMonitorData, setLocalMonitorData] = useState<Record<string, { escore: number, trato: number }>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const monitorData = confinamentos.map(c => ({
    ...c,
    escoreAtual: localMonitorData[c.id]?.escore ?? 1,
    tratoSugerido: localMonitorData[c.id]?.trato ?? c.imgAnterior,
    historicoConsumo: [c.imgAnterior * 0.95, c.imgAnterior * 0.98, c.imgAnterior] // Mock history
  }));

  const updateEscore = (id: string, novoEscore: number) => {
    const entry = confinamentos.find(c => c.id === id);
    if (!entry) return;

    let sugestao = localMonitorData[id]?.trato ?? entry.imgAnterior;
    if (novoEscore === 0) sugestao = entry.imgAnterior * 1.05;
    else if (novoEscore >= 1.5 && novoEscore <= 2) sugestao = entry.imgAnterior * 0.95;
    else if (novoEscore > 2) sugestao = entry.imgAnterior * 0.90;

    setLocalMonitorData(prev => ({
      ...prev,
      [id]: { escore: novoEscore, trato: Number(sugestao.toFixed(2)) }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save all updated treatments back to confinement records
      for (const id in localMonitorData) {
        const entry = confinamentos.find(c => c.id === id);
        if (entry) {
          await dataService.saveItem('confinamento', {
            ...entry,
            imgAnterior: localMonitorData[id].trato
          });
        }
      }
      setLocalMonitorData({}); // Clear local changes after save
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving bunk reading:', error);
      setIsSaving(false);
    }
  };

  const filteredMonitor = monitorData.filter(m => {
    const searchLower = searchTerm.toLowerCase();
    const loteNome = lotes.find(l => l.id === m.lote_id)?.nome.toLowerCase() || '';
    return m.curral.toLowerCase().includes(searchLower) || 
           loteNome.includes(searchLower) ||
           m.dieta.toLowerCase().includes(searchLower) ||
           m.qtdAnimais.toString().includes(searchLower) ||
           m.imgAnterior.toString().includes(searchLower);
  });

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/pecuaria/rebanho">Pecuária</Link>
        <ChevronRight size={14} />
        <Link to="/pecuaria/confinamento">Confinamento</Link>
        <ChevronRight size={14} />
        <span>Monitor de Cocho</span>
      </nav>
      <div className="page-header-row">
        <div className="title-section">
          <button className="btn-premium-outline back-btn-std h-10 px-3" onClick={onBack}>
            <ArrowLeft size={20} strokeWidth={3} />
          </button>
          <div className="icon-badge orange">
            <Utensils size={40} strokeWidth={3} />
          </div>
          <div>
            <h1>Monitor de Cocho</h1>
            <p className="description">Leitura de escore e ajuste dinâmico da chamada de trato</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="environmental-params card glass thin">
            <div className="param">
              <ThermometerSun size={18} strokeWidth={3} />
              <span>32°C</span>
            </div>
            <div className="param">
              <CloudRain size={18} strokeWidth={3} />
              <span>Sem chuva</span>
            </div>
          </div>
          <button className="btn-premium-solid indigo h-11 px-6 gap-2" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <RefreshCw size={18} strokeWidth={3} className="spinning" /> : <Save size={18} strokeWidth={3} />}
            {isSaving ? 'Gravando...' : 'Gravar Leituras'}
          </button>
        </div>
      </div>

        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por curral ou lote..."
          hideActions={true}
        />

      <div className="monitor-grid">
        {filteredMonitor.map((curral) => (
          <div key={curral.id} className="monitor-card card glass">
            <div className="card-header">
              <div className="curral-info flex items-center gap-3">
                <span className="curral-label bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-black text-xs">{curral.curral}</span>
                <h3 className="font-bold text-slate-800 m-0">{lotes.find(l => l.id === curral.lote_id)?.nome || '-'}</h3>
              </div>
              <div className="animal-count">
                <Utensils size={14} strokeWidth={3} />
                <span>{curral.qtdAnimais} cab.</span>
              </div>
            </div>

            <div className="bunk-reading">
              <label>Escore de Cocho (Leitura)</label>
              <div className="escore-selector">
                {[0, 0.5, 1, 1.5, 2, 3, 4].map((score) => (
                   <button 
                    key={score}
                    className={`score-btn score-${score.toString().replace('.', '')} ${curral.escoreAtual === score ? 'active' : ''}`}
                    onClick={() => updateEscore(curral.id, score)}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <p className="escore-help">
                <Info size={14} strokeWidth={3} />
                {curral.escoreAtual === 0 && "Cocho Limpo - Sugerido aumentar trato"}
                {curral.escoreAtual === 1 && "Leitura Ideal - Manter trato"}
                {curral.escoreAtual > 1 && "Sobras Excessivas - Reduzir trato"}
              </p>
            </div>

            <div className="adjustment-logic">
              <div className="logic-row">
                <span>Anterior: <strong>{curral.imgAnterior} kg/cab</strong></span>
                <ChevronRight size={16} strokeWidth={3} />
                <div className="suggested-box">
                  <label>Sugerido</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={curral.tratoSugerido} 
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setLocalMonitorData(prev => ({
                        ...prev,
                        [curral.id]: { ...(prev[curral.id] || { escore: curral.escoreAtual }), trato: val }
                      }));
                    }}
                  />
                  <span>kg/cab</span>
                </div>
              </div>
            </div>

            <div className="mini-ims-chart">
               <label>Tendência de Consumo (IMS)</label>
               <div className="chart-container">
                  {curral.historicoConsumo.map((val, idx) => (
                    <div 
                      key={idx} 
                      className="bar" 
                      style={{ height: `${(val / 15) * 100}%` }}
                      title={`${val} kg`}
                    />
                  ))}
               </div>
            </div>

            <div className="card-footer">
               <div className="dieta-tag">
                 <Activity size={12} strokeWidth={3} />
                 {curral.dieta}
               </div>
               {curral.tratoSugerido > curral.imgAnterior && (
                 <span className="trend-badge positive">Aumento</span>
               )}
               {curral.tratoSugerido < curral.imgAnterior && (
                 <span className="trend-badge negative">Redução</span>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
