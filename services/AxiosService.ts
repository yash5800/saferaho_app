import { globalNetworkState } from "@/components/network/NetworkProvider";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from "@/storage/mediators/system";
import { createApiErrorFromAxios } from "@/util/errors/ApiError";
import { getIp } from "@/util/getip";
import axios, { AxiosError } from "axios";

const ip_address = getIp();

// Configure axios defaults
axios.defaults.timeout = 30000; // 30 second timeout
axios.defaults.headers.common["Content-Type"] = "application/json";

class AxiosService {
  static initialize() {
    // Set up axios interceptor for request
    axios.interceptors.request.use(
      async (config) => {
        // Block requests when offline (except for refresh token requests)
        const isRefreshRequest = config.url?.includes("/auth/refresh-token");

        if (!globalNetworkState.isOnline && !isRefreshRequest) {
          console.log("🚫 Request blocked - No network connection");
          const error = new Error("No network connection");
          return Promise.reject(error);
        }

        const token = await getAccessToken();
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
      },
    );

    // Set up axios interceptor for response (handle token refresh)
    axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Don't retry if no config
        if (!originalRequest) {
          return Promise.reject(createApiErrorFromAxios(error));
        }

        // Check if error is 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Check network before attempting refresh
          if (!globalNetworkState.isOnline) {
            console.log("Cannot refresh token - offline");
            return Promise.reject(createApiErrorFromAxios(error));
          }

          try {
            const refreshToken = await getRefreshToken();

            if (!refreshToken) {
              console.log("No refresh token available");
              return Promise.reject(createApiErrorFromAxios(error));
            }

            console.log("Attempting to refresh access token...");

            const response = await axios.post(
              `http://${ip_address}:3002/api/auth/refresh-token`,
              { refreshToken },
              {
                timeout: 10000,
                _retry: true, // Mark this request to avoid infinite loop
              } as any,
            );

            if (response.data?.accessToken) {
              const newAccessToken = response.data.accessToken;
              await setAccessToken(newAccessToken);

              // Update the failed request with new token
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

              console.log("✅ Token refreshed successfully, retrying request");
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error("❌ Failed to refresh token:", refreshError);
            // Don't expose refresh error details, return original auth error
            return Promise.reject(createApiErrorFromAxios(error));
          }
        }

        // Convert error to ApiError for consistent handling
        return Promise.reject(createApiErrorFromAxios(error));
      },
    );
  }

  static async setInitialToken() {
    const token = await getAccessToken();
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }
}

export default AxiosService;
