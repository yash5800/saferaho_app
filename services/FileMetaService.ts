import { UserFilesMetadata } from "@/context/mainContext";
import {
  getFilePreviewMetadata,
  getFilesMetadata,
} from "@/util/filesOperations/filesGet";
import { EncryptedPreviewPayload } from "@/util/filesOperations/preview";

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
