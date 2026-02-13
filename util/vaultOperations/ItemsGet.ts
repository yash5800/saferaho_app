import axios from "axios";
import { ApiError, ErrorType, logError } from "../errors/ApiError";
import { getIp } from "../getip";

const ip_address = getIp();

export const getVaultItems = async (userId: string) => {
  if (!userId) {
    const error = new Error("User ID is required to fetch vault items.");
    logError("getVaultItems", error);
    throw error;
  }

  try {
    const res = await axios.get(`http://${ip_address}:3002/api/vault/items`, {
      params: { userId },
      timeout: 30000,
    });

    if (res.status !== 200) {
      throw new ApiError({
        type: ErrorType.SERVER_ERROR,
        message: res.data?.message || "Failed to fetch vault items",
        statusCode: res.status,
      });
    }

    return res.data.data || [];
  } catch (error) {
    logError("getVaultItems", error);

    // Re-throw as ApiError if it isn't already
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
};
