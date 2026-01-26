import { categeryType } from "@/app/(protected)/(tabs)/files";
import { userFilesMetadata } from "@/context/mainContext";
import { csv, doc, music, pdf, xls, zip } from "@/lib/icons";
import { displayToast } from "@/util/disToast";
import { saveToDownloads } from "@/util/filesOperations/download";
import { decryptFileToChunks } from "@/util/filesOperations/fileChunker";
import { formatSize } from "@/util/filesOperations/fileSize";
import { openFile } from "@/util/openWith";
import { shareFileAsync } from "@/util/share";
import { BlurView } from "@react-native-community/blur";
import { Video } from "expo-av";
import {
  Download,
  EllipsisVertical,
  ExternalLink,
  Share2,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useContext, useEffect, useState } from "react";
import {
  Animated,
  BackHandler,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  fileType: string;
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
    fileType: "",
    status: "pending",
    progress: 0,
  });
  const [decryptedUri, setDecryptedUri] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  console.log("FullItem rendered with item:", item);

  useEffect(() => {
    if (!item?.chunks || !masterKey) return;
    setDecryptedUri(null);

    const initialFile: CurrentFileState = {
      encryptedData: item.chunks,
      fileType: item.fileType,
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

  const icon = (extension: string) => {
    if (extension === "pdf") return pdf;
    if (extension === "docx" || extension === "doc") return doc;
    if (extension === "xlsx" || extension === "excel") return xls;
    if (extension === "csv") return csv;
    if (extension === "zip") return zip;
    if (category === "audio") return music;
    return doc;
  };

  const handleOpenWith = () => {
    if (!decryptedUri) return;

    openFile(decryptedUri, item?.fileType || "application/octet-stream");
  };

  const handleDownload = async () => {
    if (!decryptedUri) return;

    const res = await saveToDownloads(decryptedUri, item?.filename || "file");
    if (res) {
      displayToast({
        type: "success",
        message: "File downloaded to Downloads folder",
      });
    } else {
      displayToast({
        type: "error",
        message: "Failed to download file",
      });
    }
  };

  const handleShare = () => {
    if (!decryptedUri) return;

    shareFileAsync(decryptedUri);
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
          <View
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            style={{ width: 360 }}
          >
            {/* Header with close button */}
            <View className="flex-row justify-between items-center px-4 pt-4 pb-2">
              <View className="flex-1" />
              <TouchableOpacity onPress={onClose} className="p-2">
                <Text className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View className="px-6 pb-6">
              {item && decryptedUri && currentFile.status === "completed" ? (
                item?.fileType.startsWith("image/") ? (
                  <View className="items-center">
                    <View className="rounded-2xl overflow-hidden mb-4 shadow-md">
                      <Animated.Image
                        source={{ uri: decryptedUri }}
                        style={{ width: 280, height: 280, borderRadius: 16 }}
                        resizeMode="cover"
                      />
                    </View>
                    <Text
                      className="text-xl font-roboto-bold max-w-xs text-center text-gray-800 dark:text-gray-100"
                      numberOfLines={3}
                    >
                      {item.filename}
                    </Text>
                    <View className="flex-row items-center gap-3 mt-3">
                      <Text className="text-sm text-gray-500 dark:text-gray-400">
                        {formatSize(item.fileSize)}
                      </Text>
                      <Text className="text-gray-400">•</Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {item.filename.split(".").pop()?.toUpperCase() ||
                          "FILE"}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {formatDate(item._createdAt)}
                    </Text>
                  </View>
                ) : item?.fileType.startsWith("video/") ? (
                  <View className="items-center">
                    <View className="rounded-2xl overflow-hidden mb-4 shadow-md">
                      <Video
                        source={{ uri: decryptedUri }}
                        style={{ width: 280, height: 280, borderRadius: 16 }}
                        useNativeControls
                      />
                    </View>
                    <Text
                      className="text-xl font-roboto-bold max-w-xs text-center text-gray-800 dark:text-gray-100"
                      numberOfLines={3}
                    >
                      {item.filename}
                    </Text>
                    <View className="flex-row items-center gap-3 mt-3 flex-wrap justify-center">
                      <Text className="text-sm text-gray-500 dark:text-gray-400">
                        {formatSize(item.fileSize)}
                      </Text>
                      <Text className="text-gray-400">•</Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {item.filename.split(".").pop()?.toUpperCase() ||
                          "FILE"}
                      </Text>
                      <Text className="text-gray-400">•</Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400">
                        {formateTime(item.duration || 0)}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {formatDate(item._createdAt)}
                    </Text>
                  </View>
                ) : (
                  <View className="items-center">
                    <View className="mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 p-6 justify-center items-center w-[220px] h-[220px] shadow-md">
                      <Image
                        source={icon(item.filename.split(".").pop() || "")}
                        style={{ width: 80, height: 80, borderRadius: 16 }}
                        resizeMode="contain"
                      />
                    </View>
                    <Text
                      className="text-xl font-roboto-bold max-w-xs text-center text-gray-800 dark:text-gray-100"
                      numberOfLines={3}
                    >
                      {item.filename}
                    </Text>
                    <View className="flex-row items-center gap-3 mt-3 flex-wrap justify-center">
                      <Text className="text-sm text-gray-500 dark:text-gray-400">
                        {formatSize(item.fileSize)}
                      </Text>
                      <Text className="text-gray-400">•</Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {item.filename.split(".").pop()?.toUpperCase() ||
                          "FILE"}
                      </Text>
                      {category === "audio" && item.duration && (
                        <>
                          <Text className="text-gray-400">•</Text>
                          <Text className="text-sm text-gray-500 dark:text-gray-400">
                            {formateTime(item.duration)}
                          </Text>
                        </>
                      )}
                    </View>
                    <Text className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                      {formatDate(item._createdAt)}
                    </Text>
                  </View>
                )
              ) : (
                <View className="items-center py-4">
                  <SkeletonThumbnail
                    category={category}
                    width={280}
                    height={280}
                  />
                  <Text className="text-gray-500 dark:text-gray-400 mt-4 capitalize text-sm">
                    {currentFile.status}
                  </Text>
                  <View className="mt-4">
                    <RainProgressBar
                      progress={currentFile.progress}
                      width={220}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View className="border-t border-gray-200 dark:border-gray-700 flex-row relative">
              <TouchableOpacity
                className="flex-1 py-4 px-4 items-center border-r border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
                onPress={handleDownload}
              >
                <View className="flex-row items-center gap-2">
                  <Download
                    width={20}
                    height={20}
                    color={colorScheme === "dark" ? "#e5e7eb" : "#1f2937"}
                  />
                  <Text className="font-roboto-medium text-gray-800 dark:text-gray-200">
                    Download
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowMenu(!showMenu)}
                className="flex-1 py-4 px-4 items-center active:bg-gray-50 dark:active:bg-gray-700"
              >
                <View className="flex-row items-center gap-2">
                  <EllipsisVertical
                    width={20}
                    height={20}
                    color={colorScheme === "dark" ? "#e5e7eb" : "#1f2937"}
                  />
                  <Text className="font-roboto-medium text-gray-800 dark:text-gray-200">
                    More
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Dropdown Menu */}
              {showMenu && (
                <View className="absolute bottom-16 right-2 bg-white dark:bg-gray-700 rounded-lg shadow-md z-50 min-w-max border border-gray-200 dark:border-gray-600 overflow-hidden">
                  <TouchableOpacity
                    className="px-4 py-3 flex-row items-center gap-3 active:bg-gray-50 dark:active:bg-gray-600 border-b border-gray-100 dark:border-gray-600"
                    onPress={handleOpenWith}
                  >
                    <ExternalLink
                      width={18}
                      height={18}
                      color={colorScheme === "dark" ? "#e5e7eb" : "#1f2937"}
                    />
                    <Text className="font-roboto-medium text-gray-800 dark:text-gray-200">
                      Open with
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="px-4 py-3 flex-row items-center gap-3 active:bg-gray-50 dark:active:bg-gray-600 border-b border-gray-100 dark:border-gray-600"
                    onPress={handleShare}
                  >
                    <Share2
                      width={18}
                      height={18}
                      color={colorScheme === "dark" ? "#e5e7eb" : "#1f2937"}
                    />
                    <Text className="font-roboto-medium text-gray-800 dark:text-gray-200">
                      Share
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowMenu(false)}
                    className="px-4 py-3 flex-row items-center gap-3 active:bg-gray-50 dark:active:bg-gray-600"
                  >
                    <Text className="font-roboto-medium text-red-600 dark:text-red-400">
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
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
