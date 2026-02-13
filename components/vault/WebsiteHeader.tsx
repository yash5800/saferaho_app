import { ArrowLeft, Edit, Globe } from "lucide-react-native";
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface WebsiteHeaderProps {
  websiteUrl: string;
  domainName: string;
  icon: ImageSourcePropType | null;
  isDark: boolean;
  onBack: () => void;
  editItem: () => void;
}

const WebsiteHeader = ({
  websiteUrl,
  domainName,
  icon,
  isDark,
  onBack,
  editItem,
}: WebsiteHeaderProps) => {
  return (
    <>
      <View className="px-5 pt-4 mb-6 flex-row items-center gap-4">
        <TouchableOpacity
          className="bg-white dark:bg-slate-800 rounded-full p-2 shadow-sm"
          onPress={onBack}
        >
          <ArrowLeft color={isDark ? "#fff" : "#444"} />
        </TouchableOpacity>
        <View className="rounded bg-blue-500/20 p-2">
          <Globe size={20} color="rgb(59 130 246 )" />
        </View>
        <Text className="text-2xl font-roboto-bold text-neutral-900 dark:text-white">
          Website Creds
        </Text>
        <TouchableOpacity
          className="bg-white absolute right-5 dark:bg-slate-800 rounded-full p-2 shadow-sm"
          onPress={editItem}
        >
          <Edit size={20} color={isDark ? "#fff" : "#444"} />
        </TouchableOpacity>
      </View>

      {/* Website Card */}
      <View className="px-5">
        <View className="bg-white dark:bg-[#14141b] rounded-3xl p-5 shadow-md">
          <View className="flex-row items-center gap-4">
            <View className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 items-center justify-center">
              {icon ? (
                <Image source={icon} className="w-10 h-10 rounded-xl" />
              ) : (
                <Globe size={26} color={isDark ? "#9ca3af" : "#6b7280"} />
              )}
            </View>

            <View className="flex-1">
              <Text
                className="text-xl font-bold text-slate-900 dark:text-white"
                numberOfLines={1}
              >
                {domainName || "Website"}
              </Text>
              <Text className="text-sm text-slate-500 mt-1">{websiteUrl}</Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

export default WebsiteHeader;
