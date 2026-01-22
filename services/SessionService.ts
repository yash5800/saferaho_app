import { storage } from "@/storage/mmkv";
import { getIp } from "@/util/getip";
import axios from "axios";
import SecretStorage from "../storage/SecretStorage";

const ip_address = getIp();

class SessionService {
  static #isTokenExpired(token: string): boolean {
    try {
      const [, payload] = token.split(".");
      const decoded = JSON.parse(atob(payload));
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  static async #validateToken(token: string): Promise<boolean> {
    if (!this.#isTokenExpired(token)) {
      try {
        console.log("Validating token with backend...");

        await axios.get(`http://${ip_address}:3002/api/auth/amireal`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return true;
      } catch (error) {
        console.error("Error validating token:", error);
        return false;
      }
    }
    return false;
  }

  static async checkSession(): Promise<boolean> {
    const accessToken = storage.getString("accessToken");

    console.log(
      "SessionService - Checking session with accessToken:",
      accessToken,
    );
    console.log(
      "SessionService - Stored tokens in SecretStorage:",
      await SecretStorage.retrieveSecret("refreshToken"),
    );

    if (accessToken) {
      const isValid = await this.#validateToken(accessToken);

      if (isValid) {
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${accessToken}`;
        return true;
      } else {
        console.log(
          "Access token invalid or expired, attempting to refresh...",
        );

        const refreshToken = await SecretStorage.retrieveSecret("refreshToken");
        if (refreshToken && !this.#isTokenExpired(refreshToken)) {
          try {
            const res = await axios.post(
              `http://${ip_address}:3002/api/auth/refresh-token`,
              {
                refreshToken,
              },
            );

            const newAccessToken = res.data.accessToken;
            storage.set("accessToken", newAccessToken);
            axios.defaults.headers.common["Authorization"] =
              `Bearer ${newAccessToken}`;

            return true;
          } catch (error) {
            console.error("Error refreshing token:", error);

            // storage.clearAll();
            // await SecretStorage.clearAllSecrets();

            return false;
          }
        }
      }
    }

    return false;
  }
}

export default SessionService;
