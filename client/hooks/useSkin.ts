import { createContext, useContext, useState, useEffect } from 'react';
import { SkinTheme, defaultSkin, skinThemes, SKIN_STORAGE_KEY } from '@/lib/skins';

interface SkinContextType {
  currentSkin: SkinTheme;
  setSkin: (skin: SkinTheme) => void;
  availableSkins: SkinTheme[];
  resetToDefault: () => void;
}

const SkinContext = createContext<SkinContextType | undefined>(undefined);

export function useSkin() {
  const context = useContext(SkinContext);
  if (context === undefined) {
    throw new Error('useSkin must be used within a SkinProvider');
  }
  return context;
}

export { SkinContext };