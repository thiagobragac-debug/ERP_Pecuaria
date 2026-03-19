import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Map as MapIcon, 
  Maximize2, 
  Layers, 
  Info, 
  Calendar, 
  TrendingUp,
  Activity,
  Wind,
  Droplets,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import './MapaPastagem.css';

interface PastoData {
  id: string;
  nome: string;
  area: number;
  forrageira: string;
  capacidade: number;
  lotacaoAtual: number;
  status: 'Ocupado' | 'Vazio' | 'Descanso' | 'Reforma';
  ultimaAdubacao: string;
  ultimaChuva: string;
}

const mockPastos: PastoData[] = [
  { id: '1', nome: 'Piquete 01 - Sede', area: 12.5, forrageira: 'Brachiaria Brizantha', capacidade: 35, lotacaoAtual: 3.2, status: 'Ocupado', ultimaAdubacao: '2024-02-15', ultimaChuva: '2024-03-10' },
  { id: '2', nome: 'Invernada Boa Vista', area: 45.0, forrageira: 'Panicum Maximum', capacidade: 120, lotacaoAtual: 0, status: 'Descanso', ultimaAdubacao: '2023-11-20', ultimaChuva: '2024-03-10' },
  { id: '3', nome: 'Pasto da Baixada', area: 22.0, forrageira: 'Cynodon (Tifton 85)', capacidade: 80, lotacaoAtual: 4.1, status: 'Ocupado', ultimaAdubacao: '2024-01-05', ultimaChuva: '2024-03-11' },
  { id: '4', nome: 'Reserva Legal', area: 15.8, forrageira: 'Nativa/Campo', capacidade: 15, lotacaoAtual: 0.5, status: 'Reforma', ultimaAdubacao: '2023-01-10', ultimaChuva: '2024-02-28' },
  { id: '5', nome: 'Piquete 02 - Norte', area: 18.2, forrageira: 'Brachiaria Humidicola', capacidade: 45, lotacaoAtual: 2.1, status: 'Ocupado', ultimaAdubacao: '2024-03-01', ultimaChuva: '2024-03-12' },
  { id: '6', nome: 'Invernada do Morro', area: 33.5, forrageira: 'Brachiaria Brizantha', capacidade: 90, lotacaoAtual: 0, status: 'Vazio', ultimaAdubacao: '2023-12-10', ultimaChuva: '2024-03-10' },
];

