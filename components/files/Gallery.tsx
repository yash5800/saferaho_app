import { FilesContext, userFilesMetadata } from "@/context/mainContext";
import { previewCache, previewLoading, setPreview } from "@/lib/previewCache";
import { buildPreviewImage } from "@/util/filesOperations/preview";
import { FlashList } from "@shopify/flash-list";
import { useContext, useEffect, useRef, useState } from "react";
import { CryptoContext } from "../crypto/Crypto";
import FilePreview from "./filePreview";

const Gallery = () => {
  const { previewsByFieldId, userFilesMetadata } = useContext(FilesContext);
  const { masterKey } = useContext(CryptoContext);

  const [galleryFiles, setGalleryFiles] = useState<userFilesMetadata[]>([]);
  const previewsRef = useRef(previewsByFieldId);

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

  useEffect(() => {
    const filteredFiles = userFilesMetadata.filter(
      (file) =>
        previewsByFieldId[file._id] && file.fileType?.startsWith("image/"),
    );

    setGalleryFiles(filteredFiles);

    // 🔥 use filteredFiles directly (not state)
    filteredFiles.forEach((file) => {
      requestPreviewDecrypt(file._id);
    });
  }, [previewsByFieldId, userFilesMetadata, masterKey]);

  return (
    <FlashList
      data={galleryFiles}
      numColumns={3}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <FilePreview fileId={item._id} />}
      scrollEventThrottle={16}
      contentContainerStyle={{ padding: 5 }}
    />
  );
};

export default Gallery;
