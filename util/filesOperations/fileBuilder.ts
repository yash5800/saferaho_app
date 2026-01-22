// import { userFilesMetadata } from "@/context/mainContext";
// import { decryptData } from "../cryptography";

// export const fileBuilder = async (
//   fileMetadata: userFilesMetadata,
//   masterKey,
// ) => {
//   try {
//     const Buffers: ArrayBuffer[] = [];

//     for (const chunk of fileMetadata.chunks) {
//       console.log("Building file chunk:", chunk);
//       const encryptedPart = await fetch(chunk.url).then((res) =>
//         res.arrayBuffer(),
//       );
//       Buffers.push(encryptedPart);
//     }

//     const encryptedFile = concat(Buffers);
//     const decryptedFile = await decrypt(encryptedFile, masterKey);
//   } catch (err) {
//     console.log("Error in fileBuilder:", err);
//     throw err;
//   }
// };
// function concat(Buffers: ArrayBuffer[]): ArrayBuffer {
//   const totalLength = Buffers.reduce((sum, buf) => sum + buf.byteLength, 0);
//   const temp = new Uint8Array(totalLength);
//   let offset = 0;
//   for (const buf of Buffers) {
//     temp.set(new Uint8Array(buf), offset);
//     offset += buf.byteLength;
//   }
//   return temp.buffer;
// }
