import { SecureNoteState } from "@/components/vault/SecureNoteTemplate";
import { WebsiteTemplateState } from "@/components/vault/WebsiteTemplate";
import { useMasterKey } from "@/stateshub/useMasterKey";
import axios from "axios";
import { encryptData } from "../cryptography";
import { displayToast } from "../disToast";
import { getIp } from "../getip";

interface UploadVaultItemsParams {
  items: {
    type: "website" | "secure_note";
    data: WebsiteTemplateState | SecureNoteState;
  };
}

export interface EncryptedWebsiteVaultItemsParams {
  type: "website";
  websiteName: string;
  websiteUrl: string;
  tags?: string[];
  encryptedSecretData: {
    // userName, password, notes
    cipher: string;
    nonce: string;
    mac: string;
  };
}

export interface EncryptedSecureNoteVaultItemsParams {
  type: "secure_note";
  title: string;
  tags?: string[];
  encryptedSecretData: {
    // content
    cipher: string;
    nonce: string;
    mac: string;
  };
}

const ip_address = getIp();

// Encryption Vault Items before uploading to server
export const uploadVaultItems = async (
  userId: string,
  data: UploadVaultItemsParams,
) => {
  if (!userId || !data.items) {
    console.error("Invalid userId or data items");
    return;
  }

  const masterKey = useMasterKey.getState().masterKey;

  if (!masterKey) {
    console.error("Master key is not available");
    return;
  }

  try {
    let res = null;

    if (data.items.type === "website") {
      const secretData = {
        userName: (data.items.data as WebsiteTemplateState).userName,
        password: (data.items.data as WebsiteTemplateState).password,
        notes: (data.items.data as WebsiteTemplateState).notes,
      };
      const stringSecretData = JSON.stringify(secretData);
      const encryptedSecretData = await encryptData(
        stringSecretData,
        masterKey,
      );

      const vaultData: EncryptedWebsiteVaultItemsParams = {
        type: "website",
        websiteName: (data.items.data as WebsiteTemplateState).websiteName,
        websiteUrl: (data.items.data as WebsiteTemplateState).websiteUrl,
        tags: (data.items.data as WebsiteTemplateState).tags,
        encryptedSecretData,
      };

      res = await uploadVaultItemsToServer(userId, vaultData);
    }
    if (data.items.type === "secure_note") {
      const encryptedSecretData = await encryptData(
        (data.items.data as SecureNoteState).content,
        masterKey,
      );

      const vaultData: EncryptedSecureNoteVaultItemsParams = {
        type: "secure_note",
        title: (data.items.data as SecureNoteState).title,
        tags: (data.items.data as SecureNoteState).tags,
        encryptedSecretData,
      };

      res = await uploadVaultItemsToServer(userId, vaultData);
    }

    if (res?.status !== 201) {
      displayToast({
        type: "error",
        message: res?.message || "Failed to upload vault items",
      });
    }

    return res;
  } catch (error) {
    console.error("Error uploading vault items:", error);
  }
};

export const uploadVaultItemsToServer = async (
  userId: string,
  vaultData:
    | EncryptedWebsiteVaultItemsParams
    | EncryptedSecureNoteVaultItemsParams,
) => {
  try {
    const res = await axios.post(`http://${ip_address}:3002/api/vault/upload`, {
      userId,
      vaultData,
    });

    if (res.status === 201) {
      console.log("Vault items uploaded successfully");
    }

    return {
      status: res.status,
      message: res.data.message,
    };
  } catch (error) {
    console.error("Error uploading vault items:", error);
  }
};
