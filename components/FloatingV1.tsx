import { FloatingContext } from "@/context/mainContext";
import { hideFloating, registerFloating } from "@/lib/floatingContoller";
import { hideTabBar } from "@/lib/tabBarContoller";
import { BlurView } from "@react-native-community/blur";
import { Extrapolate } from "@shopify/react-native-skia";
import { router } from "expo-router";
import { FilePlusCorner, NotebookPen, Plus } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useContext, useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const FloatingV1 = () => {
  const { handleUpload, handleVaultItems } = useContext(FloatingContext);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const firstValue = useSharedValue(100);
  const secondValue = useSharedValue(100);
  const [open, setOpen] = useState(false);

  // Modern color palette
  const colors = {
    primary: isDark ? "#6366f1" : "#4f46e5",
    secondary: isDark ? "#a78bfa" : "#8b5cf6",
    accent: isDark ? "#ec4899" : "#db2777",
    bgLight: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.9)",
    text: "#ffffff",
  };

  const floatingScale = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    registerFloating(
      () => {
        "worklet";
        floatingScale.value = withTiming(0, { duration: 250 });
      },
      () => {
        "worklet";
        floatingScale.value = withTiming(1, { duration: 250 });
      },
    );
  }, [floatingScale]);

  const animateStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      floatingScale.value,
      [0, 1],
      [0.5, 1],
      Extrapolate.CLAMP,
    );
    return {
      transform: [{ scale }],
      opacity: floatingScale.value,
      display: floatingScale.value === 0 ? "none" : "flex",
    };
  });

  const handlePress = () => {
    const newOpenState = !open;
    setOpen(newOpenState);

    const config = {
      easing: Easing.bezier(0.68, -0.6, 0.32, 1.6),
      duration: 500,
    };

    if (newOpenState) {
      // Opening
      firstValue.value = withDelay(200, withSpring(180));
      secondValue.value = withDelay(100, withSpring(240));
      progress.value = withSpring(1);
    } else {
      // Closing
      firstValue.value = withSpring(100, config);
      secondValue.value = withDelay(100, withSpring(100, config));
      progress.value = withSpring(0);
    }
  };

  const firstIcon = useAnimatedStyle(() => {
    const scale = interpolate(
      firstValue.value,
      [100, 180],
      [0, 1],
      Extrapolate.CLAMP,
    );
    const right = interpolate(
      firstValue.value,
      [100, 180],
      [-20, 46],
      Extrapolate.CLAMP,
    );

    return {
      bottom: firstValue.value,
      transform: [{ scale }],
      right,
    };
  });

  const secondIcon = useAnimatedStyle(() => {
    const scale = interpolate(
      secondValue.value,
      [100, 240],
      [0, 1],
      Extrapolate.CLAMP,
    );
    const right = interpolate(
      secondValue.value,
      [100, 240],
      [-20, 34],
      Extrapolate.CLAMP,
    );

    return {
      bottom: secondValue.value,
      transform: [{ scale }],
      right,
    };
  });

  const plusIcon = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${progress.value * 45}deg` }],
    };
  });

  const onPressAddFile = () => {
    handlePress();
    hideFloating();
    hideTabBar();
    handleUpload();
  };

  const onPressAddNotes = () => {
    handlePress();
    hideFloating();
    hideTabBar();
    router.push("/(protected)/vaultItemsInput");
  };

  return (
    <View className="inset-0 absolute">
      {open && (
        <BlurView
          style={styles.absolute}
          blurType={colorScheme === "dark" ? "dark" : "light"}
          blurAmount={3}
          reducedTransparencyFallbackColor="white"
          onTouchEnd={handlePress}
        />
      )}
      <AnimatedTouchableOpacity
        style={[
          { bottom: 260, backgroundColor: colors.accent },
          secondIcon,
          styles.fab,
          styles.fabAccent,
        ]}
        className="absolute right-0 m-4 rounded-3xl"
        onPress={onPressAddFile}
      >
        <View className="items-center justify-center w-[150px] px-3 py-2 flex-row gap-2">
          <FilePlusCorner size={22} color={colors.text} />
          <Text
            className="text-base font-roboto-bold"
            style={{ color: colors.text }}
          >
            Add File
          </Text>
        </View>
      </AnimatedTouchableOpacity>

      <Animated.View
        style={[
          { bottom: 200, backgroundColor: colors.secondary },
          firstIcon,
          styles.fab,
          styles.fabSecondary,
        ]}
        className="absolute right-0 m-4 rounded-3xl"
      >
        <TouchableOpacity
          className="items-center justify-center w-[150px] px-3 py-2 flex-row gap-2"
          onPress={onPressAddNotes}
        >
          <NotebookPen size={22} color={colors.text} />
          <Text
            className="text-base font-roboto-bold"
            style={{ color: colors.text }}
          >
            Add Notes
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <AnimatedPressable
        onPress={handlePress}
        style={[{ bottom: 100, backgroundColor: colors.primary }, animateStyle]}
        className="absolute m-4 right-5 rounded-full"
      >
        <Animated.View
          style={plusIcon}
          className="items-center justify-center h-16 w-16"
        >
          <Plus size={28} color={colors.text} />
        </Animated.View>
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  absolute: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  fab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
  },
  fabPrimary: {
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 14,
  },
  fabSecondary: {
    shadowColor: "#a78bfa",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  fabAccent: {
    shadowColor: "#ec4899",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
});

export default FloatingV1;
