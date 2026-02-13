import axios from "axios";
import { ApiError, logError } from "../errors/ApiError";
import { getIp } from "../getip";

const ip_address = getIp();

export async function getFilesMetadata(userId: string) {
  if (!userId) {
    const error = new Error("User ID is required to fetch files metadata.");
    logError("getFilesMetadata", error);
    throw error;
  }

  try {
    const res = await axios.post(
      `http://${ip_address}:3002/api/files/filesMetadata`,
      { userId },
      { timeout: 30000 },
    );

    return res.data.data || [];
  } catch (error) {
    logError("getFilesMetadata", error);

    // Re-throw as ApiError if it isn't already
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
}

export async function getFilePreviewMetadata(userId: string) {
  if (!userId) {
    const error = new Error(
      "User ID is required to fetch file preview metadata.",
    );
    logError("getFilePreviewMetadata", error);
    throw error;
  }

  try {
    const res = await axios.post(
      `http://${ip_address}:3002/api/files/filePreviewMetadata`,
      { userId },
      { timeout: 30000 },
    );

    console.log("File preview metadata fetched successfully");
    return res.data.data || [];
  } catch (error) {
    logError("getFilePreviewMetadata", error);

    // Re-throw as ApiError if it isn't already
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
}
