import React, { useState } from 'react';
import { 
  Fuel, 
  Plus, 
  Search, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Gauge, 
  Truck, 
  X,
  ChevronLeft,
  ChevronRight,
  Droplet,
  User,
  History,
  TrendingUp,
  Filter
} from 'lucide-react';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { supabase } from '../../services/supabase';
import { Asset, Abastecimento as AbastecimentoType } from '../../types';
import { INITIAL_COMPANIES } from '../../data/initialData';
import { useCompany } from '../../contexts/CompanyContext';
import './Abastecimento.css';


export const Abastecimento: React.FC = () => {
  const { activeCompanyId } = useCompany();
  const allRecords = useLiveQuery(() => db.abastecimentos.toArray()) || [];
  const allAssets = useLiveQuery(() => db.ativos.toArray()) || [];

  // Filter by active company
  const records = allRecords.filter(r => activeCompanyId === 'Todas' || r.empresaId === activeCompanyId);
  const assets = allAssets.filter(a => activeCompanyId === 'Todas' || a.empresaId === activeCompanyId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    assetId: 'Todos',
    data: '',
    operador: '',
    tipoCombustivel: 'Todos'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const {
    paginatedData,
    currentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    nextPage,
    prevPage,
    goToPage,
    startIndex,
    endIndex,
    totalItems
  } = usePagination({ data: records as AbastecimentoType[], initialItemsPerPage: 10 });

  const [formData, setFormData] = useState<Partial<AbastecimentoType>>({
    data: new Date().toISOString().split('T')[0],
    combustivel: 'Diesel'
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ativo_id || !formData.quantidade || !formData.valorTotal) {
      alert('Preencha os campos obrigatórios');
      return;
    }

    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      const tenant_id = user?.user_metadata?.tenant_id || 'default';
      const asset = assets.find(a => a.id === formData.ativo_id);

      const newRecord: AbastecimentoType = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        ativo_nome: asset?.nome || 'N/A',
        empresaId: asset?.empresaId || (activeCompanyId === 'Todas' ? undefined : activeCompanyId),
        tenant_id
      } as AbastecimentoType;

      await dataService.saveItem('abastecimentos', newRecord);
      setIsModalOpen(false);
      setFormData({
        data: new Date().toISOString().split('T')[0],
        combustivel: 'Diesel'
      });
    } catch (error) {
      console.error('Error saving refueling:', error);
      alert('Erro ao salvar abastecimento');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Excluir este abastecimento?')) {
      await dataService.deleteItem('abastecimentos', id);
    }
  };

  const getAsset = (id: string) => assets.find(a => a.id === id);

  const calculateConsumption = (ativo_id: string) => {
    const assetRecords = records.filter(r => r.ativo_id === ativo_id);
    if (assetRecords.length < 2) return '--';
    const sorted = [...assetRecords].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    const latest = sorted[0];
    const previous = sorted[1];
    const diffUsage = latest.odometroHorimetro - previous.odometroHorimetro;
    if (diffUsage <= 0) return '--';
    return (latest.quantidade / diffUsage).toFixed(2);
  };

  const totalGasto = records.reduce((acc, r) => acc + r.valorTotal, 0);

  const stats = [
    { label: 'Investimento (Mês)', value: `R$ ${totalGasto.toLocaleString()}`, icon: DollarSign, color: 'indigo', subtext: 'Consumo consolidado' },
    { label: 'Média Frota (L/h)', value: '1.18', icon: Droplet, color: 'blue', subtext: 'Base: Tratores' },
    { label: 'Abastecimentos', value: records.length.toString().padStart(2, '0'), icon: History, color: 'emerald', subtext: 'Registros no período' },
    { label: 'Eficiência Energética', value: '+5.4%', icon: TrendingUp, color: 'orange', subtext: 'Vs. mês anterior' },
  ];


  return (
    <div className="page-container fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <Fuel size={32} strokeWidth={3} />
          </div>
          <div>
            <h1>Gestão de Combustíveis</h1>
            <p className="description">Monitoramento de eficiência energética e custos operacionais da frota.</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-premium-solid indigo h-11 px-6 flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} strokeWidth={3} /> Novo Lançamento
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card glass animate-slide-up">
          <div className="summary-info">
            <span className="summary-label">Gasto Total (Mês)</span>
            <span className="summary-value">R$ 5.420</span>
            <span className="summary-subtext desc">Volume total: 980L</span>
          </div>
          <div className="summary-icon blue">
            <DollarSign size={28} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Autonomia Rebanho</span>
            <span className="summary-value">12 <small>dias</small></span>
            <span className="summary-subtext desc">Tanque central: 45%</span>
          </div>
          <div className="summary-icon emerald">
            <Droplet size={28} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Média L/h (Tratores)</span>
            <span className="summary-value">8.42</span>
            <span className="summary-subtext desc">Ideal estipulado: 8.0</span>
          </div>
          <div className="summary-icon indigo">
            <Gauge size={28} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Eficiência Mensal</span>
            <span className="summary-value">+4.2%</span>
            <span className="summary-subtext desc">Vs. mês anterior</span>
          </div>
          <div className="summary-icon orange">
            <TrendingUp size={28} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por ativo ou operador..."
          actionsLabel="Filtragem"
        >
          <button 
            className={`btn-premium-outline h-11 px-6 flex items-center gap-2 ${isFiltersOpen ? 'filter-active' : ''}`}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter size={18} strokeWidth={3} />
            <span>{isFiltersOpen ? 'Fechar Filtros' : 'Filtros Avançados'}</span>
          </button>
        </TableFilters>


        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ativo / Equipamento</th>
                <th>Data / Operador</th>
                <th>Volume</th>
                <th>Valor Total</th>
                <th>Consumo (L/ut)</th>
                <th>Leitura</th>
                <th className="text-right">Ações</th>
              </tr>
              {isFiltersOpen && (
                  <ColumnFilters
                    columns={[
                      { key: 'assetId', type: 'select', options: assets.map(a => a.nome), placeholder: 'Equipamento...' },
                      { key: 'data', type: 'text', placeholder: 'Data...' },
                      { key: 'operador', type: 'text', placeholder: 'Operador...' },
                      { key: 'tipoCombustivel', type: 'select', options: ['Diesel', 'Gasolina', 'Etanol', 'Arla'] }
                    ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                />
              )}
            </thead>
            <tbody>
              {(paginatedData as AbastecimentoType[]).map((record) => {
                const asset = getAsset(record.ativo_id);
                return (
                  <tr key={record.id}>
                    <td>
                      <div className="asset-info">
                        <div className={`asset-icon-badge ${asset?.categoria?.toLowerCase() || 'default'}`}>
                          <Truck size={18} />
                        </div>
                        <div className="asset-text">
                          <strong className="text-slate-900">{asset?.nome || 'N/A'}</strong>
                          <span className="sub-info">{asset?.placaOuSerie}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="datetime-cell">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="font-bold text-slate-700">{new Date(record.data).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <User size={12} className="text-slate-400" />
                          <span className="sub-info">{record.operador}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="volume-badge">
                        <strong className="text-indigo-700">{record.quantidade}</strong> <small>L</small>
                      </div>
                    </td>
                    <td>
                      <strong className="text-slate-900">R$ {record.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </td>
                    <td>
                      <span className="consumption-value font-bold text-emerald-600">
                        {calculateConsumption(record.ativo_id)} <small>{asset?.tipoUso === 'Horas' ? 'L/h' : 'L/km'}</small>
                      </span>
                    </td>
                    <td>
                      <div className="usage-pill">
                        <Gauge size={14} className="text-slate-400" />
                        <span className="font-bold text-slate-700">{record.odometroHorimetro.toLocaleString()} <small className="font-normal text-slate-400">{asset?.tipoUso}</small></span>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="table-actions">
                        <button className="action-btn-global btn-delete" title="Excluir" onClick={() => handleDelete(record.id)}><Trash2 size={18} strokeWidth={3} /></button>
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
          label="abastecimentos"
        />

      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Lançar Abastecimento"
        subtitle="Informe os detalhes do consumo de combustível"
        icon={Droplet}
        size="lg"
        footer={
          <div className="flex gap-3 w-full justify-end">
            <button className="btn-premium-outline px-6" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button className="btn-premium-solid indigo px-6" onClick={handleSave}>Salvar Lançamento</button>
          </div>
        }
      >
        <div className="form-sections-grid">
          <div className="form-section">
            <div className="form-grid">
              <div className="form-group col-12">
                <label>Ativo / Equipamento</label>
                <select required value={formData.ativo_id} onChange={(e) => setFormData({...formData, ativo_id: e.target.value})}>
                  <option value="">Selecione o ativo...</option>
                  {assets.filter(a => {
                    const company = INITIAL_COMPANIES.find(c => c.id === a.empresaId);
                    return !company || company.status === 'Ativa';
                  }).map(a => <option key={a.id} value={a.id}>{a.nome} ({a.placaOuSerie})</option>)}
                </select>
              </div>
              <div className="form-group col-6">
                <label>Data</label>
                <input type="date" required value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} />
              </div>
              <div className="form-group col-6">
                <label>Tipo de Combustível</label>
                <select value={formData.combustivel} onChange={(e) => setFormData({...formData, combustivel: e.target.value as any})}>
                  <option value="Diesel S10">Diesel S10</option>
                  <option value="Diesel S500">Diesel S500</option>
                  <option value="Gasolina">Gasolina</option>
                  <option value="Etanol">Etanol</option>
                </select>
              </div>
              <div className="form-group col-4">
                <label>Volume (Litros)</label>
                <input type="number" required placeholder="0.00" onChange={(e) => setFormData({...formData, quantidade: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="form-group col-4">
                <label>Valor Total (R$)</label>
                <input type="number" required placeholder="0.00" onChange={(e) => setFormData({...formData, valorTotal: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="form-group col-4">
                <label>Horímetro / Odômetro</label>
                <input type="number" required placeholder="Leitura atual" onChange={(e) => setFormData({...formData, odometroHorimetro: parseInt(e.target.value) || 0})} />
              </div>
              <div className="form-group col-12">
                <label>Operador / Motorista</label>
                <input type="text" placeholder="Nome do responsável" onChange={(e) => setFormData({...formData, operador: e.target.value})} />
              </div>
            </div>
          </div>
        </div>
      </StandardModal>
    </div>
  );
};

