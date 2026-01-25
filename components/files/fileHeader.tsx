import { categeryType } from "@/app/(protected)/(tabs)/files";
import {
  File,
  Heart,
  Image,
  Music,
  SearchIcon,
  SettingsIcon,
  Video,
} from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface FileHeaderProps {
  colorScheme: "light" | "dark" | undefined;
  handleSettings: () => void;
  handleUpload: () => void;
  category: "photos" | "videos" | "documents" | "audio" | "others";
  setCategory: React.Dispatch<
    React.SetStateAction<"photos" | "videos" | "documents" | "audio" | "others">
  >;
}

const categoryList = [
  {
    title: "photos",
    icon: (props: any) => <Image size={16} color="#000" {...props} />,
  },
  {
    title: "videos",
    icon: (props: any) => <Video size={16} color="#000" {...props} />,
  },
  {
    title: "documents",
    icon: (props: any) => <File size={16} color="#000" {...props} />,
  },
  {
    title: "audio",
    icon: (props: any) => <Music size={16} color="#000" {...props} />,
  },
  {
    title: "others",
    icon: (props: any) => <Heart size={16} color="#000" {...props} />,
  },
];

const FileHeader = ({
  colorScheme,
  handleSettings,
  handleUpload,
  category,
  setCategory,
}: FileHeaderProps) => {
  return (
    <>
      {/* Header */}
      <View className="flex flex-row justify-between px-4 pt-4">
        <Text className="text-2xl font-roboto-bold dark:text-white">Files</Text>
        <View className="flex flex-row gap-3">
          <TouchableOpacity>
            <SearchIcon
              size={24}
              color={colorScheme === "dark" ? "#fff" : "#222"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSettings}>
            <SettingsIcon
              size={24}
              color={colorScheme === "dark" ? "#fff" : "#222"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        className="mt-4 mx-4 mb-2 px-4 py-2 bg-blue-600 rounded-full items-center"
        onPress={handleUpload}
      >
        <Text className="text-white font-medium">Upload Files</Text>
      </TouchableOpacity>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <View className="mt-6 flex flex-row gap-3 mb-5">
          {categoryList.map((catItem) => (
            <TouchableOpacity
              key={catItem.title}
              className={`flex flex-row items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow
              ${
                category === catItem.title
                  ? colorScheme === "dark"
                    ? "border border-white"
                    : "border border-black"
                  : ""
              }`}
              onPress={() => setCategory(catItem.title as categeryType)}
            >
              {catItem.icon({
                color: colorScheme === "dark" ? "#fff" : "#000",
              })}
              <Text className="text-sm dark:text-white">{catItem.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </>
  );
};

export default FileHeader;
