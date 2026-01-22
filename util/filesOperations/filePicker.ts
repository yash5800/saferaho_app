import * as DocumentPicker from "expo-document-picker";
import { setPickingInProgress } from "../../globals/picking";

export async function pickFile() {
  try {
    setPickingInProgress(true);
    console.log("Opening file picker...");
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: true,
    });

    if (result.canceled) return null;

    const files = result.assets;

    return files.map((file) => ({
      name: file.name,
      size: file.size || 0,
      uri: file.uri,
      type: file.mimeType || "application/octet-stream",
    }));
  } catch (error) {
    console.error("Error picking file:", error);
    return null;
  } finally {
    setPickingInProgress(false);
  }
}
