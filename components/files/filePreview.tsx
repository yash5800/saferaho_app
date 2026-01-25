import { previewCache, subscribePreview } from "@/lib/previewCache";
import { Video } from "lucide-react-native";
import React, { useEffect } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import SkeletonThumbnail from "./SkeletonThumbnail";

type FilePreviewProps = {
  fileId: string;
  category: "photos" | "videos" | "documents" | "audio" | "others";
  onPress?: () => void;
};

const FilePreview = ({ fileId, category, onPress }: FilePreviewProps) => {
  const [preview, setPreview] = React.useState<string | null>(null);

  useEffect(() => {
    // 🚨 RESET immediately to avoid stale reuse
    setPreview(null);

    const cached = previewCache.get(fileId);
    if (cached) {
      setPreview(cached);
      return;
    }

    const unsubscribe = subscribePreview(fileId, () => {
      const cached = previewCache.get(fileId);
      if (cached) setPreview(cached);
    });

    return () => {
      unsubscribe();
    };
  }, [fileId, category]);

  if (!preview) {
    return <SkeletonThumbnail category={category} />;
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <Image
        source={{ uri: `data:image/jpeg;base64,${preview}` }}
        style={{ width: 117, height: 117, marginBottom: 1.5 }}
        resizeMode="cover"
      />
      {category === "videos" && (
        <View className="absolute bottom-1 right-1 bg-black/50 rounded-full p-1">
          <Video size={16} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default FilePreview;
