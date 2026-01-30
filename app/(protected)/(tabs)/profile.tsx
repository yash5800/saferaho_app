import { useGetPath } from "@/components/getPath";
import { hideFloating } from "@/lib/floatingContoller";
import { useCounter } from "@/stateshub/useCouter";
import { router } from "expo-router";
import { useEffect } from "react";
import { BackHandler, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const currentPath = useGetPath();
  const { count, increment, decrement } = useCounter((state) => state);

  useEffect(() => {
    if (currentPath === "profile") {
      hideFloating();
    }

    const subscribe = BackHandler.addEventListener("hardwareBackPress", () => {
      router.back();
      return true;
    });

    return () => {
      subscribe.remove();
    };
  }, [currentPath]);

  return (
    <SafeAreaView className="flex-1 j bg-[#f4f7f8] dark:bg-[#181818]">
      <ScrollView contentContainerClassName="flex-1 justify-center items-center">
        <Text className="text-blue-500 text-lg"> Count: {count}</Text>
        <TouchableOpacity className="bg-white rounded-lg" onPress={increment}>
          <Text className="text-lg text-black">increase</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-white rounded-lg" onPress={decrement}>
          <Text className="text-lg text-black">decrease</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
