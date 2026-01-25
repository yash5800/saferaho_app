import axios from "axios";
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
  const res = await axios.post(
    `http://${ip_address}:3002/api/upload-chunk`,
    // {
    //   headers: {
    //     authorization: `Bearer ${storage.getString("authToken") || ""}`,
    //   },
    // },
    {
      data: { ...params },
    },
  );

  console.log("Chunk upload response status:", res.status);

  if (res.status !== 201) {
    throw new Error("Chunk upload failed");
  }

  return res.data;
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
  const res = await axios.post(
    `http://${ip_address}:3002/api/uploadFilePreview`,
    {
      userId,
      fileId,
      encryptedPreview,
      encryptedPreviewKey,
      version,
    },
  );

  console.log("Preview upload response status:", res.status);

  if (res.status !== 201) {
    throw new Error("Preview upload failed");
  }

  return res.data;
}
