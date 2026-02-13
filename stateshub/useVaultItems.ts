import {
  ResEncryptedSecureNoteVaultItemsParams,
  ResEncryptedWebsiteVaultItemsParams,
} from "@/app/(protected)/(tabs)/vault";
import { ApiError, getErrorMessage, logError } from "@/util/errors/ApiError";
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
        throw new Error("No vault data received from server");
      }

      const sortedData = response.sort(
        (
          a:
            | ResEncryptedWebsiteVaultItemsParams
            | ResEncryptedSecureNoteVaultItemsParams,
          b:
            | ResEncryptedWebsiteVaultItemsParams
            | ResEncryptedSecureNoteVaultItemsParams,
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
        error: null,
      });

      console.log(`✅ Vault items fetched: ${sortedData.length} items`);
    } catch (error) {
      logError("useVaultItems.fetchVaultItems", error);

      const errorMessage = getErrorMessage(error);

      // Keep existing data on network errors
      if (error instanceof ApiError && error.isNetworkError()) {
        console.log("📡 Network error - keeping cached vault data");
        set({ isLoading: false, error: errorMessage });
      } else {
        set({ isLoading: false, error: errorMessage });
      }
    }
  },

  reloadVaultItems: async (accountId: string) => {
    if (!accountId) {
      set({ error: "No account ID available" });
      logError("useVaultItems.reloadVaultItems", new Error("No account ID"));
      return;
    }

    await get().fetchVaultItems(accountId);
  },
}));
