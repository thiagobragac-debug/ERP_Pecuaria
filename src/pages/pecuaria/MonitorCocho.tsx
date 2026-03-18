import React, { useState } from 'react';
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
import './MonitorCocho.css';

interface CurralMonitor {
  id: string;
  lote: string;
  curral?: string; // Add optional curral label
  qtdAnimais: number;
  escoreAnterior: number;
  escoreAtual: number;
  tratoAnterior: number; // kg/cab
  tratoSugerido: number; // kg/cab
  dieta: string;
  historicoConsumo: number[];
}

const mockMonitor: CurralMonitor[] = [
  { id: 'C-01', lote: 'Lote 02 - Engorda Machos', qtdAnimais: 85, escoreAnterior: 1, escoreAtual: 1, tratoAnterior: 10.2, tratoSugerido: 10.2, dieta: 'Engorda Rápida V4', historicoConsumo: [9.8, 10.0, 10.2, 10.2, 10.2] },
  { id: 'C-02', lote: 'Boi China 2024', curral: 'C-02', qtdAnimais: 120, escoreAnterior: 0, escoreAtual: 0, tratoAnterior: 11.8, tratoSugerido: 12.2, dieta: 'Acabamento Top', historicoConsumo: [11.0, 11.2, 11.5, 11.8, 11.8] },
  { id: 'C-04', lote: 'Novilhas Premium', curral: 'C-04', qtdAnimais: 42, escoreAnterior: 2, escoreAtual: 2, tratoAnterior: 8.5, tratoSugerido: 8.0, dieta: 'Transição Elevada', historicoConsumo: [8.8, 8.7, 8.6, 8.5, 8.5] },
];

export const MonitorCocho: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [monitorData, setMonitorData] = useState<CurralMonitor[]>(mockMonitor);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const updateEscore = (id: string, novoEscore: number) => {
    setMonitorData(prev => prev.map(curral => {
      if (curral.id === id) {
        // Lógica simplificada de sugestão baseada no escore:
        // 0-0.5: Aumentar | 1: Manter | 1.5-2: Diminuir | >2: Alerta/Corte
        let sugestao = curral.tratoAnterior;
        if (novoEscore === 0) sugestao = curral.tratoAnterior * 1.05;
        else if (novoEscore >= 1.5 && novoEscore <= 2) sugestao = curral.tratoAnterior * 0.95;
        else if (novoEscore > 2) sugestao = curral.tratoAnterior * 0.90;

        return { ...curral, escoreAtual: novoEscore, tratoSugerido: Number(sugestao.toFixed(2)) };
      }
      return curral;
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Leituras de cocho salvas e chamadas de trato atualizadas!');
    }, 1500);
  };

  const filteredMonitor = monitorData.filter(m => {
    const searchLower = searchTerm.toLowerCase();
    return m.id.toLowerCase().includes(searchLower) || 
           m.lote.toLowerCase().includes(searchLower) ||
           m.dieta.toLowerCase().includes(searchLower) ||
           m.qtdAnimais.toString().includes(searchLower) ||
           m.tratoAnterior.toString().includes(searchLower);
  });

  return (
    <div className="page-container fade-in">
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
                <span className="curral-label bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-black text-xs">{curral.id}</span>
                <h3 className="font-bold text-slate-800 m-0">{curral.lote}</h3>
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
                {curral.escoreAnterior > 1 && "Sobras Excessivas - Reduzir trato"}
              </p>
            </div>

            <div className="adjustment-logic">
              <div className="logic-row">
                <span>Anterior: <strong>{curral.tratoAnterior} kg/cab</strong></span>
                <ChevronRight size={16} strokeWidth={3} />
                <div className="suggested-box">
                  <label>Sugerido</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={curral.tratoSugerido} 
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setMonitorData(prev => prev.map(c => c.id === curral.id ? { ...c, tratoSugerido: val } : c));
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
               {curral.tratoSugerido > curral.tratoAnterior && (
                 <span className="trend-badge positive">Aumento</span>
               )}
               {curral.tratoSugerido < curral.tratoAnterior && (
                 <span className="trend-badge negative">Redução</span>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

