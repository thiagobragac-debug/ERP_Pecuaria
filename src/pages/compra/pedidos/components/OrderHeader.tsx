import React from 'react';
import { Info, Hash, Calendar, Building2, Calculator, Truck, CreditCard } from 'lucide-react';
import { PurchaseOrder, Company, Supplier } from '../../../../types';
import { SearchableSelect } from '../../../../components/SearchableSelect';

interface Props {
  data: Partial<PurchaseOrder>;
  onChange: (data: Partial<PurchaseOrder>) => void;
  isViewMode?: boolean;
  suppliers: Supplier[];
  companies: Company[];
}

export const OrderHeader: React.FC<Props> = ({ data, onChange, isViewMode, suppliers, companies }) => {
  return (
    <div className="modern-form-section">
      <div className="section-header mb-4">
        <Info size={16} className="text-indigo-500" />
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Dados do Pedido</h3>
      </div>

      <div className="modern-form-row four-cols">
        <div className="modern-form-group">
          <label>Número</label>
          <div className="modern-input-wrapper">
            <input type="text" className="modern-input bg-slate-50" value={data.numero || ''} readOnly />
            <Hash size={18} className="modern-field-icon" />
          </div>
        </div>

        <div className="modern-form-group">
          <label>Data de Emissão</label>
          <div className="modern-input-wrapper">
            <input 
              type="date" 
              className="modern-input"
              value={data.data || ''} 
              onChange={(e) => onChange({ ...data, data: e.target.value })} 
              required 
              disabled={isViewMode} 
            />
            <Calendar size={18} className="modern-field-icon" />
          </div>
        </div>

        <div className="modern-form-group">
          <SearchableSelect
            label="Empresa / Unidade"
            options={companies.filter((c: Company) => c.status === 'Ativa').map((c: Company) => ({ id: c.id, label: c.nomeFantasia, sublabel: !c.isMatriz ? 'Filial' : 'Matriz' }))}
            value={data.empresaId || ''}
            onChange={(val) => onChange({ ...data, empresaId: val })}
            disabled={isViewMode}
            required
          />
        </div>

        <div className="modern-form-group">
          <label>Ref. Cotação</label>
          <div className="modern-input-wrapper">
            <input 
              type="text" 
              className="modern-input"
              value={data.mapaReferencia || ''} 
              onChange={(e) => onChange({ ...data, mapaReferencia: e.target.value })}
              placeholder="Ex: MC-2024"
              disabled={isViewMode}
            />
            <Calculator size={18} className="modern-field-icon" />
          </div>
        </div>
      </div>

      <div className="modern-form-row three-cols mt-4">
        <div className="modern-form-group two-cols">
          <SearchableSelect
            label="Fornecedor"
            options={suppliers.map(s => ({ id: s.id, label: s.nomeFantasia, sublabel: s.documento }))}
            value={data.fornecedor_id || ''}
            onChange={(val) => {
              const supplier = suppliers.find(s => s.id === val);
              onChange({ 
                ...data, 
                fornecedor_id: val,
                fornecedorNome: supplier?.nomeFantasia || ''
              });
            }}
            disabled={isViewMode}
            required
          />
        </div>

        <div className="modern-form-group">
          <label>Previsão de Entrega</label>
          <div className="modern-input-wrapper">
            <input 
              type="date" 
              className="modern-input"
              value={data.previsaoEntrega || ''} 
              onChange={(e) => onChange({ ...data, previsaoEntrega: e.target.value })} 
              required 
              disabled={isViewMode} 
            />
            <Truck size={18} className="modern-field-icon" />
          </div>
        </div>
      </div>

      <div className="modern-form-row three-cols mt-4">
        <div className="modern-form-group">
          <label>Condição de Pagamento</label>
          <div className="modern-input-wrapper">
            <select 
              className="modern-input"
              value={data.condicaoPagamento || ''} 
              onChange={(e) => onChange({ ...data, condicaoPagamento: e.target.value })} 
              required 
              disabled={isViewMode}
            >
              <option value="">Selecione...</option>
              <option value="À Vista">À Vista</option>
              <option value="15 Dias">15 Dias</option>
              <option value="30 Dias">30 Dias</option>
              <option value="30/60 Dias">30/60 Dias</option>
            </select>
            <CreditCard size={18} className="modern-field-icon" />
          </div>
        </div>

        <div className="modern-form-group">
          <label>Status do Pedido</label>
          <div className="modern-input-wrapper bg-slate-50 border-slate-100">
             <span className="modern-input flex items-center font-bold text-slate-500">
               {data.status || 'Pendente'}
             </span>
          </div>
        </div>
      </div>
    </div>
  );
};
