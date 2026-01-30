import { useGetPath } from "@/components/getPath";
import SettingsOverlay from "@/components/SettingsOverlay";
import { hideFloating, showFloating } from "@/lib/floatingContoller";
import { hideTabBar, showTabBar } from "@/lib/tabBarContoller";
import BottomSheet from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { Box, Heart, Search, Settings } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useEffect, useRef, useState } from "react";
import { BackHandler, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const groceryList = [
  "apples",
  "bananas",
  "oranges",
  "grapes",
  "strawberries",
  "blueberries",
  "raspberries",
  "blackberries",
  "spinach",
  "kale",
  "lettuce",
  "cabbage",
  "carrots",
  "broccoli",
  "cauliflower",
  "zucchini",
  "cucumbers",
  "tomatoes",
  "peppers",
  "onions",
  "garlic",
  "potatoes",
  "sweet potatoes",
  "avocados",
  "mushrooms",
  "milk",
  "cheese",
  "butter",
  "yogurt",
  "eggs",
  "bacon",
  "chicken",
  "beef",
  "pork",
  "fish",
  "shrimp",
  "bread",
  "rice",
  "pasta",
  "olive oil",
  "honey",
  "coffee",
  "tea",
  "juice",
  "cereal",
  "oats",
];

const categoryList = [
  { title: "All", icon: Box },
  { title: "Favorites", icon: Heart },
];

const Vault = () => {
  const lastY = useSharedValue(0);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [activeCategory, setActiveCategory] = useState("All");
  const sheetRef = useRef<BottomSheet>(null);
  const currentPath = useGetPath();

  useEffect(() => {
    if (currentPath !== "profile") showFloating();

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

  const handleSettingsOpen = () => {
    hideFloating();
    hideTabBar();
    sheetRef.current?.expand();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f4f7f8] dark:bg-[#0f0f0f]">
      <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
        {/*  Header  */}
        <View className="flex-row items-center justify-between px-4 pt-4">
          <Text className="text-2xl font-roboto-bold text-neutral-900 dark:text-white">
            Vault
          </Text>

          <View className="flex-row gap-2">
            <TouchableOpacity
              activeOpacity={0.85}
              className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 items-center justify-center"
            >
              <Search size={18} color={isDark ? "#fff" : "#111"} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSettingsOpen}
              className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 items-center justify-center"
            >
              <Settings size={18} color={isDark ? "#fff" : "#111"} />
            </TouchableOpacity>
          </View>
        </View>

        {/*  Categories  */}
        <View className="flex-row gap-2 px-4 mt-5 mb-4">
          {categoryList.map((cat) => {
            const Icon = cat.icon;
            const active = activeCategory === cat.title;

            return (
              <TouchableOpacity
                key={cat.title}
                activeOpacity={0.85}
                onPress={() => setActiveCategory(cat.title)}
                className={`
                  flex-row items-center gap-2 px-4 py-2 rounded-full
                  ${
                    active
                      ? "bg-neutral-900 dark:bg-white"
                      : "bg-neutral-100 dark:bg-neutral-800"
                  }
                `}
              >
                <Icon
                  size={14}
                  color={
                    active
                      ? isDark
                        ? "#000"
                        : "#fff"
                      : isDark
                        ? "#fff"
                        : "#111"
                  }
                />

                <Text
                  className={`
                    text-sm
                    ${
                      active
                        ? isDark
                          ? "text-black"
                          : "text-white"
                        : "text-neutral-700 dark:text-neutral-300"
                    }
                  `}
                >
                  {cat.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/*  List  */}
        <View className="px-4">
          {groceryList.map((item) => (
            <View
              key={item}
              className="py-4 border-b border-neutral-200 dark:border-neutral-800"
            >
              <Text className="text-base text-neutral-900 dark:text-white">
                {item}
              </Text>
            </View>
          ))}
        </View>
      </Animated.ScrollView>

      <SettingsOverlay sheetRef={sheetRef} />
    </SafeAreaView>
  );
};

export default Vault;
