import UploadOverlay from "@/components/files/UploadOverlay";
import FloatingV1 from "@/components/FloatingV1";
import { FloatingContext } from "@/context/mainContext";
import BottomSheet from "@gorhom/bottom-sheet";
import { Slot } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

const Layout = () => {
  const uploadRef = React.useRef<BottomSheet>(null);

  const handleUpload = () => {
    uploadRef.current?.expand();
  };

  const handleReload = () => {
    // Implement reload logic if necessary
  };

  const handleVault = () => {
    // Implement vault logic if necessary
  };

  return (
    <FloatingContext.Provider value={{ handleUpload, handleVault }}>
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
