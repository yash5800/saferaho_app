import React, { useEffect } from "react";
import { Animated, ViewStyle } from "react-native";

interface SkeletonThumbnailProps {
  width?: number;
  height?: number;
  style?: ViewStyle;
}

const SkeletonThumbnail: React.FC<SkeletonThumbnailProps> = ({
  width = 120,
  height = 120,
  style,
}) => {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [shimmerAnim]);

  const backgroundColor = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#e0e0e0", "#f0f0f0"],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          minWidth: 120,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

export default SkeletonThumbnail;
