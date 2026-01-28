import { AuthContext } from "@/components/auth/Auth";
import { CryptoContext } from "@/components/crypto/Crypto";
import DynamicBottomSheet from "@/components/DynamicBottomSheet";
import { displayToast } from "@/util/disToast";
import { backupRecoveryKeys, recovery2Pdf } from "@/util/recovery2pdf";
import { registerUser, registerUserExists } from "@/util/registerUser";
import BottomSheet from "@gorhom/bottom-sheet";
import { Link, router } from "expo-router";
import {
  ArrowLeft,
  Check,
  CloudUpload,
  Eye,
  EyeOff,
  FileCheckCorner,
} from "lucide-react-native";
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
import valid from "validator";

type FormState = {
  state: {
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  action: {
    type: string;
    payload: string;
  };
};

function reducer(state: FormState["state"], action: FormState["action"]) {
  switch (action.type) {
    case "SET_USERNAME":
      return { ...state, userName: action.payload };
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    case "SET_PASSWORD":
      return { ...state, password: action.payload };
    case "SET_CONFIRM_PASSWORD":
      return { ...state, confirmPassword: action.payload };
    case "RESET_FORM":
      return { userName: "", email: "", password: "", confirmPassword: "" };
    default:
      return state;
  }
}

const Signup = () => {
  const colorScheme = useColorScheme();
  const [form, setForm] = React.useReducer(reducer, {
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [inputError, setInputError] = React.useState<
    { field: string; message: string }[]
  >([]);
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [passwordLevel, setPasswordLevel] = React.useState(0);
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [enableSignup, setEnableSignup] = React.useState(false);
  const { setAuthenticated } = useContext(AuthContext);
  const [signUpLoading, setSignUpLoading] = React.useState(false);
  const { setIsLocked, unlock } = useContext(CryptoContext);
  const [recoveryKeys, setRecoveryKeys] = React.useState<string[]>([]);
  const [showRecoveryKeys, setShowRecoveryKeys] = React.useState(false);
  const [Dloading, setDLoading] = React.useState(true);
  const [filePath, setFilePath] = React.useState<string>("");

  const isDark = colorScheme === "dark";

  const bottomSheetRef = React.useRef<BottomSheet>(null);

  function evaluatePasswordStrength(password: string) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    setPasswordLevel(strength);
  }

  React.useEffect(() => {
    evaluatePasswordStrength(form.password);

    if (
      form.userName.length > 0 &&
      form.email.length > 0 &&
      form.password.length > 0 &&
      form.confirmPassword.length > 0 &&
      passwordLevel >= 3 &&
      form.password === form.confirmPassword &&
      emailIsValid(form.email) &&
      form.userName.length >= 6 &&
      acceptedTerms
    ) {
      setEnableSignup(true);
    } else {
      setEnableSignup(false);
    }

    // Clear input errors when user starts typing
    setInputError((prev) =>
      prev.filter((err) => {
        if (err.field === "userName" && form.userName.length > 0) return false;
        if (err.field === "email" && form.email.length > 0) return false;
        if (err.field === "password" && form.password.length > 0) return false;
        if (err.field === "confirmPassword" && form.confirmPassword.length > 0)
          return false;
        return true;
      }),
    );

    if (showRecoveryKeys && recoveryKeys.length >= 24) {
      requestAnimationFrame(() => {
        bottomSheetRef.current?.expand();
      });
    }
  }, [
    form.password,
    form.userName,
    form.email,
    form.confirmPassword,
    passwordLevel,
    showRecoveryKeys,
    recoveryKeys,
    acceptedTerms,
  ]);

  function emailIsValid(email: string) {
    return valid.isEmail(email);
  }

  const handleDownload = async (gmail: string, words: string) => {
    try {
      setDLoading(true);
      const dis = await recovery2Pdf(gmail, words);
      if (dis) {
        setFilePath(dis);
      }
    } catch (err) {
      console.error(err);
      displayToast({
        message: "Failed to generate recovery keys PDF.",
        type: "error",
      });
    } finally {
      setDLoading(false);
    }
  };

  const handleSignup = async () => {
    setSignUpLoading(true);
    setInputError([]);

    displayToast({
      message: "Signup functionality is implemented...",
      type: "info",
    });

    try {
      const userExists = await registerUserExists(form.userName, form.email);

      if (userExists.type === "error" && userExists.field) {
        setInputError((prev) => [
          ...prev,
          { field: userExists.field as string, message: userExists.message },
        ]);
        return;
      } else if (userExists.type === "unknown error") {
        displayToast({
          message: userExists.message || "An unknown error occurred.",
          type: "error",
        });
        return;
      }

      const res = await registerUser({
        userName: form.userName,
        email: form.email,
        password: form.password,
      });

      console.log("Registration Result: ", res);

      // accountUUID: res.accountUUID,
      // accountName: res.accountName,
      // email: res.email,
      // _id: res._id,
      // _createdAt: res._createdAt,
      // secret : {
      //   pk_salt: res.pk_salt,
      //   encryptedMasterKey: res.encryptedMasterKey
      // }

      //TODO: Store user data and token

      displayToast({
        message: "User registered successfully!",
        type: "success",
      });

      console.log("Mnemonic received: ", res.mnemonic);

      if (res.mnemonic) {
        handleDownload(form.email, res.mnemonic);
        setRecoveryKeys(res.mnemonic.split(" "));
        setShowRecoveryKeys(true);
      }
    } catch (error) {
      console.error("Signup error: ", error);
      displayToast({
        message: "An error occurred during signup. Please try again.",
        type: "error",
      });

      setSignUpLoading(false);
    } finally {
      setSignUpLoading(false);
      setDLoading(false);
    }
  };

  const handleCloseRecoveryKeys = () => {
    setShowRecoveryKeys(false);
    // Reset form after successful registration
    setForm({ type: "RESET_FORM", payload: "" });
    setAuthenticated(true);
    unlock();
    setIsLocked(false);
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

            {/* Sign up Container */}
            <View className="w-full rounded-3xl bg-white flex justify-center items-center p-6 dark:bg-[#1f1f1f]">
              <Text className="text-2xl font-semibold text-center dark:text-white">
                Create Account 🎉
              </Text>
              <Text className="text-center text-gray-500 dark:text-gray-400 mt-1">
                Sign up to get started
              </Text>

              <View className="justify-center items-start mt-6 w-full">
                <TextInput
                  className="w-full rounded-xl bg-slate-200 dark:bg-slate-700 px-5 py-4 pr-12 text-base text-zinc-900 dark:text-zinc-100"
                  placeholder="Username"
                  placeholderTextColor={
                    colorScheme === "dark" ? "#888" : "#999"
                  }
                  autoCapitalize="none"
                  onChangeText={(text) =>
                    setForm({ type: "SET_USERNAME", payload: text.trim() })
                  }
                  value={form.userName}
                />
                {inputError.find((err) => err.field === "userName") && (
                  <Text className="text-red-600 mt-1 ml-2">
                    {
                      inputError.find((err) => err.field === "userName")
                        ?.message
                    }
                  </Text>
                )}
                {form.userName.length < 6 && form.userName.length > 0 && (
                  <Text className="text-red-600 mt-1 ml-2 text-sm">
                    Username must be at least 6 characters
                  </Text>
                )}

                <TextInput
                  className="w-full rounded-xl bg-slate-200 dark:bg-slate-700 px-5 py-4 pr-12 text-base text-zinc-900 dark:text-zinc-100 mt-4"
                  placeholder="Email"
                  placeholderTextColor={
                    colorScheme === "dark" ? "#888" : "#999"
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={(text) =>
                    setForm({
                      type: "SET_EMAIL",
                      payload: text.trim(),
                    })
                  }
                  value={form.email}
                />
                {inputError.find((err) => err.field === "email") && (
                  <Text className="text-red-600 mt-1 ml-2">
                    {inputError.find((err) => err.field === "email")?.message}
                  </Text>
                )}
                {form.email && !emailIsValid(form.email) && (
                  <Text className="text-red-600 mt-1 ml-2 text-sm">
                    Please enter a valid email
                  </Text>
                )}

                <View className="relative w-full mt-4">
                  <TextInput
                    className="w-full rounded-xl bg-slate-200 dark:bg-slate-700 px-5 py-4 pr-12 text-base text-zinc-900 dark:text-zinc-100"
                    placeholder="Password"
                    placeholderTextColor={
                      colorScheme === "dark" ? "#888" : "#999"
                    }
                    autoCapitalize="none"
                    secureTextEntry={!passwordVisible}
                    value={form.password}
                    onChangeText={(text) =>
                      setForm({ type: "SET_PASSWORD", payload: text.trim() })
                    }
                  />
                  <TouchableOpacity
                    onPress={() => setPasswordVisible((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {passwordVisible ? (
                      <EyeOff
                        color={colorScheme === "dark" ? "white" : "gray"}
                        size={20}
                      />
                    ) : (
                      <Eye
                        color={colorScheme === "dark" ? "white" : "gray"}
                        size={20}
                      />
                    )}
                  </TouchableOpacity>
                </View>
                {passwordLevel < 3 && form.password.length > 0 && (
                  <Text className="text-red-600 mt-1 ml-2 text-sm">
                    Use uppercase, lowercase, numbers, and special characters
                  </Text>
                )}
                {inputError.find((err) => err.field === "password") && (
                  <Text className="text-red-600 mt-1 ml-2">
                    {
                      inputError.find((err) => err.field === "password")
                        ?.message
                    }
                  </Text>
                )}

                <View className="relative w-full mt-4">
                  <TextInput
                    className="w-full rounded-xl bg-slate-200 dark:bg-slate-700 px-5 py-4 pr-12 text-base text-zinc-900 dark:text-zinc-100"
                    placeholder="Confirm Password"
                    placeholderTextColor={
                      colorScheme === "dark" ? "#888" : "#999"
                    }
                    autoCapitalize="none"
                    secureTextEntry={!passwordVisible}
                    onChangeText={(text) =>
                      setForm({
                        type: "SET_CONFIRM_PASSWORD",
                        payload: text.trim(),
                      })
                    }
                    value={form.confirmPassword}
                  />
                </View>

                <TouchableOpacity
                  onPress={() => setAcceptedTerms((v) => !v)}
                  className="flex-row items-center gap-3 mt-3"
                  activeOpacity={0.8}
                >
                  <View
                    className={`w-5 h-5 rounded-md border-2 items-center justify-center ${
                      acceptedTerms
                        ? "bg-black dark:bg-white border-black dark:border-white"
                        : "border-gray-400"
                    }`}
                  >
                    {acceptedTerms && (
                      <Check size={14} color={isDark ? "black" : "white"} />
                    )}
                  </View>
                  <Text className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                    I agree to the{" "}
                    <Text className="font-semibold text-black dark:text-white">
                      Terms of Service
                    </Text>{" "}
                    and{" "}
                    <Text className="font-semibold text-black dark:text-white">
                      Privacy Policy
                    </Text>
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`w-full bg-black dark:bg-white rounded-lg mt-6 py-4 flex-row justify-center items-center gap-2 ${!enableSignup ? "opacity-50" : ""}`}
                  onPress={handleSignup}
                  disabled={!enableSignup || signUpLoading}
                >
                  {signUpLoading ? (
                    <>
                      <ActivityIndicator
                        color={colorScheme === "dark" ? "black" : "white"}
                        size="small"
                      />
                      <Text className="text-center text-white dark:text-black font-semibold">
                        Creating Account...
                      </Text>
                    </>
                  ) : (
                    <Text className="text-center text-white dark:text-black font-semibold">
                      Create Account
                    </Text>
                  )}
                </TouchableOpacity>

                <Text className="self-center text-gray-600 dark:text-gray-400 mt-5">
                  Already have an account?{" "}
                  <Link
                    href="/(login)/signin"
                    className="font-semibold text-black dark:text-white"
                  >
                    Sign In
                  </Link>
                </Text>
              </View>
            </View>
          </View>
          <DynamicBottomSheet
            bottomSheetRef={bottomSheetRef}
            snapPoints={["100%"]}
            initialSnapIndex={-1}
            pressBehavior="none"
            animationConfig={{ duration: 500 }}
          >
            <View className="flex-1 px-4 pb-8">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-semibold dark:text-white">
                  Recovery Keys 🔐
                </Text>
                <TouchableOpacity
                  className={`flex-row items-center gap-2 px-3 py-2 rounded-full ${
                    Dloading
                      ? "bg-gray-200 dark:bg-gray-700"
                      : "bg-green-100 dark:bg-green-900"
                  }`}
                >
                  {Dloading ? (
                    <ActivityIndicator
                      color={colorScheme === "dark" ? "white" : "black"}
                      size="small"
                    />
                  ) : (
                    <>
                      <FileCheckCorner color="#22c55e" size={16} />
                      <Text className="text-green-600 dark:text-green-400 text-xs font-semibold">
                        Saved
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <Text className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Save these 24 words in a safe place. {"You'll"} need them to
                recover your account.
              </Text>

              <View className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 mb-6 flex-1">
                <View className="flex-row flex-wrap gap-3 justify-center">
                  {recoveryKeys.map((item, index) => (
                    <View
                      key={index}
                      className="bg-white dark:bg-slate-700 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-600"
                    >
                      <Text className="text-xs text-gray-600 dark:text-gray-400">
                        {index + 1}
                      </Text>
                      <Text className="text-sm font-medium text-gray-900 dark:text-white">
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                className="w-full bg-black dark:bg-white rounded-lg py-4 flex-row justify-center items-center gap-2 mb-3"
                onPress={() => backupRecoveryKeys(filePath)}
              >
                <CloudUpload
                  color={colorScheme === "dark" ? "black" : "white"}
                  size={20}
                />
                <Text className="text-center text-white dark:text-black font-semibold">
                  Download Backup
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="w-full bg-slate-200 dark:bg-slate-700 rounded-lg py-4 flex-row justify-center items-center"
                onPress={handleCloseRecoveryKeys}
              >
                <Text className="text-center text-gray-900 dark:text-white font-semibold">
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          </DynamicBottomSheet>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signup;
