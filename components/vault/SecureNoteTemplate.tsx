import { Lock, Tag } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Text, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

export interface SecureNoteState {
  title: string;
  content: string;
  tags: string[];
}

interface SecureNoteTemplateProps {
  state: SecureNoteState;
  onChange: (next: SecureNoteState) => void;
  Error: {
    field: string;
    message: string;
  };
}

function tagsFormatter(tags: string) {
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

const SecureNoteTemplate = ({
  state,
  onChange,
  Error,
}: SecureNoteTemplateProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="gap-6">
      {/* Header */}
      <View
        className={`rounded-3xl p-5 border ${
          isDark
            ? "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700"
            : "bg-gradient-to-br from-purple-50 to-slate-100 border-slate-200"
        }`}
      >
        <View className="flex-row items-center gap-3">
          <View
            className={`rounded-xl p-3 ${
              isDark ? "bg-purple-500/20" : "bg-purple-100"
            }`}
          >
            <Lock size={22} color={isDark ? "#c4b5fd" : "#7c3aed"} />
          </View>

          <View className="flex-1">
            <Text
              className={`text-sm font-semibold ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Secure Note
            </Text>
            <Text
              className={`text-xl font-bold mt-1 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
              numberOfLines={1}
            >
              {state.title || "Untitled Note"}
            </Text>
          </View>
        </View>
      </View>

      {/* Title */}
      <InputCard label="Title" isDark={isDark}>
        <TextInput
          className={`text-base font-medium ${
            isDark ? "text-white" : "text-slate-900"
          }`}
          placeholder="Note title"
          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
          value={state.title}
          onChangeText={(t) => onChange({ ...state, title: t })}
          autoFocus
        />
        {Error.field === "title" && (
          <Text className="text-red-500 mt-1 text-sm">{Error.message}</Text>
        )}
      </InputCard>

      {/* Secure Content */}
      <InputCard
        label="Secure Content"
        isDark={isDark}
        icon={<Lock size={14} color={isDark ? "#94a3b8" : "#64748b"} />}
      >
        <TextInput
          multiline
          textAlignVertical="top"
          className={`rounded-xl px-4 py-3 min-h-[160px] text-base ${
            isDark ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"
          }`}
          placeholder="Write sensitive information here..."
          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
          value={state.content}
          onChangeText={(t) => onChange({ ...state, content: t })}
        />
        {Error.field === "content" && (
          <Text className="text-red-500 mt-1 text-sm">{Error.message}</Text>
        )}
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
          placeholder="personal, recovery, backup"
          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
          onChangeText={(t) => onChange({ ...state, tags: tagsFormatter(t) })}
        />

        {state.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-3">
            {state.tags.map((tag) => (
              <View
                key={tag}
                className={`rounded-full px-3 py-1.5 ${
                  isDark ? "bg-purple-600/20" : "bg-purple-100"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isDark ? "text-purple-300" : "text-purple-700"
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

export default SecureNoteTemplate;
