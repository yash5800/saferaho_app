import * as ImageManipulator from "expo-image-manipulator";
import { decryptPreview } from "../cryptography";

export async function generateImagePreview(uri: string) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 256 } }],
    {
      compress: 0.7,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    },
  );

  console.log(result.base64);

  return result.base64!; // small (~10–50 KB)
}

export type EncryptedPreviewPayload = {
  _id: string;
  accountId: string;
  fileId: string;
  vesrion: string;
  assetId: string;
  url: string;
  encryptedPreviewKey: {
    cipher: string;
    nonce: string;
    mac: string;
  };
};

export async function buildPreviewImage(
  previewFileMetadata: EncryptedPreviewPayload,
  masterKey: string,
) {
  console.log("Building preview image for file:", previewFileMetadata);

  // fetch encrypted preview
  const response = await fetch(previewFileMetadata.url);
  if (!response.ok) throw new Error("Failed to fetch preview");

  // read binary
  const arrayBuffer = await response.arrayBuffer();

  // decode JSON
  const jsonString = new TextDecoder("utf-8").decode(arrayBuffer);
  const encryptedPreview = JSON.parse(jsonString);

  // decrypt → base64
  const base64Preview = await decryptPreview(
    encryptedPreview,
    previewFileMetadata.encryptedPreviewKey,
    masterKey,
  );

  console.log("Built preview image base64:", base64Preview);
  console.log(
    "Base64 last chars:",
    base64Preview.slice(-10),
    "length:",
    base64Preview.length,
  );

  return base64Preview;
}
