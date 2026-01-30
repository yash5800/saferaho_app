import axios from "axios";
import { getIp } from "../getip";

const ip_address = getIp();

export const DeleteFile = async (userId: string, fileId: string) => {
  try {
    const res = await axios.delete(
      `http://${ip_address}:3002/api/files/deleteFile/:${userId}/:${fileId}`,
    );
    console.log("File delete response status:", res.status);

    if (res.status !== 200) {
      throw new Error("File deletion failed");
    }

    return res.data;
  } catch (err) {
    console.log("Error deleting file:", err);
  }
};
