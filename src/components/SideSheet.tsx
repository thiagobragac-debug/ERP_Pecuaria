
import React, { ReactNode, useEffect } from 'react';
import { X, LucideIcon } from 'lucide-react';
import './SideSheet.css';

interface SideSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  footer?: ReactNode;
  children: ReactNode;
}

export const SideSheet: React.FC<SideSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  footer,
  children
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="sidesheet-overlay" onClick={onClose}>
      <div 
        className={`sidesheet-content ${isOpen ? 'open' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sidesheet-header">
          <div className="header-info">
            <div className="icon-wrapper">
              <Icon size={24} />
            </div>
            <div className="text-wrapper">
              <h2>{title}</h2>
              {subtitle && <p className="subtitle">{subtitle}</p>}
            </div>
          </div>
          <button className="btn-close-sheet" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="sidesheet-body scrollable-custom">
          {children}
        </div>

        {footer && (
          <div className="sidesheet-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
