import { FileText, Building2, Calendar, Hash, Globe, User, MapPin } from 'lucide-react';
import { SearchableSelect } from '../../../../components/SearchableSelect';
import { NotaEntrada, Company, Supplier } from '../../../../types';

interface Props {
  data: Partial<NotaEntrada>;
  onChange: (data: Partial<NotaEntrada>) => void;
  isViewMode?: boolean;
  empresas: Company[];
  fornecedores: Supplier[];
}

export const InvoiceHeader: React.FC<Props> = ({ data, onChange, isViewMode, empresas, fornecedores }) => {
  return (
    <div className="modern-form-section">
      <div className="section-header mb-4">
        <FileText size={16} className="text-indigo-500" />
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Identificação da NF-e</h3>
      </div>
      
      <div className="modern-form-row mb-4">
        <div className="modern-form-group">
          <label>Chave de Acesso (44 dígitos)</label>
          <div className="modern-input-wrapper">
            <input 
              type="text" 
              className="modern-input"
              value={data.chaveAcesso || ''} 
              onChange={(e) => onChange({ ...data, chaveAcesso: e.target.value })}
              disabled={isViewMode}
              maxLength={44}
              placeholder="0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000"
            />
            <Hash size={18} className="modern-field-icon" />
          </div>
        </div>
      </div>

      <div className="modern-form-row two-cols mb-4">
        <div className="modern-form-group">
          <SearchableSelect
            label="Empresa Destinatária"
            options={empresas.map(emp => ({ id: emp.id, label: emp.nomeFantasia, sublabel: emp.cnpj }))}
            value={data.empresaId || ''}
            onChange={(val) => onChange({ ...data, empresaId: val })}
            disabled={isViewMode}
            required
          />
        </div>

        <div className="modern-form-group">
          <SearchableSelect
            label="Fornecedor (Emitente)"
            options={fornecedores.map(f => ({ id: f.id, label: f.nomeFantasia || f.nome, sublabel: f.documento }))}
            value={data.fornecedorId || ''}
            onChange={(val) => {
              const selected = fornecedores.find(f => f.id === val);
              onChange({ 
                ...data, 
                fornecedorId: val, 
                fornecedorNome: selected?.nomeFantasia || selected?.nome || '',
                inscricaoEstadual: selected?.inscricaoEstadual,
                indIEDest: selected?.indIEDest,
                cMun: selected?.cMun,
                cPais: selected?.cPais
              });
            }}
            disabled={isViewMode}
            required
          />
        </div>
      </div>

      <div className="modern-form-row three-cols mb-4">
        <div className="modern-form-group">
          <label>Data Emissão</label>
          <div className="modern-input-wrapper">
            <input 
              type="date" 
              className="modern-input"
              value={data.dataEmissao || ''} 
              onChange={(e) => onChange({ ...data, dataEmissao: e.target.value })}
              disabled={isViewMode}
              required
            />
            <Calendar size={18} className="modern-field-icon" />
          </div>
        </div>

        <div className="modern-form-group">
          <label>Número NF</label>
          <div className="modern-input-wrapper">
            <input 
              type="text" 
              className="modern-input"
              value={data.numero || ''} 
              onChange={(e) => onChange({ ...data, numero: e.target.value })}
              disabled={isViewMode}
              required
            />
            <Hash size={18} className="modern-field-icon" />
          </div>
        </div>

        <div className="modern-form-group">
          <label>Série</label>
          <div className="modern-input-wrapper">
            <input 
              type="text" 
              className="modern-input"
              value={data.serie || ''} 
              onChange={(e) => onChange({ ...data, serie: e.target.value })}
              disabled={isViewMode}
              required
            />
            <Hash size={18} className="modern-field-icon" />
          </div>
        </div>
      </div>

      <div className="modal-divider my-6" />

      <div className="section-header mb-4">
        <MapPin size={16} className="text-indigo-500" />
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Datas e Localização</h3>
      </div>

      <div className="modern-form-row three-cols">
        <div className="modern-form-group">
          <label>Data Entrada</label>
          <div className="modern-input-wrapper">
            <input 
              type="date" 
              className="modern-input"
              value={data.dataEntrada || ''} 
              onChange={(e) => onChange({ ...data, dataEntrada: e.target.value })}
              disabled={isViewMode}
              required
            />
            <Calendar size={18} className="modern-field-icon" />
          </div>
        </div>

        <div className="modern-form-group">
          <label>Natureza da Operação</label>
          <div className="modern-input-wrapper">
            <input 
              type="text" 
              className="modern-input"
              value={data.naturezaOperacao || ''} 
              onChange={(e) => onChange({ ...data, naturezaOperacao: e.target.value })}
              disabled={isViewMode}
              placeholder="Ex: Compra para comercialização"
            />
            <FileText size={18} className="modern-field-icon" />
          </div>
        </div>

        <div className="modern-form-group">
          <label>Ind. Presença</label>
          <div className="modern-input-wrapper">
            <select 
              className="modern-input"
              value={data.indPres || '1'} 
              onChange={(e) => onChange({ ...data, indPres: e.target.value as any })}
              disabled={isViewMode}
            >
              <option value="0">0-Não se aplica</option>
              <option value="1">1-Presencial</option>
              <option value="2">2-Internet</option>
              <option value="3">3-Telefone</option>
              <option value="4">4-Entrega</option>
              <option value="9">9-Outros</option>
            </select>
            <Globe size={18} className="modern-field-icon" />
          </div>
        </div>
      </div>
    </div>
  );
};
