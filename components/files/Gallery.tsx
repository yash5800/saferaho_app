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

interface GalleryProps {
  ListHeaderComponent: React.ComponentType<any> | null;
  category: categeryType;
  scrollHandler: any;
  handleReload: () => void;
  refreshing?: boolean;
}

const fileTypes = {
  photos: "image/",
  videos: "video/",
  documents: "application/",
  audio: "audio/",
  others: "other/",
};

const Gallery = ({
  ListHeaderComponent,
  category,
  scrollHandler,
  handleReload,
  refreshing,
}: GalleryProps) => {
  const { previewsByFieldId, userFilesMetadata, reload } =
    useContext(UserDataContext);
  const { masterKey } = useContext(CryptoContext);
  const { colorScheme } = useColorScheme();

  const [galleryFiles, setGalleryFiles] = useState<UserFilesMetadata[]>([]);
  const [selectedItem, setSelectedItem] = useState<UserFilesMetadata | null>(
    null,
  );
  const previewsRef = useRef(previewsByFieldId);

  useEffect(() => {
    previewCache.clear();
    previewLoading.clear();
  }, [category]);

  useEffect(() => {
    previewsRef.current = previewsByFieldId;
  }, [previewsByFieldId]);

  const decryptAndCachePreview = async (fileId: string) => {
    if (!masterKey) return;

    const previewMetadata = previewsRef.current[fileId];
    if (!previewMetadata) return;

    try {
      const base64Preview = await buildPreviewImage(previewMetadata, masterKey);
      setPreview(fileId, base64Preview);
    } catch (error) {
      console.error("Preview decrypt failed:", fileId, error);
    }
  };

  const requestPreviewDecrypt = async (fileId: string) => {
    if (previewCache.has(fileId) || previewLoading.has(fileId)) return;

    previewLoading.add(fileId);
    try {
      await decryptAndCachePreview(fileId);
    } finally {
      previewLoading.delete(fileId);
    }
  };

  function evictInvisiblePreviews(visibleFileIds: string[]) {
    for (const fileId of previewCache.keys()) {
      if (!visibleFileIds.includes(fileId)) {
        previewCache.delete(fileId);
      }
    }
  }

  // 👀 Viewability handler
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      viewableItems.forEach((item) => {
        const fileId = item.item?._id;
        if (!fileId) return;

        if (category !== "photos" && category !== "videos") return;
        requestPreviewDecrypt(fileId);
      });

      // 🧹 evict old previews
      const visibleIds = viewableItems.map((v) => v.item?._id).filter(Boolean);

      evictInvisiblePreviews(visibleIds);
    },
  ).current;

  useEffect(() => {
    const filteredFiles = userFilesMetadata
      .filter((file) => {
        switch (category) {
          case "photos":
            return (
              file.fileType.startsWith(fileTypes.photos) &&
              previewsByFieldId[file._id]
            );
          case "videos":
            return (
              file.fileType.startsWith(fileTypes.videos) &&
              previewsByFieldId[file._id]
            );
          case "documents":
            return file.fileType.startsWith(fileTypes.documents);
          case "audio":
            return file.fileType.startsWith(fileTypes.audio);
          case "others":
            return (
              !file.fileType.startsWith(fileTypes.photos) &&
              !file.fileType.startsWith(fileTypes.videos) &&
              !file.fileType.startsWith(fileTypes.documents) &&
              !file.fileType.startsWith(fileTypes.audio)
            );
          default:
            return false;
        }
      })
      .sort((a, b) => b._createdAt.localeCompare(a._createdAt));

    setGalleryFiles(filteredFiles);
  }, [previewsByFieldId, userFilesMetadata, category]);

  const scaleFull = useSharedValue(0);

  const animateFullItem = useAnimatedStyle(() => {
    return {
      opacity: scaleFull.value,
      transform: [{ scale: 0.95 + scaleFull.value * 0.05 }],
    };
  });

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

  return (
    <>
      <FlashList
        data={galleryFiles}
        numColumns={category === "photos" || category === "videos" ? 3 : 1}
        extraData={category}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          if (
            (category === "photos" || category === "videos") &&
            !previewCache.has(item._id)
          ) {
            requestPreviewDecrypt(item._id);
          }
          return category === "photos" || category === "videos" ? (
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
          );
        }}
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
              No {category === "others" ? "files" : category} in this category
              yet.
              {"\n"}Upload some files to get started!
            </Text>
          </View>
        }
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 30 }}
        contentContainerStyle={{
          paddingHorizontal: 2,
          position: "relative",
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshing={false}
        onRefresh={handleReload}
      />
      {selectedItem && (
        <FullItem
          item={selectedItem}
          category={category}
          onClose={closeFullItem}
          animatedItem={animateFullItem}
        />
      )}
    </>
  );
};

export default Gallery;
