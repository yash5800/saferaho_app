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

export interface UserProfile{
  id : string;
  userUUID: string;
  userName: string;
  email: string;
  createdAt: Date;
}

// interface JWTTokens{
//   accessToken: string;
//   refreshToken: string;
// }

export interface UserSettings{
  darkMode: boolean;
  biometricAuth: boolean;
  notificationsEnabled: boolean;
}

interface UserDataContextType {
  userProfile: UserProfile | null;
  userSettings: UserSettings;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
}

export const UserDataContext = createContext<UserDataContextType>({
    userProfile: {
      id: '',
      userUUID: '',
      userName: '',
      email: '',
      createdAt: new Date()
    },
    userSettings: {
      darkMode: false,
      biometricAuth: false,
      notificationsEnabled: false
    },
    setUserProfile: () => {},
    setUserSettings: () => {}
  }
)