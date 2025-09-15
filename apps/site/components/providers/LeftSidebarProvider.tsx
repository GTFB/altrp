import { createContext, useCallback, useContext, useState, useEffect } from "react";
import { useSession } from "./SessionProvider";

const LeftSidebarContext = createContext<any>(null);

interface LeftSidebarProviderProps {
  children: React.ReactNode;
  open: boolean;
}

export const useLeftSidebar = () => {
  return useContext(LeftSidebarContext);
}

export function LeftSidebarProvider({ children, open = true }: LeftSidebarProviderProps) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(open);
  const { setToSessionClient } = useSession() || {};
  console.log(open, 'open')
  // Update state when open prop changes (from server-side session)
  useEffect(() => {
    setLeftSidebarOpen(open);
  }, [open]);
  
  const _setLeftSidebarOpen = useCallback((open: boolean) => {
    setLeftSidebarOpen(open);
    setToSessionClient?.('leftSidebarOpen', open);
  }, [setToSessionClient]);

  return (
    <LeftSidebarContext.Provider value={{leftSidebarOpen, setLeftSidebarOpen: _setLeftSidebarOpen}}>
      {children}
    </LeftSidebarContext.Provider>
  );
}