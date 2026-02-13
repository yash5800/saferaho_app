import { useGetPath } from "@/components/getPath";
import StorageActivity from "@/components/home/StorageActivity";
import { UserDataContext } from "@/context/mainContext";
import { hideFloating, showFloating } from "@/lib/floatingContoller";
import {
  apps,
  compressed,
  documents,
  images,
  music,
  others,
  vault,
  videos,
} from "@/lib/icons";
import { hideTabBar, showTabBar } from "@/lib/tabBarContoller";
import { useCategory } from "@/stateshub/useCategory";
import { useVaultItems } from "@/stateshub/useVaultItems";
import { formatSize } from "@/util/filesOperations/fileSize";
import { usageItemsFilter } from "@/util/home/usageItems";
import { router } from "expo-router";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  BackHandler,
  Image,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { categeryType } from "./files";

const getFileIcon = (fileType: string) => {
  const normalized = fileType?.toLowerCase() || "";
  if (normalized.startsWith("image/")) return images;
  if (normalized.startsWith("video/")) return videos;
  if (normalized.startsWith("audio/")) return music;
  if (normalized.includes("zip") || normalized.includes("compressed"))
    return compressed;
  if (
    normalized.includes("pdf") ||
    normalized.includes("doc") ||
    normalized.includes("sheet") ||
    normalized.includes("presentation")
  )
    return documents;
  return others;
};

