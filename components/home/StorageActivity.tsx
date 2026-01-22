import { calculatePercentage } from "@/util/calculatePersentage";
import { useFont } from "@shopify/react-native-skia";
import { useColorScheme } from "nativewind";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import CircleDonut from "../CircleDonut";

const RADIUS = 60;
const STROKE_WIDTH = 10;
const GOALS = 5120; // 5 GB in MB
const StorageActivity = () => {
  const [value, setValue] = React.useState(0);
  const percentage = useSharedValue(0);
  const end = useSharedValue(0);
  const font = useFont(require("../../assets/fonts/Roboto-Bold.ttf"), 30);

  const { colorScheme } = useColorScheme();

  function GBConverter(sizeInMB: number) {
    if (sizeInMB < 1024) {
      return `${sizeInMB} MB`;
    } else {
      const sizeInGB = (sizeInMB / 1024).toFixed(2);
      return `${sizeInGB} GB`;
    }
  }

  React.useEffect(() => {
    if (value > 0) {
      const generatePercentage = calculatePercentage(value, GOALS);
      percentage.value = withTiming(generatePercentage, { duration: 1000 });
      end.value = withTiming(generatePercentage / 100, { duration: 1000 });
    }
  }, [value]);

  const handleClick = () => {
    setValue(Math.floor(Math.random() * GOALS));
  };

  if (!font) {
    return (
      <View className="bg-[#1A1A1A] rounded-3xl py-4 px-5 mt-4 justify-center items-center">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="bg-[#1A1A1A] rounded-3xl py-4 px-5 mt-4 justify-center items-center gap-8 flex flex-row">
      <CircleDonut
        Radius={RADIUS}
        StrokeWidth={STROKE_WIDTH}
        End={end}
        percentage={percentage}
        font={font}
      />
      <View className="justify-center items-center gap-2">
        <Text className="text-white">Available Storage</Text>
        <Text className="text-white text-xl font-roboto-bold">
          {GBConverter(value)} / {GBConverter(GOALS)}
        </Text>
        <TouchableOpacity
          className="bg-white justify-center items-center px-4 py-2 rounded-full"
          onPress={handleClick}
        >
          <Text className="text-black font-roboto-bold">View More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StorageActivity;
