import { CryptoContext } from "@/components/crypto/Crypto";
import { RainProgressBar } from "@/components/RainProgressBar";
import { showTabBar } from "@/lib/tabBarContoller";
import {
  generateRandomId,
  uploadFilesSequentially,
} from "@/util/filesOperations/fileChunker";
import { pickFile } from "@/util/filesOperations/filePicker";
import { formatSize } from "@/util/filesOperations/fileSize";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { ArrowLeft } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useContext, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type UserFiles = {
  id: string;
  file: {
    name: string;
    size: number;
    uri: string;
    type: string;
  };
  totalChunks: number;
  progress: number;
  status: "encrypting" | "uploading" | "completed" | "error" | "pending";
};

const smapleProgress: UserFiles[] = [
  {
    id: "1",
    file: {
      name: "example1.txt",
      size: 1024,
      uri: "file:///example1.txt",
      type: "text/plain",
    },
    totalChunks: 5,
    progress: 20,
    status: "encrypting",
  },
  {
    id: "2",
    file: {
      name: "example2.jpg",
      size: 2048,
      uri: "file:///example2.jpg",
      type: "image/jpeg",
    },
    totalChunks: 10,
    progress: 50,
    status: "uploading",
  },
  {
    id: "3",
    file: {
      name: "example3.pdf",
      size: 4096,
      uri: "file:///example3.pdf",
      type: "application/pdf",
    },
    totalChunks: 8,
    progress: 100,
    status: "completed",
  },
  {
    id: "4",
    file: {
      name: "example4.mp4",
      size: 8192,
      uri: "file:///example4.mp4",
      type: "video/mp4",
    },
    totalChunks: 12,
    progress: 75,
    status: "error",
  },
  {
    id: "5",
    file: {
      name: "example5.docx",
      size: 5120,
      uri: "file:///example5.docx",
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
    totalChunks: 6,
    progress: 0,
    status: "pending",
  },
];

const statusStyles = {
  pending: "bg-gray-200 dark:bg-gray-500 text-gray-700 dark:text-gray-300",
  encrypting:
    "bg-yellow-200 dark:bg-yellow-600 text-yellow-800 dark:text-yellow-200",
  uploading: "bg-blue-200 dark:bg-blue-600 text-blue-800 dark:text-blue-200",
  completed:
    "bg-green-200 dark:bg-green-600 text-green-800 dark:text-green-200",
  error: "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200",
};

const filesFormater = (
  files: { name: string; size: number; uri: string; type: string }[],
): UserFiles[] =>
  files.map((file) => ({
    id: generateRandomId(),
    file,
    totalChunks: 0,
    progress: 0,
    status: "pending" as UserFiles["status"],
  }));

interface SettingsOverlayProps {
  sheetRef: React.RefObject<BottomSheet | null>;
}

const UploadOverlay = ({ sheetRef }: SettingsOverlayProps) => {
  const snapPoints = useMemo(() => ["100%"], []);
  const { colorScheme } = useColorScheme();
  const { masterKey } = useContext(CryptoContext);
  const [uplodedFiles, setUploadedFiles] = useState<UserFiles[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async () => {
    setIsUploading(true);
    setUploadedFiles([]);

    const filesMetadata = await pickFile();
    if (!filesMetadata || !masterKey) {
      setIsUploading(false);
      return;
    }

    const formatted = filesFormater(filesMetadata);
    setUploadedFiles(formatted);

    await uploadFilesSequentially(masterKey, setUploadedFiles, formatted);
    setIsUploading(false);
  };

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      index={-1}
      enablePanDownToClose={false}
      enableHandlePanningGesture={false}
      enableContentPanningGesture={false}
      backgroundStyle={{
        backgroundColor: colorScheme === "dark" ? "#181818" : "#f3f4f6",
      }}
      handleIndicatorStyle={{
        display: "none",
      }}
    >
      <BottomSheetScrollView className="w-full px-4 pt-6">
        {/* Back header */}
        <View className="gap-3 flex-row justify-center items-center relative">
          <TouchableOpacity
            className="absolute left-0 bg-white dark:bg-slate-700 rounded-full p-2"
            onPress={() => {
              showTabBar();
              sheetRef.current?.close();
            }}
          >
            <ArrowLeft color={colorScheme === "dark" ? "white" : "gray"} />
          </TouchableOpacity>
          <Text className="text-xl font-semibold dark:text-white">
            Upload Files
          </Text>
        </View>

        {/* Description */}
        <Text className="text-center text-gray-600 dark:text-gray-400 mt-5">
          Select files to encrypt and upload to your secure storage.
        </Text>

        {/* Select Button */}
        <TouchableOpacity
          disabled={isUploading}
          onPress={handleFileSelect}
          className={`mb-6 rounded-xl py-4 items-center mt-5 ${
            isUploading
              ? "bg-gray-300 dark:bg-gray-700"
              : "bg-black dark:bg-white"
          }`}
        >
          {isUploading ? (
            <>
              <RainProgressBar
                progress={
                  uplodedFiles.reduce((acc, file) => acc + file.progress, 0) /
                  (uplodedFiles.length || 1)
                }
                width={150}
                height={10}
                colors={["#00f5d4", "#3a86ff", "#8338ec", "#06ffa5", "#48cae4"]}
              />
              <Text className="font-medium text-gray-500 mt-2">
                Uploading...
              </Text>
            </>
          ) : (
            <Text className="font-medium text-white dark:text-black">
              Select Files
            </Text>
          )}
        </TouchableOpacity>

        {/* Files List */}
        <View className="gap-4 pb-16">
          {uplodedFiles.map((file) => (
            <View
              key={file.id}
              className="rounded-2xl p-4 bg-gray-100 dark:bg-[#1c1c1c]"
            >
              {/* Top Row */}
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-1 pr-2">
                  <Text
                    className="dark:text-white font-medium"
                    numberOfLines={1}
                  >
                    {file.file.name}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {formatSize(file.file.size)}
                  </Text>
                </View>

                {/* Status Badge */}
                <View
                  className={`px-3 py-1 rounded-full ${
                    statusStyles[file.status]
                  }`}
                >
                  <Text className="text-xs font-medium capitalize">
                    {file.status}
                  </Text>
                </View>
              </View>

              {/* Progress */}
              <RainProgressBar progress={file.progress} width={250} />

              {/* Footer */}
              <View className="flex-row justify-between mt-2">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {file.progress}% completed
                </Text>
                {file.totalChunks > 0 && (
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {file.totalChunks} chunks
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default UploadOverlay;
