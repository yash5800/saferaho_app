import {
  Canvas,
  Group,
  Path,
  SkFont,
  Skia,
  SweepGradient,
  Text,
  vec,
} from "@shopify/react-native-skia";
import { useColorScheme } from "nativewind";
import { View } from "react-native";
import { SharedValue, useDerivedValue } from "react-native-reanimated";

interface CircleDonutProps {
  Radius: number;
  StrokeWidth: number;
  End: SharedValue<number>;
  percentage: SharedValue<number>;
  font: SkFont;
}

const CircleDonut = ({
  Radius,
  StrokeWidth,
  End,
  percentage,
  font,
}: CircleDonutProps) => {
  const innerRadius = Radius - StrokeWidth / 2;
  const { colorScheme } = useColorScheme();

  const path = Skia.Path.Make();
  path.addCircle(Radius, Radius, innerRadius);

  /*  percentage text  */
  const targetText = useDerivedValue(() => {
    const v = percentage.value;
    return v < 10 ? `${v.toFixed(1)}%` : `${Math.round(v)}%`;
  });

  const textX = useDerivedValue(() => {
    const metrics = font.measureText(targetText.value);
    return Radius - metrics.width / 2;
  });

  const fontMetrics = font.measureText("100%");

  return (
    <View style={{ width: Radius * 2, height: Radius * 2 }}>
      <Canvas style={{ flex: 1 }}>
        {/* Background track */}
        <Path
          path={path}
          strokeWidth={StrokeWidth}
          style="stroke"
          color="rgba(160,160,160,0.2)"
          strokeCap="round"
        />

        {/* Progress */}
        <Group>
          <Path
            path={path}
            strokeWidth={StrokeWidth}
            style="stroke"
            strokeCap="round"
            start={0}
            end={End}
          >
            <SweepGradient
              c={vec(Radius, Radius)}
              colors={[
                "#22d3ee", // cyan
                "#38bdf8", // blue
                "#818cf8", // indigo
                "#22d3ee",
              ]}
            />
          </Path>
        </Group>

        {/* Center text */}
        <Text
          x={textX}
          y={Radius + fontMetrics.height / 3}
          text={targetText}
          font={font}
          color={colorScheme === "dark" ? "#ffffff" : "#000000"}
        />
      </Canvas>
    </View>
  );
};

export default CircleDonut;
