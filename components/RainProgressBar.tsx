import { Canvas, LinearGradient, Rect, vec } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { View } from "react-native";
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  progress: number; // 0–100
  width?: number;
  height?: number;
  colors?: string[];
};

export function RainProgressBar({
  progress,
  width = 260,
  height = 10,
  colors = ["#22d3ee", "#3b82f6", "#6366f1", "#22d3ee"],
}: Props) {
  const animated = useSharedValue(0);

  useEffect(() => {
    animated.value = withTiming(progress / 100, {
      duration: 300,
    });
  }, [progress]);

  // 🔹 Derived values (Reanimated only)
  const barWidth = useDerivedValue(() => {
    return animated.value * width;
  });

  const gradientStart = useDerivedValue(() => {
    return vec(barWidth.value - 80, 0);
  });

  const gradientEnd = useDerivedValue(() => {
    return vec(barWidth.value + 80, 0);
  });

  return (
    <View
      style={{
        width,
        height,
        borderRadius: height / 2,
        overflow: "hidden",
        backgroundColor: "#111",
        marginTop: 5,
      }}
    >
      <Canvas style={{ width, height }}>
        <Rect x={0} y={0} width={barWidth} height={height}>
          <LinearGradient
            start={gradientStart}
            end={gradientEnd}
            colors={colors}
          />
        </Rect>
      </Canvas>
    </View>
  );
}
