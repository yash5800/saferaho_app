export const previewLoading = new Set<string>();

type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();
export const previewCache = new Map<string, string>();

export function subscribePreview(fileId: string, cb: Listener) {
  if (!listeners.has(fileId)) {
    listeners.set(fileId, new Set());
  }
  listeners.get(fileId)!.add(cb);

  // unsubscribe
  return () => {
    listeners.get(fileId)?.delete(cb);
  };
}

export function setPreview(fileId: string, data: string) {
  previewCache.set(fileId, data);

  // 🔔 notify only listeners of this file
  listeners.get(fileId)?.forEach((cb) => cb());
}
