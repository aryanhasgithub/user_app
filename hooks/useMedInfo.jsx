// hooks/useMedInfo.jsx
import { useContext } from 'react';
import { MedInfoContext } from '../contexts/MedInfoContext';

export function useMedInfo() {
  const context = useContext(MedInfoContext);
  
  if (!context) {
    throw new Error('useMedInfo must be used within MedInfoProvider');
  }
  
  return context;
}