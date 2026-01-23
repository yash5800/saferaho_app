import { previewCache, subscribePreview } from "@/lib/previewCache";
import React, { useEffect } from "react";
import { Image } from "react-native";
import SkeletonThumbnail from "./SkeletonThumbnail";

type FilePreviewProps = {
  fileId: string;
};

const FilePreview = ({ fileId }: FilePreviewProps) => {
  const [preview, setPreview] = React.useState<string | null>(null);

  useEffect(() => {
    // 1️⃣ ALWAYS read cache first
    const cached = previewCache.get(fileId);
    if (cached) {
      setPreview(cached);
      return; // 🔥 DO NOT subscribe
    }

    // 2️⃣ Only subscribe if not cached
    const unsubscribe = subscribePreview(fileId, () => {
      const cached = previewCache.get(fileId);
      if (cached) setPreview(cached);
    });

    return () => {
      unsubscribe();
    };
  }, [fileId]);

  if (!preview) {
    return <SkeletonThumbnail />;
  }

  return (
    <Image
      source={{ uri: `data:image/jpeg;base64,${preview}` }}
      style={{ width: 117, height: 117 }}
      resizeMode="cover"
    />
  );
};

export default FilePreview;
