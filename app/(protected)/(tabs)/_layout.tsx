import TabBar from "@/components/TabBar";
import { UserDataContext } from "@/context/mainContext";
import { Tabs } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const TabLayout = () => {
  const { userProfile, userFilesMetadata } = useContext(UserDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user profile exists and files metadata has been loaded
    if (userProfile?.id) {
      // Give a small delay to ensure all data is ready
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [userProfile, userFilesMetadata]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-lg text-gray-700 dark:text-gray-300">
          Loading your data...
        </Text>
      </View>
    );
  }

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: "Vault",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="files"
        options={{
          title: "Files",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
