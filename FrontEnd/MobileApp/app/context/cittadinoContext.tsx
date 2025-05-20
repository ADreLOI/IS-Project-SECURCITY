// src/context/CittadinoContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Cittadino = 
{
  username: string;
  id: string;
  email: string;
  
  // Add other properties if needed
};

type CittadinoContextType = {
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
