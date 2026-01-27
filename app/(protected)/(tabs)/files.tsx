import FileHeader from "@/components/files/fileHeader";
import Gallery from "@/components/files/Gallery";
import { useGetPath } from "@/components/getPath";
import SettingsOverlay from "@/components/SettingsOverlay";
import { UserDataContext } from "@/context/mainContext";
import { hideFloating, showFloating } from "@/lib/floatingContoller";
import { hideTabBar, showTabBar } from "@/lib/tabBarContoller";
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
  const { reload } = useContext(UserDataContext);
  const settingRef = React.useRef<BottomSheet>(null);
  const lastY = useSharedValue(0);
  const { colorScheme } = useColorScheme();
  const [category, setCategory] = useState<categeryType>("photos");
  const currentPath = useGetPath();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (currentPath !== "profile") {
      showFloating();
    }
  }, [currentPath]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentOffset = event.nativeEvent.contentOffset.y;

      if (currentOffset > lastY.value && currentOffset > 20) {
        hideFloating();
        hideTabBar();
      } else {
        showFloating();
        showTabBar();
      }

      lastY.value = currentOffset;
    },
    [],
  );

  const handleSettings = () => {
    hideTabBar();
    hideFloating();
    settingRef.current?.expand();
  };

  const handleReload = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f4f7f8] dark:bg-[#181818]">
      <Gallery
        ListHeaderComponent={() => (
          <FileHeader
            colorScheme={colorScheme}
            handleSettings={handleSettings}
            category={category}
            setCategory={setCategory}
          />
        )}
        scrollHandler={handleScroll}
        category={category}
        handleReload={handleReload}
        refreshing={refreshing}
      />
      <SettingsOverlay sheetRef={settingRef} />
    </SafeAreaView>
  );
};

export default Files;
