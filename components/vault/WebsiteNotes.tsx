import { Text, View } from "react-native";

interface WebsiteNotesProps {
  notes?: string;
}

const WebsiteNotes = ({ notes }: WebsiteNotesProps) => {
  return (
    <View className="bg-white dark:bg-[#14141b] rounded-3xl p-5 shadow-md">
      <Text className="text-xs uppercase tracking-widest text-purple-500 font-semibold mb-2">
        Notes
      </Text>
      <Text className="text-base text-slate-700 dark:text-slate-300">
        {notes || "No notes added"}
      </Text>
    </View>
  );
};

export default WebsiteNotes;
