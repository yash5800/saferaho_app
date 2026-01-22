import { storage } from "@/storage/mmkv";
import SecretStorage from "@/storage/SecretStorage";
import axios from "axios";
import { generateKey } from "./cryptography";
import { getIp } from "./getip";

interface SignInUserData {
  userInput: string;
  password: string;
}

const ip_address = getIp();

//TODO: future update

const signInUser = async (data: SignInUserData) => {
  storage.clearAll();
  SecretStorage.clearAllSecrets();

  try {
    const check1 = await axios.post(
      `http://${ip_address}:3002/api/signin/check1`,
      {
        userInput: data.userInput,
      },
    );

    console.log("SignInUser - check1 response:", check1.data);

    if (check1.status === 200) {
      const calculatedHash = await generateKey(
        data.password,
        check1.data.data.auth_salt,
      );

      console.log("SignInUser - calculatedHash:", calculatedHash);

      const check2 = await axios.post(
        `http://${ip_address}:3002/api/signin/check2`,
        {
          accountName: check1.data.data.accountName,
          authHash: calculatedHash,
        },
      );

      if (check2.status === 200) {
        const userData = check2.data.data;

        const userProfile = {
          userName: userData.accountName,
          email: userData.email,
          id: userData._id,
          userUUID: userData.accountUUID,
          createdAt: new Date(userData._createdAt),
        };

        console.log("SignInUser - check2 response:", userData);

        storage.set("accessToken", check2.data.tokens.accessToken);
        storage.set("userProfile", JSON.stringify(userProfile));

        console.log(
          "SignInUser - Stored accessToken and userProfile in storage.",
        );

        //TODO : set default settings
        storage.set(
          "userSettings",
          JSON.stringify({
            darkMode: false,
            notificationsEnabled: false,
            biometricAuth: false,
            // other settings can be added here like 2FA, notifications, etc.
          }),
        );

        //TODO : store userVaultData

        // data.storage.set('userVaultData', JSON.stringify({
        //   // initial vault data structure
        // }));

        // TODO : store user files metadata

        console.log(
          "SignInUser - Generating passwordKey and storing user secret data.",
        );

        console.log(
          "SignInUser - userData:",
          userData.email,
          data.password,
          userData.secret.pk_salt,
        );

        const passwordKey = await generateKey(
          userData.email + data.password,
          userData.secret.pk_salt,
        );

        // Storing user secret data securely
        const pk_salt = userData.secret.pk_salt;
        const encryptedMasterKey = userData.secret.encryptedMasterKey;

        console.log(
          "SignInUser - Storing masterKeyData and refreshToken in SecretStorage.",
        );

        await SecretStorage.storeSecret(
          "masterKeyData",
          JSON.stringify({
            passwordKey,
            pk_salt,
            encryptedMasterKey,
          }),
        );

        console.log(
          "MasterKeyData stored in SecretStorage.",
          await SecretStorage.retrieveSecret("masterKeyData"),
        );

        await SecretStorage.storeSecret(
          "refreshToken",
          check2.data.tokens.refreshToken,
        );

        console.log("SignInUser - Sign in process completed successfully.");

        return {
          type: "success",
          userProfile,
          message: "Signed in successfully",
        };
      }
    }

    return {
      type: "error",
      message: "Invalid sign in attempt",
    };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log("Axios error in signInUser:", err.response?.data);

      if (
        err.response?.data?.message ===
        "No user found with this username or email"
      ) {
        return {
          type: "error",
          field: "userInput",
          message: "No user found with this username or email",
        };
      } else if (
        err.response?.data?.message === "Invalid credentials provided."
      ) {
        return {
          type: "error",
          field: "password",
          message: "Incorrect password",
        };
      }
    }
    console.log("Error in signInUser:", err);
    throw err;
  }

  // const passwordKey = await generateKey(data.email + data.password, data.pwd_salt);

  // const masterKey = await decryptData(data.encryptedMasterKey, passwordKey);

  // return masterKey;
};

export { signInUser };
