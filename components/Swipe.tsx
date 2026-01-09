import { ArrowRight } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const BUTTON_WIDTH = 285;
const BUTTON_HEIGHT = 70;
const BUTTON_PADDING = 10;

const SWIPEABLE_SIZE = BUTTON_HEIGHT - 2 * BUTTON_PADDING;
const MAX_TRANSLATE_X =
  BUTTON_WIDTH - 2 * BUTTON_PADDING - SWIPEABLE_SIZE;

type SwipeProps = {
  onComplete: () => void;
};

const Swipe = ({ onComplete }: SwipeProps) => {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      "worklet";
      startX.value = translateX.value;
    })
    .onUpdate((e) => {
      "worklet";
      const newX = startX.value + e.translationX;

      translateX.value = Math.min(
        Math.max(newX, 0),
        MAX_TRANSLATE_X
      );
    })
    .onEnd(() => {
      "worklet";

      if (translateX.value > MAX_TRANSLATE_X * 0.9) {
        translateX.value = withSpring(MAX_TRANSLATE_X);
        runOnJS(onComplete)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const swipeableStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, MAX_TRANSLATE_X * 0.6],
      [1, 0],
      Extrapolate.CLAMP
    ),
  }));

  return (
    <View
      className="
        relative overflow-hidden justify-center
        bg-neutral-900 dark:bg-neutral-100
        rounded-full
      "
      style={{
        width: BUTTON_WIDTH,
        height: BUTTON_HEIGHT,
        padding: BUTTON_PADDING,
      }}
    >
      {/* Center text */}
      <Animated.Text
        className="
          absolute self-center
          text-base font-semibold
          text-white dark:text-neutral-900
        "
        style={textStyle}
      >
        Swipe to get started
      </Animated.Text>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          className="
            absolute left-[10px]
            items-center justify-center
            rounded-full
            bg-violet-600 dark:bg-violet-500
          "
          style={[
            {
              width: SWIPEABLE_SIZE,
              height: SWIPEABLE_SIZE,
            },
            swipeableStyle,
          ]}
        >
          <ArrowRight size={26} color="#fff" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default Swipe;
