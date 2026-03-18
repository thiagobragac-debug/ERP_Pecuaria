
import React, { ReactNode } from 'react';
import { X, LucideIcon } from 'lucide-react';
import './StandardModal.css';

interface StandardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  footer?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  isViewMode?: boolean;
}

export const StandardModal: React.FC<StandardModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  footer,
  children,
  size = 'md',
  isViewMode = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content standard-modal size-${size} ${footer ? 'fixed-footer' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="header-icon-title">
            <div className="icon-badge indigo">
              <Icon size={24} />
            </div>
            <div>
              <h2>{title}</h2>
              {subtitle && <p className="subtitle">{subtitle}</p>}
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body scrollable">
          {children}
        </div>

        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
