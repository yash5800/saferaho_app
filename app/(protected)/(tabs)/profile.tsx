import { AuthContext } from "@/components/auth/Auth";
import { useGetPath } from "@/components/getPath";
import GradientText from "@/components/GraidentText";
import NetworkStatus from "@/components/network/NetworkStatus";
import ProfileItem from "@/components/profile/ProfileItem";
import ProfileSection from "@/components/profile/ProfileSection";
import SettingsOverlay from "@/components/SettingsOverlay";
import { UserDataContext } from "@/context/mainContext";
import { hideFloating } from "@/lib/floatingContoller";
import { hideTabBar, showTabBar } from "@/lib/tabBarContoller";
import { useAccountServices } from "@/stateshub/useAccountServices";
import { getUserSubscriptionData } from "@/storage/mediators/system";
import { Feather } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Settings } from "lucide-react-native";
import { useContext, useEffect, useRef } from "react";
import { BackHandler, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const currentPath = useGetPath();
  const { userProfile } = useContext(UserDataContext);
  const { services } = useAccountServices((state) => state);
  const settingsRef = useRef<BottomSheet>(null);
  const lastY = useSharedValue(0);

  const storageSize = getUserSubscriptionData()?.storage_limit_gb ?? 5;
  const totalFiles = services?.files_meta.getFiles().length || 0;

  const { signOut } = useContext(AuthContext);

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

  const scrollHandler = useAnimatedScrollHandler((event) => {
    const y = event.contentOffset.y;
    const diff = y - lastY.value;

    if (currentPath !== "profile") {
      return;
    }

    if (y <= 0) {
      runOnJS(showTabBar)();
      lastY.value = 0;
      return;
    }

    if (diff > 3) {
      runOnJS(hideTabBar)();
    }

    if (diff < -10) {
      runOnJS(showTabBar)();
    }

    lastY.value = y;
  });

  const handleSettings = () => {
    hideTabBar();
    hideFloating();
    settingsRef.current?.expand();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f4f7f8] dark:bg-[#181818]">
      <NetworkStatus />
      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Banner with Gradient */}
        <LinearGradient
          colors={["#5865F2", "#7289DA", "#5865F2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="h-32 relative"
        >
          <TouchableOpacity
            className="absolute top-4 right-16 w-10 h-10 bg-black/20 rounded-full items-center justify-center"
            onPress={() => {
              /* Edit banner */
            }}
          >
            <Feather name="edit-2" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSettings}
            className="w-10 h-10 rounded-full bg-black/20 items-center justify-center top-0 right-0 m-4 absolute"
          >
            <Settings size={18} color={"#fff"} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Profile Info Section */}
        <View className="px-4 pb-6">
          {/* Avatar */}
          <View className="relative -mt-16 mb-4">
            <View className="w-28 h-28 rounded-full bg-white dark:bg-[#232323] p-1.5 shadow-lg">
              <LinearGradient
                colors={["#5865F2", "#7289DA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-full h-full rounded-full items-center justify-center"
                style={{
                  borderRadius: 9999,
                }}
              >
                <Text className="text-4xl font-bold text-white">
                  {userProfile?.userName.charAt(0).toUpperCase() || "U"}
                </Text>
              </LinearGradient>
            </View>
            <TouchableOpacity
              className="absolute bottom-0 right-0 w-9 h-9 bg-[#5865F2] rounded-full items-center justify-center border-4 border-white dark:border-[#181818]"
              onPress={() => {
                /* Change avatar */
              }}
            >
              <Feather name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Username and Status */}
          <View className="mb-6">
            <View className="flex-row items-center mb-1">
              <GradientText
                colors={["#00F5A0", "#00D9F5", "#A855F7"]}
                className="text-2xl font-bold mr-2"
              >
                {userProfile?.userName || "Username"}
              </GradientText>

              {(getUserSubscriptionData()?.plan_name ?? "Free") ===
              "Premium" ? (
                <LinearGradient
                  colors={["#eab308", "#f59e0b"]}
                  className="px-2 py-0.5"
                  style={{ borderRadius: 2 }}
                >
                  <Text className="text-xs font-semibold text-white">
                    Premium
                  </Text>
                </LinearGradient>
              ) : getUserSubscriptionData()?.plan_name === "Basic" ? (
                <LinearGradient
                  colors={["#43B581", "#24AD3C"]}
                  className="px-2 py-0.5"
                  style={{ borderRadius: 2 }}
                >
                  <Text className="text-xs font-semibold text-white">
                    Basic
                  </Text>
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={["#6b7280", "#4b5563"]}
                  className="px-2 py-0.5"
                  style={{ borderRadius: 2 }}
                >
                  <Text className="text-xs font-semibold text-white">Free</Text>
                </LinearGradient>
              )}
            </View>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {userProfile?.email || "user@example.com"}
            </Text>
          </View>

          {/* Stats Cards */}
          <View className="flex-row justify-between mb-6">
            <View className="flex-1 bg-white dark:bg-[#232323] rounded-xl p-4 mr-2 items-center">
              <GradientText
                className="text-2xl font-bold"
                colors={["#FF6FD8", "#9D36FF"]}
              >
                {totalFiles}
              </GradientText>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Files
              </Text>
            </View>
            <View className="flex-1 bg-white dark:bg-[#232323] rounded-xl p-4 mx-2 items-center">
              <GradientText
                colors={["#DA3BF7", "#7289DA"]}
                className="text-2xl font-bold "
              >
                {storageSize} GB
              </GradientText>
              {/* <Text className="text-2xl font-bold text-[#7289DA]">
                {storageSize} GB
              </Text> */}
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Storage
              </Text>
            </View>
            <View className="flex-1 bg-white dark:bg-[#232323] rounded-xl p-4 ml-2 items-center">
              <GradientText
                colors={["#00F5A0", "#00D9F5"]}
                className="text-2xl font-bold"
              >
                {getUserSubscriptionData()?.subscription_status.toLocaleUpperCase()}
              </GradientText>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Status
              </Text>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <ProfileSection title="Account">
          <ProfileItem
            icon="user"
            label="Edit Profile"
            value="Update your profile information"
            onPress={() => {
              /* Navigate to edit profile */
            }}
            color="#5865F2"
          />
          <ProfileItem
            icon="shield"
            label="Security"
            value="Password & authentication"
            onPress={() => {
              /* Navigate to security */
            }}
            color="#43B581"
          />
          <ProfileItem
            icon="credit-card"
            label="Subscription"
            value="Manage your plan"
            onPress={() => {
              /* Navigate to subscription */
            }}
            color="#FAA61A"
          />
        </ProfileSection>

        {/* Preferences Section */}
        <ProfileSection title="Preferences">
          <ProfileItem
            icon="bell"
            label="Notifications"
            value="Manage notification settings"
            onPress={() => {
              /* Navigate to notifications */
            }}
            color="#7289DA"
          />
          <ProfileItem
            icon="moon"
            label="Appearance"
            value="Theme and display settings"
            onPress={() => {
              /* Navigate to appearance */
            }}
            color="#9B59B6"
          />
          <ProfileItem
            icon="lock"
            label="Privacy"
            value="Control your privacy"
            onPress={() => {
              /* Navigate to privacy */
            }}
            color="#F04747"
          />
        </ProfileSection>

        {/* Storage Section */}
        <ProfileSection title="Storage & Data">
          <ProfileItem
            icon="hard-drive"
            label="Storage Management"
            value="Manage your storage"
            onPress={() => {
              /* Navigate to storage */
            }}
            color="#3B82F6"
          />
          <ProfileItem
            icon="download"
            label="Downloads"
            value="View downloaded files"
            onPress={() => {
              /* Navigate to downloads */
            }}
            color="#10B981"
          />
          <ProfileItem
            icon="trash-2"
            label="Clear Cache"
            value="Free up space"
            onPress={() => {
              /* Clear cache */
            }}
            color="#EF4444"
          />
        </ProfileSection>

        {/* Support Section */}
        <ProfileSection title="Support & About">
          <ProfileItem
            icon="help-circle"
            label="Help Center"
            value="Get help and support"
            onPress={() => {
              /* Navigate to help */
            }}
            color="#6366F1"
          />
          <ProfileItem
            icon="message-circle"
            label="Feedback"
            value="Send us your feedback"
            onPress={() => {
              /* Navigate to feedback */
            }}
            color="#8B5CF6"
          />
          <ProfileItem
            icon="info"
            label="About"
            value="App version 1.0.0"
            onPress={() => {
              /* Navigate to about */
            }}
            color="#06B6D4"
          />
        </ProfileSection>

        {/* Logout Button */}
        <View className="px-4 pb-8 pt-2">
          <TouchableOpacity
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl py-4 flex-row items-center justify-center"
            onPress={() => {
              signOut();
            }}
            activeOpacity={0.7}
          >
            <Feather name="log-out" size={20} color="#EF4444" />
            <Text className="text-base font-semibold text-red-500 ml-2">
              Log Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View className="h-4" />
      </Animated.ScrollView>
      <SettingsOverlay sheetRef={settingsRef} />
    </SafeAreaView>
  );
};

export default Profile;
