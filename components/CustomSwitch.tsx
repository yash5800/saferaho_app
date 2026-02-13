import { useCallback, useEffect } from "react";
import { TouchableWithoutFeedback } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface CustomSwitchProps {
  active: boolean;
  activeColor: string;
  inActiveColor: string;
  thumbColor?: string;
  duration?: number;
  scale?: number;
  onToggle?: (isActive: boolean) => void;
  style?: object;
}

const CustomSwitch = ({
  active,
  activeColor,
  inActiveColor,
  thumbColor = "#fff",
  duration = 300,
  scale = 1,
  onToggle,
  style,
}: CustomSwitchProps) => {
  const isActive = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    isActive.value = withSpring(active ? 1 : 0, { damping: 15 });
  }, [active]);

  const handleToggle = useCallback(() => {
    const newValue = isActive.value === 0;
    isActive.value = withSpring(newValue ? 1 : 0, { damping: 15 });
    if (onToggle) {
      onToggle(newValue);
    }
  }, [onToggle]);

  const thumbStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: isActive.value * 21 + 1,
        },
      ],
    };
  });

  const backgroundColorStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        isActive.value,
        [0, 1],
        [inActiveColor, activeColor],
      ),
    };
  });

  const scaleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: scale * (1 + isActive.value * 0.05),
        },
      ],
    };
  });

  return (
    <TouchableWithoutFeedback onPress={handleToggle}>
      <Animated.View
        className="w-[50px] h-[28px] rounded-3xl flex justify-center bg-[#F2F5F7] p-[2px] elevation-sm dark:bg-gray-500"
        style={[backgroundColorStyle, scaleStyle, style]}
      >
        <Animated.View
          className="w-[24px] h-[24px] rounded-full p-2 bg-[#fff]"
          style={[
            thumbStyles,
            {
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.2,
              shadowRadius: 2.5,
              elevation: 4,
            },
            {
              backgroundColor: thumbColor,
            },
          ]}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default CustomSwitch;
