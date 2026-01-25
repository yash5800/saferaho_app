import { Image, Music, Video } from "lucide-react-native";
import React, { useEffect } from "react";
import { Animated, View, ViewStyle } from "react-native";

interface SkeletonThumbnailProps {
  width?: number;
  height?: number;
  style?: ViewStyle;
  category?: "photos" | "videos" | "documents" | "audio" | "others";
}

const SkeletonThumbnail: React.FC<SkeletonThumbnailProps> = ({
  width = 117,
  height = 117,
  style,
  category = "photos",
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
    outputRange: ["#d0d0d0", "#e5e5e5"],
  });

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.7],
  });

  const getIcon = () => {
    switch (category) {
      case "videos":
        return <Video size={32} color="#888" />;
      case "audio":
        return <Music size={32} color="#888" />;
      case "photos":
      default:
        return <Image size={32} color="#888" />;
    }
  };

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          minWidth: 117,
          backgroundColor,
          marginBottom: 1.5,
        },
        style,
      ]}
    >
      <View className="h-full w-full items-center justify-center">
        <Animated.View style={{ opacity }}>{getIcon()}</Animated.View>
      </View>
    </Animated.View>
  );
};

export default SkeletonThumbnail;
