import React, { useState } from 'react';
import { Repeat, ArrowRight, DollarSign, Calendar, MessageSquare, ShieldCheck, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { StandardModal } from './StandardModal';
import { MOCK_BANKS, BankAccount } from '../data/bankData';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialSourceId?: string;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, onSuccess, initialSourceId }) => {
  const [sourceId, setSourceId] = useState(initialSourceId || MOCK_BANKS[0].id);
  const [targetId, setTargetId] = useState(MOCK_BANKS[1]?.id || MOCK_BANKS[0].id);

  // Update sourceId when initialSourceId changes (e.g. clicking different cards)
  React.useEffect(() => {
    if (initialSourceId) {
      setSourceId(initialSourceId);
    }
  }, [initialSourceId, isOpen]);
  const [value, setValue] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [observation, setObservation] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleTransfer = () => {
    // Simulate API call and state update
    setIsSuccess(true);
    setTimeout(() => {
        setIsSuccess(false);
        onSuccess?.();
        onClose();
    }, 2000);
  };

  const sourceBank = MOCK_BANKS.find(b => b.id === sourceId);

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title="Transferência entre Contas"
      subtitle="Movimente saldo entre suas contas internas com facilidade."
      icon={Repeat}
      footer={
        <div className="footer-actions flex justify-end gap-3 w-full">
          <button className="btn-premium-outline" onClick={onClose}>Cancelar</button>
          <button 
            className="btn-premium-solid indigo" 
            onClick={handleTransfer}
            disabled={value <= 0 || sourceId === targetId || (sourceBank && value > sourceBank.saldo)}
          >
            {isSuccess ? <ShieldCheck size={18} strokeWidth={3} className="animate-bounce" /> : <Repeat size={18} strokeWidth={3} />}
            <span>{isSuccess ? 'Sucesso!' : 'Confirmar Transferência'}</span>
          </button>
        </div>
      }
    >
      <div className="transfer-form-grid">
        <div className="form-section">
          <div className="form-group">
            <label>Conta de Origem (Débito)</label>
            <div className="input-with-icon">
              <select value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
                {MOCK_BANKS.map(bank => (
                  <option key={bank.id} value={bank.id}>{bank.banco} - Saldo: R$ {bank.saldo.toLocaleString('pt-BR')}</option>
                ))}
              </select>
              <ArrowDownLeft size={18} className="field-icon text-red-500" />
            </div>
          </div>

          <div className="transfer-arrow-visual">
            <ArrowRight size={20} className="text-primary-indigo opacity-40" />
          </div>

          <div className="form-group">
            <label>Conta de Destino (Crédito)</label>
            <div className="input-with-icon">
              <select value={targetId} onChange={(e) => setTargetId(e.target.value)}>
                {MOCK_BANKS.map(bank => (
                  <option key={bank.id} value={bank.id}>{bank.banco}</option>
                ))}
              </select>
              <ArrowUpRight size={18} className="field-icon text-green-500" />
            </div>
          </div>
        </div>

        <div className="horizontal-divider my-8"></div>

        <div className="form-grid">
          <div className="col-6">
            <div className="form-group">
              <label>Valor da Transferência</label>
              <div className="input-with-icon">
                <input 
                  type="number" 
                  placeholder="0,00" 
                  value={value} 
                  onChange={(e) => setValue(Number(e.target.value))} 
                />
                <DollarSign size={18} className="field-icon" />
              </div>
            </div>
          </div>

          <div className="col-6">
            <div className="form-group">
              <label>Data da Operação</label>
              <div className="input-with-icon">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <Calendar size={18} className="field-icon" />
              </div>
            </div>
          </div>
        </div>

        <div className="form-group mt-6">
          <label>Observação / Memorando</label>
          <div className="input-with-icon">
            <input 
                type="text" 
                placeholder="Ex: Ajuste de saldo mensal..." 
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
            />
            <MessageSquare size={18} className="field-icon" />
          </div>
        </div>

        {(sourceBank && value > sourceBank.saldo) && (
            <div className="validation-alert error mt-6">
                Saldo insuficiente na conta de origem para esta operação.
            </div>
        )}
      </div>

      <style>{`
        .transfer-form-grid { padding: 8px 4px; }
        .transfer-arrow-visual { 
            display: flex; 
            justify-content: center; 
            margin: 8px 0; 
        }
        .form-section {
            background: #f8fafc;
            padding: 24px;
            border-radius: 20px;
            border: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .horizontal-divider {
            height: 1px;
            background: var(--border-color);
            opacity: 0.5;
        }
        .validation-alert {
            padding: 1rem;
            border-radius: var(--radius-md);
            font-size: 0.85rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        .validation-alert.error {
            background: rgba(239, 68, 68, 0.1);
            color: var(--danger);
            border: 1px solid rgba(239, 68, 68, 0.2);
        }
      `}</style>
    </StandardModal>
  );
};
