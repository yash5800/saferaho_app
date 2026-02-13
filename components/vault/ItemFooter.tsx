import { Text, View } from "react-native";

interface ItemFooterProps {
  updatedAt: string;
}

const ItemFooter = ({ updatedAt }: ItemFooterProps) => {
  return (
    <View className="items-center mt-4">
      <Text className="text-xs text-slate-400">
        Last edited • {new Date(updatedAt).toLocaleDateString()}
      </Text>
    </View>
  );
};

export default ItemFooter;
