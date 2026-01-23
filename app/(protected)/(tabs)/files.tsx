import Gallery from "@/components/files/Gallery";
import UploadOverlay from "@/components/files/UploadOverlay";
import SettingsOverlay from "@/components/SettingsOverlay";
import { FilesContext, UserDataContext } from "@/context/mainContext";
import { showExploreHeader } from "@/lib/exploreHeaderContoller";
import { hideTabBar, showTabBar } from "@/lib/tabBarContoller";
import {
  getFilePreviewMetadata,
  getFilesMetadata,
} from "@/util/filesOperations/filesGet";
import { EncryptedPreviewPayload } from "@/util/filesOperations/preview";
import BottomSheet from "@gorhom/bottom-sheet";
import { Box, Heart, SearchIcon, Settings } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useContext, useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const cetogeryList = [
  {
    title: "All",
    icon: (props: any) => <Box size={16} color="#000" {...props} />,
  },
  {
    title: "Favorites",
    icon: (props: any) => <Heart size={16} color="#000" {...props} />,
  },
];

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

  useEffect(() => {
    const fetchFilesMetadata = async () => {
      if (!userProfile?.id) return;

      const filesMetadata = await getFilesMetadata(userProfile.id);
      setUserFilesMetadata(filesMetadata);
      console.log("Fetched user files metadata:", filesMetadata);

      const previewMetadata: EncryptedPreviewPayload[] =
        await getFilePreviewMetadata(userProfile.id);
      const previewMap: Record<string, EncryptedPreviewPayload> = {};

      for (const item of previewMetadata) {
        if (!item.fileId || !item.url) continue;
        console.log("Processing preview metadata item:", item);
        previewMap[item.fileId] = item;
      }
      console.log("Fetched preview metadata for files:", previewMap);

      setPreviewsByFieldId(previewMap);
    };

    fetchFilesMetadata();
  }, [userProfile]);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    const y = event.contentOffset.y;
    const diff = y - lastY.value;

    if (y <= 0) {
      runOnJS(showTabBar)();
      runOnJS(showExploreHeader)();
      lastY.value = 0;
      return;
    }

    // hiding when scrolling down
    if (diff > 3) {
      runOnJS(hideTabBar)();
    }

    // showing scrolling up
    if (diff < -10) {
      runOnJS(showTabBar)();
    }

    if (diff < -3) {
      runOnJS(showExploreHeader)();
    }
    lastY.value = y;
  });

  return (
    <FilesContext.Provider value={{ userFilesMetadata, previewsByFieldId }}>
      <SafeAreaView className="flex-1 bg-[#dbeaea] dark:bg-[#181818]">
        <Animated.ScrollView
          onScroll={scrollHandler}
          contentContainerStyle={{ paddingVertical: 16 }}
        >
          {/* Header */}
          <View className="flex flex-row justify-between px-4">
            <Text className="text-2xl font-roboto-bold dark:text-white">
              Files
            </Text>
            <View className="flex flex-row gap-3">
              <TouchableOpacity>
                <SearchIcon
                  size={24}
                  color={colorScheme === "dark" ? "#fff" : "#222"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  hideTabBar();
                  settingRef.current?.expand();
                }}
              >
                <Settings
                  size={24}
                  color={colorScheme === "dark" ? "#fff" : "#222"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Upload Button */}
          <TouchableOpacity
            onPress={() => {
              hideTabBar();
              uploadRef.current?.expand();
            }}
            className="mx-4 mt-6 mb-4 rounded-xl py-4 items-center bg-black dark:bg-white"
          >
            <Text className="text-white dark:text-black">Upload Files</Text>
          </TouchableOpacity>
          <Gallery />
        </Animated.ScrollView>
        <UploadOverlay sheetRef={uploadRef} />
        <SettingsOverlay sheetRef={settingRef} />
      </SafeAreaView>
    </FilesContext.Provider>
  );
};

export default Files;
