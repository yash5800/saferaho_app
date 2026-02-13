import {
  ResEncryptedSecureNoteVaultItemsParams,
  ResEncryptedWebsiteVaultItemsParams,
} from "@/app/(protected)/(tabs)/vault";
import { getVaultItems } from "@/util/vaultOperations/ItemsGet";
import { create } from "zustand";

export interface VaultItemsState {
  data: {
    websitesDataCache: ResEncryptedWebsiteVaultItemsParams[];
    secureNotesDataCache: ResEncryptedSecureNoteVaultItemsParams[];
    vaultItemsCache: Record<
      string,
      | ResEncryptedWebsiteVaultItemsParams
      | ResEncryptedSecureNoteVaultItemsParams
    >;
    lastFetch: number;
  };

  isLoading: boolean;
  error: string | null;

  fetchVaultItems: (accountId: string) => Promise<void>;

  reloadVaultItems: (accountId: string) => Promise<void>;
}

export const useVaultItems = create<VaultItemsState>((set, get) => ({
  data: {
    websitesDataCache: [],
    secureNotesDataCache: [],
    vaultItemsCache: {},
    lastFetch: 0,
  },

  isLoading: false,
  error: null,

  fetchVaultItems: async (accountId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await getVaultItems(accountId);

      if (!response) {
        set({ isLoading: false, error: "No data received" });
        return;
      }

      const sortedData = response.sort(
        (
          a: ResEncryptedWebsiteVaultItemsParams | ResEncryptedSecureNoteVaultItemsParams,
          b: ResEncryptedWebsiteVaultItemsParams | ResEncryptedSecureNoteVaultItemsParams,
        ) => (a._createdAt > b._createdAt ? -1 : 1),
      );

      const websitesDataCache: ResEncryptedWebsiteVaultItemsParams[] =
        sortedData.filter(
          (
            item:
              | ResEncryptedWebsiteVaultItemsParams
              | ResEncryptedSecureNoteVaultItemsParams,
          ): item is ResEncryptedWebsiteVaultItemsParams =>
            item.type === "website",
        );

      const secureNotesDataCache: ResEncryptedSecureNoteVaultItemsParams[] =
        sortedData.filter(
          (
            item:
              | ResEncryptedWebsiteVaultItemsParams
              | ResEncryptedSecureNoteVaultItemsParams,
          ): item is ResEncryptedSecureNoteVaultItemsParams =>
            item.type === "secure_note",
        );

      const vaultItemsCache: Record<
        string,
        | ResEncryptedWebsiteVaultItemsParams
        | ResEncryptedSecureNoteVaultItemsParams
      > = {};
      sortedData.forEach(
        (
          item:
            | ResEncryptedWebsiteVaultItemsParams
            | ResEncryptedSecureNoteVaultItemsParams,
        ) => {
          vaultItemsCache[item._id] = item;
        },
      );

      set({
        data: {
          websitesDataCache,
          secureNotesDataCache,
          vaultItemsCache,
          lastFetch: Date.now(),
        },
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
    }
  },

  reloadVaultItems: async (accountId: string) => {
    if (!accountId) {
      set({ error: "No account ID available" });
      return;
    }

    await get().fetchVaultItems(accountId);
  },
}));
