import {
  UserDataContext,
  UserFilesMetadata,
  UserProfile,
  UserSettings,
} from "@/context/mainContext";
import { isPickingInProgress } from "@/globals/picking";
import { SettingsProperties } from "@/Operations/Settings";
import FilesMetaService, {
  FilesMetaServiceTypes,
} from "@/services/FileMetaService";
import { storage } from "@/storage/mmkv";
import { EncryptedPreviewPayload } from "@/util/filesOperations/preview";
import { useColorScheme } from "nativewind";
import React, { useContext, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { AuthContext } from "../auth/Auth";
import { CryptoContext } from "../crypto/Crypto";
import LockScreen from "../LockScreen";

interface UserDataProps {
  children: React.ReactNode;
}

const UserData = ({ children }: UserDataProps) => {
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(
    null,
  );
  const [userSettings, setUserSettings] = React.useState<UserSettings>({
    themeMode: "system",
    enableNotifications: false,
  });
  const [userFilesMetadata, setUserFilesMetadata] = React.useState<
    UserFilesMetadata[]
  >([]);
  const [previewsByFieldId, setPreviewsByFieldId] = React.useState<
    Record<string, EncryptedPreviewPayload>
  >({});

  const [filesObjects, setFilesObjects] =
    React.useState<FilesMetaServiceTypes | null>(null);

  const [cryptoFailedAttempts, setCryptoFailedAttempts] = React.useState(0);
  const [showLockScreen, setShowLockScreen] = useState(false);

  const { setColorScheme } = useColorScheme();
  const { unlock, isLocked, lock } = useContext(CryptoContext);
  const { isAuthenticated, signOut } = useContext(AuthContext);

  const initialUnlockRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  const LOCK_TIMEOUT = 10000; // 10 seconds

  useEffect(() => {
    if (!isAuthenticated) return;
    if (initialUnlockRef.current) return;

    initialUnlockRef.current = true;

    if (!isLocked) {
      setShowLockScreen(false);
      return;
    }

    unlock()
      .then((value) => {
        if (!value) {
          setShowLockScreen(true);
        }
      })
      .catch((err) => {
        console.error("Initial unlock failed:", err);
        setShowLockScreen(true);
      });
  }, [isAuthenticated, isLocked]);

  // Monitor authentication status
  useEffect(() => {
    if (!isAuthenticated) return;

    const storeSettings = SettingsProperties.getSettings();
    const userProfileString = storage.getString("userProfile");
    if (userProfileString) {
      console.log(userProfileString);
      setUserProfile(JSON.parse(userProfileString));
    }
    if (storeSettings) {
      setUserSettings(storeSettings);
      console.log("Applying stored darkMode setting:", storeSettings.themeMode);
      setColorScheme(storeSettings.themeMode);
    }

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => subscription.remove();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!userProfile?.id) return;

    // Fetch initial files metadata
    const fetchUserData = async () => {
      const filesMetaService = new FilesMetaService(userProfile.id);
      await filesMetaService.init();
      setFilesObjects(filesMetaService);

      const filesData = await filesMetaService.getFilesData();

      if (filesData) {
        setUserFilesMetadata(filesData.filesCache);
        setPreviewsByFieldId(filesData.previewMap);
      }
    };
    fetchUserData();

    // TODO : implenetations of vaults can be added here
  }, [userProfile?.id]);

  {
    /* Reload function to refresh files metadata */
  }
  const reload = async () => {
    if (!userProfile?.id || !filesObjects) return;

    const filesData = await filesObjects.refresh();
    console.log("Files data refreshed:", filesData);

    if (filesData) {
      setUserFilesMetadata(filesData.filesCache);
      setPreviewsByFieldId(filesData.previewMap);
    }
  };

  {
    /* Handle AppState changes */
  }
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    console.log("AppState", appStateRef.current, nextAppState);

    if (nextAppState === "inactive" || nextAppState === "background") {
      if (isPickingInProgress()) return;
      storage.set("lastAppStateChange", Date.now());
    }

    if (nextAppState === "active" && appStateRef.current === "background") {
      const startTime = storage.getNumber("lastAppStateChange");
      if (startTime && Date.now() - startTime > LOCK_TIMEOUT) {
        lock();
        setShowLockScreen(true);
      }
    }
    // console.log('AppState changed to:', nextAppState);
    // if(nextAppState === 'inactive' || nextAppState === 'background'){
    //   lock();
    //   setShowLockScreen(true);
    // }

    appStateRef.current = nextAppState;
  };

  // Monitor isLocked changes
  // useEffect(() => {
  //   if(!isAuthenticated) return;
  //   setShowLockScreen(isLocked);
  // },[isLocked,isAuthenticated]);

  const handleUnlockSuccess = () => {
    setCryptoFailedAttempts(0);
    setShowLockScreen(false);
  };

  // Handle unlock failure
  const handleUnlockFail = () => {
    setCryptoFailedAttempts((prev) => {
      const next = prev + 1;
      if (next === 3) {
        console.warn("Maximum unlock attempts reached");
      } else if (next >= 4) {
        console.warn("Exceeded maximum unlock attempts, logging out");
        signOut();
      }
      return next;
    });
  };

  // Show lock screen if crypto is locked
  if (isAuthenticated && showLockScreen) {
    return (
      <LockScreen
        onUnlockSuccess={handleUnlockSuccess}
        onUnlockFail={handleUnlockFail}
      />
    );
  }

  return (
    <UserDataContext.Provider
      value={{
        userProfile,
        setUserProfile,
        userSettings,
        setUserSettings,
        userFilesMetadata,
        setUserFilesMetadata,
        reload,
        previewsByFieldId,
        setPreviewsByFieldId,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export default UserData;
