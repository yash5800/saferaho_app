import axios from "axios";
import { getIp } from "../getip";

const ip_address = getIp();

export async function getFilesMetadata(userId: string) {
  if (!userId) {
    console.error("User ID is required to fetch files metadata.");
    return;
  }

  try {
    const res = await axios.post(
      `http://${ip_address}:3002/api/files/filesMetadata`,
      {
        userId: userId,
      },
    );
    console.log("Files metadata response:", res.data);

    return res.data.data;
  } catch (error) {
    console.error("Error fetching files metadata:", error);
  }
}
