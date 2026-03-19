import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  DollarSign, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  RefreshCw, 
  AlertTriangle,
  Zap,
  Target,
  BarChart3,
  Calendar,
  Save,
  Download,
  Percent,
  Calculator,
  Users,
  Scale
} from 'lucide-react';
import { useCompany } from '../../contexts/CompanyContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import './AnaliseCustoNutricao.css';

interface IngredienteAnalise {
  id: string;
  nome: string;
  proporcao: number;
  custoOriginal: number;
  custoSimulado: number;
}

const mockIngredientes: IngredienteAnalise[] = [
  { id: '1', nome: 'Milho Grão Inteiro', proporcao: 85, custoOriginal: 1.10, custoSimulado: 1.10 },
  { id: '2', nome: 'Núcleo Confinamento 15%', proporcao: 15, custoOriginal: 3.50, custoSimulado: 3.50 },
];

export const AnaliseCustoNutricao: React.FC<{ onBack: () => void; dietaNome?: string }> = ({ onBack, dietaNome = 'Dieta Acabamento Grão Inteiro' }) => {
  const { activeCompanyId } = useCompany();
  
  // Live Queries
  const allDietas = useLiveQuery(() => db.dietas.toArray()) || [];
  const allAnimais = useLiveQuery(() => db.animais.toArray()) || [];
  const allInsumos = useLiveQuery(() => db.insumos.toArray()) || [];

  const dietas = allDietas.filter(d => activeCompanyId === 'Todas' || d.empresaId === activeCompanyId);
  const animais = allAnimais.filter(a => activeCompanyId === 'Todas' || a.empresaId === activeCompanyId);
  
  // Find specific dieta if name provided
  const currentDieta = dietas.find(d => d.nome === dietaNome);

  // Map ingredients from dieta to analysis format
  const initialIngredientes: IngredienteAnalise[] = useMemo(() => {
    if (!currentDieta) return [
      { id: '1', nome: 'Milho Grão Inteiro', proporcao: 85, custoOriginal: 1.10, custoSimulado: 1.10 },
      { id: '2', nome: 'Núcleo Confinamento 15%', proporcao: 15, custoOriginal: 3.50, custoSimulado: 3.50 },
    ];

    return currentDieta.ingredientes.map((ing, idx) => ({
      id: idx.toString(),
      nome: ing.nome,
      proporcao: ing.proporcao,
      custoOriginal: ing.custoUnitario,
      custoSimulado: ing.custoUnitario
    }));
  }, [currentDieta]);

  const [ingredientes, setIngredientes] = useState<IngredienteAnalise[]>(initialIngredientes);
  
  // Sync state with initialIngredientes when it changes
  React.useEffect(() => {
    setIngredientes(initialIngredientes);
  }, [initialIngredientes]);

  const [cms, setCms] = useState(currentDieta?.cmsProjetado || 10.5); // CMS em kg
  const [isSimulating, setIsSimulating] = useState(false);
  const [visualTab, setVisualTab] = useState<'componente' | 'animais'>('componente');
  const [costCalculationMode, setCostCalculationMode] = useState<'fixed' | 'proportional'>('proportional');

  const stats = useMemo(() => {
    const custoOriginalTotal = ingredientes.reduce((acc, ing) => acc + (ing.custoOriginal * (ing.proporcao / 100) * cms), 0);
    const custoSimuladoTotal = ingredientes.reduce((acc, ing) => acc + (ing.custoSimulado * (ing.proporcao / 100) * cms), 0);
    const diferencaCabca = custoSimuladoTotal - custoOriginalTotal;
    const impactoMes = diferencaCabca * 30 * 1000; // Exemplo para 1000 cabeças em 30 dias

    return {
      original: custoOriginalTotal,
      simulado: custoSimuladoTotal,
      diferencaPerc: ((custoSimuladoTotal / custoOriginalTotal - 1) * 100).toFixed(1),
      impactoMes,
    };
  }, [ingredientes, cms]);

  const handlePriceChange = (id: string, newPrice: string) => {
    const price = parseFloat(newPrice) || 0;
    setIngredientes(prev => prev.map(ing => ing.id === id ? { ...ing, custoSimulado: price } : ing));
  };

  const resetSimulation = () => {
    setIngredientes(prev => prev.map(ing => ({ ...ing, custoSimulado: ing.custoOriginal })));
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <button className="btn-premium-outline back-btn-std h-11 w-11 flex items-center justify-center p-0" style={{ borderRadius: '15px' }} onClick={onBack}>
            <ArrowLeft size={24} strokeWidth={3} />
          </button>
          <div className="icon-badge emerald">
            <Calculator size={40} strokeWidth={3} />
          </div>
          <div>
            <h1>Análise de Custo & Volatilidade</h1>
            <p className="description">Simulação de impacto financeiro por flutuação de preços em: <strong>{dietaNome}</strong></p>
          </div>
        </div>
        <div className="action-buttons">
          <button className="btn-premium-outline h-11 px-6 gap-2" onClick={resetSimulation}>
            <RefreshCw size={20} strokeWidth={3} />
            <span>Resetar Preços</span>
          </button>
          <button className="btn-premium-solid indigo h-11 px-6 gap-2">
            <Save size={20} strokeWidth={3} />
            <span>Gerenciar Dieta</span>
          </button>
        </div>
      </div>

      <div className="top-stats-row">
        <div className="stat-card glass primary">
          <div className="stat-content">
            <span className="stat-label">Custo/Cab/Dia (Simulado)</span>
            <div className="stat-value-group">
              <span className="text-emerald-600 font-extrabold text-2xl">R$</span>
              <span className="value">{stats.simulado.toFixed(2)}</span>
            </div>
            <p className={`mt-2 font-black text-sm flex items-center gap-2 ${parseFloat(stats.diferencaPerc) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              <TrendingUp size={16} strokeWidth={3} style={{ transform: parseFloat(stats.diferencaPerc) > 0 ? 'none' : 'rotate(180deg)' }} />
              {stats.diferencaPerc}% vs custo atual
            </p>
          </div>
          <div className="stat-icon-bg">
            <DollarSign size={64} color="#10b981" />
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-content">
            <span className="stat-label">Impacto Projetado/Mês</span>
            <div className="stat-value-group">
              <span className="text-sky-600 font-extrabold text-2xl">R$</span>
              <span className="value">{Math.abs(stats.impactoMes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <p className="mt-2 text-slate-500 font-bold text-sm">Projeção para rebanho de 1.000 cab.</p>
          </div>
          <div className="stat-icon-bg">
            <Zap size={64} color="#0ea5e9" />
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-content">
            <span className="stat-label">Conversão Alimentar</span>
            <div className="stat-value-group">
              <span className="value">1:6.2</span>
            </div>
            <p className="mt-2 text-amber-600 font-bold text-sm flex items-center gap-2">
              <Target size={16} strokeWidth={3} /> Meta de Eficiência Bio.
            </p>
          </div>
          <div className="stat-icon-bg">
            <Scale size={64} color="#f59e0b" />
          </div>
        </div>
      </div>

      <div className="analise-main-grid">
        <div className="simulador-section card glass">
          <div className="card-header">
            <div className="title">
              <Calculator size={20} strokeWidth={3} />
              <h3>Simulador de Matéria Prima</h3>
            </div>
            <div className="cms-input">
              <label>CMS (kg):</label>
              <div className="input-with-icon mini">
                <input type="number" value={cms} onChange={(e) => setCms(parseFloat(e.target.value) || 0)} />
                <Scale size={14} className="field-icon" />
              </div>
            </div>
          </div>

          <div className="price-table">
            <div className="table-row header">
              <span>Ingrediente</span>
              <span>Proporção</span>
              <span>Preço Base (kg)</span>
              <span>Novo Preço (kg)</span>
            </div>
            {ingredientes.map((ing) => (
              <div key={ing.id} className="table-row">
                <div className="name-col">
                  <strong>{ing.nome}</strong>
                </div>
                <div className="perc-col">
                  <span className="perc-badge">{ing.proporcao}%</span>
                </div>
                <div className="price-col">
                  R$ {ing.custoOriginal.toFixed(2)}
                </div>
                <div className="input-col">
                  <div className="input-with-icon">
                    <input 
                      type="number" 
                      step="0.01" 
                      value={ing.custoSimulado} 
                      onChange={(e) => handlePriceChange(ing.id, e.target.value)}
                    />
                    <DollarSign size={18} className="field-icon" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="simulation-alert">
            <AlertTriangle size={20} strokeWidth={3} />
            <p>Os valores simulados são projeções e não alteram o cadastro real dos insumos até que sejam confirmados no botão de salvar.</p>
          </div>
        </div>

        <div className="visualizacao-section card glass">
          <div className="visual-tabs">
            <button className={visualTab === 'componente' ? 'active' : ''} onClick={() => setVisualTab('componente')}><BarChart3 size={18} strokeWidth={3} /> Custo por Componente</button>
            <button className={visualTab === 'animais' ? 'active' : ''} onClick={() => setVisualTab('animais')}><Users size={18} strokeWidth={3} /> Impacto por Animal</button>
          </div>

          {visualTab === 'componente' ? (
            <div className="chart-container">
              <div className="mock-donut">
                 <div className="donut-segment milho" style={{'--value': 65} as React.CSSProperties}></div>
                 <div className="donut-segment nucleo" style={{'--value': 35} as React.CSSProperties}></div>
                 <div className="donut-center">
                    <strong>R$ {stats.simulado.toFixed(2)}</strong>
                    <span>Total/Cab/Dia</span>
                 </div>
              </div>

              <div className="chart-legend">
                <div className="legend-item">
                  <span className="dot milho"></span>
                  <div className="legend-info">
                    <span className="label">Milho (Concentrado)</span>
                    <span className="value">R$ {(ingredientes[0].custoSimulado * (ingredientes[0].proporcao/100) * cms).toFixed(2)} (65%)</span>
                  </div>
                </div>
                <div className="legend-item">
                  <span className="dot nucleo"></span>
                  <div className="legend-info">
                    <span className="label">Núcleo (Mineral/Adit.)</span>
                    <span className="value">R$ {(ingredientes[1].custoSimulado * (ingredientes[1].proporcao/100) * cms).toFixed(2)} (35%)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
             <div className="animal-simulation-list animate-fade-in">
                <div className="simulation-controls">
                   <p className="tab-helper">Impacto individual no <strong>Lote 02</strong></p>
                   <div className="cost-mode-toggle mini">
                      <label className={costCalculationMode === 'fixed' ? 'active' : ''}>
                         <input type="radio" value="fixed" checked={costCalculationMode === 'fixed'} onChange={() => setCostCalculationMode('fixed')} />
                         Fixo
                      </label>
                      <label className={costCalculationMode === 'proportional' ? 'active' : ''}>
                         <input type="radio" value="proportional" checked={costCalculationMode === 'proportional'} onChange={() => setCostCalculationMode('proportional')} />
                         Peso
                      </label>
                   </div>
                </div>
                
                <div className="sim-animal-grid">
                   {(() => {
                      const relevantLoteId = currentDieta?.loteId;
                      const lotAnimals = relevantLoteId 
                        ? animais.filter(a => {
                            const searchStr = `Lote ${relevantLoteId.padStart(2, '0')}`;
                            return a.lote.startsWith(searchStr);
                          })
                        : animais.slice(0, 10); // Show first 10 for sample if no lote linked

                      const totalWeight = lotAnimals.reduce((acc, a) => acc + a.peso, 0);
                      const totalOriginalLotCost = (stats.original) * lotAnimals.length;
                      const totalSimulatedLotCost = (stats.simulado) * lotAnimals.length;

                      return lotAnimals.map(animal => {
                         const weightFactor = animal.peso / (totalWeight || 1);
                         
                         const animalSimCost = costCalculationMode === 'proportional' 
                           ? totalSimulatedLotCost * weightFactor 
                           : stats.simulado;
                           
                         const animalOrigCost = costCalculationMode === 'proportional' 
                           ? totalOriginalLotCost * weightFactor 
                           : stats.original;
                           
                         const animalDiffPerc = ((animalSimCost / (animalOrigCost || 1) - 1) * 100).toFixed(1);

                         return (
                             <div key={animal.id} className="sim-animal-item flex items-center justify-between p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                <div className="animal-basic flex items-center gap-3">
                                   <span className="brinco font-black text-slate-700">#{animal.brinco}</span>
                                   <span className="weight-tag text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{animal.peso} kg {costCalculationMode === 'proportional' && <small className="ml-1 text-[10px]">({(weightFactor * 100).toFixed(1)}%)</small>}</span>
                                </div>
                                <div className="impact-info flex items-center gap-4">
                                   <span className="new-cost font-black text-slate-900">R$ {animalSimCost.toFixed(2)} <small className="text-[10px] text-slate-400">/dia</small></span>
                                   <span className={`diff px-2 py-0.5 rounded-full text-xs font-black border ${parseFloat(animalDiffPerc) > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                      {parseFloat(animalDiffPerc) >= 0 ? '+' : ''}{animalDiffPerc}%
                                   </span>
                                 </div>
                             </div>
                         );
                      });
                   })()}
                </div>
             </div>
          )}

          <div className="summary-footer">
             <div className="footer-item">
                <Calendar size={16} />
                <span>Vigência Sugerida: <strong>15 Dias</strong></span>
             </div>
             <button className="btn-premium-outline h-10 w-10 flex items-center justify-center p-0">
                <Download size={18} strokeWidth={3} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

