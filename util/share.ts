import * as Sharing from "expo-sharing";

const shareFileAsync = async (fileUri: string) => {
  try {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      console.warn("Sharing is not available on this platform");
      return false;
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: undefined, // Let Expo determine the MIME type
      dialogTitle: "Share File",
      UTI: undefined, // Let Expo determine the UTI
    });

    return true;
  } catch (error) {
    console.error("Error sharing file:", error);
    return false;
  }
};

export { shareFileAsync };
