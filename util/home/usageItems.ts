import { UserFilesMetadata } from "@/context/mainContext";
import { getExtensionFromMime } from "../openWith";

type category =
  | "videos"
  | "compressed"
  | "apps"
  | "photos"
  | "documents"
  | "audio"
  | "others";

function fileTypes(category: category) {
  switch (category) {
    case "videos":
      return ["mp4", "mov", "avi", "mkv"];
    case "photos":
      return ["png", "jpg", "jpeg", "svg", "gif"];
    case "apps":
      return ["apk", "exe", "dmg", "app"];
    case "documents":
      return ["pdf", "docx", "txt", "xlsx", "pptx"];
    case "audio":
      return ["mp3", "wav", "aac", "flac"];
    case "compressed":
      return ["zip", "rar", "7z", "tar"];
    default:
      return [];
  }
}

interface usageItemsFilterProps {
  userFilesMetadata: UserFilesMetadata[];
  usageItems: {
    percent?: number;
    size?: number;
    tab: string;
    name: string;
    icon: any;
    total: number;
  }[];
}

export const usageItemsFilter = (props: usageItemsFilterProps) => {
  const { userFilesMetadata, usageItems } = props;

  const tempValidator = {
    videos: {
      total: 0,
      size: 0,
    },
    compressed: {
      total: 0,
      size: 0,
    },
    apps: {
      total: 0,
      size: 0,
    },
    photos: {
      total: 0,
      size: 0,
    },
    documents: {
      total: 0,
      size: 0,
    },
    audio: {
      total: 0,
      size: 0,
    },
    others: {
      total: 0,
      size: 0,
    },
  };

  for (const item of userFilesMetadata) {
    const type = getExtensionFromMime(item.fileType);
    if (fileTypes("videos").includes(type)) {
      tempValidator.videos.total += 1;
      tempValidator.videos.size += item.fileSize;
    } else if (fileTypes("compressed").includes(type)) {
      tempValidator.compressed.total += 1;
      tempValidator.compressed.size += item.fileSize;
    } else if (fileTypes("apps").includes(type)) {
      tempValidator.apps.total += 1;
      tempValidator.apps.size += item.fileSize;
    } else if (fileTypes("photos").includes(type)) {
      tempValidator.photos.total += 1;
      tempValidator.photos.size += item.fileSize;
    } else if (fileTypes("documents").includes(type)) {
      tempValidator.documents.total += 1;
      tempValidator.documents.size += item.fileSize;
    } else if (fileTypes("audio").includes(type)) {
      tempValidator.audio.total += 1;
      tempValidator.audio.size += item.fileSize;
    } else {
      tempValidator.others.total += 1;
      tempValidator.others.size += item.fileSize;
    }
  }

  const totalUsedSize =
    tempValidator.videos.size +
    tempValidator.compressed.size +
    tempValidator.apps.size +
    tempValidator.photos.size +
    tempValidator.documents.size +
    tempValidator.audio.size +
    tempValidator.others.size;

  const updatedUsageItems = usageItems.map((item) => {
    let totalCount = 0;
    let totalSize = 0;
    switch (item.name) {
      case "Images":
        totalCount = tempValidator.photos.total;
        totalSize = tempValidator.photos.size;
        break;
      case "Videos":
        totalCount = tempValidator.videos.total;
        totalSize = tempValidator.videos.size;
        break;
      case "Documents":
        totalCount = tempValidator.documents.total;
        totalSize = tempValidator.documents.size;
        break;
      case "Music":
        totalCount = tempValidator.audio.total;
        totalSize = tempValidator.audio.size;
        break;
      case "Apps":
        totalCount = tempValidator.apps.total;
        totalSize = tempValidator.apps.size;
        break;
      case "Compressed":
        totalCount = tempValidator.compressed.total;
        totalSize = tempValidator.compressed.size;
        break;
      case "Others":
        totalCount = tempValidator.others.total;
        totalSize = tempValidator.others.size;
        break;
      case "Vault":
        totalCount = 0; // Assuming vault count is handled separately
        break;
    }

    const percent = totalUsedSize > 0 ? (totalSize / totalUsedSize) * 100 : 0;

    return {
      ...item,
      total: totalCount,
      size: totalSize,
      percent: Number(percent.toFixed(1)),
    };
  });

  return updatedUsageItems;
};
