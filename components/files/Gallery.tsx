import { categeryType } from "@/app/(protected)/(tabs)/files";
import { UserDataContext, UserFilesMetadata } from "@/context/mainContext";
import { hideFloating, showFloating } from "@/lib/floatingContoller";
import { previewCache, previewLoading, setPreview } from "@/lib/previewCache";
import { hideTabBar, showTabBar } from "@/lib/tabBarContoller";
import { buildPreviewImage } from "@/util/filesOperations/preview";
import { FlashList } from "@shopify/flash-list";
import { Search } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useContext, useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { CryptoContext } from "../crypto/Crypto";
import FileDoc from "./fileDoc";
import FilePreview from "./filePreview";
import FullItem from "./fullItem";

const fileTypes = {
  photos: ["image/"],
  videos: ["video/"],
  audio: ["audio/"],

  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
  ],

  compressed: [
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/gzip",
  ],

  apps: ["application/vnd.android.package-archive"],

  others: [],
} as const;

const matchesMime = (mime: string, list: readonly string[]) =>
  list.some((m) => mime.startsWith(m));

interface GalleryProps {
  ListHeaderComponent: React.ComponentType<any> | null;
  scrollHandler: any;
  category: categeryType;
  handleReload: () => void;
  refreshing?: boolean;
}

const Gallery = ({
  ListHeaderComponent,
  scrollHandler,
  handleReload,
  refreshing,
  category,
}: GalleryProps) => {
  const { previewsByFieldId, userFilesMetadata } = useContext(UserDataContext);
  const { masterKey } = useContext(CryptoContext);
  const { colorScheme } = useColorScheme();

  const [galleryFiles, setGalleryFiles] = useState<UserFilesMetadata[]>([]);
  const [selectedItem, setSelectedItem] = useState<UserFilesMetadata | null>(
    null,
  );

  const previewsRef = useRef(previewsByFieldId);

  /*  cache reset  */
  // useEffect(() => {
  //   previewCache.clear();
  //   previewLoading.clear();
  // }, [category]);

  useEffect(() => {
    previewsRef.current = previewsByFieldId;
    console.log(
      "Updated previewsRef with new previewsByFieldId",
      previewsByFieldId,
    );
  }, [previewsByFieldId]);

  /*  preview decrypt logic  */
  const decryptAndCachePreview = async (fileId: string) => {
    console.log("masterKey available:", masterKey);
    if (!masterKey) return;

    console.log("Starting preview decrypt for fileId:", fileId);

    const previewMetadata = previewsRef.current[fileId];
    if (!previewMetadata) return;

    console.log("Decrypting preview for fileId:", fileId);

    try {
      const base64Preview = await buildPreviewImage(previewMetadata, masterKey);
      setPreview(fileId, base64Preview);
    } catch (err) {
      console.error("Preview decrypt failed:", fileId, err);
    }
  };

  const requestPreviewDecrypt = async (fileId: string) => {
    if (previewCache.has(fileId) || previewLoading.has(fileId)) return;

    previewLoading.add(fileId);

    console.log("Requesting preview decrypt for fileId:", fileId);
    try {
      await decryptAndCachePreview(fileId);
    } finally {
      previewLoading.delete(fileId);
    }
  };

  const evictInvisiblePreviews = (visibleIds: string[]) => {
    for (const fileId of previewCache.keys()) {
      if (!visibleIds.includes(fileId)) {
        previewCache.delete(fileId);
      }
    }
  };

  /*  viewability handler  */
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (category !== "photos" && category !== "videos") return;

      viewableItems.forEach((v) => {
        const fileId = v.item?._id;
        if (fileId) requestPreviewDecrypt(fileId);
      });

      const visibleIds = viewableItems
        .map((v) => v.item?._id)
        .filter((id) => id !== undefined);
      evictInvisiblePreviews(visibleIds as string[]);
    },
  ).current;

  // /*  initial preview requests  */
  // for (const file of galleryFiles) {
  //   requestPreviewDecrypt(file._id);
  // }

  /*  FILTER FILES  */
  useEffect(() => {
    const filtered = userFilesMetadata
      .filter((file) => {
        const mime = file.fileType ?? "";

        switch (category) {
          case "photos":
            return matchesMime(mime, fileTypes.photos);

          case "videos":
            return matchesMime(mime, fileTypes.videos);

          case "audio":
            return matchesMime(mime, fileTypes.audio);

          case "documents":
            return matchesMime(mime, fileTypes.documents);

          case "compressed":
            return matchesMime(mime, fileTypes.compressed);

          case "apps":
            return matchesMime(mime, fileTypes.apps);

          case "others":
            return !(
              matchesMime(mime, fileTypes.photos) ||
              matchesMime(mime, fileTypes.videos) ||
              matchesMime(mime, fileTypes.audio) ||
              matchesMime(mime, fileTypes.documents) ||
              matchesMime(mime, fileTypes.compressed) ||
              matchesMime(mime, fileTypes.apps)
            );

          default:
            return false;
        }
      })
      .sort((a, b) => b._createdAt.localeCompare(a._createdAt));

    setGalleryFiles(filtered);
  }, [userFilesMetadata, category]);

  /*  full item modal  */
  const scaleFull = useSharedValue(0);

  const animatedFullStyle = useAnimatedStyle(() => ({
    opacity: scaleFull.value,
    transform: [{ scale: 0.95 + scaleFull.value * 0.05 }],
  }));

  const openFullItem = (item: UserFilesMetadata) => {
    setSelectedItem(item);
    scaleFull.value = withTiming(1, { duration: 250 });
    hideTabBar();
    hideFloating();
  };

  const closeFullItem = () => {
    scaleFull.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(setSelectedItem)(null);
    });
    showTabBar();
    showFloating();
  };

  /*  UI  */
  return (
    <>
      <FlashList
        key={category}
        data={galleryFiles}
        numColumns={category === "photos" || category === "videos" ? 3 : 1}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) =>
          category === "photos" || category === "videos" ? (
            <FilePreview
              fileId={item._id}
              category={category}
              onPress={() => openFullItem(item)}
            />
          ) : (
            <FileDoc
              item={item}
              category={category}
              onPress={() => openFullItem(item)}
            />
          )
        }
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20 px-6">
            <Search
              size={64}
              color={colorScheme === "dark" ? "#9ca3af" : "#d1d5db"}
            />
            <Text className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-400">
              Nothing found
            </Text>
            <Text className="mt-2 text-center text-sm text-gray-500 dark:text-gray-500">
              No {category === "others" ? "files" : category} yet.
              {"\n"}Upload files to get started!
            </Text>
          </View>
        }
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 30 }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshing={refreshing}
        onRefresh={handleReload}
        contentContainerStyle={{ paddingHorizontal: 2 }}
      />

      {selectedItem && (
        <FullItem
          item={selectedItem}
          category={category}
          onClose={closeFullItem}
          animatedItem={animatedFullStyle}
        />
      )}
    </>
  );
};

export default Gallery;
