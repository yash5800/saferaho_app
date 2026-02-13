import axios from "axios";
import { ApiError, ErrorType, logError } from "../errors/ApiError";
import { getIp } from "../getip";

const ip_address = getIp();

interface UploadChunkParams {
  userId: string;
  fileId: string;
  filename: string;
  index: number;
  fileSize: number;
  fileType: string;
  duration?: number;
  totalChunks: number;
  encrypted: {
    cipher: string;
    nonce: string;
    mac: string;
  };
}

export async function uploadChunkToServer(params: UploadChunkParams) {
  try {
    const res = await axios.post(
      `http://${ip_address}:3002/api/upload-chunk`,
      { data: { ...params } },
      { timeout: 60000 }, // 60 seconds for upload
    );

    console.log("Chunk upload response status:", res.status);

    if (res.status !== 201) {
      throw new ApiError({
        type: ErrorType.SERVER_ERROR,
        message: "Chunk upload failed",
        statusCode: res.status,
      });
    }

    return res.data;
  } catch (error) {
    logError("uploadChunkToServer", error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError({
      type: ErrorType.SERVER_ERROR,
      message: "Failed to upload file chunk",
      originalError: error,
    });
  }
}

export async function uploadPreviewToServer({
  userId,
  fileId,
  encryptedPreview,
  encryptedPreviewKey,
  version,
}: {
  userId: string;
  fileId: string;
  encryptedPreview: {
    cipher: string;
    nonce: string;
    mac: string;
  };
  encryptedPreviewKey: {
    cipher: string;
    nonce: string;
    mac: string;
  };
  version: string;
}) {
  try {
    const res = await axios.post(
      `http://${ip_address}:3002/api/uploadFilePreview`,
      {
        userId,
        fileId,
        encryptedPreview,
        encryptedPreviewKey,
        version,
      },
      { timeout: 30000 },
    );

    console.log("Preview upload response status:", res.status);

    if (res.status !== 201) {
      throw new ApiError({
        type: ErrorType.SERVER_ERROR,
        message: "Preview upload failed",
        statusCode: res.status,
      });
    }

    return res.data;
  } catch (error) {
    logError("uploadPreviewToServer", error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError({
      type: ErrorType.SERVER_ERROR,
      message: "Failed to upload file preview",
      originalError: error,
    });
  }
}
