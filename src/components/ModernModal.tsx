import React from 'react';
import { X, LucideIcon } from 'lucide-react';
import './ModernModal.css';

interface ModernModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const ModernModal: React.FC<ModernModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  footer
}) => {
  if (!isOpen) return null;

  return (
    <div className="modern-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modern-modal-container animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <header className="modern-modal-header">
          <div className="header-left">
            {Icon && (
              <div className="modal-icon-wrapper">
                <Icon size={24} strokeWidth={2.5} />
              </div>
            )}
            <div className="modal-title-wrapper">
              <h2 className="modal-title-text">{title}</h2>
              {subtitle && <p className="modal-subtitle-text">{subtitle}</p>}
            </div>
          </div>
          <button className="modal-close-button" onClick={onClose} title="Fechar">
            <X size={20} strokeWidth={3} />
          </button>
        </header>

        <main className="modern-modal-body custom-scrollbar">
          {children}
        </main>

        {footer && (
          <footer className="modern-modal-footer">
            <div className="footer-island">
              {footer}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};
