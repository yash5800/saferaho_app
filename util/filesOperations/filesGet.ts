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

    return res.data.data;
  } catch (error) {
    console.error("Error fetching files metadata:", error);
  }
}

export async function getFilePreviewMetadata(userId: string) {
  if (!userId) {
    console.error("User ID is required to fetch file preview metadata.");
    return;
  }

  try {
    const res = await axios.post(
      `http://${ip_address}:3002/api/files/filePreviewMetadata`,
      {
        userId: userId,
      },
    );
    console.log("File preview metadata response:", res.data);

    return res.data.data;
  } catch (error) {
    console.error("Error fetching file preview metadata:", error);
  }
}
