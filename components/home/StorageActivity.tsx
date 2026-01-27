import { UserDataContext } from "@/context/mainContext";
import { calculatePercentage } from "@/util/calculatePersentage";
import { useFont } from "@shopify/react-native-skia";
import { router } from "expo-router";
import { useContext, useEffect, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import CircleDonut from "../CircleDonut";

const RADIUS = 60;
const STROKE_WIDTH = 10;
const GOALS = 5120; // 5 GB in MB

const StorageActivity = () => {
  const [value, setValue] = useState(0);
  const percentage = useSharedValue(0);
  const end = useSharedValue(0);

  const font = useFont(require("../../assets/fonts/Roboto-Bold.ttf"), 28);
  const { userFilesMetadata } = useContext(UserDataContext);

  // Calculate used storage in MB
  const usedInMB = useMemo(() => {
    if (!userFilesMetadata?.length) return 0;
    const totalBytes = userFilesMetadata.reduce(
      (acc, file) => acc + (file.fileSize || 0),
      0,
    );
    return totalBytes / (1024 * 1024);
  }, [userFilesMetadata]);

  // Format storage display
  const formatStorage = (mb: number) => {
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  useEffect(() => {
    setValue(usedInMB);
  }, [usedInMB]);

  useEffect(() => {
    const percent = calculatePercentage(value, GOALS);
    percentage.value = withTiming(percent, { duration: 900 });
    end.value = withTiming(percent / 100, { duration: 900 });
  }, [value]);

  if (!font) {
    return (
      <View className="mt-4 rounded-3xl p-6 bg-neutral-900 items-center">
        <Text className="text-white">Loading storage…</Text>
      </View>
    );
  }

  const handleViewMore = () => {
    router.push("/activity");
  };

  return (
    <View className="mt-4 rounded-3xl p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex-row items-center justify-between">
      {/* Donut */}
      <CircleDonut
        Radius={RADIUS}
        StrokeWidth={STROKE_WIDTH}
        End={end}
        percentage={percentage}
        font={font}
      />

      {/* Info */}
      <View className="flex-1 ml-6">
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
          Storage Used
        </Text>

        <Text className="mt-1 text-xl font-roboto-bold text-neutral-900 dark:text-white">
          {formatStorage(value)}
          <Text className="text-sm font-normal text-neutral-500 dark:text-neutral-400">
            {" "}
            of {formatStorage(GOALS)}
          </Text>
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          className="mt-4 self-start bg-neutral-900 dark:bg-white px-4 py-2 rounded-full"
          onPress={handleViewMore}
        >
          <Text className="text-white dark:text-black text-sm font-roboto-bold">
            View details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StorageActivity;
