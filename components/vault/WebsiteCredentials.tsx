import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface WebsiteCredentialsProps {
  userName: string;
  password: string;
}

const WebsiteCredentials = ({
  userName,
  password,
}: WebsiteCredentialsProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <View className="bg-white dark:bg-[#14141b] rounded-3xl p-5 shadow-md gap-4">
      {/* Username */}
      <View>
        <Text className="text-xs uppercase tracking-widest text-purple-500 font-semibold mb-1">
          Username
        </Text>
        <Text className="text-base text-slate-900 dark:text-white">
          {userName || "—"}
        </Text>
      </View>

      {/* Password */}
      <View>
        <Text className="text-xs uppercase tracking-widest text-purple-500 font-semibold mb-1">
          Password
        </Text>
        <View className="bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3">
          <Text className="text-base tracking-widest text-slate-900 dark:text-white pr-8">
            {showPassword ? password : "••••••••••••"}
          </Text>
          <TouchableOpacity
            className="absolute right-4 top-3"
            onPress={toggleShowPassword}
          >
            <Text className="text-sm text-indigo-500">
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default WebsiteCredentials;
