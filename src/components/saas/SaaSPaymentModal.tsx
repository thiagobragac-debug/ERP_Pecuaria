import React, { useState, useEffect } from 'react';
import { pixService } from '../../services/pixService';
import { saasService } from '../../services/saasService';
import { 
  X, 
  Copy, 
  Check, 
  Smartphone, 
  Info, 
  AlertCircle,
  QrCode,
  ArrowRight,
  RefreshCw,
  CreditCard,
  FileText,
  ExternalLink
} from 'lucide-react';
import './SaaSPaymentModal.css';

interface SaaSPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  amount: number;
  onConfirm: () => void;
}

type PaymentMethod = 'pix' | 'card' | 'boleto';

export const SaaSPaymentModal: React.FC<SaaSPaymentModalProps> = ({
  isOpen,
  onClose,
  planName,
  amount,
  onConfirm
}) => {
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const load = async () => {
        setLoading(true);
        try {
          const data = await saasService.getPaymentConfig();
          setConfig(data);
          
          // Auto-select first active method
          if (data) {
            if (data.pix?.is_active) setMethod('pix');
            else if (data.card?.is_active) setMethod('card');
            else if (data.boleto?.is_active) setMethod('boleto');
          }
        } catch (err) {
          console.error('Error loading payment config:', err);
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const pixCode = (config?.pix?.is_active && method === 'pix') ? pixService.generateStaticPix({
    chave: config.pix.pix_key,
    beneficiario: config.pix.merchant_name,
    cidade: config.pix.merchant_city,
    valor: amount,
    txtId: `ASSIN${planName.substring(0, 5).toUpperCase()}`
  }) : '';

  const qrCodeUrl = pixCode ? pixService.getQrCodeUrl(pixCode) : '';

  const handleCopy = () => {
    if (!pixCode) return;
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExternalCheckout = () => {
    if (config?.card?.checkout_url) {
      window.open(config.card.checkout_url, '_blank');
    }
  };

  const isAnyMethodActive = config?.pix?.is_active || config?.card?.is_active || config?.boleto?.is_active;

  return (
    <div className="pix-modal-overlay">
      <div className="pix-modal-content">
        <button className="close-modal" onClick={onClose}>
          <X size={24} />
        </button>

        <header className="pix-modal-header">
          <div className="icon-badge">
            {method === 'pix' && <QrCode size={32} />}
            {method === 'card' && <CreditCard size={32} />}
            {method === 'boleto' && <FileText size={32} />}
          </div>
          <h2>Pagamento SaaS</h2>
          <p>Assinatura do Plano {planName}</p>
        </header>

        <div className="modal-inner-scroll">
          {loading ? (
            <div className="pix-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
              <RefreshCw size={48} className="spinning text-emerald-500 mb-4" />
              <p className="text-muted">Carregando opções...</p>
            </div>
          ) : !isAnyMethodActive ? (
            <div className="pix-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <h3>Checkout Indisponível</h3>
              <p className="text-muted">Nenhum método de pagamento está habilitado no momento. Por favor, entre em contato com o suporte.</p>
            </div>
          ) : (
            <>
              {/* Selector */}
              <div className="payment-selector">
                <button 
                  className={`method-btn ${method === 'pix' ? 'active' : ''}`}
                  onClick={() => setMethod('pix')}
                  disabled={!config.pix?.is_active}
                >
                  <QrCode size={20} />
                  <span>PIX</span>
                </button>
                <button 
                  className={`method-btn ${method === 'card' ? 'active' : ''}`}
                  onClick={() => setMethod('card')}
                  disabled={!config.card?.is_active}
                >
                  <CreditCard size={20} />
                  <span>Cartão</span>
                </button>
                <button 
                  className={`method-btn ${method === 'boleto' ? 'active' : ''}`}
                  onClick={() => setMethod('boleto')}
                  disabled={!config.boleto?.is_active}
                >
                  <FileText size={20} />
                  <span>Boleto</span>
                </button>
              </div>

              {step === 1 ? (
                <div className="pix-body">
                  <div className="amount-highlight">
                    <span>Valor Total</span>
                    <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}</strong>
                  </div>

                  {method === 'pix' && (
                    <div className="fade-in">
                      <div className="qr-container">
                        {qrCodeUrl ? (
                          <>
                            <img src={qrCodeUrl} alt="QR Code PIX" />
                            <div className="scan-overlay">
                              <Smartphone size={40} />
                              <span>Escaneie com seu banco</span>
                            </div>
                          </>
                        ) : (
                          <div className="error-placeholder">Erro ao gerar QR</div>
                        )}
                      </div>
                      <div className="copy-paste-section">
                        <label>Código PIX (Copia e Cola)</label>
                        <div className="copy-box">
                          <input type="text" readOnly value={pixCode} />
                          <button onClick={handleCopy} className={copied ? 'copied' : ''} disabled={!pixCode}>
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {method === 'card' && (
                    <div className="fade-in">
                      <div className="method-instructions">
                        <h4>Cartão de Crédito</h4>
                        <p>Você será redirecionado para um ambiente seguro para finalizar o pagamento com seu cartão.</p>
                      </div>
                      <button className="action-btn-global" onClick={handleExternalCheckout}>
                        Pagar com Cartão
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  )}

                  {method === 'boleto' && (
                    <div className="fade-in">
                      <div className="method-instructions">
                        <h4>Boleto Bancário</h4>
                        <p>{config.boleto.instructions || "O boleto será gerado e enviado para o e-mail da conta."}</p>
                      </div>
                    </div>
                  )}

                  <div className="pix-instructions mt-6">
                    <div className="info-item">
                      <Info size={16} />
                      <span>{method === 'pix' ? 'Liberação imediata.' : 'Liberação em até 2 dias úteis.'}</span>
                    </div>
                  </div>

                  {method !== 'card' && (
                    <button className="next-step-btn mt-6" onClick={() => setStep(2)}>
                      Já realizei o pagamento
                      <ArrowRight size={20} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="pix-confirmation-body fade-in">
                  <div className="confirmation-icon">
                    <AlertCircle size={48} />
                  </div>
                  <h3>Confirmação</h3>
                  <p>
                    {method === 'pix' 
                      ? "Anexe o comprovante do PIX para agilizar a liberação."
                      : "Sua solicitação será processada assim que identificarmos o pagamento."}
                  </p>

                  <div className="upload-section">
                    <input type="file" id="comp" className="hidden" />
                    <label htmlFor="comp" className="upload-label">
                      <span>Anexar comprovante</span>
                      <small>(Opcional)</small>
                    </label>
                  </div>

                  <div className="action-footer">
                    <button className="secondary-btn" onClick={() => setStep(1)}>Voltar</button>
                    <button className="confirm-btn action-btn" onClick={onConfirm}>Confirmar</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
