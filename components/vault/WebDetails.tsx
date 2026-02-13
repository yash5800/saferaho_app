import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ChevronRight, Globe } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getWebsiteIcon } from "./WebsiteTemplate";

interface WebDetailsProps {
  details: {
    _id: string;
    websiteName: string;
    websiteUrl: string;
    _createdAt: string;
  };
}

const formatDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

const WebDetails = ({ details }: WebDetailsProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [icon, setIcon] = useState<ImageSourcePropType | null>(null);

  useEffect(() => {
    getWebsiteIcon(details.websiteUrl)
      .then(setIcon)
      .catch(() => setIcon(null));
  }, [details.websiteUrl]);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      className="mb-4"
      onPress={() => router.push(`/(protected)/${details._id}`)}
    >
      <LinearGradient
        colors={isDark ? ["#1e1b4b", "#020617"] : ["#eef2ff", "#ffffff"]}
        className="p-[1px]"
        style={{ borderRadius: 16 }}
      >
        <View className="flex-row items-center gap-4 p-4 rounded-2xl bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800">
          <View className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 items-center justify-center overflow-hidden">
            {icon ? (
              <Image source={icon} className="w-10 h-10" />
            ) : (
              <Globe size={28} color={isDark ? "#9ca3af" : "#6b7280"} />
            )}
          </View>

          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="text-base font-roboto-bold text-neutral-900 dark:text-white"
            >
              {details.websiteName || "Unnamed Website"}
            </Text>

            <Text className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
              {formatDate(details._createdAt)}
            </Text>
          </View>

          <View className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 items-center justify-center">
            <ChevronRight size={20} color={isDark ? "#fff" : "#111"} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default WebDetails;
