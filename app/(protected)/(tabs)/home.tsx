import StorageActivity from "@/components/home/StorageActivity";
import {
  apps,
  compressed,
  documents,
  images,
  music,
  others,
  vault,
  videos,
} from "@/lib/icons";
import { hideTabBar, showTabBar } from "@/lib/tabBarContoller";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
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

const UsageItems = [
  {
    name: "Images",
    icon: images,
    total: "12 Files",
  },
  {
    name: "Videos",
    icon: videos,
    total: "8 Files",
  },
  {
    name: "Documents",
    icon: documents,
    total: "15 Files",
  },
  {
    name: "Music",
    icon: music,
    total: "20 Files",
  },
  {
    name: "Apps",
    icon: apps,
    total: "5 Files",
  },
  {
    name: "Compressed",
    icon: compressed,
    total: "3 Files",
  },
  {
    name: "Others",
    icon: others,
    total: "7 Files",
  },
  {
    name: "Vault",
    icon: vault,
    total: "4 Records",
  },
];

const recent = [
  {
    fileName: "vacation_photo.png",
    fileSize: "2.1 MB",
    date: "12 Aug 2023",
    icon: images,
  },
  {
    fileName: "project_proposal.pdf",
    fileSize: "1.2 MB",
    date: "10 Sep 2023",
    icon: documents,
  },
];

const Home = () => {
  const lastY = useSharedValue(0);

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
    }

    // showing scrolling up
    if (diff < -10) {
      runOnJS(showTabBar)();
    }
    lastY.value = y;
  });

  return (
    <SafeAreaView className="flex-1 bg-[#dbeaea] dark:bg-[#181818]">
      <Animated.ScrollView
        className="px-4 pt-4"
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <View className="flex-1 flex-row justify-between items-center gap-2">
          <View className="justify-center items-center rounded-full w-14 h-14 bg-white dark:bg-gray-800">
            <Text className="text-3xl font-bold dark:text-white">A</Text>
          </View>
          <TextInput
            placeholder="Search"
            className="flex-1 bg-slate-100 shadow-lg active:shadow-xl rounded-full px-4 dark:bg-gray-700 dark:text-white placeholder:text-gray-400"
          />
        </View>
        <View className="mt-4 px-3">
          <Text className="text-2xl font-roboto-bold dark:text-white">
            Welcome to SafeRaho Space!
          </Text>
        </View>
        <StorageActivity />
        <View className="flex flex-row justify-start items-center flex-wrap gap-4 mt-5">
          {UsageItems.map((item) => (
            <TouchableOpacity
              key={item.name}
              className="w-28 h-28 bg-white dark:bg-gray-800 rounded-lg justify-center items-center shadow-md active:shadow-lg"
            >
              <Image source={item.icon} style={{ width: 30, height: 30 }} />
              <Text className="mt-2 font-roboto-medium dark:text-white">
                {item.name}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {item.total}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View className="flex justify-center items-start mt-6 pb-10">
          <Text className="text-xl font-semibold text-gray-00 dark:text-white">
            Recent
          </Text>
          <View className="w-full mt-4 gap-3">
            {recent.map((file, index) => (
              <View
                key={`file${index}`}
                className="rounded-3xl justify-start items-center flex-row bg-white dark:bg-gray-800 p-4"
              >
                <Image source={file.icon} style={{ width: 40, height: 40 }} />
                <View className="ml-4 flex-1">
                  <Text className="font-roboto-medium dark:text-white text-lg">
                    {file.fileName}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {file.fileSize} | {file.date}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default Home;
