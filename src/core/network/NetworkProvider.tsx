import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';


interface NetworkContextValue {
  isOnline: boolean;
  isInternetReachable: boolean | null;
}

const NetworkContext = createContext<NetworkContextValue>({
  isOnline: true,
  isInternetReachable: true,
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<NetInfoState | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((nextState) => {
      setState(nextState);
    });

    NetInfo.fetch().then(setState);

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      isOnline: state?.isConnected ?? true,
      isInternetReachable: state?.isInternetReachable ?? true,
    }),
    [state],
  );

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  return useContext(NetworkContext);
}
