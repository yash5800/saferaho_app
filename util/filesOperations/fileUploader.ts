import axios from "axios";
import { getIp } from "../getip";

const ip_address = getIp();

export async function uploadChunkToServer({
  userId,
  fileId,
  filename,
  index,
  fileSize,
  totalChunks,
  encrypted,
}: {
  userId: string;
  fileId: string;
  filename: string;
  index: number;
  fileSize: number;
  totalChunks: number;
  encrypted: string;
}) {
  const res = await axios.post(`http://${ip_address}:3002/api/upload-chunk`, {
    userId,
    fileId,
    filename,
    index,
    fileSize,
    totalChunks,
    encrypted,
  });

  console.log("Chunk upload response status:", res.status);

  if (res.status !== 201) {
    throw new Error("Chunk upload failed");
  }

  return res.data;
}
