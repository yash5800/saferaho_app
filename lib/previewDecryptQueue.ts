// import { previewCache, previewLoading } from "./previewCache";

// const MAX_CONCURRENT_DECRYPTS = 3;

// let activeDecrypts = 0;
// const decryptQueue: string[] = [];

// async function processDecryptQueue() {
//   if (activeDecrypts >= MAX_CONCURRENT_DECRYPTS) return;
//   if (decryptQueue.length === 0) return;

//   const fileId = decryptQueue.shift()!;
//   activeDecrypts++;
//   previewLoading.add(fileId);

//   try {
//     await decryptAndCachePreview(fileId);
//   } catch (e) {
//     console.error("Preview decrypt failed:", fileId, e);
//   } finally {
//     previewLoading.delete(fileId);
//     activeDecrypts--;
//     processDecryptQueue(); // continue
//   }
// }

// export function requestPreviewDecrypt(fileId: string) {
//   if (previewCache.has(fileId)) return;
//   if (previewLoading.has(fileId)) return;
//   if (decryptQueue.includes(fileId)) return;

//   decryptQueue.push(fileId);
//   processDecryptQueue();
// }
