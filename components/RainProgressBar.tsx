import { Canvas, LinearGradient, Rect, vec } from "@shopify/react-native-skia";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";

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
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    setAnimated(progress / 100);
  }, [progress]);

  // 🔹 Derived values
  const barWidth = useMemo(() => {
    return animated * width;
  }, [animated, width]);

  const gradientStart = useMemo(() => {
    return vec(barWidth - 80, 0);
  }, [barWidth]);

  const gradientEnd = useMemo(() => {
    return vec(barWidth + 80, 0);
  }, [barWidth]);

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
