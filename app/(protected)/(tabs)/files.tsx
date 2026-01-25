import FileHeader from "@/components/files/fileHeader";
import Gallery from "@/components/files/Gallery";
import UploadOverlay from "@/components/files/UploadOverlay";
import SettingsOverlay from "@/components/SettingsOverlay";
import { FilesContext, UserDataContext } from "@/context/mainContext";
import { hideTabBar, showTabBar } from "@/lib/tabBarContoller";
import {
  getFilePreviewMetadata,
  getFilesMetadata,
} from "@/util/filesOperations/filesGet";
import { EncryptedPreviewPayload } from "@/util/filesOperations/preview";
import BottomSheet from "@gorhom/bottom-sheet";
import { useColorScheme } from "nativewind";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export type categeryType =
  | "photos"
  | "videos"
  | "documents"
  | "audio"
  | "others";

const Files = () => {
  const { userFilesMetadata, setUserFilesMetadata, userProfile } =
    useContext(UserDataContext);
  const [previewsByFieldId, setPreviewsByFieldId] = React.useState<
    Record<string, EncryptedPreviewPayload>
  >({});
  const uploadRef = React.useRef<BottomSheet>(null);
  const settingRef = React.useRef<BottomSheet>(null);
  const lastY = useSharedValue(0);
  const { colorScheme } = useColorScheme();
  const [category, setCategory] = useState<categeryType>("photos");

  const fetchFilesMetadata = useCallback(async () => {
    if (!userProfile?.id) return;

    const filesMetadata = await getFilesMetadata(userProfile.id);
    setUserFilesMetadata(filesMetadata);
    console.log("Fetched user files metadata:", filesMetadata);

    const previewMetadata: EncryptedPreviewPayload[] =
      await getFilePreviewMetadata(userProfile.id);
    const previewMap: Record<string, EncryptedPreviewPayload> = {};

    for (const item of previewMetadata) {
      if (!item.fileId || !item.url) continue;
      // console.log("Processing preview metadata item:", item);
      previewMap[item.fileId] = item;
    }
    // console.log("Fetched preview metadata for files:", previewMap);

    setPreviewsByFieldId(previewMap);
  }, [userProfile?.id, setUserFilesMetadata]);

  useEffect(() => {
    fetchFilesMetadata();
  }, [fetchFilesMetadata]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentOffset = event.nativeEvent.contentOffset.y;

      if (currentOffset > lastY.value && currentOffset > 20) {
        hideTabBar();
      } else {
        showTabBar();
      }

      lastY.value = currentOffset;
    },
    [],
  );

  const handleUpload = () => {
    hideTabBar();
    uploadRef.current?.expand();
  };

  const handleSettings = () => {
    hideTabBar();
    settingRef.current?.expand();
  };

  const handleReload = () => {
    fetchFilesMetadata();
  };

  return (
    <FilesContext.Provider value={{ userFilesMetadata, previewsByFieldId }}>
      <SafeAreaView className="flex-1 bg-[#dbeaea] dark:bg-[#181818]">
        <Gallery
          ListHeaderComponent={() => (
            <FileHeader
              colorScheme={colorScheme}
              handleSettings={handleSettings}
              handleUpload={handleUpload}
              category={category}
              setCategory={setCategory}
            />
          )}
          scrollHandler={handleScroll}
          category={category}
        />
        <UploadOverlay sheetRef={uploadRef} handleReload={handleReload} />
        <SettingsOverlay sheetRef={settingRef} />
      </SafeAreaView>
    </FilesContext.Provider>
  );
};

export default Files;
