import { useNetwork } from "@/context/networkContext";
import { AlertCircle } from "lucide-react-native";
import React from "react";
import { Text } from "react-native";
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

const NetworkStatus = () => {
  const { isOnline } = useNetwork();
  const animatedValue = useSharedValue(isOnline ? 1 : 0);

  React.useEffect(() => {
    animatedValue.value = withTiming(isOnline ? 1 : 0, {
      duration: 300,
    });
  }, [isOnline, animatedValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      animatedValue.value,
      [0, 1],
      ["#ef4444", "#22c55e"], // red to green
    ),
  }));

  if (isOnline) {
    return null; // Don't show when online
  }

  return (
    <Animated.View
      style={[
        {
          paddingVertical: 10,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        },
        animatedStyle,
      ]}
    >
      <AlertCircle size={18} color="#fff" strokeWidth={2.5} />
      <Text className="text-sm font-semibold text-white">
        Offline - No internet connection
      </Text>
    </Animated.View>
  );
};

export default NetworkStatus;
