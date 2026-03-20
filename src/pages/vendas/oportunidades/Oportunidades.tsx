import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  Plus, 
  Search, 
  Filter, 
  X,
  MoreVertical, 
  Calendar, 
  DollarSign, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  MapPin,
  ChevronRight,
  Briefcase,
  Target
} from 'lucide-react';
import { useOfflineQuery, useOfflineMutation } from '../../../hooks/useOfflineSync';
import { SummaryCard } from '../../../components/SummaryCard';
import { useCompany } from '../../../contexts/CompanyContext';
import { Opportunity, OpportunityStage, Cliente } from '../../../types';
import { ModernModal } from '../../../components/ModernModal';
import './Oportunidades.css';

const STAGES: OpportunityStage[] = ['Novo', 'Qualificacao', 'Proposta', 'Negociacao', 'Fechado', 'Perdido'];

const STAGE_LABELS: Record<OpportunityStage, string> = {
  'Novo': 'Novo Contato',
  'Qualificacao': 'Qualificação',
  'Proposta': 'Proposta Enviada',
  'Negociacao': 'Em Negociação',
  'Fechado': 'Fechado (Ganho)',
  'Perdido': 'Perdido'
};

export const Oportunidades: React.FC = () => {
  const { activeCompanyId } = useCompany();
  const { data: allOpportunities = [] } = useOfflineQuery<Opportunity>(['oportunidades'], 'oportunidades');
  const opportunities = allOpportunities.filter(o => activeCompanyId === 'Todas' || (o as any).empresaId === activeCompanyId);
  const { data: clientes = [] } = useOfflineQuery<Cliente>(['clientes'], 'clientes');
  
  const saveOpportunityMutation = useOfflineMutation<Opportunity>('oportunidades', [['oportunidades']]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Opportunity>>({
    titulo: '',
    valor: 0,
    vencimento: new Date().toISOString().split('T')[0],
    estagio: 'Novo',
    probabilidade: 20,
    contato_nome: '',
    origem: 'Indicação'
  });

  const handleOpenModal = (opp?: Opportunity, viewOnly = false) => {
    setIsViewMode(viewOnly);
    if (opp) {
      setSelectedOpp(opp);
      setFormData({ ...opp });
    } else {
      setSelectedOpp(null);
      setFormData({
        titulo: '',
        valor: 0,
        vencimento: new Date().toISOString().split('T')[0],
        estagio: 'Novo',
        probabilidade: 20,
        contato_nome: '',
        origem: 'Indicação'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.titulo || !formData.contato_nome) {
      alert('Por favor, preencha o título e o nome do contato.');
      return;
    }

    const payload: Opportunity = {
      ...(selectedOpp || {}),
      ...formData,
      id: selectedOpp?.id || Math.random().toString(36).substr(2, 9),
      empresaId: activeCompanyId !== 'Todas' ? activeCompanyId : (selectedOpp as any)?.empresaId,
      tenant_id: 'default',
      created_at: selectedOpp?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Opportunity;

    await saveOpportunityMutation.mutateAsync(payload);
    setIsModalOpen(false);
  };

  const updateStage = async (opp: Opportunity, newStage: OpportunityStage) => {
    const updatedOpp = { ...opp, estagio: newStage, updated_at: new Date().toISOString() };
    await saveOpportunityMutation.mutateAsync(updatedOpp);
  };

  const filteredOpps = opportunities.filter(o => 
    o.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.contato_nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStageTotal = (stage: OpportunityStage) => {
    return filteredOpps
      .filter(o => o.estagio === stage)
      .reduce((acc, curr) => acc + (curr.valor || 0), 0);
  };

  const renderCard = (opp: Opportunity) => (
    <div 
      key={opp.id} 
      className="opportunity-card"
      onClick={() => handleOpenModal(opp, true)}
    >
      <div className="opp-header">
        <span className="opp-title">{opp.titulo}</span>
        <button className="btn-card-action">
          <MoreVertical size={16} />
        </button>
      </div>
      <div className="opp-value">R$ {opp.valor.toLocaleString()}</div>
      <div className="opp-client">
        <User size={14} />
        <span>{opp.contato_nome}</span>
      </div>
      <div className="opp-footer">
        <div className="opp-date">
          <Calendar size={12} />
          <span>{new Date(opp.vencimento).toLocaleDateString('pt-BR')}</span>
        </div>
        <div className={`prob-badge ${opp.probabilidade >= 70 ? 'prob-high' : opp.probabilidade >= 40 ? 'prob-medium' : 'prob-low'}`}>
          {opp.probabilidade}%
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/vendas">Vendas & Comercial</Link>
        <ChevronRight size={14} />
        <span>Oportunidades</span>
      </nav>

      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge blue">
            <Globe size={32} />
          </div>
          <div>
            <h1>Oportunidades (CRM)</h1>
            <p className="description">Gerencie seu funil de vendas, acompanhe negociações e feche mais negócios.</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-premium-outline">
            <span>Ver Dashboard</span>
            <TrendingUp size={18} strokeWidth={3} />
          </button>
          <button className="btn-premium-solid blue" onClick={() => handleOpenModal()}>
            <span>Nova Oportunidade</span>
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <SummaryCard 
          label="Total em Pipeline"
          value={`R$ ${(opportunities.reduce((a, b) => a + (b.valor || 0), 0) / 1000).toFixed(0)}k`}
          icon={DollarSign}
          color="blue"
          delay="0s"
          subtext="Valor bruto estimado"
          trend={{ value: 'Atualizado hoje', type: 'up', icon: TrendingUp }}
        />
        <SummaryCard 
          label="Negociações Ativas"
          value={opportunities.filter(o => !['Fechado', 'Perdido'].includes(o.estagio)).length.toString()}
          icon={Briefcase}
          color="indigo"
          delay="0.1s"
          subtext="No funil de vendas"
        />
        <SummaryCard 
          label="Taxa de Conversão"
          value="24%"
          icon={CheckCircle2}
          color="emerald"
          delay="0.2s"
          trend={{ value: '+2% este mês', type: 'up', icon: TrendingUp }}
        />
      </div>

      <div className="filters-bar mb-6 px-1 flex gap-4">
        <div className="search-wrapper flex-1">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por título, cliente ou contato..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="premium-search"
          />
        </div>
        <button className="btn-premium-outline">
          <Filter size={18} />
          <span>Filtros</span>
        </button>
      </div>

      <div className="crm-pipeline">
        {STAGES.map((stage) => (
          <div key={stage} className="pipeline-column">
            <div className={`column-header stage-${stage.toLowerCase()}`}>
              <div className="column-title">
                {STAGE_LABELS[stage]}
                <span className="column-count">
                  {filteredOpps.filter(o => o.estagio === stage).length}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-400">
                R$ {getStageTotal(stage).toLocaleString()}
              </div>
            </div>
            <div className="column-cards">
              {filteredOpps.filter(o => o.estagio === stage).map(renderCard)}
              {filteredOpps.filter(o => o.estagio === stage).length === 0 && (
                <div className="empty-column-state">
                  Sem oportunidades
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ModernModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isViewMode ? 'Visualizar Oportunidade' : (selectedOpp ? 'Editar Oportunidade' : 'Nova Oportunidade')}
        subtitle="Gerencie os detalhes desta negociação"
        icon={Globe}
        footer={
          <>
            <button className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>
              <X size={18} strokeWidth={3} />
              <span>{isViewMode ? 'Fechar' : 'Cancelar'}</span>
            </button>
            {!isViewMode && (
              <button className="btn-premium-solid indigo" onClick={handleSave}>
                <span>{selectedOpp ? 'Salvar Alterações' : 'Criar Oportunidade'}</span>
                {selectedOpp ? <CheckCircle2 size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
              </button>
            )}
          </>
        }
      >
        <div className="modal-content-scrollable">
          <div className="form-sections-grid">
            <div className="form-section">
              <div className="form-section-title">
                <Target size={16} />
                <span>Dados da Negociação</span>
              </div>
              <div className="form-grid">
                <div className="form-group col-12">
                  <label>Título da Oportunidade</label>
                  <input 
                    type="text" 
                    value={formData.titulo} 
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    disabled={isViewMode}
                    placeholder="Ex: Venda de Reprodutores Nelore"
                  />
                </div>
                <div className="form-group col-6">
                  <label>Valor Estimado (R$)</label>
                  <div className="input-with-icon">
                    <DollarSign size={16} className="icon-field" />
                    <input 
                      type="number" 
                      value={formData.valor} 
                      onChange={(e) => setFormData({...formData, valor: Number(e.target.value)})}
                      disabled={isViewMode}
                    />
                  </div>
                </div>
                <div className="form-group col-6">
                  <label>Probabilidade (%)</label>
                  <select 
                    value={formData.probabilidade} 
                    onChange={(e) => setFormData({...formData, probabilidade: Number(e.target.value)})}
                    disabled={isViewMode}
                  >
                    <option value={10}>10% - Contato Inicial</option>
                    <option value={25}>25% - Qualificado</option>
                    <option value={50}>50% - Proposta Enviada</option>
                    <option value={75}>75% - Negociação</option>
                    <option value={90}>90% - Em Contrato</option>
                    <option value={100}>100% - Fechado</option>
                  </select>
                </div>
                <div className="form-group col-6">
                  <label>Estágio</label>
                  <select 
                    value={formData.estagio} 
                    onChange={(e) => setFormData({...formData, estagio: e.target.value as OpportunityStage})}
                    disabled={isViewMode}
                  >
                    {STAGES.map(s => (
                      <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group col-6">
                  <label>Previsão de Fechamento</label>
                  <input 
                    type="date" 
                    value={formData.vencimento} 
                    onChange={(e) => setFormData({...formData, vencimento: e.target.value})}
                    disabled={isViewMode}
                  />
                </div>
                <div className="form-group col-12">
                  <label>Descrição / Histórico</label>
                  <textarea 
                    rows={3}
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    disabled={isViewMode}
                    placeholder="Notas internas sobre a negociação..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="form-divider" />

            <div className="form-section">
              <div className="form-section-title">
                <User size={16} />
                <span>Contato e Origem</span>
              </div>
              <div className="form-grid">
                <div className="form-group col-12">
                  <label>Nome do Contato</label>
                  <div className="input-with-icon">
                    <User size={16} className="icon-field" />
                    <input 
                      type="text" 
                      value={formData.contato_nome} 
                      onChange={(e) => setFormData({...formData, contato_nome: e.target.value})}
                      disabled={isViewMode}
                    />
                  </div>
                </div>
                <div className="form-group col-6">
                  <label>Telefone</label>
                  <div className="input-with-icon">
                    <Phone size={16} className="icon-field" />
                    <input 
                      type="text" 
                      value={formData.contato_tel} 
                      onChange={(e) => setFormData({...formData, contato_tel: e.target.value})}
                      disabled={isViewMode}
                    />
                  </div>
                </div>
                <div className="form-group col-6">
                  <label>E-mail</label>
                  <div className="input-with-icon">
                    <Mail size={16} className="icon-field" />
                    <input 
                      type="email" 
                      value={formData.contato_email} 
                      onChange={(e) => setFormData({...formData, contato_email: e.target.value})}
                      disabled={isViewMode}
                    />
                  </div>
                </div>
                <div className="form-group col-12">
                  <label>Origem do Prospect</label>
                  <select 
                    value={formData.origem} 
                    onChange={(e) => setFormData({...formData, origem: e.target.value})}
                    disabled={isViewMode}
                  >
                    <option value="Indicação">Indicação</option>
                    <option value="Site">Site / Web</option>
                    <option value="Redes Sociais">Redes Sociais</option>
                    <option value="Feira/Evento">Feira / Evento</option>
                    <option value="Ativo">Ativo / Prospect</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModernModal>
    </div>
  );
};
