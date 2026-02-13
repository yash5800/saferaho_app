// components/vault/edit/EditWebsiteForm.tsx
import { Globe, Tag, X } from "lucide-react-native";
import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface EditWebsiteData {
  websiteName: string;
  websiteUrl: string;
  userName: string;
  password: string;
  notes: string;
  tags: string[];
}

interface EditWebsiteFormProps {
  data: EditWebsiteData;
  onChange: (data: EditWebsiteData) => void;
  isDark: boolean;
}

const EditWebsiteForm = ({ data, onChange, isDark }: EditWebsiteFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const handleChange = (field: keyof EditWebsiteData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
      handleChange("tags", [...data.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    handleChange(
      "tags",
      data.tags.filter((t) => t !== tag)
    );
  };

  return (
    <View className="gap-5">
      {/* Website Info Card */}
      <View className="bg-white dark:bg-[#14141b] rounded-3xl p-5 shadow-md gap-4">
        <View className="flex-row items-center gap-3 mb-2">
          <View className="w-10 h-10 rounded-xl bg-purple-500/20 items-center justify-center">
            <Globe size={20} color="#a855f7" />
          </View>
          <Text className="text-lg font-bold text-slate-900 dark:text-white">
            Website Information
          </Text>
        </View>

        {/* Website Name */}
        <View>
          <Text className="text-xs uppercase tracking-widest text-purple-500 font-semibold mb-2">
            Website Name
          </Text>
          <TextInput
            className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-base text-slate-900 dark:text-white"
            value={data.websiteName}
            onChangeText={(value) => handleChange("websiteName", value)}
            placeholder="e.g., Google"
            placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
          />
        </View>

        {/* Website URL */}
        <View>
          <Text className="text-xs uppercase tracking-widest text-purple-500 font-semibold mb-2">
            Website URL
          </Text>
          <TextInput
            className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-base text-slate-900 dark:text-white"
            value={data.websiteUrl}
            onChangeText={(value) => handleChange("websiteUrl", value)}
            placeholder="https://example.com"
            placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Credentials Card */}
      <View className="bg-white dark:bg-[#14141b] rounded-3xl p-5 shadow-md gap-4">
        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Credentials
        </Text>

        {/* Username */}
        <View>
          <Text className="text-xs uppercase tracking-widest text-purple-500 font-semibold mb-2">
            Username / Email
          </Text>
          <TextInput
            className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-base text-slate-900 dark:text-white"
            value={data.userName}
            onChangeText={(value) => handleChange("userName", value)}
            placeholder="username@example.com"
            placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View>
          <Text className="text-xs uppercase tracking-widest text-purple-500 font-semibold mb-2">
            Password
          </Text>
          <View className="relative">
            <TextInput
              className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 pr-20 text-base text-slate-900 dark:text-white"
              value={data.password}
              onChangeText={(value) => handleChange("password", value)}
              placeholder="Enter password"
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              className="absolute right-4 top-3"
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text className="text-sm text-indigo-500 font-semibold">
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Notes Card */}
      <View className="bg-white dark:bg-[#14141b] rounded-3xl p-5 shadow-md">
        <Text className="text-xs uppercase tracking-widest text-purple-500 font-semibold mb-2">
          Notes (Optional)
        </Text>
        <TextInput
          className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-base text-slate-900 dark:text-white min-h-[100px]"
          value={data.notes}
          onChangeText={(value) => handleChange("notes", value)}
          placeholder="Add any additional notes..."
          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
          multiline
          textAlignVertical="top"
        />
      </View>

      {/* Tags Card */}
      <View className="bg-white dark:bg-[#14141b] rounded-3xl p-5 shadow-md gap-3">
        <View className="flex-row items-center gap-2 mb-1">
          <Tag size={18} color="#a855f7" />
          <Text className="text-lg font-bold text-slate-900 dark:text-white">
            Tags
          </Text>
        </View>

        {/* Tag Input */}
        <View className="flex-row gap-2">
          <TextInput
            className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-base text-slate-900 dark:text-white"
            value={tagInput}
            onChangeText={setTagInput}
            placeholder="Add a tag"
            placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
            onSubmitEditing={handleAddTag}
            returnKeyType="done"
          />
          <TouchableOpacity
            className="bg-purple-500 rounded-xl px-6 items-center justify-center"
            onPress={handleAddTag}
          >
            <Text className="text-white font-semibold">Add</Text>
          </TouchableOpacity>
        </View>

        {/* Tags Display */}
        {data.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-2">
            {data.tags.map((tag, index) => (
              <View
                key={index}
                className="bg-purple-100 dark:bg-purple-900/30 rounded-full px-3 py-1.5 flex-row items-center gap-2"
              >
                <Text className="text-sm text-purple-700 dark:text-purple-300">
                  {tag}
                </Text>
                <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                  <X size={14} color={isDark ? "#d8b4fe" : "#7c3aed"} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default EditWebsiteForm;