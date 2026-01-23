import { storage } from "@/storage/mmkv";
import * as FileSystem from "expo-file-system/legacy";
import * as Random from "expo-random";
import { deriveKeys, encryptChunk, encryptPreview } from "../cryptography";
import { getFileSize } from "./fileSize";
import { uploadChunkToServer, uploadPreviewToServer } from "./fileUploader";
import { generateImagePreview } from "./preview";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB

export interface EncryptedChunk {
  index: number;
  encrypted: {
    cipher: string;
    nonce: string;
    mac: string;
  };
  version: string;
}

function yieldToUI(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// Generate a random ID using expo-random
export function generateRandomId(): string {
  const randomBytes = Random.getRandomBytes(16);
  return Array.from(randomBytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function encryptFileToChunks(
  uri: string,
  secretKey: string,
  onProgress?: (percent: number) => void,
): Promise<EncryptedChunk[]> {
  const fileSize = await getFileSize(uri);
  const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);

  console.log(`File size: ${fileSize} bytes, Total chunks: ${totalChunks}`);

  const { encKey, macKey } = deriveKeys(secretKey);

  let offset = 0;
  let index = 0;

  const chunks: EncryptedChunk[] = [];

  while (offset < fileSize) {
    const length = Math.min(CHUNK_SIZE, fileSize - offset);

    // 1️⃣ Read PART of file as Base64
    const base64Chunk = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
      position: offset,
      length,
    });

    // 2️⃣ Encrypt this chunk
    const encrypted = await encryptChunk(base64Chunk, encKey, macKey);

    // 3️⃣ Save chunk
    chunks.push({
      index,
      encrypted,
      version: "aes-cbc-hmac-v1",
    });

    // 4️⃣ Update counters
    offset += length;
    index++;

    // 5️⃣ Progress callback
    if (onProgress) {
      onProgress(Math.round((index / totalChunks) * 100));
    }

    // 6️⃣ Yield to UI (prevents crash)
    await yieldToUI();
  }

  return chunks;
}

export async function uploadEncryptedChunks(
  filesMetadata: { id: string; name: string; size: number; type: string },
  chunks: EncryptedChunk[],
  onProgress: (p: number) => void,
) {
  for (let i = 0; i < chunks.length; i++) {
    console.log(
      `Uploading chunk ${i + 1} of ${chunks.length}`,
      chunks[i].encrypted.cipher.length,
    );
    await uploadChunkToServer({
      userId: storage.getString("userProfile")
        ? JSON.parse(storage.getString("userProfile") || "").id
        : "",
      fileId: filesMetadata.id,
      filename: filesMetadata.name,
      index: i,
      fileSize: filesMetadata.size,
      fileType: filesMetadata.type,
      totalChunks: chunks.length,
      encrypted: chunks[i].encrypted,
    });

    onProgress(Math.round(((i + 1) / chunks.length) * 100));
  }
}

type UserFiles = {
  id: string;
  file: {
    name: string;
    size: number;
    uri: string;
    type: string;
  };
  totalChunks: number;
  progress: number;
  status: "encrypting" | "uploading" | "completed" | "error" | "pending";
};

//TODO: implement this function to upload multiple files sequentially
export async function uploadFilesSequentially(
  masterKey: string,
  setFiles: React.Dispatch<React.SetStateAction<UserFiles[]>>,
  filesMetadata: UserFiles[],
) {
  try {
    for (const file of filesMetadata) {
      console.log(
        `Starting upload for file: ${file.file.name}, file id: ${file.id}`,
      );
      // Encrypt file to chunks with progress callback
      setFiles((prevFiles: UserFiles[]) =>
        prevFiles.map((f) => {
          console.log(
            `Setting status to encrypting for file: ${file.file.name} of ${f.file.name}`,
          );
          return f.file.name === file.file.name
            ? { ...f, status: "encrypting" }
            : f;
        }),
      );

      console.log(
        `Checking if preview generation is needed for file: ${file.file.name}`,
      );

      if (file.file.type.startsWith("image/")) {
        console.log(`Generating preview for image file: ${file.file.name}`);

        const previewBase64 = await generateImagePreview(file.file.uri);

        console.log(
          "previewBase64 last chars",
          previewBase64.slice(-10),
          "length:",
          previewBase64.length,
        );

        const encryptedPreviewPayload = await encryptPreview(
          previewBase64,
          masterKey,
        );

        console.log(
          `Encrypted preview for file: ${file.file.name} - `,
          encryptedPreviewPayload,
        );

        await uploadPreviewToServer({
          userId: storage.getString("userProfile")
            ? JSON.parse(storage.getString("userProfile") || "").id
            : "",
          fileId: file.id,
          ...encryptedPreviewPayload,
        });
      }

      console.log(`Encrypting file to chunks: ${file.file.name}`);

      const chunks = await encryptFileToChunks(
        file.file.uri,
        masterKey,
        (percent) => {
          setFiles((prevFiles: UserFiles[]) =>
            prevFiles.map((f) =>
              f.file.name === file.file.name
                ? {
                    ...f,
                    progress: percent,
                    status: "encrypting",
                  }
                : f,
            ),
          );
        },
      );

      // Switch to uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.file.name === file.file.name
            ? {
                ...f,
                totalChunks: chunks.length,
                status: "uploading",
                progress: 0,
              }
            : f,
        ),
      );

      // Upload encrypted chunks with progress callback
      await uploadEncryptedChunks(
        {
          id: file.id,
          name: file.file.name,
          size: file.file.size,
          type: file.file.type,
        },
        chunks,
        (percent) => {
          setFiles((prevFiles: UserFiles[]) =>
            prevFiles.map((f) =>
              f.file.name === file.file.name
                ? { ...f, progress: percent, status: "uploading" }
                : f,
            ),
          );
        },
      );

      // Mark file as completed
      setFiles((prevFiles: UserFiles[]) =>
        prevFiles.map((f) =>
          f.file.name === file.file.name
            ? { ...f, progress: 100, status: "completed" }
            : f,
        ),
      );
    }
  } catch (error) {
    console.error("Error uploading files:", error);
  }
}
