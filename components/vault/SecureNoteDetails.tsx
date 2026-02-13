import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ChevronRight, FileText } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Text, TouchableOpacity, View } from "react-native";

interface SecureNoteDetailsProps {
  details: {
    _id: string;
    title: string;
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

const SecureNoteDetails = ({ details }: SecureNoteDetailsProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      className="mb-4"
      onPress={() => router.push(`/(protected)/${details._id}`)}
    >
      <LinearGradient
        colors={isDark ? ["#581c87", "#020617"] : ["#faf5ff", "#ffffff"]}
        className="p-[1px]"
        style={{ borderRadius: 16 }}
      >
        <View className="flex-row items-center gap-4 p-4 rounded-2xl bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800">
          <View className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/30 items-center justify-center">
            <FileText size={28} color={isDark ? "#c084fc" : "#9333ea"} />
          </View>

          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="text-base font-roboto-bold text-neutral-900 dark:text-white"
            >
              {details.title || "Untitled Note"}
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

export default SecureNoteDetails;
