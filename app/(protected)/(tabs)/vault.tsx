import SettingsOverlay from "@/components/SettingsOverlay";
import {
  hideExploreHeader,
  showExploreHeader,
} from "@/lib/exploreHeaderContoller";
import { hideTabBar, showTabBar } from "@/lib/tabBarContoller";
import BottomSheet from "@gorhom/bottom-sheet";
import { Box, Heart, SearchIcon, Settings } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
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

const cetogeryList = [
  {
    title: "All",
    icon: (props: any) => <Box size={16} color="#000" {...props} />,
  },
  {
    title: "Favorites",
    icon: (props: any) => <Heart size={16} color="#000" {...props} />,
  },
];

const Vault = () => {
  const lastY = useSharedValue(0);
  const { colorScheme } = useColorScheme();
  const [activeCategory, setActiveCategory] = React.useState("All");
  const sheetRef = React.useRef<BottomSheet>(null);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    const y = event.contentOffset.y;
    const diff = y - lastY.value;

    if (y <= 0) {
      runOnJS(showTabBar)();
      lastY.value = 0;
      return;
    }

    // hiding when scrolling down
    if (diff > 3) {
      runOnJS(hideTabBar)();
      runOnJS(hideExploreHeader)();
    }

    // showing scrolling up
    if (diff < -10) {
      runOnJS(showTabBar)();
    }

    if (diff < -3) {
      runOnJS(showExploreHeader)();
    }
    lastY.value = y;
  });

  return (
    <SafeAreaView className="flex-1 bg-[#dbeaea] dark:bg-[#181818]">
      <Animated.ScrollView
        contentContainerStyle={{ paddingVertical: 16 }}
        onScroll={scrollHandler}
      >
        {/* Header */}
        <View className="flex flex-row justify-between px-4">
          <Text className="text-2xl font-roboto-bold dark:text-white">
            Vault
          </Text>
          <View className="flex flex-row justify-center items-center gap-3">
            <TouchableOpacity onPress={() => {}}>
              <SearchIcon
                size={24}
                color={colorScheme === "dark" ? "#fff" : "#222"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                hideTabBar();
                sheetRef.current?.expand();
              }}
            >
              <Settings
                size={24}
                color={colorScheme === "dark" ? "#fff" : "#222"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View className="mt-6 px-4 flex flex-row gap-3">
          {cetogeryList.map((category) => (
            <TouchableOpacity
              key={category.title}
              className="flex flex-row items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow"
              onPress={() => setActiveCategory(category.title)}
            >
              {category.icon({
                color: colorScheme === "dark" ? "#fff" : "#000",
                fill:
                  activeCategory === category.title
                    ? colorScheme === "dark"
                      ? "#fff"
                      : "#000"
                    : "none",
              })}
              <Text className="text-sm dark:text-white">{category.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Grocery Items */}

        {groceryList.map((item) => (
          <View
            key={item}
            className="p-4 border-b border-gray-200 dark:border-gray-700"
          >
            <Text className="text-lg dark:text-white">{item}</Text>
          </View>
        ))}
      </Animated.ScrollView>
      <SettingsOverlay sheetRef={sheetRef} />
    </SafeAreaView>
  );
};

export default Vault;
