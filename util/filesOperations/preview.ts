import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as VideoThumbnails from "expo-video-thumbnails";
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

  return result.base64!; // small (~10–50 KB)
}

export async function readThumbnailAsBase64(thumbnailUri: string) {
  return await FileSystem.readAsStringAsync(thumbnailUri, {
    encoding: "base64",
  });
}

export async function generateVideoPreview(uri: string) {
  const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(uri, {
    time: 1000, // 1 second
    quality: 0.6,
  });

  return readThumbnailAsBase64(thumbnailUri);
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

  // fetch encrypted preview (stored as JSON string)
  const response = await fetch(previewFileMetadata.url);
  if (!response.ok) throw new Error("Failed to fetch preview");

  // directly parse JSON
  const encryptedPreview = JSON.parse(await response.json());

  console.log("Fetched encrypted preview:", typeof encryptedPreview);

  // decrypt → base64 image
  const base64Preview = await decryptPreview(
    encryptedPreview,
    previewFileMetadata.encryptedPreviewKey,
    masterKey,
  );

  console.log(
    "Built preview image base64 length:",
    base64Preview.length,
    "last chars:",
    base64Preview.slice(-10),
  );

  return base64Preview;
}

export async function getMediaDurationSeconds(uri: string) {
  const sound = new Audio.Sound();

  try {
    await sound.loadAsync(
      { uri },
      {},
      false, // 👈 do NOT autoplay
    );

    const status = await sound.getStatusAsync();

    if (!status.isLoaded || status.durationMillis == null) {
      return null;
    }

    return Math.floor(status.durationMillis / 1000);
  } catch (e) {
    console.warn("Failed to read media duration:", e);
    return null;
  } finally {
    await sound.unloadAsync(); // 🔴 VERY IMPORTANT
  }
}
