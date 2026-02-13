import axios from "axios";
import { Globe, Lock, Tag } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";

export interface WebsiteTemplateState {
  websiteName: string;
  websiteUrl: string;
  userName: string;
  password: string;
  notes: string;
  tags: string[];
}

interface WebsiteTemplateProps {
  state: WebsiteTemplateState;
  onChange: (next: WebsiteTemplateState) => void;
  Error: {
    field: string;
    message: string;
  };
}

export function domainName(url: string) {
  try {
    const { hostname } = new URL(url);
    return hostname.replace("www.", "");
  } catch {
    return url;
  }
}

const FALLBACK_WEBSITE_ICON =
  require("@/public/images/internet.png") as ImageSourcePropType;

export async function getWebsiteIcon(
  url?: string | null,
): Promise<ImageSourcePropType> {
  if (!url) return FALLBACK_WEBSITE_ICON;

  try {
    const normalized =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

    const hostname = new URL(normalized).hostname.replace(/^www\./, "");

    const result = await axios.get(
      `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
      {
        responseType: "arraybuffer",
      },
    );

    console.log("Favicon fetch result:", result);

    if (result.status !== 200) {
      return FALLBACK_WEBSITE_ICON;
    }

    return {
      uri: `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
    };
  } catch {
    return FALLBACK_WEBSITE_ICON;
  }
}

function tagsFormater(tags: string) {
  return tags
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

const InputCard = ({
  label,
  icon,
  children,
  isDark,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isDark: boolean;
}) => (
  <View
    className={`rounded-2xl border px-4 py-4 ${
      isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
    }`}
  >
    <View className="flex-row items-center mb-3 gap-2">
      {icon}
      <Text
        className={`text-xs font-bold uppercase tracking-wider ${
          isDark ? "text-slate-500" : "text-slate-600"
        }`}
      >
        {label}
      </Text>
    </View>
    {children}
  </View>
);

const WebsiteTemplate = ({ state, onChange, Error }: WebsiteTemplateProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showPassword, setShowPassword] = useState(false);

  const [websiteIcon, setWebsiteIcon] = useState<ImageSourcePropType>(
    FALLBACK_WEBSITE_ICON,
  );

  return (
    <View className="gap-6">
      {/* Website Header */}
      <View
        className={`rounded-3xl p-5 border ${
          isDark
            ? "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700"
            : "bg-gradient-to-br from-blue-50 to-slate-100 border-slate-200"
        }`}
      >
        <View className="flex-row items-center gap-4">
          <Image
            source={websiteIcon}
            resizeMode="cover"
            className="rounded-full w-16 h-16 bg-white p-5"
          />
          <View className="flex-1">
            <Text
              className={`text-sm font-semibold ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Website
            </Text>
            <Text
              className={`text-xl font-bold mt-1 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
              numberOfLines={1}
            >
              {state.websiteName || "Add website"}
            </Text>
          </View>
        </View>
      </View>

      {/* URL */}
      <InputCard
        label="Website URL"
        isDark={isDark}
        icon={<Globe size={14} color={isDark ? "#94a3b8" : "#64748b"} />}
      >
        <TextInput
          className={`text-base font-medium ${
            isDark ? "text-white" : "text-slate-900"
          }`}
          placeholder="https://example.com"
          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
          value={state.websiteUrl}
          onChangeText={(t) => {
            onChange({
              ...state,
              websiteUrl: t.trim(),
              websiteName: domainName(t.trim()).split(".")[0] || "",
            });
            getWebsiteIcon(t.trim()).then((icon) => setWebsiteIcon(icon));
          }}
          autoFocus
          autoCapitalize="none"
          keyboardType="url"
        />
        {Error.field === "websiteUrl" && (
          <Text className="text-red-500 mt-1 text-sm">{Error.message}</Text>
        )}
      </InputCard>

      {/* Login Details */}
      <InputCard
        label="Login Details"
        isDark={isDark}
        icon={<Lock size={14} color={isDark ? "#94a3b8" : "#64748b"} />}
      >
        <View className="gap-4">
          <TextInput
            className={`rounded-xl px-4 py-3 text-base ${
              isDark ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"
            }`}
            placeholder="Username / Email"
            placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
            value={state.userName}
            onChangeText={(t) => onChange({ ...state, userName: t })}
          />
          {Error.field === "userName" && (
            <Text className="text-red-500 mt-1 text-sm">{Error.message}</Text>
          )}

          <View>
            <TextInput
              secureTextEntry={!showPassword}
              className={`rounded-xl px-4 py-3 text-base ${
                isDark
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-900"
              }`}
              placeholder="Password"
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              value={state.password}
              onChangeText={(t) => onChange({ ...state, password: t })}
            />
            <TouchableOpacity
              className="absolute right-4 top-3"
              onPress={() => setShowPassword((s) => !s)}
            >
              <Text
                className={`text-sm font-medium ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}
              >
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
            {Error.field === "password" && (
              <Text className="text-red-500 mt-1 text-sm">{Error.message}</Text>
            )}
          </View>
        </View>
      </InputCard>

      {/* Notes */}
      <InputCard label="Notes" isDark={isDark}>
        <TextInput
          multiline
          numberOfLines={4}
          className={`rounded-xl px-4 py-3 text-base ${
            isDark ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"
          }`}
          placeholder="Security questions, backup info, hints…"
          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
          value={state.notes}
          onChangeText={(t) => onChange({ ...state, notes: t })}
        />
      </InputCard>

      {/* Tags */}
      <InputCard
        label="Tags"
        isDark={isDark}
        icon={<Tag size={14} color={isDark ? "#94a3b8" : "#64748b"} />}
      >
        <TextInput
          className={`rounded-xl px-4 py-3 text-base ${
            isDark ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"
          }`}
          placeholder="work, finance, personal"
          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
          onChangeText={(t) => onChange({ ...state, tags: tagsFormater(t) })}
        />

        {state.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-3">
            {state.tags.map((tag) => (
              <View
                key={tag}
                className={`rounded-full px-3 py-1.5 ${
                  isDark ? "bg-blue-600/20" : "bg-blue-100"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isDark ? "text-blue-300" : "text-blue-700"
                  }`}
                >
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}
      </InputCard>
    </View>
  );
};

export default WebsiteTemplate;
