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

export interface userFilesMetadata {
  _id: string;
  accountId: string;
  filename: string;
  fileSize: number;
  fileType: string;
  totalChunks: number;
  nonce: string;
  mac: string;
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
  userFilesMetadata: userFilesMetadata[];
  setUserFilesMetadata: React.Dispatch<
    React.SetStateAction<userFilesMetadata[]>
  >;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
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
});

export const FilesContext = createContext<{
  userFilesMetadata: userFilesMetadata[];
  previewsByFieldId: Record<string, EncryptedPreviewPayload>;
}>({
  userFilesMetadata: [],
  previewsByFieldId: {},
});
