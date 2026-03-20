import React, { useState } from 'react';
import { FileText, Download, Filter, Search, Calendar, Landmark, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';
import { ModernModal } from './ModernModal';
import { MOCK_BANKS } from '../data/bankData';

interface ExtratoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBankId?: string;
}

const MOCK_EXTRATO_DATA = [
  { id: 1, data: '2024-03-20', descricao: 'DOC RECEBIDO - PIX CLIENTE', valor: 12500.00, tipo: 'entrada' },
  { id: 2, data: '2024-03-19', descricao: 'PAGTO BOLETO - ENERGIA', valor: -850.40, tipo: 'saida' },
  { id: 3, data: '2024-03-19', descricao: 'TAR MANUTENCAO CONTA', valor: -45.00, tipo: 'saida' },
  { id: 4, data: '2024-03-18', descricao: 'TRANSFERENCIA RECEBIDA', valor: 5500.00, tipo: 'entrada' },
  { id: 5, data: '2024-03-17', descricao: 'COMPRA MEDICAMENTOS', valor: -2200.00, tipo: 'saida' },
  { id: 6, data: '2024-03-16', descricao: 'VENDA DE BEZERRAS', valor: 15800.00, tipo: 'entrada' },
];

export const ExtratoModal: React.FC<ExtratoModalProps> = ({ isOpen, onClose, initialBankId }) => {
  const [selectedBankId, setSelectedBankId] = useState(initialBankId || MOCK_BANKS[0].id);

  // Update selectedBankId when initialBankId changes
  React.useEffect(() => {
    if (initialBankId) {
      setSelectedBankId(initialBankId);
    }
  }, [initialBankId, isOpen]);

  return (
    <ModernModal
      isOpen={isOpen}
      onClose={onClose}
      title="Extrato Detalhado"
      subtitle="Visualize todo o histórico de movimentações financeiras."
      icon={FileText}
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="export-options flex gap-2">
            <button className="btn-premium-outline">
              <Download size={16} strokeWidth={3} />
              <span>PDF</span>
            </button>
            <button className="btn-premium-outline">
              <Download size={16} strokeWidth={3} />
              <span>Excel</span>
            </button>
          </div>
          <button className="btn-premium-solid indigo" onClick={onClose}>
            <X size={18} strokeWidth={3} />
            <span>Fechar</span>
          </button>
        </div>
      }
    >
      <div className="extrato-container">
        <div className="extrato-filters">
            <div className="filter-item">
                <label>Conta Bancária</label>
                <select value={selectedBankId} onChange={(e) => setSelectedBankId(e.target.value)}>
                    {MOCK_BANKS.map(bank => (
                        <option key={bank.id} value={bank.id}>{bank.banco}</option>
                    ))}
                </select>
            </div>
            <div className="filter-item">
                <label>Período</label>
                <div className="input-with-icon">
                    <Calendar size={16} />
                    <input type="text" defaultValue="Março/2024" readOnly />
                </div>
            </div>
            <div className="search-box-mini flex-1">
                <Search size={16} />
                <input type="text" placeholder="Buscar no extrato..." />
            </div>
        </div>

        <div className="extrato-table-wrapper">
          <table className="extrato-table">
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Tipo</th>
                    <th className="text-right">Valor</th>
                </tr>
            </thead>
            <tbody>
                {MOCK_EXTRATO_DATA.map(item => (
                    <tr key={item.id}>
                        <td className="data-col">{new Date(item.data).toLocaleDateString()}</td>
                        <td className="desc-col">{item.descricao}</td>
                        <td className="tipo-col">
                            <span className={`type-badge ${item.tipo}`}>
                                {item.tipo === 'entrada' ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                                {item.tipo.toUpperCase()}
                            </span>
                        </td>
                        <td className={`valor-col text-right ${item.tipo}`}>
                           R$ {Math.abs(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                    </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .extrato-filters {
            display: flex;
            gap: 16px;
            margin-bottom: 24px;
            padding-bottom: 20px;
            border-bottom: 1px solid #f1f5f9;
            align-items: flex-end;
        }
        .filter-item {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .filter-item label {
            font-size: 0.75rem;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
        }
        .filter-item select, .filter-item input {
            padding: 8px 12px;
            border-radius: 8px;
            border: 1.5px solid #f1f5f9;
            font-size: 0.85rem;
            font-weight: 600;
        }
        .extrato-table-wrapper {
            background: #f8fafc;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
        }
        .extrato-table { width: 100%; border-collapse: collapse; }
        .extrato-table th {
            text-align: left;
            padding: 12px 16px;
            background: white;
            font-size: 0.75rem;
            font-weight: 800;
            color: #64748b;
            text-transform: uppercase;
            border-bottom: 1px solid #e2e8f0;
        }
        .extrato-table td {
            padding: 14px 16px;
            font-size: 0.875rem;
            font-weight: 600;
            color: #334155;
            border-bottom: 1px solid #f1f5f9;
        }
        .extrato-table tr:last-child td { border-bottom: none; }
        .extrato-table .data-col { color: #94a3b8; font-size: 0.8rem; }
        .extrato-table .valor-col { font-weight: 800; }
        .extrato-table .valor-col.entrada { color: #10b981; }
        .extrato-table .valor-col.saida { color: #ef4444; }
        .type-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 0.65rem;
            font-weight: 800;
        }
        .type-badge.entrada { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .type-badge.saida { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
      `}</style>
    </ModernModal>
  );
};
