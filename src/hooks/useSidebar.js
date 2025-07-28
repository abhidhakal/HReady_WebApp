import { useState, useCallback } from 'react';

export function useSidebar(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const openSidebar = useCallback(() => setIsOpen(true), []);
  const closeSidebar = useCallback(() => setIsOpen(false), []);
  const toggleSidebar = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    setIsOpen, // Expose setter for advanced use
  };
}
