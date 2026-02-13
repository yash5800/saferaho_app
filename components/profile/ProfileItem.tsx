import { hideFloating } from "@/lib/floatingContoller";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

const ProfileItem = ({
  icon,
  label,
  value,
  onPress,
  showArrow = true,
  color = "#3B82F6",
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  color?: string;
}) => (
  <TouchableOpacity
    onPress={() => {
      hideFloating();
      router.push("/(protected)/vaultItemsInput");
    }}
    disabled={!onPress}
    className="flex-row items-center px-4 py-4 border-b border-gray-100 dark:border-gray-800"
    activeOpacity={0.7}
  >
    <View
      className="w-10 h-10 rounded-full items-center justify-center mr-3"
      style={{ backgroundColor: `${color}15` }}
    >
      <Feather name={icon as any} size={20} color={color} />
    </View>
    <View className="flex-1">
      <Text className="text-base font-medium text-gray-900 dark:text-white">
        {label}
      </Text>
      {value && (
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {value}
        </Text>
      )}
    </View>
    {showArrow && onPress && (
      <Feather name="chevron-right" size={20} color="#9CA3AF" />
    )}
  </TouchableOpacity>
);

export default ProfileItem;
