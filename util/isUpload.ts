let isUploading = false;

export function isUploadingInProgress() {
  return isUploading;
}

export function setUploadingInProgress(value: boolean) {
  isUploading = value;
}
