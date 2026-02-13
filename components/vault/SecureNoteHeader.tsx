import { ArrowLeft, Edit, FileText } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface SecureNoteHeaderProps {
  title: string;
  isDark: boolean;
  onBack: () => void;
  editItem: () => void;
}

const SecureNoteHeader = ({
  title,
  isDark,
  onBack,
  editItem,
}: SecureNoteHeaderProps) => {
  return (
    <View className="px-5 pt-4 mb-6 flex-row items-center gap-4">
      <TouchableOpacity
        className="bg-white dark:bg-slate-800 rounded-full p-2 shadow-sm"
        onPress={onBack}
      >
        <ArrowLeft color={isDark ? "#fff" : "#444"} />
      </TouchableOpacity>

      <View className="flex-row items-center gap-3 flex-1">
        <View className="w-10 h-10 rounded-xl bg-purple-500/20 items-center justify-center">
          <FileText size={20} color="#a855f7" />
        </View>
        <Text
          numberOfLines={1}
          className="text-2xl font-roboto-bold text-neutral-900 dark:text-white flex-1"
        >
          {title}
        </Text>
      </View>
      <TouchableOpacity
        className="bg-white absolute right-5 dark:bg-slate-800 rounded-full p-2 shadow-sm"
        onPress={editItem}
      >
        <Edit size={20} color={isDark ? "#fff" : "#444"} />
      </TouchableOpacity>
    </View>
  );
};

export default SecureNoteHeader;
