import { useGetPath } from "@/components/getPath";
import { hideFloating } from "@/lib/floatingContoller";
import { useEffect } from "react";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const currentPath = useGetPath();

  useEffect(() => {
    if (currentPath === "profile") {
      hideFloating();
    }
  }, [currentPath]);

  return (
    <SafeAreaView className="flex-1 j bg-[#f4f7f8] dark:bg-[#181818]">
      <ScrollView contentContainerClassName="flex-1 justify-center items-center">
        <Text>Profile Page</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
