import { Canvas, Group, Path, Skia } from "@shopify/react-native-skia";
import { useColorScheme } from "nativewind";
import { Text, View } from "react-native";

interface CategorySlice {
  percent: number; // 0–100
  color: string;
}

interface CategoryDonutProps {
  radius: number;
  strokeWidth: number;
  slices: CategorySlice[];
}

const CategoryDonut = ({ radius, strokeWidth, slices }: CategoryDonutProps) => {
  const innerRadius = radius - strokeWidth / 2;

  const path = Skia.Path.Make();
  path.addCircle(radius, radius, innerRadius);

  const { colorScheme } = useColorScheme();

  const totalPercent = Math.max(
    0,
    Math.min(
      100,
      Number.isFinite(
        slices.reduce((acc, slice) => acc + (slice.percent || 0), 0),
      )
        ? slices.reduce((acc, slice) => acc + (slice.percent || 0), 0)
        : 0,
    ),
  );

  const percentLabel =
    totalPercent < 10
      ? `${totalPercent.toFixed(1)}%`
      : `${Math.round(totalPercent)}%`;

  let start = 0;

  return (
    <View style={{ width: radius * 2, height: radius * 2 }}>
      <Canvas style={{ flex: 1 }}>
        {/* Background track */}
        <Path
          path={path}
          style="stroke"
          strokeWidth={strokeWidth}
          color="rgba(150,150,150,0.15)"
          strokeCap="round"
        />

        {/* Segments */}
        {slices.map((slice, index) => {
          const end = start + slice.percent / 100;
          const currentStart = start;
          start = end;

          return (
            <Group key={index}>
              <Path
                path={path}
                style="stroke"
                strokeWidth={strokeWidth}
                start={currentStart}
                end={end}
                strokeCap="round"
                color={slice.color}
              />
            </Group>
          );
        })}
      </Canvas>

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: Math.max(12, radius * 0.45),
            fontWeight: "700",
            color: colorScheme === "dark" ? "#ffffff" : "#111827",
          }}
        >
          {percentLabel}
        </Text>
      </View>
    </View>
  );
};

export default CategoryDonut;
