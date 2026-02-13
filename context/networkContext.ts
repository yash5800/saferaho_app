import React from "react";

export interface NetworkContextType {
  isOnline: boolean;
  isConnected: boolean;
}

export const NetworkContext = React.createContext<NetworkContextType>({
  isOnline: true,
  isConnected: true,
});

export const useNetwork = () => {
  const context = React.useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within NetworkProvider");
  }
  return context;
};