export const MapaPastagem: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedPasto, setSelectedPasto] = useState<PastoData | null>(mockPastos[0]);
  const [filter, setFilter] = useState<'todos' | 'status' | 'lotacao'>('todos');

  const getHeatmapColor = (lotacao: number) => {
    if (lotacao === 0) return 'empty';
    if (lotacao < 1.5) return 'low';
    if (lotacao <= 3.0) return 'medium';
    return 'high';
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'Ocupado': return 'Em Pastejo';
      case 'Descanso': return 'Vazio (D)';
      case 'Reforma': return 'Em Reforma';
      default: return 'Livre';
    }
  };

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/pecuaria/rebanho">Pecuária</Link>
        <ChevronRight size={14} />
        <Link to="/pecuaria/pastos">Pastos</Link>
        <ChevronRight size={14} />
        <span>Mapa</span>
      </nav>
      <div className="page-header-row">
        <div className="title-section">
          <button className="btn-premium-outline back-btn h-10 px-3" onClick={onBack}>
            <ArrowLeft size={20} strokeWidth={3} />
          </button>
          <div className="icon-badge emerald">
            <MapIcon size={24} strokeWidth={3} />
          </div>
          <div>
            <h1>Mapa Operacional de Pastagens</h1>
            <p className="description">Visão espacial da propriedade e monitoramento térmico de lotação UA/ha.</p>
          </div>
        </div>
        <div className="map-controls">
           <div className="control-group">
              <button className={filter === 'todos' ? 'active' : ''} onClick={() => setFilter('todos')}>Satélite</button>
              <button className={filter === 'lotacao' ? 'active' : ''} onClick={() => setFilter('lotacao')}>Heatmap Lotação</button>
              <button className={filter === 'status' ? 'active' : ''} onClick={() => setFilter('status')}>Status Manejo</button>
           </div>
        </div>
      </div>

      <div className="map-main-content">
        <div className="visual-map-container card glass">
          <div className="map-grid">
            {mockPastos.map((pasto) => (
              <div 
                key={pasto.id} 
                className={`pasto-block ${getHeatmapColor(pasto.lotacaoAtual)} ${pasto.status.toLowerCase()} ${selectedPasto?.id === pasto.id ? 'selected' : ''}`}
                onClick={() => setSelectedPasto(pasto)}
              >
                <div className="block-overlay">
                   <div className="pasto-tag">
                      <span className="name">{pasto.nome}</span>
                      <span className="area">{pasto.area} ha</span>
                   </div>
                   {pasto.lotacaoAtual > 0 && (
                      <div className="lotacao-badge">
                        <TrendingUp size={12} strokeWidth={3} />
                        {pasto.lotacaoAtual} UA
                      </div>
                   )}
                </div>
              </div>
            ))}
            {/* Simulation of other farm areas */}
            <div className="farm-area forest">Reserva Florestal</div>
            <div className="farm-area facility">Sede / Curral</div>
          </div>
          
          <div className="map-legend card glass">
             <div className="legend-title">Legenda de {filter === 'lotacao' ? 'Lotação (UA/ha)' : 'Status'}</div>
             <div className="legend-items">
                {filter === 'lotacao' ? (
                  <>
                    <div className="item"><span className="dot high"></span> Alta ({'>'}3.0)</div>
                    <div className="item"><span className="dot medium"></span> Média (1.5-3.0)</div>
                    <div className="item"><span className="dot low"></span> Baixa ({'<'}1.5)</div>
                    <div className="item"><span className="dot empty"></span> Vazio</div>
                  </>
                ) : (
                  <>
                    <div className="item"><span className="dot ocupado"></span> Ocupado</div>
                    <div className="item"><span className="dot descanso"></span> Descanso</div>
                    <div className="item"><span className="dot reforma"></span> Reforma</div>
                  </>
                )}
             </div>
          </div>
        </div>

        <div className="detail-panel-section">
          {selectedPasto ? (
            <div className="pasto-detail-card card glass animate-slide-right">
              <div className="detail-header">
                <div className="tag-row">
                  <span className={`status-pill ${selectedPasto.status.toLowerCase()}`}>
                    {getStatusLabel(selectedPasto.status)}
                  </span>
                  <span className="id-badge">ID: {selectedPasto.id}</span>
                </div>
                <h2>{selectedPasto.nome}</h2>
                <div className="area-total">
                  <Maximize2 size={16} strokeWidth={3} />
                  {selectedPasto.area} Hectares Totais
                </div>
              </div>

              <div className="detail-stats-grid">
                 <div className="d-stat">
                    <span className="label">Lotação Atual</span>
                    <div className="value-group">
                       <span className="val">{selectedPasto.lotacaoAtual}</span>
                       <span className="unit">UA/ha</span>
                    </div>
                 </div>
                 <div className="d-stat">
                    <span className="label">Capacidade</span>
                    <div className="value-group">
                       <span className="val">{selectedPasto.capacidade}</span>
                       <span className="unit">UA Total</span>
                    </div>
                 </div>
              </div>

              <div className="manuseio-info">
                 <div className="info-row">
                    <Layers size={18} strokeWidth={3} />
                    <div className="text">
                       <span>Espécie Forrageira</span>
                       <strong>{selectedPasto.forrageira}</strong>
                    </div>
                 </div>
                 <div className="info-row">
                    <Activity size={18} strokeWidth={3} />
                    <div className="text">
                       <span>Última Adubação</span>
                       <strong>{new Date(selectedPasto.ultimaAdubacao).toLocaleDateString('pt-BR')}</strong>
                    </div>
                 </div>
                 <div className="info-row">
                    <Droplets size={18} strokeWidth={3} />
                    <div className="text">
                       <span>Pluviometria Recente</span>
                       <strong>{new Date(selectedPasto.ultimaChuva).toLocaleDateString('pt-BR')}</strong>
                    </div>
                 </div>
              </div>

              <div className="pasto-alert">
                 {selectedPasto.lotacaoAtual > 3.5 ? (
                   <div className="alert-content warning">
                      <AlertTriangle size={20} />
                      <p>Atenção: A lotação atual excede a capacidade de suporte recomendada. Risco de degradação.</p>
                   </div>
                 ) : (
                   <div className="alert-content safe">
                      <CheckCircle2 size={20} />
                      <p>Manejo adequado: O índice de lotação está dentro da zona de conforto biológico.</p>
                   </div>
                 )}
              </div>

              <div className="action-buttons-vertical">
                 <button className="btn-primary-action">Registrar Manejo</button>
                 <button className="btn-secondary-action">Histórico de Lote</button>
              </div>
            </div>
          ) : (
            <div className="empty-panel card glass">
               <Info size={48} />
               <p>Selecione um pasto no mapa para visualizar os detalhes técnicos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

