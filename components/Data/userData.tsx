import {
    UserDataContext,
    UserFilesMetadata,
    UserProfile,
    UserSettings,
} from "@/context/mainContext";
import { isPickingInProgress } from "@/globals/picking";
import { SettingsProperties } from "@/Operations/Settings";
import { useAccountServices } from "@/stateshub/useAccountServices";
import { useVaultItems } from "@/stateshub/useVaultItems";
import { getUserProfileData } from "@/storage/mediators/system";
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

  const [cryptoFailedAttempts, setCryptoFailedAttempts] = React.useState(0);
  const [showLockScreen, setShowLockScreen] = useState(false);

  const { setColorScheme } = useColorScheme();
  const { unlock, isLocked, lock } = useContext(CryptoContext);
  const { isAuthenticated, signOut } = useContext(AuthContext);

  const initialUnlockRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  const LOCK_TIMEOUT = 10000; // 10 seconds
  const { initAccount, services } = useAccountServices((state) => state);
  const { fetchVaultItems, reloadVaultItems } = useVaultItems((state) => state);

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
    const userProfileString = getUserProfileData();
    if (userProfileString) {
      console.log(userProfileString);
      setUserProfile(userProfileString);
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
    if (!userProfile?.id || !isAuthenticated) return;

    initAccount(userProfile.id);

    if (!services) return;

    // Fetch initial files metadata
    const fetchUserData = async () => {
      try {
        const filesMetaService = services.files_meta;

        if (!filesMetaService) {
          console.error("Files meta service not available");
          return;
        }

        const filesMetaData = await filesMetaService.getFiles();
        const filesPreviews = await filesMetaService.getPreviewMap();

        if (filesMetaData) {
          setUserFilesMetadata(filesMetaData);
          setPreviewsByFieldId(filesPreviews);
        }

        // Fetch vault items (errors are handled internally)
        await fetchVaultItems(userProfile.id);
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Don't crash the app, just log the error
        // User can retry with pull-to-refresh
      }
    };

    fetchUserData();
  }, [userProfile?.id, isAuthenticated, services, initAccount]);

  {
    /* Reload function to refresh files metadata */
  }
  const reload = async () => {
    if (!userProfile?.id) {
      console.warn("Cannot reload: No user profile ID");
      return;
    }

    if (!services?.files_meta) {
      console.warn("Cannot reload: Files meta service not available");
      return;
    }

    try {
      const filesData = await services.files_meta.refresh();

      if (filesData) {
        const filesMetaData = filesData.filesCache;
        const filesPreviews = filesData.previewMap;

        setUserFilesMetadata(filesMetaData);
        setPreviewsByFieldId(filesPreviews);
      }

      // Reload vault items (errors handled internally)
      await reloadVaultItems(userProfile.id);

      console.log("✅ Data reload completed");
    } catch (error) {
      console.error("Error reloading data:", error);
      // Don't throw - let the error be handled by individual services
      // The user will see network status indicator if offline
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
