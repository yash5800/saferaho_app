import CryptoService from '@/services/CryptoService';
import React from 'react';

interface CryptoProps {
  children: React.ReactNode;
}

interface CryptoContextType {
  masterKey:string | null,
  unlock: () => Promise<boolean>,
  lock: () => void,
  isLocked: boolean,
  setIsLocked: React.Dispatch<React.SetStateAction<boolean>>,
}

export const CryptoContext = React.createContext<CryptoContextType>({
  masterKey: '',
  unlock: async () => false,
  lock: () => {},
  isLocked: true,
  setIsLocked: () => {}
});

const Crypto = ({ children }: CryptoProps) => {
  const [masterKey, setMasterKey] = React.useState<string | null>(null);
  const [isLocked, setIsLocked] = React.useState<boolean>(true);

  async function unlock() {
    const masterKey = await CryptoService.unlockMasterKey();
    if(!masterKey){
       return false;
    }

    setMasterKey(masterKey);
    setIsLocked(false);
    return true;
  }

  function lock() {
    setMasterKey(null);
    setIsLocked(true);
  }

  return (
    <CryptoContext.Provider value={{masterKey, unlock, lock, isLocked, setIsLocked}}>
      {children}
    </CryptoContext.Provider>
  )
}

export default Crypto