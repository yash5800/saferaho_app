import ItemFooter from "@/components/vault/ItemFooter";
import SecureNoteContent from "@/components/vault/SecureNoteContent";
import SecureNoteFooter from "@/components/vault/SecureNoteFooter";
import SecureNoteHeader from "@/components/vault/SecureNoteHeader";
import SecureNoteTags from "@/components/vault/SecureNoteTags";
import WebsiteCredentials from "@/components/vault/WebsiteCredentials";
import WebsiteHeader from "@/components/vault/WebsiteHeader";
import WebsiteNotes from "@/components/vault/WebsiteNotes";
import WebsiteTags from "@/components/vault/WebsiteTags";
import { domainName, getWebsiteIcon } from "@/components/vault/WebsiteTemplate";
import { hideFloating } from "@/lib/floatingContoller";
import { useVaultItems } from "@/stateshub/useVaultItems";
import {
  DecryptedDataSecureNote,
  DecryptedDataWebsite,
  vaultItemDecrypt,
} from "@/util/vaultOperations/vaultItemDecrypt";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { ImageSourcePropType, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ItemView = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useVaultItems((state) => state);
  const [item, setItem] = useState(data.vaultItemsCache[id]);
  const [itemScrectData, setItemScrectData] = useState<
    DecryptedDataSecureNote | DecryptedDataWebsite | null
  >(null);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [icon, setIcon] = useState<ImageSourcePropType | null>(null);

  useEffect(() => {
    if (item.type === "website") {
      getWebsiteIcon(item.websiteUrl)
        .then(setIcon)
        .catch(() => setIcon(null));
    }
  }, [item.type, item]);

  useEffect(() => {
    hideFloating();
    const decrypt = async () => {
      const decrypted = await vaultItemDecrypt(
        item.type,
        item.encryptedSecretData,
      );
      setItemScrectData(decrypted);
    };
    decrypt();
  }, [item.type, item.encryptedSecretData]);

  const handleBack = () => {
    router.push(`/(protected)/(tabs)/vault`);
  };

  const handleEdit = () => {
    router.push(`/(protected)/${id}/edit`);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f4f7f8] dark:bg-[#0b0b0f]">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Website Login View */}
        {item.type === "website" && itemScrectData && (
          <>
            <WebsiteHeader
              websiteUrl={item.websiteUrl}
              domainName={
                domainName(item.websiteUrl).split(".")[0] || item.websiteUrl
              }
              icon={icon}
              isDark={isDark}
              onBack={handleBack}
              editItem={handleEdit}
            />

            <View className="px-5 pb-10 gap-6 mt-10">
              <WebsiteCredentials
                userName={(itemScrectData as DecryptedDataWebsite).userName}
                password={(itemScrectData as DecryptedDataWebsite).password}
              />

              <WebsiteNotes
                notes={(itemScrectData as DecryptedDataWebsite).notes}
              />

              <WebsiteTags tags={item.tags} isDark={isDark} />

              <ItemFooter updatedAt={item._updatedAt} />
            </View>
          </>
        )}

        {/* Secure Note View */}
        {item.type === "secure_note" && itemScrectData && (
          <>
            <SecureNoteHeader
              title={(item as any).title || "Secure Note"}
              isDark={isDark}
              onBack={handleBack}
              editItem={handleEdit}
            />

            <View className="px-5 pb-10 gap-6">
              <SecureNoteContent
                content={(itemScrectData as DecryptedDataSecureNote).content}
                isDark={isDark}
              />

              <SecureNoteTags tags={item.tags} isDark={isDark} />

              <SecureNoteFooter updatedAt={item._updatedAt} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ItemView;
