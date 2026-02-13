import axios from "axios";
import { getIp } from "../getip";

const ip_address = getIp();

export const getVaultItems = async (userId: string) => {
  if (!userId) return;

  const res = await axios.get(`http://${ip_address}:3002/api/vault/items`, {
    params: { userId },
  });

  if (res.status !== 200) {
    console.error("Failed to fetch vault items:", res.data.message);
    return;
  }

  return res.data.data;
};
