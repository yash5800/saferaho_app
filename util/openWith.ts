import { setPickingInProgress } from "@/globals/picking";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

function getExtensionFromMime(mime: string): string {
  if (!mime) return "bin";

  if (mime.startsWith("image/")) {
    if (mime.includes("png")) return "png";
    if (mime.includes("webp")) return "webp";
    return "jpg"; // default
  }

  if (mime.startsWith("video/")) {
    if (mime.includes("quicktime")) return "mov";
    return "mp4";
  }

  if (mime.startsWith("audio/")) {
    if (mime.includes("wav")) return "wav";
    if (mime.includes("aac")) return "aac";
    return "mp3";
  }

  if (mime === "application/pdf") return "pdf";

  if (mime.includes("word") || mime.includes("officedocument.wordprocessingml"))
    return "docx";

  if (mime.includes("excel") || mime.includes("spreadsheetml")) return "xlsx";

  if (mime.includes("zip") || mime.includes("compressed")) return "zip";
  if (mime.includes("csv")) return "csv";

  if (mime.includes("tar")) return "tar";
  if (mime.includes("rar")) return "rar";

  return "bin";
}

function mimeToUTI(mime?: string): string {
  if (!mime) return "public.data";

  if (mime.startsWith("image/")) return "public.image";
  if (mime.startsWith("video/")) return "public.movie";
  if (mime.startsWith("audio/")) return "public.audio";

  switch (mime) {
    case "application/pdf":
      return "public.pdf";
    case "text/plain":
      return "public.plain-text";
    case "application/zip":
      return "public.zip-archive";
    default:
      return "public.data";
  }
}

async function ensureExtension(uri: string, mime?: string) {
  if (!mime) return uri;

  const ext = mime.split("/")[1];
  if (uri.endsWith(`.${ext}`)) return uri;

  const newUri = `${uri}.${ext}`;
  await FileSystem.copyAsync({ from: uri, to: newUri });
  return newUri;
}

async function openAndroid(uri: string, mime?: string) {
  const contentUri = await FileSystem.getContentUriAsync(uri);

  try {
    // 1️⃣ Try strict open (correct apps only)
    await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
      data: contentUri,
      type: mime,
      flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
    });
  } catch (e) {
    console.warn("Strict open failed, falling back", e);

    // 2️⃣ Fallback: open chooser (user can install app)
    await IntentLauncher.startActivityAsync("android.intent.action.SEND", {
      type: mime ?? "*/*",
      extra: {
        "android.intent.extra.STREAM": contentUri,
      },
      flags: 1,
    });
  }
}

async function openIOS(uri: string, mime?: string) {
  const available = await Sharing.isAvailableAsync();
  if (!available) return;

  const fixedUri = await ensureExtension(uri, mime);

  await Sharing.shareAsync(fixedUri, {
    mimeType: mime,
    UTI: mimeToUTI(mime),
    dialogTitle: "Open with",
  });
}

export async function openFile(fileUri: string, mimeType?: string) {
  setPickingInProgress(true);
  try {
    if (Platform.OS === "android") {
      await openAndroid(fileUri, mimeType);
    } else {
      await openIOS(fileUri, mimeType);
    }
  } catch (err) {
    console.error("Failed to open file:", err);
  } finally {
    setPickingInProgress(false);
  }
}

export { getExtensionFromMime };
