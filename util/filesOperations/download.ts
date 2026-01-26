import { setPickingInProgress } from "@/globals/picking";
import { PermissionsAndroid, Platform } from "react-native";
import RNFS from "react-native-fs";

async function requestStoragePermission(): Promise<boolean> {
  if (Platform.OS !== "android") return true;

  try {
    // Android 13+
    if (Platform.Version >= 33) {
      return true; // No permission needed for Downloads
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: "Storage Permission",
        message: "App needs access to storage to save files",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error("Permission request error:", err);
    return false;
  }
}

export async function saveToDownloads(
  fileUri: string,
  filename: string,
): Promise<string | null> {
  try {
    setPickingInProgress(true);
    const hasPermission = await requestStoragePermission();

    if (!hasPermission) {
      setPickingInProgress(false);
      console.warn("Storage permission denied");
      return null;
    }

    const sourcePath = fileUri.replace("file://", "");
    const destPath =
      Platform.OS === "android"
        ? `${RNFS.DownloadDirectoryPath}/${filename}`
        : `${RNFS.DocumentDirectoryPath}/${filename}`;

    // Ensure the destination directory exists (mainly for iOS sandbox paths)
    const destDir = destPath.substring(0, destPath.lastIndexOf("/"));
    if (destDir) {
      await RNFS.mkdir(destDir);
    }

    const exists = await RNFS.exists(sourcePath);
    if (!exists) {
      setPickingInProgress(false);
      throw new Error("Source file does not exist");
    }

    await RNFS.copyFile(sourcePath, destPath);

    return destPath;
  } catch (error) {
    console.error("Failed to save file:", error);
    return null;
  } finally {
    setPickingInProgress(false);
  }
}
