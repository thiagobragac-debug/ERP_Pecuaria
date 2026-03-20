import React from 'react';
import { FileText, Users, Calendar, Building2, MapPin, CreditCard } from 'lucide-react';
import { SearchableSelect } from '../../../../components/SearchableSelect';
import { SalesInvoice, Cliente, Company } from '../../../../types';

interface Props {
  data: Partial<SalesInvoice>;
  onChange: (data: Partial<SalesInvoice>) => void;
  isViewMode?: boolean;
  clients: Cliente[];
  companies: Company[];
}

export const SaleHeader: React.FC<Props> = ({ data, onChange, isViewMode, clients, companies }) => {
  return (
    <div className="modern-form-section">
      <div className="section-header mb-6">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Identificação da Venda</h3>
        </div>
        <div className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg uppercase tracking-widest">
          Ref: {data.numero || 'NOVO'}
        </div>
      </div>

      <div className="modern-form-row mb-6">
        <div className="modern-form-group">
          <SearchableSelect
            label="Cliente (Destino)"
            options={clients.map(c => ({ 
              id: c.id, 
              label: c.nome, 
              sublabel: (c as any).documento || (c as any).cpf_cnpj || 'Sem documento' 
            }))}
            value={data.cliente_id || ''}
            onChange={(val) => onChange({ ...data, cliente_id: val })}
            disabled={isViewMode}
            required
          />
        </div>
      </div>

      <div className="modern-form-row three-cols mb-6">
        <div className="modern-form-group">
          <label>Data da Venda</label>
          <div className="modern-input-wrapper">
            <input 
              type="date" 
              className="modern-input"
              value={data.dataEmissao || (data as any).data || ''} 
              onChange={(e) => onChange({ ...data, dataEmissao: e.target.value })}
              disabled={isViewMode}
              required
            />
            <Calendar size={18} className="modern-field-icon" />
          </div>
        </div>

        <div className="modern-form-group">
          <label>Previsão de Saída</label>
          <div className="modern-input-wrapper">
            <input 
              type="date" 
              className="modern-input"
              value={(data as any).dataSaida || ''} 
              onChange={(e) => onChange({ ...data, dataSaida: e.target.value })}
              disabled={isViewMode}
            />
            <Calendar size={18} className="modern-field-icon text-indigo-400" />
          </div>
        </div>

        <div className="modern-form-group">
          <label>Nº Pedido (PV)</label>
          <div className="modern-input-wrapper">
            <input 
              type="text" 
              className="modern-input font-bold text-slate-700"
              value={data.numero || ''} 
              onChange={(e) => onChange({ ...data, numero: e.target.value })}
              disabled={isViewMode}
              placeholder="PV-2024-001"
            />
            <FileText size={18} className="modern-field-icon" />
          </div>
        </div>
      </div>

      <div className="modal-divider my-8" />

      <div className="section-header mb-6">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Origem & Faturamento</h3>
        </div>
      </div>

      <div className="modern-form-row two-cols">
        <div className="modern-form-group">
          <SearchableSelect
            label="Empresa / Unidade Emissora"
            options={companies.filter(c => c.status === 'Ativa').map(c => ({ 
              id: c.id, 
              label: c.nomeFantasia, 
              sublabel: !c.isMatriz ? 'Filial' : 'Matriz' 
            }))}
            value={data.empresaId || ''}
            onChange={(val) => onChange({ ...data, empresaId: val })}
            disabled={isViewMode}
            required
          />
        </div>

        <div className="modern-form-group">
          <label>Condição de Pagamento</label>
          <div className="modern-input-wrapper">
            <select 
              className="modern-input font-bold"
              value={(data as any).meioPagamento || 'Boleto'} 
              onChange={(e) => onChange({ ...data, meioPagamento: e.target.value })}
              disabled={isViewMode}
            >
              <option value="Boleto">Boleto Bancário</option>
              <option value="Pix">Pix / Transferência</option>
              <option value="Cartao">Cartão de Crédito</option>
              <option value="Dinheiro">Dinheiro</option>
            </select>
            <CreditCard size={18} className="modern-field-icon" />
          </div>
        </div>
      </div>
    </div>
  );
};
