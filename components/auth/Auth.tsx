import NetworkProvider from "@/components/network/NetworkProvider";
import AxiosService from "@/services/AxiosService";
import SessionService from "@/services/SessionService";
import { clearAllUserData } from "@/storage/mediators/system";
import { useColorScheme } from "nativewind";
import React from "react";

interface AuthProps {
  children: React.ReactNode;
}

interface AuthContextType {
  isAuthenticated: boolean;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  signOut: () => void;
}

export const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  setAuthenticated: () => {},
  signOut: () => {},
});

const Auth = ({ children }: AuthProps) => {
  const [isAuthenticated, setAuthenticated] = React.useState(false);
  const { setColorScheme } = useColorScheme();

  console.log("Auth Component - Checking session status.");

  React.useEffect(() => {
    // Initialize axios interceptors on app startup
    AxiosService.initialize();
    AxiosService.setInitialToken();

    const sessionStatus = async () => {
      const status = await SessionService.checkSession();
      if (status) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
    };
    sessionStatus();
  }, []);

  const signOut = async () => {
    await clearAllUserData();
    setAuthenticated(false);
    setColorScheme("system");
  };

  return (
    <NetworkProvider>
      <AuthContext.Provider
        value={{ isAuthenticated, setAuthenticated, signOut: signOut }}
      >
        {children}
      </AuthContext.Provider>
    </NetworkProvider>
  );
};

export default Auth;
