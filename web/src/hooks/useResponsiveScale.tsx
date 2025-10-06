// src/hooks/useResponsiveScale.ts
import { useState, useEffect } from 'react';

// Este hook devuelve un factor de escala basado en el ancho de la ventana
export const useResponsiveScale = () => {
  const getScale = () => {
    if (window.innerWidth < 640) { // Para pantallas pequeñas (móviles)
      return 2; // Usa una escala más pequeña
    }
    return 3; // Para pantallas más grandes
  };

  const [scale, setScale] = useState(getScale());

  useEffect(() => {
    const handleResize = () => {
      setScale(getScale());
    };

    window.addEventListener('resize', handleResize);
    // Limpia el listener cuando el componente se desmonte
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return scale;
};