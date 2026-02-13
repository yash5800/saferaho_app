import { Text, View } from "react-native";

const ProfileSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View className="mb-4">
    <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-4">
      {title}
    </Text>
    <View className="bg-white dark:bg-[#232323] rounded-xl mx-4 overflow-hidden">
      {children}
    </View>
  </View>
);

export default ProfileSection;
