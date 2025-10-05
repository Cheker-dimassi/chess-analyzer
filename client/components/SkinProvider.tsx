import { useState, useEffect, ReactNode } from 'react';
import { SkinTheme, defaultSkin, skinThemes, SKIN_STORAGE_KEY } from '@/lib/skins';
import { SkinContext } from '@/hooks/useSkin';

interface SkinProviderProps {
  children: ReactNode;
}

export function SkinProvider({ children }: SkinProviderProps) {
  const [currentSkin, setCurrentSkin] = useState<SkinTheme>(defaultSkin);

  useEffect(() => {
    const savedSkin = localStorage.getItem(SKIN_STORAGE_KEY);
    if (savedSkin) {
      try {
        const parsedSkin = JSON.parse(savedSkin);
        const foundSkin = skinThemes.find(skin => skin.id === parsedSkin.id);
        if (foundSkin) {
          setCurrentSkin(foundSkin);
        }
      } catch (error) {
        console.error('Error loading saved skin:', error);
      }
    }
  }, []);

  const setSkin = (skin: SkinTheme) => {
    setCurrentSkin(skin);
    localStorage.setItem(SKIN_STORAGE_KEY, JSON.stringify(skin));
  };

  const resetToDefault = () => {
    setSkin(defaultSkin);
  };

  return (
    <SkinContext.Provider
      value={{
        currentSkin,
        setSkin,
        availableSkins: skinThemes,
        resetToDefault,
      }}
    >
      {children}
    </SkinContext.Provider>
  );
}
