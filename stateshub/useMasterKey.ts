import { create } from "zustand";

interface MasterKeyState {
  masterKey: string | null;
  setMasterKey: (masterKey: string | null) => void;
}

export const useMasterKey = create<MasterKeyState>((set) => ({
  masterKey: null,
  setMasterKey: (masterKey) => set({ masterKey }),
}));
