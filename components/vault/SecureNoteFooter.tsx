import { Text, View } from "react-native";

interface SecureNoteFooterProps {
  updatedAt: string;
}

const SecureNoteFooter = ({ updatedAt }: SecureNoteFooterProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View className="items-center mt-4">
      <Text className="text-xs text-slate-400 mt-1">
        Last edited • {formatDate(updatedAt)}
      </Text>
    </View>
  );
};

export default SecureNoteFooter;
