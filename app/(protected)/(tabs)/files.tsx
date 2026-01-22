import UploadOverlay from "@/components/files/UploadOverlay";
import SettingsOverlay from "@/components/SettingsOverlay";
import { UserDataContext } from "@/context/mainContext";
import { showExploreHeader } from "@/lib/exploreHeaderContoller";
import { hideTabBar, showTabBar } from "@/lib/tabBarContoller";
import { getFilesMetadata } from "@/util/filesOperations/filesGet";
import { formatSize } from "@/util/filesOperations/fileSize";
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
  const uploadRef = React.useRef<BottomSheet>(null);
  const settingRef = React.useRef<BottomSheet>(null);
  const lastY = useSharedValue(0);
  const { colorScheme } = useColorScheme();
  const [activeCategory, setActiveCategory] = React.useState("All");

  useEffect(() => {
    const fetchFilesMetadata = async () => {
      if (userProfile && userProfile.id) {
        const filesMetadata = await getFilesMetadata(userProfile.id);

        console.log("Fetched files metadata:", filesMetadata);
        setUserFilesMetadata(filesMetadata);
      }
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
    <SafeAreaView className="flex-1 bg-[#dbeaea] dark:bg-[#181818]">
      <Animated.ScrollView
        contentContainerStyle={{ paddingVertical: 16 }}
        onScroll={scrollHandler}
      >
        {/* Header */}
        <View className="flex flex-row justify-between px-4">
          <Text className="text-2xl font-roboto-bold dark:text-white">
            Files
          </Text>
          <View className="flex flex-row justify-center items-center gap-3">
            <TouchableOpacity onPress={() => {}}>
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
        <TouchableOpacity
          onPress={() => {
            hideTabBar();
            uploadRef.current?.expand();
          }}
          className="mx-4 mt-6 mb-4 rounded-xl py-4 items-center bg-black dark:bg-white"
        >
          <Text className="font-medium text-white dark:text-black">
            Upload Files
          </Text>
        </TouchableOpacity>

        {userFilesMetadata.length > 0 && (
          <View className="px-4 mb-4 justify-center items-center gap-3">
            {userFilesMetadata.map((file) => (
              <View
                key={file._id}
                className="w-full p-4 rounded-lg bg-white dark:bg-[#222] shadow"
              >
                <Text className="text-base font-medium text-black dark:text-white">
                  {file.filename}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {formatSize(file.fileSize)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Animated.ScrollView>
      <UploadOverlay sheetRef={uploadRef} />
      <SettingsOverlay sheetRef={settingRef} />
    </SafeAreaView>
  );
};

export default Files;
