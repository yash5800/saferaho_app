import { BlurView } from "@react-native-community/blur";
import { AlertTriangle, Info, XCircle } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}) => {
  const { colorScheme } = useColorScheme();
  const scaleValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const getIcon = () => {
    const iconColor =
      variant === "danger"
        ? "#dc2626"
        : variant === "warning"
          ? "#f59e0b"
          : "#3b82f6";

    switch (variant) {
      case "danger":
        return <XCircle width={48} height={48} color={iconColor} />;
      case "warning":
        return <AlertTriangle width={48} height={48} color={iconColor} />;
      case "info":
        return <Info width={48} height={48} color={iconColor} />;
    }
  };

  const getConfirmButtonColor = () => {
    switch (variant) {
      case "danger":
        return "bg-red-600 active:bg-red-700";
      case "warning":
        return "bg-amber-500 active:bg-amber-600";
      case "info":
        return "bg-blue-600 active:bg-blue-700";
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Pressable onPress={onCancel} style={StyleSheet.absoluteFill}>
        <View className="flex-1 justify-center items-center">
          <BlurView
            style={styles.absolute}
            blurType={colorScheme === "dark" ? "dark" : "light"}
            blurAmount={4}
            reducedTransparencyFallbackColor="white"
          />
          <Animated.View
            style={{
              transform: [{ scale: scaleValue }],
            }}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden mx-6"
                style={{ maxWidth: 360, minWidth: 320 }}
              >
                {/* Header with Icon */}
                <View className="items-center pt-8 pb-4 px-6">
                  <View className="mb-4">{getIcon()}</View>
                  <Text className="text-2xl font-roboto-bold text-gray-900 dark:text-white text-center mb-2">
                    {title}
                  </Text>
                  <Text className="text-base text-gray-600 dark:text-gray-300 text-center leading-6">
                    {message}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View className="border-t border-gray-200 dark:border-gray-700">
                  <View className="flex-row">
                    <TouchableOpacity
                      onPress={onCancel}
                      className="flex-1 py-4 items-center border-r border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
                    >
                      <Text className="font-roboto-bold text-base text-gray-700 dark:text-gray-300">
                        {cancelText}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        onConfirm();
                        onCancel();
                      }}
                      className={`flex-1 py-4 items-center ${getConfirmButtonColor()}`}
                    >
                      <Text className="font-roboto-bold text-base text-white">
                        {confirmText}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  absolute: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});
