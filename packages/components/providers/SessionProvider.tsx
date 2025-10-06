"use client";

import { createContext, useCallback, useContext, useState } from "react";

const SessionContext = createContext<{
  sessionState: any | null;
  setSessionState: (session: any) => void;
  setToSessionClient: (key: string, value: any) => void;
} | null>(null);

export const useSession = () => {
  return useContext(SessionContext);
};

export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  const [sessionState, setSessionState] = useState<any | null>(session);


  const setToSessionClient = useCallback((key: string, value: any) => {
    setSessionState((prev: any) => ({ ...prev, [key]: value }));
    fetch('/api/altrp-session', {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    }).catch((error) => {
      console.error('Error setting session:', error);
    });
  }, [sessionState]);

  return (
    <SessionContext.Provider
      value={{ sessionState, setSessionState, setToSessionClient }}
    >
      {children}
    </SessionContext.Provider>
  );
}
