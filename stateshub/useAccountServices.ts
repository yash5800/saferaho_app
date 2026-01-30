import AccountServices from "@/services/AccountServices";
import { create } from "zustand";

interface AccountServicesState {
  accountId: string | null;
  services: AccountServices | null;

  initAccount: (accountId: string) => Promise<void>;
  resetAccount: () => void;
}

export const useAccountServices = create<AccountServicesState>((set, get) => ({
  accountId: null,
  services: null,

  initAccount: async (accountId) => {
    const current = get().accountId;
    if (current === accountId && get().services) return;

    const services = new AccountServices(accountId);
    await services.init();

    console.log(
      "Account services initialized for accountId:",
      accountId,
      services,
    );

    set({
      accountId,
      services,
    });
  },

  resetAccount: () => {
    set({
      accountId: null,
      services: null,
    });
  },
}));
