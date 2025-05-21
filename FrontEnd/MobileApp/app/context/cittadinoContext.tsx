// src/context/CittadinoContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Cittadino } from '../types/index'; // Adjust the import path as necessary


type CittadinoContextType = 
{
  cittadino: Cittadino | null;
  setCittadino: (cittadino: Cittadino) => void;
};

const CittadinoContext = createContext<CittadinoContextType | undefined>(undefined);

export const CittadinoProvider = ({ children }: { children: ReactNode }) => {
  const [cittadino, setCittadino] = useState<Cittadino | null>(null);

  return (
    <CittadinoContext.Provider value={{ cittadino, setCittadino }}>
      {children}
    </CittadinoContext.Provider>
  );
};

export const useCittadino = () => {
  const context = useContext(CittadinoContext);
  if (!context) {
    throw new Error('useCittadino must be used within a CittadinoProvider');
  }
  return context;
};
