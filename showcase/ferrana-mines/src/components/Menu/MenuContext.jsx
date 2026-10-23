"use client";

import { createContext, useContext, useMemo, useRef, useState } from "react";

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const apiRef = useRef({
    open: () => {},
    close: () => {},
    isAnimating: () => false,
  });
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      register(api) {
        apiRef.current = api;
      },
      open() {
        if (apiRef.current.isAnimating()) return;
        apiRef.current.open();
      },
      close() {
        if (apiRef.current.isAnimating()) return;
        apiRef.current.close();
      },
      toggle() {
        if (apiRef.current.isAnimating()) return;
        if (isOpen) apiRef.current.close();
        else apiRef.current.open();
      },
    }),
    [isOpen],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error("useMenu must be used within MenuProvider");
  }
  return ctx;
}
