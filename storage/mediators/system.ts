import { UserMasterKeyType } from "@/types/userMasterKey";
import { UserPlanType } from "@/types/userPlan";
import { UserProfileType } from "@/types/userProfile";
import { UserSettingsType } from "@/types/userSettings";
import { storage } from "../mmkv";
import SecretStorage from "../SecretStorage";

// Storing system user data in the storage

{
  /* Profile */
}
export function setUserProfileData(data: UserProfileType) {
  const storeData = JSON.stringify(data);
  storage.set("userProfileData", storeData);
}

export function getUserProfileData(): UserProfileType | null {
  const data = storage.getString("userProfileData");
  if (data) {
    return JSON.parse(data) as UserProfileType;
  }
  return null;
}

{
  /* Subscription */
}
export function setUserSubscriptionData(data: UserPlanType) {
  const storeData = JSON.stringify(data);
  storage.set("userSubscriptionData", storeData);
}

export function getUserSubscriptionData(): UserPlanType | null {
  const data = storage.getString("userSubscriptionData");
  if (data) {
    return JSON.parse(data) as UserPlanType;
  }
  return null;
}

{
  /* Settings */
}
export function setUserSettingsData(data: UserSettingsType) {
  const storeData = JSON.stringify(data);
  storage.set("userSettingsData", storeData);
}

export function getUserSettingsData(): UserSettingsType | null {
  const data = storage.getString("userSettingsData");
  if (data) {
    return JSON.parse(data) as UserSettingsType;
  }
  return null;
}

{
  /* Master Key */
}
export async function setMasterKeyData(data: UserMasterKeyType) {
  const storeData = JSON.stringify(data);
  await SecretStorage.storeSecret("masterKeyData", storeData);
}

export async function getMasterKeyData(): Promise<UserMasterKeyType | null> {
  const data = await SecretStorage.retrieveSecret("masterKeyData");
  if (data) {
    return JSON.parse(data) as UserMasterKeyType;
  }
  return null;
}

{
  /* AccessToken */
}
export function setAccessToken(token: string) {
  storage.set("accessToken", token);
}

export function getAccessToken(): string | null {
  const token = storage.getString("accessToken");
  if (token) {
    return token;
  }
  return null;
}

{
  /* RefreshToken */
}
export async function setRefreshToken(token: string) {
  await SecretStorage.storeSecret("refreshToken", token);
}

export async function getRefreshToken(): Promise<string | null> {
  const token = await SecretStorage.retrieveSecret("refreshToken");
  if (token) {
    return token;
  }
  return null;
}

// TODO: Offline Data Storage Functions Vault + Files Metadata

{
  /* Clear All User Data */
}
export async function clearAllUserData() {
  storage.clearAll();
  await SecretStorage.clearAllSecrets();
}
