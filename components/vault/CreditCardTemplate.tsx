import {
  CreditCard as CreditCardIcon,
  Eye,
  EyeOff,
  Tag,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Text, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

export interface CreditCardTemplateState {
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardType: string;
  notes: string;
  tags: string[];
}

interface CreditCardTemplateProps {
  state: CreditCardTemplateState;
  onChange: (next: CreditCardTemplateState) => void;
}

function tagsFormater(tags: string) {
  return tags.split(",").map((tag) => tag.trim().toLowerCase());
}

function formatCardNumber(value: string) {
  const cleaned = value.replace(/\s/g, "");
  const formatted = cleaned.match(/.{1,4}/g);
  return formatted ? formatted.join(" ") : cleaned;
}

function detectCardType(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, "");
  if (/^4/.test(cleaned)) return "Visa";
  if (/^5[1-5]/.test(cleaned)) return "Mastercard";
  if (/^3[47]/.test(cleaned)) return "American Express";
  if (/^6(?:011|5)/.test(cleaned)) return "Discover";
  return "Unknown";
}

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  icon?: React.ReactNode;
  isDark: boolean;
  keyboardType?: "default" | "numeric" | "number-pad";
  maxLength?: number;
}

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline,
  numberOfLines,
  icon,
  isDark,
  keyboardType,
  maxLength,
}: InputFieldProps) => {
  const [showSecure, setShowSecure] = useState(false);

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
          secureTextEntry={secureTextEntry && !showSecure}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? "top" : "center"}
          keyboardType={keyboardType}
          maxLength={maxLength}
        />
        {secureTextEntry && (
          <View
            onTouchEnd={() => setShowSecure(!showSecure)}
            className="ml-2 p-2"
          >
            {showSecure ? (
              <Eye
                size={18}
                color={isDark ? "#94a3b8" : "#64748b"}
                strokeWidth={2}
              />
            ) : (
              <EyeOff
                size={18}
                color={isDark ? "#94a3b8" : "#64748b"}
                strokeWidth={2}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const CreditCardTemplate = ({ state, onChange }: CreditCardTemplateProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    const formatted = formatCardNumber(cleaned);
    const cardType = detectCardType(cleaned);
    onChange({ ...state, cardNumber: formatted, cardType });
  };

  return (
    <View className="gap-0">
      {/* Credit Card Header */}
      <View
        className={`rounded-2xl mb-6 p-4 border ${
          isDark
            ? "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700"
            : "bg-gradient-to-br from-emerald-50 to-slate-100 border-slate-200"
        }`}
      >
        <View className="flex-row items-center gap-4">
          <View
            className={`w-14 h-14 rounded-lg items-center justify-center ${
              isDark ? "bg-emerald-600/20" : "bg-emerald-100"
            }`}
          >
            <CreditCardIcon
              size={28}
              color={isDark ? "#34d399" : "#059669"}
              strokeWidth={2}
            />
          </View>
          <View className="flex-1">
            <Text
              className={`text-sm font-semibold ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {state.cardType || "Credit Card"}
            </Text>
            <Text
              className={`text-xl font-bold mt-1 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
              numberOfLines={1}
            >
              {state.cardNumber
                ? `•••• ${state.cardNumber.slice(-4)}`
                : "No Card Number"}
            </Text>
          </View>
        </View>
      </View>

      {/* Card Details Section */}
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
          Card Information
        </Text>

        <InputField
          label="Cardholder Name"
          value={state.cardholderName}
          onChangeText={(text) => onChange({ ...state, cardholderName: text })}
          placeholder="John Doe"
          isDark={isDark}
        />

        <InputField
          label="Card Number"
          value={state.cardNumber}
          onChangeText={handleCardNumberChange}
          placeholder="1234 5678 9012 3456"
          keyboardType="number-pad"
          maxLength={19}
          isDark={isDark}
        />

        <View className="flex-row gap-4">
          <View className="flex-1">
            <InputField
              label="Expiry Month"
              value={state.expiryMonth}
              onChangeText={(text) => onChange({ ...state, expiryMonth: text })}
              placeholder="MM"
              keyboardType="number-pad"
              maxLength={2}
              isDark={isDark}
            />
          </View>
          <View className="flex-1">
            <InputField
              label="Expiry Year"
              value={state.expiryYear}
              onChangeText={(text) => onChange({ ...state, expiryYear: text })}
              placeholder="YY"
              keyboardType="number-pad"
              maxLength={2}
              isDark={isDark}
            />
          </View>
          <View className="flex-1">
            <InputField
              label="CVV"
              value={state.cvv}
              onChangeText={(text) => onChange({ ...state, cvv: text })}
              placeholder="123"
              secureTextEntry
              keyboardType="number-pad"
              maxLength={4}
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
                        ? "bg-emerald-600/20 border-emerald-500/30"
                        : "bg-emerald-100/60 border-emerald-300"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isDark ? "text-emerald-300" : "text-emerald-700"
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

export default CreditCardTemplate;
