export function sizeConverterFromBytes(sizeInBytes: number): string {
  const units = ["B", "KiB", "MiB", "GiB", "TiB"]; // Binary unit symbols
  const factor = 1024;

  if (sizeInBytes === 0) return "0 B";
  if (sizeInBytes < 0) return "Invalid size";

  // Determine the correct unit level (0: B, 1: KiB, 2: MiB, etc.)
  const i = Math.floor(Math.log(sizeInBytes) / Math.log(factor));

  // Limit units to what is defined in the array
  const unitIndex = Math.min(i, units.length - 1);

  // Calculate final value
  const value = sizeInBytes / Math.pow(factor, unitIndex);

  return `${value.toFixed(2)} ${units[unitIndex]}`;
}
