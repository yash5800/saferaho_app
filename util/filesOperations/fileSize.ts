import * as FileSystem from "expo-file-system/legacy";

export async function getFileSize(uri: string): Promise<number> {
  const info = await FileSystem.getInfoAsync(uri);

  if (!info.exists || typeof info.size !== "number") {
    throw new Error("File not accessible");
  }

  return info.size;
}

export const formatSize = (bytes: number) => {
  if (bytes === 0 || bytes === undefined || bytes === null) return "0 B";

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};
