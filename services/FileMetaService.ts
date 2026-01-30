// type category =
//   | "videos"
//   | "compressed"
//   | "apps"
//   | "photos"
//   | "documents"
//   | "audio"
//   | "others";

import { UserFilesMetadata } from "@/context/mainContext";
import {
  getFilePreviewMetadata,
  getFilesMetadata,
} from "@/util/filesOperations/filesGet";
import { EncryptedPreviewPayload } from "@/util/filesOperations/preview";

// function fileTypes(category: category) {
//   switch (category) {
//     case "videos":
//       return ["mp4", "mov", "avi", "mkv"];
//     case "photos":
//       return ["png", "jpg", "jpeg", "svg", "gif"];
//     case "apps":
//       return ["apk", "exe", "dmg", "app"];
//     case "documents":
//       return ["pdf", "docx", "txt", "xlsx", "pptx"];
//     case "audio":
//       return ["mp3", "wav", "aac", "flac"];
//     case "compressed":
//       return ["zip", "rar", "7z", "tar"];
//     default:
//       return [];
//   }
// }

// export interface FilesMetaServiceTypes {
//   refresh(): Promise<{
//     filesCache: UserFilesMetadata[];
//     previewMap: Record<string, EncryptedPreviewPayload>;
//     lastFetch: number;
//   }>;
//   getFilesData(): {
//     filesCache: UserFilesMetadata[];
//     previewMap: Record<string, EncryptedPreviewPayload>;
//     lastFetch: number;
//   };
// }

// class FilesMetaService implements FilesMetaServiceTypes {
//   private filesData: {
//     filesCache: UserFilesMetadata[];
//     previewMap: Record<string, EncryptedPreviewPayload>;
//     lastFetch: number;
//   } = {
//     filesCache: [],
//     previewMap: {},
//     lastFetch: 0,
//   };
//   private accountId: string;

//   constructor(accountId: string) {
//     this.accountId = accountId;
//   }

//   async init() {
//     await this.#fetchFilesMetadata();
//   }

//   async #fetchFilesMetadata() {
//     try {
//       const filesMetadata: UserFilesMetadata[] = await getFilesMetadata(
//         this.accountId,
//       );

//       const sortedFiles = filesMetadata.sort((a, b) => {
//         return (
//           new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime()
//         );
//       });
//       // console.log("Fetched files metadata:", filesMetadata); // Log the fetched data

//       const previewMetadata: EncryptedPreviewPayload[] =
//         await getFilePreviewMetadata(this.accountId);
//       // console.log("Fetched preview metadata:", previewMetadata); // Log the fetched preview data;
//       const previewMap: Record<string, EncryptedPreviewPayload> = {};

//       for (const item of previewMetadata) {
//         if (!item.fileId || !item.url) continue;
//         // console.log("Processing preview metadata item:", item);
//         previewMap[item.fileId] = item;
//       }

//       this.filesData = {
//         filesCache: sortedFiles || [],
//         previewMap: previewMap || {},
//         lastFetch: Date.now(),
//       };
//     } catch (error) {
//       console.error("Error fetching files metadata:", error); // Log any errors
//     }
//   }

//   async refresh() {
//     this.filesData = {
//       filesCache: [],
//       previewMap: {},
//       lastFetch: 0,
//     };

//     await this.#fetchFilesMetadata();

//     return this.filesData;
//   }

//   getFilesData() {
//     return this.filesData;
//   }
// }

// export default FilesMetaService;

class FilesMetaService {
  private filesData: {
    filesCache: UserFilesMetadata[];
    previewMap: Record<string, EncryptedPreviewPayload>;
    lastFetch: number;
  } = {
    filesCache: [],
    previewMap: {},
    lastFetch: 0,
  };

  constructor(private accountId: string) {}

  async init() {
    await this.#fetchFilesMetadata();
  }

  async #fetchFilesMetadata() {
    try {
      const filesMetadata: UserFilesMetadata[] = await getFilesMetadata(
        this.accountId,
      );

      const sortedFiles = filesMetadata.sort((a, b) => {
        return (
          new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime()
        );
      });

      const previewMetadata: EncryptedPreviewPayload[] =
        await getFilePreviewMetadata(this.accountId);
      const previewMap: Record<string, EncryptedPreviewPayload> = {};

      for (const item of previewMetadata) {
        if (!item.fileId || !item.url) continue;
        previewMap[item.fileId] = item;
      }

      this.filesData = {
        filesCache: sortedFiles || [],
        previewMap: previewMap || {},
        lastFetch: Date.now(),
      };
    } catch (error) {
      console.error("Error fetching files metadata:", error);
    }
  }

  async refresh() {
    await this.#fetchFilesMetadata();
    return this.filesData;
  }

  getFiles() {
    return this.filesData.filesCache;
  }

  getPreviewMap() {
    return this.filesData.previewMap;
  }

  getLastFetch() {
    return this.filesData.lastFetch;
  }
}

export default FilesMetaService;
