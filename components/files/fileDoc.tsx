import { categeryType } from "@/app/(protected)/(tabs)/files";
import { userFilesMetadata } from "@/context/mainContext";
import { csv, doc, music, pdf, xls, zip } from "@/lib/icons";
import { formatSize } from "@/util/filesOperations/fileSize";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface FileDocProps {
  item: userFilesMetadata;
  category: categeryType;
  onPress?: () => void;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formateTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const FileDoc = ({ item, category, onPress }: FileDocProps) => {
  const extension = item.filename.split(".").pop()?.toLowerCase() ?? "";

  const icon = () => {
    if (extension === "pdf") return pdf;
    if (extension === "docx" || extension === "doc") return doc;
    if (extension === "xlsx" || extension === "excel") return xls;
    if (extension === "csv") return csv;
    if (extension === "zip") return zip;
    if (category === "audio") return music;
    return doc;
  };

  return (
    <TouchableOpacity
      className="mx-2 my-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg shadow-black/10 dark:border-gray-700 dark:bg-[#303030] dark:shadow-black/30"
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <View className="mr-4 h-14 w-14 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#3E3E3E]">
          <Image source={icon()} style={{ width: 44, height: 44 }} />
        </View>

        <View className="flex-1">
          <Text
            className="text-base font-semibold text-gray-900 dark:text-white"
            numberOfLines={1}
          >
            {item.filename}
          </Text>
          <Text
            className="mt-1 text-sm text-gray-600 dark:text-gray-400"
            numberOfLines={1}
          >
            {item._createdAt && formatDate(item._createdAt)}
          </Text>

          <View className="mt-2 flex-row items-center gap-2">
            <View className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-700">
              <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {formatSize(item.fileSize)}
              </Text>
            </View>
            <View className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-700">
              <Text className="text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                {extension || "file"}
              </Text>
            </View>
            {category === "audio" && item.duration && (
              <View className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-700">
                <Text className="text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  {formateTime(item.duration)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FileDoc;
