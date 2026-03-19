import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Company } from '../types';

interface CompanyContextType {
  activeCompanyId: string; // 'Todas' or specific company ID
  activeCompany: Company | null;
  setActiveCompanyId: (id: string) => void;
  companies: Company[];
  isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCompanyId, setActiveCompanyId] = useState<string>(() => {
    return localStorage.getItem('activeCompanyId') || 'Todas';
  });

  const companies = useLiveQuery(() => db.empresas.toArray()) || [];
  const isLoading = companies.length === 0 && activeCompanyId !== 'Todas';

  const activeCompany = companies.find(c => c.id === activeCompanyId) || null;

  useEffect(() => {
    localStorage.setItem('activeCompanyId', activeCompanyId);
  }, [activeCompanyId]);

  const handleSetActiveCompanyId = (id: string) => {
    setActiveCompanyId(id);
  };

  return (
    <CompanyContext.Provider value={{ 
      activeCompanyId, 
      activeCompany, 
      setActiveCompanyId: handleSetActiveCompanyId, 
      companies,
      isLoading
    }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
