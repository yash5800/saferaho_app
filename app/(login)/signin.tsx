import { AuthContext } from "@/components/auth/Auth";
import { CryptoContext } from "@/components/crypto/Crypto";
import { displayToast } from "@/util/disToast";
import { signInUser } from "@/util/signInUser";
import { Link, router } from "expo-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import React, { useContext } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function reducer(
  state: { userInput: string; password: string },
  action: { type: string; payload: string },
) {
  switch (action.type) {
    case "SET_USER_INPUT":
      return { ...state, userInput: action.payload };
    case "SET_PASSWORD":
      return { ...state, password: action.payload };
    case "RESET_FORM":
      return { userInput: "", password: "" };
    default:
      return state;
  }
}

const Signin = () => {
  const colorScheme = useColorScheme();
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [form, setForm] = React.useReducer(reducer, {
    userInput: "",
    password: "",
  });
  const [inputError, setInputError] = React.useState<null | {
    field: string;
    message: string;
  }>(null);
  const { setAuthenticated } = useContext(AuthContext);
  const [signInLoading, setSignInLoading] = React.useState(false);
  const { setIsLocked } = useContext(CryptoContext);
  const isDark = colorScheme === "dark";

  const handleSignIn = async () => {
    setInputError(null);
    setSignInLoading(true);
    const res = await signInUser({
      userInput: form.userInput,
      password: form.password,
    });

    if (res?.type === "error" && res.field && res.message) {
      setInputError({ field: res.field, message: res.message });
    } else if (res?.type === "error" && res.field === undefined) {
      displayToast({
        type: "error",
        message: res.message,
      });
    } else {
      displayToast({
        type: "success",
        message: "Signed in successfully!",
      });

      setAuthenticated(true);
      setIsLocked(false);
    }

    setSignInLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#dbeaea] dark:bg-[#181818]">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center"
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center items-center px-4 pb-8">
            {/* back header */}
            <View className="w-full flex-row justify-center items-center p-6">
              <TouchableOpacity
                className="absolute left-4 bg-white dark:bg-slate-700 rounded-full p-2"
                onPress={() => router.replace("/(login)")}
              >
                <ArrowLeft color={colorScheme === "dark" ? "white" : "gray"} />
              </TouchableOpacity>
              <Text className="text-lg font-semibold dark:text-white">
                SafeRaho
              </Text>
            </View>

            {/* Sign in Container */}
            <View className="w-full rounded-3xl bg-white flex justify-center items-center p-6  dark:bg-[#1f1f1f]">
              <Text className="text-2xl font-semibold text-center dark:text-white">
                Welcome Back 👋
              </Text>
              <Text className="text-center text-gray-500 dark:text-gray-400 mt-1">
                Sign in to continue
              </Text>

              <View className="justify-center items-start mt-6 w-full">
                <TextInput
                  className="w-full rounded-xl bg-slate-200 dark:bg-slate-700 px-5 py-4 pr-12 text-base text-zinc-900 dark:text-zinc-100"
                  placeholder="Email or Username"
                  placeholderTextColor={isDark ? "#888" : "#999"}
                  autoCapitalize="none"
                  onChangeText={(t) =>
                    setForm({ type: "SET_USER_INPUT", payload: t.trim() })
                  }
                />
                {inputError && inputError.field === "userInput" ? (
                  <Text className="text-red-600 mt-1 ml-2">
                    {inputError.message}
                  </Text>
                ) : null}
                <View className="relative w-full mt-4">
                  <TextInput
                    className="w-full rounded-xl bg-slate-200 dark:bg-slate-700 px-5 py-4 pr-12 text-base text-zinc-900 dark:text-zinc-100"
                    placeholder="Password"
                    placeholderTextColor={isDark ? "#888" : "#999"}
                    secureTextEntry={!passwordVisible}
                    autoCapitalize="none"
                    onChangeText={(t) =>
                      setForm({ type: "SET_PASSWORD", payload: t.trim() })
                    }
                  />
                  <TouchableOpacity
                    onPress={() => setPasswordVisible((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {passwordVisible ? (
                      <EyeOff color={isDark ? "white" : "gray"} size={20} />
                    ) : (
                      <Eye color={isDark ? "white" : "gray"} size={20} />
                    )}
                  </TouchableOpacity>
                </View>
                {inputError && inputError.field === "password" ? (
                  <Text className="text-red-600 mt-1 ml-2">
                    {inputError.message}
                  </Text>
                ) : null}
                <Link
                  href="/(login)/forgot"
                  className="text-sm text-gray-600 font-medium mt-3 self-end dark:text-gray-400"
                >
                  Forgot password?
                </Link>
                <TouchableOpacity
                  className="w-full bg-black dark:bg-white rounded-lg mt-6 py-4 flex-row justify-center items-center gap-2"
                  onPress={handleSignIn}
                  disabled={signInLoading}
                >
                  {signInLoading ? (
                    <>
                      <ActivityIndicator
                        color={colorScheme === "dark" ? "black" : "white"}
                        size="small"
                      />
                      <Text className="text-center text-white dark:text-black font-semibold">
                        Signing In...
                      </Text>
                    </>
                  ) : (
                    <Text className="text-center text-white dark:text-black font-semibold">
                      Sign In
                    </Text>
                  )}
                </TouchableOpacity>
                <Text className="self-center text-gray-600 dark:text-gray-400 mt-5">
                  {"Don't have an account?"}{" "}
                  <Link
                    href="/(login)/signup"
                    className="font-semibold text-black dark:text-white"
                  >
                    Sign Up
                  </Link>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signin;
