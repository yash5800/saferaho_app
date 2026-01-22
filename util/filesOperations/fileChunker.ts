import { storage } from "@/storage/mmkv";
import * as FileSystem from "expo-file-system/legacy";
import * as Random from "expo-random";
import { encryptData } from "../cryptography";
import { getFileSize } from "./fileSize";
import { uploadChunkToServer } from "./fileUploader";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB

export interface EncryptedChunk {
  index: number;
  encrypted: string;
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

  const chunks: EncryptedChunk[] = [];

  let offset = 0;
  let index = 0;

  while (offset < fileSize) {
    const length = Math.min(CHUNK_SIZE, fileSize - offset);

    // 1️⃣ Read PART of file as Base64
    const base64Chunk = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
      position: offset,
      length,
    });

    // 2️⃣ Encrypt this chunk
    const encrypted = encryptData(base64Chunk, secretKey).toString();

    // 3️⃣ Save chunk
    chunks.push({
      index,
      encrypted,
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

  console.log(chunks[0].encrypted);

  return chunks;
}

export async function uploadEncryptedChunks(
  filesMetadata: { id: string; name: string; size: number },
  chunks: { index: number; encrypted: string }[],
  onProgress: (p: number) => void,
) {
  for (let i = 0; i < chunks.length; i++) {
    await uploadChunkToServer({
      userId: storage.getString("userProfile")
        ? JSON.parse(storage.getString("userProfile") || "").id
        : "",
      fileId: filesMetadata.id,
      filename: filesMetadata.name,
      index: i,
      fileSize: filesMetadata.size,
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
      console.log(`Starting upload for file: ${file.file.name}`);
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
