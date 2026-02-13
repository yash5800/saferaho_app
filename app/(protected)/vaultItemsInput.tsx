import { useGetPath } from "@/components/getPath";
import SecureNoteTemplate, {
  SecureNoteState,
} from "@/components/vault/SecureNoteTemplate";
import WebsiteTemplate, {
  WebsiteTemplateState,
} from "@/components/vault/WebsiteTemplate";
import { UserDataContext } from "@/context/mainContext";
import { hideFloating, showFloating } from "@/lib/floatingContoller";
import { showTabBar } from "@/lib/tabBarContoller";
import { getUserProfileData } from "@/storage/mediators/system";
import { displayToast } from "@/util/disToast";
import { uploadVaultItems } from "@/util/vaultOperations/vaultItemsUpload";
import { useRouter } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const VaultItemsInput = () => {
  const { reload } = useContext(UserDataContext);
  const router = useRouter();
  const [currentTemplet, setCurrentTemplet] = useState("Website");
  const templets = ["Website", "Secure Note"];
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const userId = getUserProfileData()?.id;

  const [websiteDetails, setWebsiteDetails] = useState<WebsiteTemplateState>({
    websiteName: "",
    websiteUrl: "",
    userName: "",
    password: "",
    notes: "",
    tags: [],
  });

  const [secureNoteDetails, setSecureNoteDetails] = useState<SecureNoteState>({
    title: "",
    content: "",
    tags: [],
  });

  const currentPath = useGetPath();

  const [Error, setError] = useState({
    field: "",
    message: "",
  });

  useEffect(() => {
    hideFloating();

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleClose();
        return true;
      },
    );

    return () => {
      backHandler.remove();
      showFloating();
      showTabBar();
    };
  }, [currentPath]);

  const handleClose = useCallback(() => {
    showFloating();
    showTabBar();
    router.back();
  }, [router]);

  const handleSave = useCallback(async () => {
    if (!userId || (!websiteDetails && !secureNoteDetails)) return;

    if (currentTemplet === "Website") {
      if (!websiteDetails.websiteUrl.trim()) {
        setError({ field: "websiteUrl", message: "Website URL is required" });
        return;
      }

      if (!websiteDetails.userName.trim()) {
        setError({ field: "userName", message: "Username is required" });
        return;
      }

      if (!websiteDetails.password.trim()) {
        setError({ field: "password", message: "Password is required" });
        return;
      }
    }

    if (currentTemplet === "Secure Note") {
      if (!secureNoteDetails.title.trim()) {
        setError({ field: "title", message: "Title is required" });
        return;
      }

      if (!secureNoteDetails.content.trim()) {
        setError({ field: "content", message: "Content is required" });
        return;
      }
    }

    let res;

    if (currentTemplet === "Website") {
      res = await uploadVaultItems(userId, {
        items: {
          type: "website",
          data: websiteDetails,
        },
      });
    }

    if (currentTemplet === "Secure Note") {
      res = await uploadVaultItems(userId, {
        items: {
          type: "secure_note",
          data: secureNoteDetails,
        },
      });
    }

    if (res?.status !== 201) return;

    displayToast({
      type: "success",
      message: "Vault item saved successfully",
    });

    reload();
    handleClose();
  }, [currentTemplet, websiteDetails, secureNoteDetails, handleClose]);

  return (
    <View className="flex-1 bg-[#f4f7f8] dark:bg-[#0f0f0f]">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <ScrollView
            contentContainerClassName="flex justify-start p-4 gap-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header with close and save buttons */}
            <View className="flex-row justify-between items-center mb-3">
              <TouchableOpacity
                className="rounded-full bg-white dark:bg-slate-800 p-3 shadow-sm border border-gray-200 dark:border-slate-700"
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <ArrowLeft color={isDark ? "#e2e8f0" : "#334155"} size={24} />
              </TouchableOpacity>

              <Text className="text-2xl font-roboto-bold text-slate-900 dark:text-white">
                Secure Details
              </Text>

              <TouchableOpacity
                className="rounded-full bg-blue-500 dark:bg-blue-600 p-3 shadow-md"
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Check color="white" size={24} />
              </TouchableOpacity>
            </View>
            {/* Template selector */}
            <View className="flex-row gap-3 mb-2">
              {templets.map((templet) => (
                <TouchableOpacity
                  key={templet}
                  className={`flex-1 px-5 py-3.5 rounded-2xl border-2 shadow-sm ${
                    currentTemplet === templet
                      ? "bg-blue-500 dark:bg-blue-600 border-blue-500 dark:border-blue-600"
                      : "bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600"
                  }`}
                  onPress={() => setCurrentTemplet(templet)}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`font-roboto-semibold text-center ${
                      currentTemplet === templet
                        ? "text-white"
                        : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {templet}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {currentTemplet === "Website" && (
              <WebsiteTemplate
                state={websiteDetails}
                onChange={setWebsiteDetails}
                Error={Error}
              />
            )}

            {currentTemplet === "Secure Note" && (
              <SecureNoteTemplate
                state={secureNoteDetails}
                onChange={setSecureNoteDetails}
                Error={Error}
              />
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default VaultItemsInput;
