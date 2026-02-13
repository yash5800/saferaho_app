import SecureNoteTemplate, {
  SecureNoteTemplateState,
} from "@/components/vault/SecureNoteTemplate";
import WebsiteTemplate, {
  WebsiteTemplateState,
} from "@/components/vault/WebsiteTemplate";
import { showFloating } from "@/lib/floatingContoller";
import { showTabBar } from "@/lib/tabBarContoller";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Save } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface VaultItemsOverlayProps {
  sheetRef: React.RefObject<BottomSheet | null>;
}

const VaultItemsOverlay = ({ sheetRef }: VaultItemsOverlayProps) => {
  const [websiteDetails, setWebsiteDetails] = useState<WebsiteTemplateState>({
    websiteName: "",
    websiteUrl: "",
    userName: "",
    password: "",
    notes: "",
    tags: [],
  });

  const [secureNoteDetails, setSecureNoteDetails] =
    useState<SecureNoteTemplateState>({
      title: "",
      content: "",
      tags: [],
    });

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [currentTemplets, setCurrentTemplets] = useState("Website");
  const templets = ["Website", "Secure Note"];
  const snapPoints = useMemo(() => ["90%"], []);

  const handleClose = useCallback(() => {
    sheetRef.current?.close();
    showFloating();
    showTabBar();
  }, [sheetRef]);

  useEffect(() => {
    const handleBack = () => {
      if (sheetRef.current) {
        handleClose();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBack,
    );

    return () => subscription.remove();
  }, [sheetRef, handleClose]);

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving vault item:", {
      type: currentTemplets,
      website: websiteDetails,
      note: secureNoteDetails,
    });
    handleClose();
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
        backgroundColor: "transparent",
      }}
      handleIndicatorStyle={{
        display: "none",
      }}
    >
      <LinearGradient
        colors={
          isDark
            ? ["#0f172a", "#1e1b4b", "#312e81"]
            : ["#f0f9ff", "#e0f2fe", "#dbeafe"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
      >
        <BottomSheetView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
          >
            <BottomSheetScrollView
              contentContainerStyle={{ padding: 16, gap: 12 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View className="gap-3 flex-row justify-between items-center mb-2">
                <TouchableOpacity
                  className="rounded-full overflow-hidden shadow-lg"
                  onPress={handleClose}
                >
                  <BlurView
                    intensity={80}
                    tint={isDark ? "dark" : "light"}
                    className="p-3"
                  >
                    <LinearGradient
                      colors={
                        isDark
                          ? ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]
                          : ["white", "white"]
                      }
                      className="absolute inset-0"
                    />
                    <ArrowLeft color={isDark ? "white" : "#1e293b"} size={24} />
                  </BlurView>
                </TouchableOpacity>

                <Text className="text-2xl font-roboto-bold text-neutral-900 dark:text-white">
                  Secure Details
                </Text>

                <TouchableOpacity
                  className="rounded-full overflow-hidden shadow-lg"
                  onPress={handleSave}
                >
                  <BlurView
                    intensity={80}
                    tint={isDark ? "dark" : "light"}
                    className="p-3"
                  >
                    <LinearGradient
                      colors={
                        isDark
                          ? ["rgba(139,92,246,0.3)", "rgba(168,85,247,0.2)"]
                          : ["rgba(139,92,246,0.2)", "rgba(168,85,247,0.1)"]
                      }
                      className="absolute inset-0"
                    />
                    <Save color={isDark ? "#a78bfa" : "#7c3aed"} size={24} />
                  </BlurView>
                </TouchableOpacity>
              </View>

              {/* Template selector */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ height: 50 }}
              >
                {templets.map((templet) => (
                  <TouchableOpacity
                    key={templet}
                    className={`px-4 py-2.5 rounded-full border ${
                      isDark
                        ? currentTemplets === templet
                          ? "bg-purple-700/30 border-purple-500"
                          : "bg-slate-900 border-slate-800"
                        : currentTemplets === templet
                          ? "bg-purple-300/60 border-purple-500"
                          : "bg-slate-100 border-slate-200"
                    } mr-3 mb-3 shadow-sm`}
                    onPress={() => setCurrentTemplets(templet)}
                  >
                    <Text
                      className={`font-semibold ${
                        isDark
                          ? currentTemplets === templet
                            ? "text-purple-200"
                            : "text-slate-300"
                          : currentTemplets === templet
                            ? "text-purple-700"
                            : "text-slate-700"
                      }`}
                    >
                      {templet}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Content */}
              {currentTemplets === "Website" && (
                <WebsiteTemplate
                  state={websiteDetails}
                  onChange={setWebsiteDetails}
                />
              )}

              {currentTemplets === "Secure Note" && (
                <SecureNoteTemplate
                  state={secureNoteDetails}
                  onChange={setSecureNoteDetails}
                />
              )}
            </BottomSheetScrollView>
          </KeyboardAvoidingView>
        </BottomSheetView>
      </LinearGradient>
    </BottomSheet>
  );
};

export default VaultItemsOverlay;
