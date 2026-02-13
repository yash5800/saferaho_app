import { Mail, MapPin, Phone, Tag, User } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Text, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

export interface IdentityTemplateState {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  notes: string;
  tags: string[];
}

interface IdentityTemplateProps {
  state: IdentityTemplateState;
  onChange: (next: IdentityTemplateState) => void;
}

function tagsFormater(tags: string) {
  return tags.split(",").map((tag) => tag.trim().toLowerCase());
}

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  icon?: React.ReactNode;
  isDark: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
}

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  numberOfLines,
  icon,
  isDark,
  keyboardType,
}: InputFieldProps) => {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </Text>
      <View
        className={`flex-row items-center rounded-xl border ${
          isDark
            ? "bg-slate-900 border-slate-800 active:border-blue-500"
            : "bg-slate-50 border-slate-200 active:border-blue-500"
        } px-4 py-3.5 transition-colors`}
      >
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          className={`flex-1 text-base font-medium ${
            isDark ? "text-white" : "text-slate-900"
          }`}
          placeholder={placeholder || label}
          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? "top" : "center"}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );
};

const IdentityTemplate = ({ state, onChange }: IdentityTemplateProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const fullName = `${state.firstName} ${state.lastName}`.trim();

  return (
    <View className="gap-0">
      {/* Identity Header */}
      <View
        className={`rounded-2xl mb-6 p-4 border ${
          isDark
            ? "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700"
            : "bg-gradient-to-br from-purple-50 to-slate-100 border-slate-200"
        }`}
      >
        <View className="flex-row items-center gap-4">
          <View
            className={`w-14 h-14 rounded-lg items-center justify-center ${
              isDark ? "bg-purple-600/20" : "bg-purple-100"
            }`}
          >
            <User
              size={28}
              color={isDark ? "#a855f7" : "#7c3aed"}
              strokeWidth={2}
            />
          </View>
          <View className="flex-1">
            <Text
              className={`text-sm font-semibold ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Identity
            </Text>
            <Text
              className={`text-xl font-bold mt-1 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
              numberOfLines={1}
            >
              {fullName || "No Name"}
            </Text>
          </View>
        </View>
      </View>

      {/* Personal Information */}
      <View
        className={`rounded-2xl mb-6 p-5 border ${
          isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <Text
          className={`mb-4 text-xs font-bold uppercase tracking-wider ${
            isDark ? "text-slate-500" : "text-slate-600"
          }`}
        >
          Personal Information
        </Text>

        <View className="flex-row gap-4">
          <View className="flex-1">
            <InputField
              label="First Name"
              value={state.firstName}
              onChangeText={(text) => onChange({ ...state, firstName: text })}
              placeholder="John"
              isDark={isDark}
            />
          </View>
          <View className="flex-1">
            <InputField
              label="Last Name"
              value={state.lastName}
              onChangeText={(text) => onChange({ ...state, lastName: text })}
              placeholder="Doe"
              isDark={isDark}
            />
          </View>
        </View>

        <InputField
          label="Email Address"
          value={state.email}
          onChangeText={(text) => onChange({ ...state, email: text })}
          placeholder="john.doe@example.com"
          keyboardType="email-address"
          icon={<Mail size={18} color={isDark ? "#94a3b8" : "#64748b"} />}
          isDark={isDark}
        />

        <InputField
          label="Phone Number"
          value={state.phoneNumber}
          onChangeText={(text) => onChange({ ...state, phoneNumber: text })}
          placeholder="+1 (555) 123-4567"
          keyboardType="phone-pad"
          icon={<Phone size={18} color={isDark ? "#94a3b8" : "#64748b"} />}
          isDark={isDark}
        />
      </View>

      {/* Address Information */}
      <View
        className={`rounded-2xl mb-6 p-5 border ${
          isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <Text
          className={`mb-4 text-xs font-bold uppercase tracking-wider ${
            isDark ? "text-slate-500" : "text-slate-600"
          }`}
        >
          Address
        </Text>

        <InputField
          label="Street Address"
          value={state.address}
          onChangeText={(text) => onChange({ ...state, address: text })}
          placeholder="123 Main Street"
          icon={<MapPin size={18} color={isDark ? "#94a3b8" : "#64748b"} />}
          isDark={isDark}
        />

        <View className="flex-row gap-4">
          <View className="flex-1">
            <InputField
              label="City"
              value={state.city}
              onChangeText={(text) => onChange({ ...state, city: text })}
              placeholder="New York"
              isDark={isDark}
            />
          </View>
          <View className="flex-1">
            <InputField
              label="State/Province"
              value={state.state}
              onChangeText={(text) => onChange({ ...state, state: text })}
              placeholder="NY"
              isDark={isDark}
            />
          </View>
        </View>

        <View className="flex-row gap-4">
          <View className="flex-1">
            <InputField
              label="ZIP/Postal Code"
              value={state.zipCode}
              onChangeText={(text) => onChange({ ...state, zipCode: text })}
              placeholder="10001"
              isDark={isDark}
            />
          </View>
          <View className="flex-1">
            <InputField
              label="Country"
              value={state.country}
              onChangeText={(text) => onChange({ ...state, country: text })}
              placeholder="United States"
              isDark={isDark}
            />
          </View>
        </View>
      </View>

      {/* Notes Section */}
      <View
        className={`rounded-2xl mb-6 p-5 border ${
          isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <Text
          className={`mb-4 text-xs font-bold uppercase tracking-wider ${
            isDark ? "text-slate-500" : "text-slate-600"
          }`}
        >
          Additional Info
        </Text>

        <InputField
          label="Notes"
          value={state.notes}
          onChangeText={(text) => onChange({ ...state, notes: text })}
          multiline
          numberOfLines={4}
          placeholder="Add any additional notes..."
          isDark={isDark}
        />
      </View>

      {/* Tags Section */}
      <View
        className={`rounded-2xl p-5 border ${
          isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <Text
          className={`mb-4 text-xs font-bold uppercase tracking-wider ${
            isDark ? "text-slate-500" : "text-slate-600"
          }`}
        >
          Tags & Organization
        </Text>

        <View
          className={`flex-row items-center rounded-xl border ${
            isDark
              ? "bg-slate-900 border-slate-800"
              : "bg-slate-50 border-slate-200"
          } px-4 py-3.5`}
        >
          <Tag
            size={18}
            color={isDark ? "#94a3b8" : "#64748b"}
            className="mr-3"
          />
          <TextInput
            className={`flex-1 text-base font-medium ${
              isDark ? "text-white" : "text-slate-900"
            }`}
            placeholder="Add tags separated by commas"
            placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
            onChangeText={(text) =>
              onChange({ ...state, tags: tagsFormater(text) })
            }
          />
        </View>

        {state.tags && state.tags.length > 0 && (
          <View className="flex-row flex-wrap mt-4 gap-2">
            {state.tags.map(
              (tag) =>
                tag && (
                  <View
                    key={tag}
                    className={`rounded-full px-3 py-1.5 border ${
                      isDark
                        ? "bg-purple-600/20 border-purple-500/30"
                        : "bg-purple-100/60 border-purple-300"
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
                ),
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default IdentityTemplate;
