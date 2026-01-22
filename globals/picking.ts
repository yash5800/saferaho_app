let pickingInProgress = false;

export function isPickingInProgress() {
  return pickingInProgress;
}

export function setPickingInProgress(value: boolean) {
  pickingInProgress = value;
}
