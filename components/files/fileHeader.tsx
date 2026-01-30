import { categeryType } from "@/app/(protected)/(tabs)/files";
import {
  AppWindow,
  File,
  FileArchive,
  Heart,
  Image,
  Music,
  Search,
  Settings,
  Video,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface FileHeaderProps {
  handleSettings: () => void;
  category: categeryType;
  setCategory: (category: categeryType) => void;
}

interface Category {
  title: categeryType;
  icon: React.ComponentType<{ size: number; color: string }>;
}

const FileHeader = ({
  handleSettings,
  category,
  setCategory,
}: FileHeaderProps) => {
  const [categoryList, setCategoryList] = React.useState<Category[]>([
    { title: "photos", icon: Image },
    { title: "videos", icon: Video },
    { title: "documents", icon: File },
    { title: "audio", icon: Music },
    { title: "apps", icon: AppWindow },
    { title: "compressed", icon: FileArchive },
    { title: "others", icon: Heart },
  ]);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    if (category) {
      setCategoryList((prev) => {
        const selected = prev.find((cat) => cat.title === category);
        if (!selected) return prev;

        return [selected, ...prev.filter((cat) => cat.title !== category)];
      });
    }
  }, [category]);

  return (
    <>
      {/*  Header */}
      <View className="flex-row items-center justify-between px-4 pt-4">
        <Text className="text-2xl font-roboto-bold text-neutral-900 dark:text-white">
          Files
        </Text>

        <View className="flex-row gap-2">
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 items-center justify-center"
          >
            <Search size={18} color={isDark ? "#fff" : "#111"} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSettings}
            className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 items-center justify-center"
          >
            <Settings size={18} color={isDark ? "#fff" : "#111"} />
          </TouchableOpacity>
        </View>
      </View>

      {/*  Categories  */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        className="mt-5"
      >
        <View className="flex-row gap-2 mb-4">
          {categoryList.map((cat) => {
            const Icon = cat.icon;
            const active = category === cat.title;

            return (
              <TouchableOpacity
                key={cat.title}
                activeOpacity={0.85}
                onPress={() => setCategory(cat.title)}
                className={`
                  flex-row items-center gap-2 px-4 py-2 rounded-full
                  ${
                    active
                      ? "bg-neutral-900 dark:bg-white"
                      : "bg-neutral-100 dark:bg-neutral-800"
                  }
                `}
              >
                <Icon
                  size={14}
                  color={
                    active
                      ? isDark
                        ? "#000"
                        : "#fff"
                      : isDark
                        ? "#fff"
                        : "#111"
                  }
                />

                <Text
                  className={`
                    text-sm capitalize
                    ${
                      active
                        ? isDark
                          ? "text-black"
                          : "text-white"
                        : "text-neutral-700 dark:text-neutral-300"
                    }
                  `}
                >
                  {cat.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
};

export default FileHeader;
