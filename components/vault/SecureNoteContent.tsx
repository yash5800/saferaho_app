import * as Clipboard from "expo-clipboard";
import { Copy } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface SecureNoteContentProps {
  content: string;
  isDark: boolean;
}

const SecureNoteContent = ({ content, isDark }: SecureNoteContentProps) => {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(content);
    // You can add a toast notification here
  };

  return (
    <View className="bg-white dark:bg-[#14141b] rounded-3xl p-5 shadow-md">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xs uppercase tracking-widest text-purple-500 font-semibold">
          Content
        </Text>
        <TouchableOpacity
          onPress={handleCopy}
          className="bg-purple-500/10 rounded-full p-2"
          activeOpacity={0.7}
        >
          <Copy size={16} color="#a855f7" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 max-h-96"
        showsVerticalScrollIndicator={true}
      >
        <Text className="text-base text-slate-700 dark:text-slate-300 leading-6">
          {content || "No content"}
        </Text>
      </ScrollView>
    </View>
  );
};

export default SecureNoteContent;
