import { getUserSubscriptionData } from "@/storage/mediators/system";
import FilesMetaService from "./FileMetaService";
import StorageService from "./StorageService";

class AccountServices {
  readonly files_meta: FilesMetaService;
  readonly storage: StorageService;

  constructor(accountId: string) {
    this.files_meta = new FilesMetaService(accountId);

    console.log(
      "FileMetaService initialized for accountId:",
      accountId,
      this.files_meta,
    );

    const plan_data = getUserSubscriptionData() ?? null;

    this.storage = new StorageService(this.files_meta, plan_data);
  }

  async init() {
    await this.files_meta.init();
  }
}

export default AccountServices;
