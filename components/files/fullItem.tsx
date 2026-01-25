import { categeryType } from "@/app/(protected)/(tabs)/files";
import { userFilesMetadata } from "@/context/mainContext";
import { csv, doc, music, pdf, xls, zip } from "@/lib/icons";
import { decryptFileToChunks } from "@/util/filesOperations/fileChunker";
import { formatSize } from "@/util/filesOperations/fileSize";
import { generateVideoPreview } from "@/util/filesOperations/preview";
import { BlurView } from "@react-native-community/blur";
import { Video } from "expo-av";
import { useColorScheme } from "nativewind";
import { useContext, useEffect, useState } from "react";
import {
  Animated,
  BackHandler,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CryptoContext } from "../crypto/Crypto";
import { RainProgressBar } from "../RainProgressBar";
import SkeletonThumbnail from "./SkeletonThumbnail";

type FullItemProps = {
  item?: userFilesMetadata;
  category?: categeryType;
  animatedItem?: Animated.WithAnimatedValue<any>;
  onClose?: () => void;
};

interface CurrentFileState {
  encryptedData: {
    index: number;
    assetId: string;
    url: string;
  }[];
  status: "pending" | "decrypting" | "completed" | "error";
  progress: number;
}

const formateTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const FullItem = ({ item, animatedItem, onClose, category }: FullItemProps) => {
  const { colorScheme } = useColorScheme();
  const { masterKey } = useContext(CryptoContext);
  const [currentFile, setCurrentFile] = useState<CurrentFileState>({
    encryptedData: [],
    status: "pending",
    progress: 0,
  });
  const [decryptedUri, setDecryptedUri] = useState<string | null>(null);

  console.log("FullItem rendered with item:", item);

  useEffect(() => {
    if (!item?.chunks || !masterKey) return;
    setDecryptedUri(null);

    const initialFile: CurrentFileState = {
      encryptedData: item.chunks,
      status: "pending",
      progress: 0,
    };
    setCurrentFile(initialFile);

    //hardware back button handling can be added here if needed
    BackHandler.addEventListener("hardwareBackPress", () => {
      onClose && onClose();
      return true;
    });

    const fetchDecryptedFile = async (fileState: CurrentFileState) => {
      try {
        const base64Uri = await decryptFileToChunks(
          fileState,
          setCurrentFile,
          masterKey,
        );

        console.log("Decrypted file data:", base64Uri);
        setDecryptedUri(`file://${base64Uri}`);
      } catch (error) {
        console.error("Error decrypting file:", error);
      }
    };

    fetchDecryptedFile(initialFile);
  }, [item, masterKey]);

  const getThumbnail = (uri: string) => {
    return generateVideoPreview(uri);
  };

  const icon = (extension: string) => {
    if (extension === "pdf") return pdf;
    if (extension === "docx" || extension === "doc") return doc;
    if (extension === "xlsx" || extension === "excel") return xls;
    if (extension === "csv") return csv;
    if (extension === "zip") return zip;
    if (category === "audio") return music;
    return doc;
  };

  return (
    <Pressable onPress={onClose} style={StyleSheet.absoluteFill}>
      <Animated.View
        className="absolute inset-0 justify-center items-center"
        style={animatedItem}
      >
        <BlurView
          style={styles.absolute}
          blurType={colorScheme === "dark" ? "dark" : "light"}
          blurAmount={3}
          reducedTransparencyFallbackColor="white"
        />
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="bg-white p-4 rounded-lg shadow-lg">
            {item && decryptedUri && currentFile.status === "completed" ? (
              item?.fileType.startsWith("image/") ? (
                <View className="justify-center items-center rounded-lg">
                  <Animated.Image
                    source={{ uri: decryptedUri }}
                    style={{ width: 300, height: 300, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                  <Text
                    className="p-2 text-lg font-roboto-bold max-w-xs text-center"
                    numberOfLines={3}
                  >
                    {item.filename}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-gray-500">
                      {formatSize(item.fileSize)}
                    </Text>
                    <Text className="text-gray-500">•</Text>
                    <Text className="text-gray-500">
                      {item.filename.split(".").pop()?.toUpperCase() || "FILE"}
                    </Text>
                  </View>
                </View>
              ) : item?.fileType.startsWith("video/") ? (
                <View className="justify-center items-center rounded-lg">
                  <Video
                    source={{ uri: decryptedUri }}
                    style={{ width: 300, height: 300, borderRadius: 12 }}
                    useNativeControls
                  />
                  <Text
                    className="p-2 text-lg font-roboto-bold max-w-xs text-center"
                    numberOfLines={3}
                  >
                    {item.filename}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-gray-500">
                      {formatSize(item.fileSize)}
                    </Text>
                    <Text className="text-gray-500">•</Text>
                    <Text className="text-gray-500">
                      {item.filename.split(".").pop()?.toUpperCase() || "FILE"}
                    </Text>
                    <Text className="text-gray-500">•</Text>
                    <Text className="text-gray-500">
                      {formateTime(item.duration || 0)}
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="justify-center items-center rounded-lg">
                  <View className="mb-4 rounded-lg bg-gray-200 p-4 justify-center items-center w-[250px] h-[250px]">
                    <Image
                      source={icon(item.filename.split(".").pop() || "")}
                      style={{ width: 60, height: 60, borderRadius: 12 }}
                      resizeMode="cover"
                    />
                  </View>
                  <Text
                    className="p-2 text-lg font-roboto-bold max-w-xs text-center"
                    numberOfLines={3}
                  >
                    {item.filename}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-gray-500">
                      {formatSize(item.fileSize)}
                    </Text>
                    <Text className="text-gray-500">•</Text>
                    <Text className="text-gray-500">
                      {item.filename.split(".").pop()?.toUpperCase() || "FILE"}
                    </Text>
                    {category === "audio" && item.duration && (
                      <>
                        <Text className="text-gray-500">•</Text>
                        <Text className="text-gray-500">
                          {formateTime(item.duration)}
                        </Text>
                      </>
                    )}
                  </View>
                  <Text className="mt-4 text-center text-gray-600">
                    {formatDate(item._createdAt)}
                  </Text>
                </View>
              )
            ) : (
              <View className="justify-center items-center rounded-lg">
                <SkeletonThumbnail
                  category={category}
                  width={300}
                  height={300}
                />

                <Text className="text-gray-500">{currentFile.status}</Text>
                <RainProgressBar progress={currentFile.progress} width={200} />
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>
    </Pressable>
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
});

export default FullItem;
