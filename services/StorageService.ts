import { UserPlanType } from "@/types/userPlan";
import FilesMetaService from "./FileMetaService";

class StorageService {
  private storageUsedGB: number = 0;
  private refreshing: boolean = false;

  constructor(
    private files_meta: FilesMetaService,
    private plan_data: UserPlanType | null,
  ) {}

  async calcStorageUsed() {
    if (this.refreshing) return;
    this.refreshing = true;

    await this.files_meta.refresh();
    const files = this.files_meta.getFiles();

    let totalBytes = 0;
    for (const file of files) {
      totalBytes += file.fileSize ?? 0;
    }

    this.storageUsedGB = totalBytes / 1024 ** 3;
    this.refreshing = false;
  }

  async getUsedGB() {
    await this.calcStorageUsed();
    return this.storageUsedGB;
  }

  async getLeftGB() {
    if (!this.plan_data) return 0;

    return this.plan_data.storage_limit_gb - (await this.getUsedGB());
  }
}

export default StorageService;
