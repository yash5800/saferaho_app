import { Plus } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface SecureNoteTagsProps {
  tags: string[];
  isDark: boolean;
  onAddTag?: () => void;
}

const SecureNoteTags = ({ tags, isDark, onAddTag }: SecureNoteTagsProps) => {
  return (
    <View className="bg-white dark:bg-[#14141b] rounded-3xl p-5 shadow-md">
      <Text className="text-xs uppercase tracking-widest text-purple-500 font-semibold mb-3">
        Tags
      </Text>

      <View className="flex-row flex-wrap gap-3">
        {tags.length > 0 ? (
          tags.map((tag, index) => (
            <View
              key={index}
              className="bg-purple-500/90 rounded-full px-4 py-1.5"
            >
              <Text className="text-white text-sm">{tag}</Text>
            </View>
          ))
        ) : (
          <Text className="text-slate-400 dark:text-slate-500 text-sm italic">
            No tags added
          </Text>
        )}

        {onAddTag && (
          <TouchableOpacity
            className="bg-slate-200 dark:bg-slate-700 rounded-full p-3"
            onPress={onAddTag}
          >
            <Plus size={18} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SecureNoteTags;
