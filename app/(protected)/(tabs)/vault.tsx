import { useGetPath } from "@/components/getPath";
import NetworkStatus from "@/components/network/NetworkStatus";
import SettingsOverlay from "@/components/SettingsOverlay";
import WebDetails from "@/components/vault/WebDetails";
import { UserDataContext } from "@/context/mainContext";
import { useNetwork } from "@/context/networkContext";
import { hideFloating, showFloating } from "@/lib/floatingContoller";
import { hideTabBar, showTabBar } from "@/lib/tabBarContoller";
import { useVaultItems } from "@/stateshub/useVaultItems";
import { getUserProfileData } from "@/storage/mediators/system";
import { displayToast } from "@/util/disToast";
import BottomSheet from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ChevronRight,
  FileText,
  Globe,
  Search,
  Settings,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useContext, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

/* ================= TYPES ================= */

export interface ResEncryptedWebsiteVaultItemsParams {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  type: "website";
  websiteName: string;
  websiteUrl: string;
  encryptedSecretData: {
    cipher: string;
    nonce: string;
    mac: string;
  };
  tags: string[];
}

export interface ResEncryptedSecureNoteVaultItemsParams {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  type: "secure_note";
  title: string;
  encryptedSecretData: {
    cipher: string;
    nonce: string;
    mac: string;
  };
  tags: string[];
}

/* ================= COMPONENT ================= */

const Vault = () => {
  const lastY = useSharedValue(0);
  const { colorScheme } = useColorScheme();

  const isDark = colorScheme === "dark";

  const sheetRef = useRef<BottomSheet>(null);
  const vaultItemsRef = useRef<BottomSheet>(null);
  const currentPath = useGetPath();
  const userId = getUserProfileData()?.id;
  const { data, isLoading } = useVaultItems((state) => state);
  const { reload } = useContext(UserDataContext);
  const { isOnline } = useNetwork();
  const [refreshing, setRefreshing] = useState(false);

  const [websitesDetails, setWebsitesDetails] = useState<
    ResEncryptedWebsiteVaultItemsParams[]
  >([]);
  const [secureNotesDetails, setSecureNotesDetails] = useState<
    ResEncryptedSecureNoteVaultItemsParams[]
  >([]);

  useEffect(() => {
    if (!userId) return;

    setWebsitesDetails(data.websitesDataCache);
    setSecureNotesDetails(data.secureNotesDataCache);
  }, [userId, data]);

  useEffect(() => {
    if (currentPath !== "profile") showFloating();

    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      router.back();
      return true;
    });

    return () => sub.remove();
  }, [currentPath]);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    const y = event.contentOffset.y;
    const diff = y - lastY.value;

    if (currentPath !== "vault") return;

    if (y <= 0) {
      runOnJS(showTabBar)();
      runOnJS(showFloating)();
      lastY.value = 0;
      return;
    }

    if (diff > 3) {
      runOnJS(hideTabBar)();
      runOnJS(hideFloating)();
    }

    if (diff < -10) {
      runOnJS(showTabBar)();
      runOnJS(showFloating)();
    }

    lastY.value = y;
  });

  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "N/A";

  /* ================= UI ================= */

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#f4f7f8] dark:bg-[#0b0b0f] items-center justify-center">
        <Text className="text-neutral-500 dark:text-neutral-400">
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  const handleRefresh = async () => {
    if (!isOnline) {
      displayToast({
        message: "No Internet Connection",
        message2: "Please check your network and try again",
        type: "error",
      });
      return;
    }

    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewItem = (id: string) => {
    router.push(`/(protected)/${id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f4f7f8] dark:bg-[#0b0b0f]">
      <NetworkStatus />
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* ===== HEADER ===== */}
        <View className="px-4 pt-4 mb-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-roboto-bold text-neutral-900 dark:text-white">
              Vault
            </Text>

            <View className="flex-row gap-2">
              {[Search, Settings].map((Icon, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={
                    Icon === Settings
                      ? () => sheetRef.current?.expand()
                      : undefined
                  }
                  className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 items-center justify-center"
                >
                  <Icon size={18} color={isDark ? "#fff" : "#111"} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <LinearGradient
            colors={isDark ? ["#6366f1", "#a855f7"] : ["#4f46e5", "#9333ea"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="h-[3px] w-16 rounded-full"
          />
        </View>

        {/* ===== SECURE NOTES ===== */}
        {secureNotesDetails.length > 0 && (
          <View className="mb-10">
            <Text className="text-lg font-roboto-bold text-neutral-900 dark:text-white px-4 mb-4">
              Secure Notes
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-4"
            >
              {secureNotesDetails.map((note, i) => (
                <LinearGradient
                  key={i}
                  colors={
                    isDark ? ["#312e81", "#020617"] : ["#e0e7ff", "#f5f3ff"]
                  }
                  className="w-64 h-40 mr-4 p-[1px]"
                  style={{
                    borderRadius: 24,
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.75}
                    className="flex-1 rounded-3xl p-5 bg-white/80 dark:bg-neutral-900/80 border border-indigo-200/40 dark:border-indigo-800/40 justify-between"
                    onPress={() => handleViewItem(note._id)}
                  >
                    <View className="flex-row gap-3">
                      <LinearGradient
                        colors={["#6366f1", "#a855f7"]}
                        className="w-10 h-10 items-center justify-center"
                        style={{ borderRadius: 9999 }}
                      >
                        <FileText size={18} color="#fff" />
                      </LinearGradient>

                      <Text
                        numberOfLines={2}
                        className="text-sm font-roboto-bold text-neutral-900 dark:text-white flex-1"
                      >
                        {note.title}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                        {formatDate(note._createdAt)}
                      </Text>

                      <View className="w-8 h-8 rounded-full bg-indigo-500 items-center justify-center">
                        <ChevronRight size={20} color="#fff" />
                      </View>
                    </View>
                  </TouchableOpacity>
                </LinearGradient>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ===== WEBSITES ===== */}
        {websitesDetails.length > 0 && (
          <View className="mb-8 px-4">
            <Text className="text-lg font-roboto-bold text-neutral-900 dark:text-white mb-4">
              Websites
            </Text>

            {websitesDetails.map((site, i) => (
              <WebDetails key={i} details={site} />
            ))}
          </View>
        )}

        {/* ===== EMPTY STATE ===== */}
        {websitesDetails.length === 0 && secureNotesDetails.length === 0 && (
          <View className="items-center py-20 px-6">
            <View className="w-20 h-20 rounded-full bg-neutral-200 dark:bg-neutral-800 items-center justify-center mb-4">
              <Globe size={36} color={isDark ? "#666" : "#aaa"} />
            </View>

            <Text className="text-lg font-roboto-bold text-neutral-900 dark:text-white mb-1">
              No Vault Items
            </Text>

            <Text className="text-sm text-neutral-500 dark:text-neutral-400 text-center mb-6">
              Add websites or secure notes to get started
            </Text>

            <TouchableOpacity onPress={() => vaultItemsRef.current?.expand()}>
              <LinearGradient
                colors={["#6366f1", "#9333ea"]}
                className="px-8 py-3"
                style={{ borderRadius: 9999 }}
              >
                <Text className="text-white font-semibold text-sm">
                  Add Item
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </Animated.ScrollView>

      <SettingsOverlay sheetRef={sheetRef} />
    </SafeAreaView>
  );
};

export default Vault;
