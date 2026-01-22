import { UserDataContext } from "@/context/mainContext";
import { showTabBar } from "@/lib/tabBarContoller";
import { SettingsProperties } from "@/Operations/Settings";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { ArrowLeft } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { AuthContext } from "./auth/Auth";

interface SettingsOverlayProps {
  sheetRef: React.RefObject<BottomSheet | null>;
}

const SettingsOverlay = ({ sheetRef }: SettingsOverlayProps) => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const { signOut } = React.useContext(AuthContext);
  const { userSettings } = React.useContext(UserDataContext);
  const snapPoints = useMemo(() => ["100%"], []);

  const scaleL = useSharedValue(colorScheme === "light" ? 1.2 : 1);
  const scaleD = useSharedValue(colorScheme === "dark" ? 1.2 : 1);

  const animateScaleL = useAnimatedStyle(() => {
    const scaleValue = interpolate(scaleL.value, [1, 1.2], [1, 1.2]);
    return {
      transform: [{ scale: scaleValue }],
    };
  });

  const animateScaleD = useAnimatedStyle(() => {
    const scaleValue = interpolate(scaleD.value, [1, 1.2], [1, 1.2]);
    return {
      transform: [{ scale: scaleValue }],
    };
  });

  const handleThemeChange = (theme: string) => {
    setColorScheme(theme as "light" | "dark" | "system");
    SettingsProperties.settheme(theme as "light" | "dark" | "system");
    if (theme === "light") {
      scaleD.value = withTiming(1, { duration: 250 }, () => {
        scaleL.value = withTiming(1.2, { duration: 250 });
      });
    } else {
      scaleL.value = withTiming(1, { duration: 250 }, () => {
        scaleD.value = withTiming(1.2, { duration: 250 });
      });
    }
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
      <BottomSheetView>
        {/* back header */}
        <View className="w-full flex-row justify-center items-center p-4">
          <TouchableOpacity
            className="absolute left-4 bg-white dark:bg-slate-700 rounded-full p-2"
            onPress={() => {
              showTabBar();
              sheetRef.current?.close();
            }}
          >
            <ArrowLeft color={colorScheme === "dark" ? "white" : "gray"} />
          </TouchableOpacity>
          <Text className="text-xl font-semibold dark:text-white">
            Settings
          </Text>
        </View>

        {/* Settings Container */}
        <View className="flex-1 justify-start items-center px-4 pb-8 mt-5">
          <View className="w-full rounded-3xl bg-white flex justify-start items-start p-6  dark:bg-[#1f1f1f]">
            <View className="w-full flex justify-between items-center flex-row">
              <View className="flex flex-col">
                <Text className="text-lg font-semibold dark:text-white">
                  Theme Mode
                </Text>
                <Text className="text-sm dark:text-gray-600">
                  Toggle the app appearance
                </Text>
              </View>
              <View className="flex-row justify-center items-center gap-3">
                <Animated.View
                  className={`p-3 bg-white border-[1px] rounded-full ${colorScheme === "light" && "border-green-300"}`}
                  onTouchStart={() => handleThemeChange("light")}
                  style={animateScaleL}
                />
                <Animated.View
                  className={`p-3 bg-[#181818] border-[1px] rounded-full ${colorScheme === "dark" && "border-green-300"}`}
                  onTouchStart={() => handleThemeChange("dark")}
                  style={animateScaleD}
                />
              </View>
              {/* <CustomSwitch
                active={colorScheme === "dark"}
                activeColor="#81b0ff"
                inActiveColor="#767577"
                onToggle={toggleTheme}
              /> */}
            </View>
          </View>

          <TouchableOpacity onPress={signOut}>
            <Text className="text-red-500 mt-6 text-lg font-semibold">
              SignOut
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

export default SettingsOverlay;
