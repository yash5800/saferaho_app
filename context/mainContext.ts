import { EncryptedPreviewPayload } from "@/util/filesOperations/preview";
import { createContext } from "react";

// accountUUID: res.accountUUID,
// accountName: res.accountName,
// email: res.email,
// _id: res._id,
// _createdAt: res._createdAt,
// secret : {
//   pk_salt: res.pk_salt,
//   encryptedMasterKey: res.encryptedMasterKey
// }

export interface UserProfile {
  id: string;
  userUUID: string;
  userName: string;
  email: string;
  createdAt: Date;
}

// interface JWTTokens{
//   accessToken: string;
//   refreshToken: string;
// }

export interface UserSettings {
  themeMode: "light" | "dark" | "system";
  enableNotifications: boolean;
}

export interface UserFilesMetadata {
  _id: string;
  accountId: string;
  filename: string;
  fileSize: number;
  fileType: string;
  duration?: number;
  totalChunks: number;
  chunks: [
    {
      index: number;
      assetId: string;
      url: string;
    },
  ];
  _createdAt: string;
}

interface UserDataContextType {
  userProfile: UserProfile | null;
  userSettings: UserSettings;
  userFilesMetadata: UserFilesMetadata[];
  setUserFilesMetadata: React.Dispatch<
    React.SetStateAction<UserFilesMetadata[]>
  >;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  reload: () => Promise<void>;
  previewsByFieldId: Record<string, EncryptedPreviewPayload>;
  setPreviewsByFieldId: React.Dispatch<
    React.SetStateAction<Record<string, EncryptedPreviewPayload>>
  >;
}

export const UserDataContext = createContext<UserDataContextType>({
  userProfile: {
    id: "",
    userUUID: "",
    userName: "",
    email: "",
    createdAt: new Date(),
  },
  userSettings: {
    themeMode: "system",
    enableNotifications: false,
  },
  userFilesMetadata: [],
  setUserProfile: () => {},
  setUserSettings: () => {},
  setUserFilesMetadata: () => {},
  reload: async () => {},
  previewsByFieldId: {},
  setPreviewsByFieldId: () => {},
});

export const FloatingContext = createContext<{
  handleUpload: () => void;
  handleVault: () => void;
}>({
  handleUpload: () => {},
  handleVault: () => {},
});
