// Edit page main file
import EditSecureNoteForm from "@/components/vault/edit/EditSecureNoteForm";
import EditWebsiteForm from "@/components/vault/edit/EditWebsiteForm";
import { UserDataContext } from "@/context/mainContext";
import { hideFloating } from "@/lib/floatingContoller";
import { useVaultItems } from "@/stateshub/useVaultItems";
import { getUserProfileData } from "@/storage/mediators/system";
import { displayToast } from "@/util/disToast";
import { getIp } from "@/util/getip";
import {
  DecryptedDataSecureNote,
  DecryptedDataWebsite,
  vaultItemDecrypt,
} from "@/util/vaultOperations/vaultItemDecrypt";
import { uploadVaultItems } from "@/util/vaultOperations/vaultItemsUpload";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Save, Trash2 } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ip_address = getIp();

interface EditWebsiteData {
  websiteName: string;
  websiteUrl: string;
  userName: string;
  password: string;
  notes: string;
  tags: string[];
}

interface EditSecureNoteData {
  title: string;
  content: string;
  tags: string[];
}

const EditItemView = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, fetchVaultItems } = useVaultItems((state) => state);
  const { reload } = useContext(UserDataContext);
  const [item, setItem] = useState(data.vaultItemsCache[id]);
  const [itemSecretData, setItemSecretData] = useState<
    DecryptedDataSecureNote | DecryptedDataWebsite | null
  >(null);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [Error, setError] = useState({
    field: "",
    message: "",
  });

  const userId = getUserProfileData()?.id;

  // Form data states
  const [websiteData, setWebsiteData] = useState<EditWebsiteData>({
    websiteName: "",
    websiteUrl: "",
    userName: "",
    password: "",
    notes: "",
    tags: [],
  });

  const [secureNoteData, setSecureNoteData] = useState<EditSecureNoteData>({
    title: "",
    content: "",
    tags: [],
  });

  useEffect(() => {
    hideFloating();
    const decrypt = async () => {
      const decrypted = await vaultItemDecrypt(
        item.type,
        item.encryptedSecretData,
      );
      setItemSecretData(decrypted);

      // Initialize form data
      if (item.type === "website" && decrypted) {
        setWebsiteData({
          websiteName: (item as any).websiteName || "",
          websiteUrl: (item as any).websiteUrl || "",
          userName: (decrypted as DecryptedDataWebsite).userName || "",
          password: (decrypted as DecryptedDataWebsite).password || "",
          notes: (decrypted as DecryptedDataWebsite).notes || "",
          tags: item.tags || [],
        });
      } else if (item.type === "secure_note" && decrypted) {
        setSecureNoteData({
          title: (item as any).title || "",
          content: (decrypted as DecryptedDataSecureNote).content || "",
          tags: item.tags || [],
        });
      }
    };
    decrypt();
  }, [item.type, item.encryptedSecretData]);

  const handleBack = () => {
    router.back();
  };

  const handleSave = useCallback(async () => {
    if (!userId || (!websiteData && !secureNoteData)) return;

    setIsSaving(true);

    if (item.type === "website") {
      if (!websiteData.websiteUrl.trim()) {
        setError({ field: "websiteUrl", message: "Website URL is required" });
        return;
      }

      if (!websiteData.userName.trim()) {
        setError({ field: "userName", message: "Username is required" });
        return;
      }

      if (!websiteData.password.trim()) {
        setError({ field: "password", message: "Password is required" });
        return;
      }
    }

    if (item.type === "secure_note") {
      if (!secureNoteData.title.trim()) {
        setError({ field: "title", message: "Title is required" });
        return;
      }

      if (!secureNoteData.content.trim()) {
        setError({ field: "content", message: "Content is required" });
        return;
      }
    }

    let res;

    if (item.type === "website") {
      res = await uploadVaultItems(userId, {
        items: {
          type: "website",
          data: websiteData,
        },
      });
    }

    if (item.type === "secure_note") {
      res = await uploadVaultItems(userId, {
        items: {
          type: "secure_note",
          data: secureNoteData,
        },
      });
    }

    if (res?.status !== 201) return;

    displayToast({
      type: "success",
      message: "Vault item saved successfully",
    });

    reload();
    router.back();
    setIsSaving(false);
  }, [websiteData, secureNoteData, handleBack]);

  const handleDelete = () => {
    // Alert.alert(
    //   "Delete Item",
    //   "Are you sure you want to delete this item? This action cannot be undone.",
    //   [
    //     {
    //       text: "Cancel",
    //       style: "cancel",
    //     },
    //     {
    //       text: "Delete",
    //       style: "destructive",
    //       onPress: async () => {
    //         const userId = getUserProfileData()?.id;
    //         if (!userId) return;
    //         setIsDeleting(true);
    //         try {
    //           await deleteVaultItem(userId, id);
    //           await fetchVaultItems(userId);
    //           displayToast({
    //             type: "success",
    //             message: "Item deleted successfully",
    //           });
    //           router.push("/(protected)/(tabs)/vault");
    //         } catch (error) {
    //           console.error("Error deleting:", error);
    //           displayToast({
    //             type: "error",
    //             message: "Failed to delete item",
    //           });
    //         } finally {
    //           setIsDeleting(false);
    //         }
    //       },
    //     },
    //   ],
    // );
  };

  if (!itemSecretData) {
    return (
      <SafeAreaView className="flex-1 bg-[#f4f7f8] dark:bg-[#0b0b0f] items-center justify-center">
        <ActivityIndicator size="large" color="#5865F2" />
        <Text className="text-slate-500 dark:text-slate-400 mt-4">
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f4f7f8] dark:bg-[#0b0b0f]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-grow"
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-3 flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              className="bg-white dark:bg-slate-800 rounded-full p-2 shadow-sm"
              onPress={handleBack}
            >
              <ArrowLeft color={isDark ? "#fff" : "#444"} size={20} />
            </TouchableOpacity>
            <Text className="text-xl font-roboto-bold text-neutral-900 dark:text-white">
              Edit {item.type === "website" ? "Website" : "Secure Note"}
            </Text>
          </View>

          <View className="flex-row gap-2">
            <TouchableOpacity
              className="bg-red-50 dark:bg-red-900/20 rounded-full p-2 border border-red-200 dark:border-red-800"
              onPress={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Trash2 color="#EF4444" size={20} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-purple-50 dark:bg-purple-900/20 rounded-full px-4 py-2 flex-row items-center gap-2 border border-purple-200 dark:border-purple-800"
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#a855f7" />
              ) : (
                <>
                  <Save color="#a855f7" size={18} />
                  <Text className="text-purple-600 dark:text-purple-400 font-semibold">
                    Save
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-grow"
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-5 py-6">
            {item.type === "website" && (
              <EditWebsiteForm
                data={websiteData}
                onChange={setWebsiteData}
                isDark={isDark}
              />
            )}

            {item.type === "secure_note" && (
              <EditSecureNoteForm
                data={secureNoteData}
                onChange={setSecureNoteData}
                isDark={isDark}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const deleteVaultItem = async (userId: string, itemId: string) => {
  try {
    const res = await axios.delete(
      `http://${ip_address}:3002/api/vault/delete/${itemId}`,
      {
        data: { userId },
      },
    );

    if (res.status === 200) {
      console.log("Vault item deleted successfully");
    }

    return {
      status: res.status,
      message: res.data.message,
    };
  } catch (error) {
    console.error("Error deleting vault item:", error);
    throw error;
  }
};

export default EditItemView;