const formatCreatedDate = (createdAt: string) => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// TODO : Implement vault functionality in home screen
const Home = () => {
  const { userFilesMetadata, reload } = useContext(UserDataContext);
  const currentPath = useGetPath();
  const lastY = useSharedValue(0);
  const { setCategory } = useCategory((state) => state);
  const { data: vaultData } = useVaultItems((state) => state);

  const [refreshing, setRefreshing] = useState(false);
  const [usageItems, setUsageItems] = useState([
    {
      name: "Images",
      icon: images,
      tab: "photos",
      total: 0,
      size: 0,
      percent: 0,
    },
    {
      name: "Videos",
      icon: videos,
      tab: "videos",
      total: 0,
      size: 0,
      percent: 0,
    },
    {
      name: "Documents",
      icon: documents,
      tab: "documents",
      total: 0,
      size: 0,
      percent: 0,
    },
    { name: "Music", icon: music, tab: "audio", total: 0, size: 0, percent: 0 },
    { name: "Apps", icon: apps, tab: "apps", total: 0, size: 0, percent: 0 },
    {
      name: "Compressed",
      icon: compressed,
      tab: "compressed",
      total: 0,
      size: 0,
      percent: 0,
    },
    {
      name: "Others",
      icon: others,
      tab: "others",
      total: 0,
      size: 0,
      percent: 0,
    },
    { name: "Vault", icon: vault, tab: "vault", total: 0, size: 0, percent: 0 },
  ]);

  useEffect(() => {
    const updatedUsageItems = usageItemsFilter({
      userFilesMetadata,
      usageItems,
    });

    // Calculate vault total
    const vaultTotal =
      (vaultData.websitesDataCache?.length || 0) +
      (vaultData.secureNotesDataCache?.length || 0);

    // Update vault item with actual count
    const itemsWithVaultCount = updatedUsageItems.map((item) =>
      item.tab === "vault" ? { ...item, total: vaultTotal } : item,
    );

    setUsageItems(itemsWithVaultCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userFilesMetadata, vaultData]);

  useEffect(() => {
    if (currentPath !== "profile") showFloating();

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (currentPath === "home") {
          BackHandler.exitApp(); // ⛔ close app
          return true;
        }
        return false; // 🔙 normal back
      },
    );

    return () => {
      backHandler.remove();
    };
  }, [currentPath]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  };

  const scrollHandler = useAnimatedScrollHandler((event) => {
    const y = event.contentOffset.y;
    const diff = y - lastY.value;

    if (currentPath !== "home") {
      return;
    }

    if (y <= 0) {
      runOnJS(showTabBar)();
      runOnJS(showFloating)();
      lastY.value = 0;
      return;
    }

    if (diff > 3) {
      runOnJS(hideTabBar)();
      runOnJS(hideFloating)();
    }

    if (diff < -10) {
      runOnJS(showTabBar)();
      runOnJS(showFloating)();
    }

    lastY.value = y;
  });

  const recentFiles = useMemo(() => {
    const allItems = [
      ...userFilesMetadata.map((file) => ({
        id: file._id,
        name: file.filename,
        type: "file",
        createdAt: file._createdAt,
        size: file.fileSize,
        fileType: file.fileType,
      })),
      ...(vaultData.websitesDataCache || []).map((website) => ({
        id: website._id,
        name: website.websiteName,
        type: "website",
        createdAt: website._createdAt,
      })),
      ...(vaultData.secureNotesDataCache || []).map((note) => ({
        id: note._id,
        name: note.title,
        type: "secure_note",
        createdAt: note._createdAt,
      })),
    ];

    return allItems
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 3)
      .map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        date: formatCreatedDate(item.createdAt),
        icon: item.type === "file" ? getFileIcon(item.fileType) : vault,
        size: item.type === "file" ? formatSize(item.size) : undefined,
        itemType: item.type,
      }));
  }, [userFilesMetadata, vaultData]);

  const redirect = (tab: categeryType | "vault") => {
    if (tab === "vault") {
      router.push("/(protected)/(tabs)/vault");
      return;
    }
    setCategory(tab);
    router.push("/(protected)/(tabs)/files");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f4f7f8] dark:bg-[#0f0f0f]">
      <Animated.ScrollView
        className="px-4 pt-4"
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header  */}
        <View className="flex-row items-center gap-3 mb-5">
          <View className="w-12 h-12 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 items-center justify-center">
            <Text className="text-xl font-bold dark:text-white">A</Text>
          </View>

          <TextInput
            placeholder="Search files, folders…"
            className="flex-1 h-12 px-4 rounded-full bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 text-base dark:text-white"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/*  Welcome  */}
        <View className="mb-4">
          <Text className="text-xl font-semibold text-neutral-900 dark:text-white">
            Welcome back 👋
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            Your SafeRaho Space
          </Text>
        </View>

        {/*  Storage  */}
        <StorageActivity />

        {/*  Usage Grid  */}
        <View className="flex-row flex-wrap justify-between gap-y-4 mt-5">
          {usageItems.map((item) => (
            <TouchableOpacity
              key={item.name}
              activeOpacity={0.85}
              className="w-[47%] bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800"
              onPress={() => redirect(item.tab as categeryType | "vault")}
            >
              <View className="flex-row justify-between items-start">
                {/* Top */}
                <View className="flex-1">
                  <View className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 items-center justify-center">
                    <Image
                      source={item.icon}
                      style={{ width: 22, height: 22 }}
                    />
                  </View>
                </View>
                {item.name !== "Vault" && (
                  <View className="flex-1 items-end">
                    <Text className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      {formatSize(item.size ?? 0)}
                    </Text>

                    <View className="mt-1 w-14 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                      <View
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${
                            item.percent ??
                            Math.min(
                              ((item.size ?? 0) / (1024 * 1024 * 1024)) * 100,
                              100,
                            )
                          }%`,
                        }}
                      />
                    </View>
                  </View>
                )}
              </View>

              {/* Bottom */}
              <View className="ml-3">
                <Text className="mt-3 text-base font-medium dark:text-white">
                  {item.name}
                </Text>

                <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                  {item.total} {item.name !== "Vault" ? "Files" : "Records"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/*  Recent  */}
        <View className="mt-7 pb-10">
          <Text className="text-lg font-semibold dark:text-white mb-3">
            Recent
          </Text>

          {recentFiles.length === 0 ? (
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              No recent items yet.
            </Text>
          ) : (
            <View className="gap-3">
              {recentFiles.map((item) => (
                <View
                  key={item.id}
                  className="flex-row items-center gap-4 bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800"
                >
                  <View className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 items-center justify-center">
                    <Image
                      source={item.icon}
                      style={{ width: 22, height: 22 }}
                    />
                  </View>

                  <View className="flex-1">
                    <Text
                      className="text-base font-medium dark:text-white"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                      {item.itemType === "file" ? (
                        <>
                          {item.size} • {item.date}
                        </>
                      ) : (
                        <>
                          {item.itemType === "website"
                            ? "Website"
                            : "Secure Note"}{" "}
                          • {item.date}
                        </>
                      )}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default Home;
