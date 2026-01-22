import { Canvas, Path, SkFont, Skia, Text } from "@shopify/react-native-skia";
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
  const path = Skia.Path.Make();
  path.addCircle(Radius, Radius, innerRadius);

  const targetText = useDerivedValue(
    () =>
      `${percentage.value < 10 ? percentage.value.toFixed(1) : Math.round(percentage.value)}%`,
    [],
  );

  const fontSize = font.measureText("00%");
  const textX = useDerivedValue(() => {
    const _fontSize = font.measureText(targetText.value);
    return Radius - _fontSize.width / 2;
  });

  return (
    <View style={{ width: Radius * 2, height: Radius * 2 }}>
      <Canvas style={{ flex: 1 }}>
        <Path
          path={path}
          strokeWidth={StrokeWidth}
          style={"stroke"}
          color={"#3B3B3B"}
          strokeJoin={"round"}
          strokeCap={"round"}
          start={0}
          end={1}
        />
        <Path
          path={path}
          strokeWidth={StrokeWidth}
          style={"stroke"}
          color={"#82FDFF"}
          strokeJoin={"round"}
          strokeCap={"round"}
          start={0}
          end={End}
        />
        <Text
          x={textX}
          y={Radius + fontSize.height / 2}
          text={targetText}
          font={font}
          color={"white"}
        />
      </Canvas>
    </View>
  );
};

export default CircleDonut;
