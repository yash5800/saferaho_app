import { NetworkContext } from "@/context/networkContext";
import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useState } from "react";

interface NetworkProviderProps {
  children: React.ReactNode;
}

// Global network state that axios can access
export let globalNetworkState = {
  isOnline: true,
};

const NetworkProvider = ({ children }: NetworkProviderProps) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online =
        state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
      globalNetworkState.isOnline = online;

      if (online) {
        console.log("✅ Network restored - Back online");
      } else {
        console.log("❌ Network lost - Offline");
      }
    });

    // Initial network check
    NetInfo.fetch().then((state) => {
      const online =
        state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
      globalNetworkState.isOnline = online;
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline, isConnected: isOnline }}>
      {children}
    </NetworkContext.Provider>
  );
};

export default NetworkProvider;
