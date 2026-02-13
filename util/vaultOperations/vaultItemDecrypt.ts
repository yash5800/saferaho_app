import { useMasterKey } from "@/stateshub/useMasterKey";
import { decryptData } from "../cryptography";

interface vaultItemDecryptTypes {
  cipher: string;
  nonce: string;
  mac: string;
}

export interface DecryptedDataWebsite {
  userName: string;
  password: string;
  notes?: string;
}

export interface DecryptedDataSecureNote {
  content: string;
}

export async function vaultItemDecrypt(
  type: "website" | "secure_note",
  encryptedData: vaultItemDecryptTypes,
): Promise<DecryptedDataWebsite | DecryptedDataSecureNote | null> {
  const masterKey = useMasterKey.getState().masterKey;

  if (!masterKey) return null;

  try {
    const decryptedData = await decryptData(encryptedData, masterKey);

    console.log("Decrypted data:", decryptedData);

    if (type === "website") {
      const parsedData = JSON.parse(decryptedData);
      return {
        userName: parsedData.userName,
        password: parsedData.password,
        notes: parsedData.notes,
      } as DecryptedDataWebsite;
    } else if (type === "secure_note") {
      return {
        content: decryptedData,
      } as DecryptedDataSecureNote;
    }

    return null;
  } catch (e) {
    console.error("Decryption failed:", e);
    return null;
  }
}
