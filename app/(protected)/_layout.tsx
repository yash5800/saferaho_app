import UploadOverlay from "@/components/files/UploadOverlay";
import FloatingV1 from "@/components/FloatingV1";
import { FloatingContext, UserDataContext } from "@/context/mainContext";
import { useAccountServices } from "@/stateshub/useAccountServices";
import BottomSheet from "@gorhom/bottom-sheet";
import { Slot } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const Layout = () => {
  const uploadRef = React.useRef<BottomSheet>(null);
  const { userProfile, userFilesMetadata } = useContext(UserDataContext);
  const [isLoading, setIsLoading] = useState(true);
  const { initAccount, services } = useAccountServices((state) => state);

  useEffect(() => {
    // Check if user profile exists and files metadata has been loaded
    if (!userProfile?.id) return;

    initAccount(userProfile.id);

    if (!services) return;

    // Give a small delay to ensure all data is ready
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [userProfile, userFilesMetadata, services, initAccount]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-lg text-gray-700 dark:text-gray-300">
          Loading your data...
        </Text>
      </View>
    );
  }

  const handleUpload = () => {
    uploadRef.current?.expand();
  };

  return (
    <FloatingContext.Provider value={{ handleUpload }}>
      <Slot />
      {/* FAB LAYER */}
      <View
        pointerEvents="box-none"
        style={{
          ...StyleSheet.absoluteFillObject,
        }}
      >
        <FloatingV1 />
      </View>

      {/* BOTTOM SHEET LAYER */}
      <UploadOverlay sheetRef={uploadRef} />
    </FloatingContext.Provider>
  );
};

export default Layout;
