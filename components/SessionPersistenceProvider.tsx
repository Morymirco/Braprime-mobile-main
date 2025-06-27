import React from 'react';
import { useSessionPersistence } from '../hooks/useSessionPersistence';

interface SessionPersistenceProviderProps {
  children: React.ReactNode;
}

export function SessionPersistenceProvider({ children }: SessionPersistenceProviderProps) {
  // Utiliser le hook de persistance de session
  useSessionPersistence();

  return <>{children}</>;
} 