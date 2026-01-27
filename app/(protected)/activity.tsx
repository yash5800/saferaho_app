import CategoryDonut from "@/components/CategoryDonut";
import { UserDataContext } from "@/context/mainContext";
import { formatSize } from "@/util/filesOperations/fileSize";
import { usageItemsFilter } from "@/util/home/usageItems";
import { useContext, useEffect, useMemo } from "react";
import { BackHandler, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useGetPath } from "@/components/getPath";
import { hideFloating } from "@/lib/floatingContoller";
import {
  apps,
  compressed,
  documents,
  images,
  music,
  others,
  videos,
} from "@/lib/icons";
import { router } from "expo-router";

/* ---------------- constants ---------------- */

const BASE_USAGE_ITEMS = [
  { name: "Images", icon: images, total: 0 },
  { name: "Videos", icon: videos, total: 0 },
  { name: "Documents", icon: documents, total: 0 },
  { name: "Music", icon: music, total: 0 },
  { name: "Apps", icon: apps, total: 0 },
  { name: "Compressed", icon: compressed, total: 0 },
  { name: "Others", icon: others, total: 0 },
];

const CATEGORY_COLORS: Record<string, string> = {
  Images: "#38bdf8", // blue
  Videos: "#8b5cf6", // purple
  Documents: "#f59e0b", // amber
  Music: "#ec4899", // pink
  Apps: "#6366f1", // indigo
  Compressed: "#22c55e", // green
  Others: "#9ca3af", // gray
};

/* ---------------- screen ---------------- */

const Activity = () => {
  const { userFilesMetadata } = useContext(UserDataContext);
  const path = useGetPath();

  useEffect(() => {
    if (path === "activity") {
      hideFloating();
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (path === "activity") {
          router.replace("/(protected)/(tabs)/home");
          return true;
        }
        return false;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [path]);

  /* ---- compute usage via existing logic ---- */
  const usageItems = useMemo(
    () =>
      usageItemsFilter({
        userFilesMetadata,
        usageItems: BASE_USAGE_ITEMS,
      }),
    [userFilesMetadata],
  );

  const totalUsedBytes = usageItems.reduce(
    (acc, item) => acc + (item.size ?? 0),
    0,
  );

  const donutSlices = usageItems
    .filter((item) => item.percent > 0)
    .map((item) => ({
      percent: item.percent,
      color: CATEGORY_COLORS[item.name] ?? "#9ca3af",
    }));

  return (
    <SafeAreaView className="flex-1 bg-[#f4f7f8] dark:bg-[#0f0f0f]">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/*  Header  */}
        <View className="px-4 pt-4 mb-6">
          <Text className="text-2xl font-roboto-bold text-neutral-900 dark:text-white">
            Storage Activity
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            Category-wise storage usage
          </Text>
        </View>

        {/*  Category Donut  */}
        <View className="items-center mb-6">
          <CategoryDonut radius={90} strokeWidth={14} slices={donutSlices} />

          <Text className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">
            {formatSize(totalUsedBytes)}
            <Text className="text-sm font-normal text-neutral-500 dark:text-neutral-400">
              {" "}
              used
            </Text>
          </Text>
        </View>

        {/*  Legend  */}
        <View className="flex-row flex-wrap justify-center gap-3 px-6 mb-6">
          {usageItems.map((item) => (
            <View key={item.name} className="flex-row items-center gap-2">
              <View
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: CATEGORY_COLORS[item.name] ?? "#9ca3af",
                }}
              />
              <Text className="text-xs text-neutral-600 dark:text-neutral-400">
                {item.name}
              </Text>
            </View>
          ))}
        </View>

        {/*  Breakdown List  */}
        <View className="px-4">
          <Text className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
            Breakdown
          </Text>

          {usageItems.map((item) => (
            <View
              key={item.name}
              className="flex-row items-center justify-between py-4 border-b border-neutral-200 dark:border-neutral-800"
            >
              {/* Left */}
              <View>
                <Text className="text-base text-neutral-900 dark:text-white">
                  {item.name}
                </Text>
                <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                  {item.total} files
                </Text>
              </View>

              {/* Right */}
              <View className="items-end">
                <Text className="text-sm font-medium text-neutral-900 dark:text-white">
                  {formatSize(item.size ?? 0)}
                </Text>
                <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                  {item.percent}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Activity;
