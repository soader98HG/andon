import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface StationCtx {
  station: string;
  setStation: (id: string) => void;
}

const StationContext = createContext<StationCtx | undefined>(undefined);

export function StationProvider({ children }: { children: ReactNode }) {
  const [station, setStation] = useState('');
  return (
    <StationContext.Provider value={{ station, setStation }}>
      {children}
    </StationContext.Provider>
  );
}

export function useStation() {
  const ctx = useContext(StationContext);
  if (!ctx) throw new Error('useStation must be used within StationProvider');
  return ctx;
}
