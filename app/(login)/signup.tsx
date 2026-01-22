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
  CloudUpload,
  Eye,
  EyeOff,
  FileCheckCorner,
  Star,
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
      form.userName.length >= 6
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
          {/* back header */}
          <View className="w-full flex-row justify-center items-center p-4">
            <TouchableOpacity
              className="absolute left-4 bg-white dark:bg-slate-700 rounded-full p-2"
              onPress={() => router.replace("/(login)")}
            >
              <ArrowLeft color={colorScheme === "dark" ? "white" : "#BFBFBF"} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold dark:text-white">
              SafeRaho
            </Text>
          </View>

          {/* Sign up Container */}
          <View className="flex-1 justify-center items-center px-4 pb-6 mt-2">
            <View className="w-full rounded-3xl bg-white flex justify-center items-center p-6 dark:bg-[#1f1f1f]">
              <Text className="text-xl font-semibold dark:text-white">
                Create Account
              </Text>

              <View className="justify-center items-start w-full">
                <Text className="text-gray-800 dark:text-gray-300 mt-4 text-center font-semibold mb-2">
                  User Name
                </Text>
                <TextInput
                  className={
                    "w-full rounded-full text-zinc-900 bg-slate-200 pl-5" +
                    " placeholder:text-zinc-400 dark:bg-slate-700 dark:text-zinc-100"
                  }
                  placeholder="Enter user name"
                  placeholderTextColor={
                    colorScheme === "dark" ? "#888888" : "#aaaaaa"
                  }
                  keyboardType="default"
                  autoCapitalize="words"
                  onChangeText={(text) =>
                    setForm({ type: "SET_USERNAME", payload: text.trim() })
                  }
                  value={form.userName}
                />
                {inputError.find((err) => err.field === "userName") && (
                  <Text className="text-red-500 mt-1 ml-2 text-xs">
                    {
                      inputError.find((err) => err.field === "userName")
                        ?.message
                    }
                  </Text>
                )}
                {form.userName.length < 6 && form.userName.length > 0 && (
                  <Text className="text-red-500 mt-1 ml-2 text-xs">
                    User name must be at least 6 characters long.
                  </Text>
                )}

                <Text className="text-gray-800 dark:text-gray-300 mt-4 text-center font-semibold mb-2">
                  Email
                </Text>
                <TextInput
                  className={
                    "w-full rounded-full text-zinc-900 bg-slate-200 pl-5" +
                    " placeholder:text-zinc-400 dark:bg-slate-700 dark:text-zinc-100"
                  }
                  placeholder="Enter your email"
                  placeholderTextColor={
                    colorScheme === "dark" ? "#888888" : "#aaaaaa"
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
                  <Text className="text-red-500 mt-1 ml-2 text-xs">
                    {inputError.find((err) => err.field === "email")?.message}
                  </Text>
                )}
                {form.email && !emailIsValid(form.email) && (
                  <Text className="text-red-500 mt-1 ml-2 text-xs">
                    Please enter a valid email address.
                  </Text>
                )}

                <Text className="text-gray-800 dark:text-gray-300 mt-4 text-center font-semibold mb-2">
                  Password
                </Text>
                <View className="w-full">
                  <TextInput
                    className={
                      "rounded-full text-zinc-900 bg-slate-200 pl-5 pr-12" +
                      " placeholder:text-zinc-400 dark:bg-slate-700 dark:text-zinc-100"
                    }
                    placeholder="Create a password"
                    placeholderTextColor={
                      colorScheme === "dark" ? "#888888" : "#aaaaaa"
                    }
                    keyboardType="default"
                    autoCapitalize="none"
                    secureTextEntry={!passwordVisible}
                    value={form.password}
                    onChangeText={(text) =>
                      setForm({ type: "SET_PASSWORD", payload: text.trim() })
                    }
                  />
                  <TouchableOpacity
                    className="absolute right-4 top-3"
                    onPress={() => setPasswordVisible((prev) => !prev)}
                  >
                    {passwordVisible ? (
                      <EyeOff
                        color={colorScheme === "dark" ? "white" : "gray"}
                      />
                    ) : (
                      <Eye color={colorScheme === "dark" ? "white" : "gray"} />
                    )}
                  </TouchableOpacity>
                </View>
                {passwordLevel < 3 && form.password.length > 0 && (
                  <Text className="text-red-500 mt-1 ml-2 text-xs">
                    Password is too weak. Use at least 8 characters, including
                    uppercase, lowercase, numbers, and special characters.
                  </Text>
                )}
                {inputError.find((err) => err.field === "password") && (
                  <Text className="text-red-500 mt-1 ml-2 text-xs">
                    {
                      inputError.find((err) => err.field === "password")
                        ?.message
                    }
                  </Text>
                )}

                <Text className="text-gray-800 dark:text-gray-300 mt-4 text-center font-semibold mb-2">
                  Confirm Password
                </Text>
                <View className="w-full">
                  <TextInput
                    className={
                      "rounded-full text-zinc-900 bg-slate-200 pl-5 pr-12" +
                      " placeholder:text-zinc-400 dark:bg-slate-700 dark:text-zinc-100"
                    }
                    placeholder="Re-enter your password"
                    placeholderTextColor={
                      colorScheme === "dark" ? "#888888" : "#aaaaaa"
                    }
                    keyboardType="default"
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
                  <TouchableOpacity
                    className="absolute right-4 top-3"
                    onPress={() => setPasswordVisible((prev) => !prev)}
                  >
                    {passwordVisible ? (
                      <EyeOff
                        color={colorScheme === "dark" ? "white" : "gray"}
                      />
                    ) : (
                      <Eye color={colorScheme === "dark" ? "white" : "gray"} />
                    )}
                  </TouchableOpacity>
                </View>
                {inputError.find((err) => err.field === "confirmPassword") && (
                  <Text className="text-red-500 mt-1 ml-2 text-xs">
                    {
                      inputError.find((err) => err.field === "confirmPassword")
                        ?.message
                    }
                  </Text>
                )}

                <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1 self-start">
                  By signing up, you agree to our Terms of Service and Privacy
                  Policy.
                </Text>

                <TouchableOpacity
                  className={`w-full bg-black dark:bg-white rounded-full mt-4 py-4 flex-row justify-center items-center gap-2 ${!enableSignup ? "opacity-50" : ""}`}
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
            <Text className="flex-1 font-semibold text-lg text-center mb-4 dark:text-white ">
              {"Preview Recovery Key's "}
            </Text>
            <TouchableOpacity className="absolute bg-[#caffb7] top-3 right-3 p-2 rounded-full">
              {Dloading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="justify-center items-center flex-row gap-1">
                  <FileCheckCorner color="#35c800" size={14} />
                  <Text className="text-[#35c800] text-sm font-semibold">
                    Saved
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <View className="flex-1 flex-row justify-center flex-wrap gap-4 mb-6">
              {recoveryKeys.map((item, index) => (
                <View
                  key={index}
                  className="w-1/4 p-2 items-center rounded-md bg-gray-200 dark:bg-gray-700"
                >
                  <Text className="text-gray-800 dark:text-gray-300">
                    {item}
                  </Text>
                </View>
              ))}
            </View>
            <View className="flex-1 justify-around items-center flex-row mb-5">
              <TouchableOpacity
                className="w-[140px] bg-blue-500 rounded-full py-4 flex-row justify-center items-center gap-2 self-center"
                onPress={handleCloseRecoveryKeys}
              >
                <Text className="text-center text-white font-semibold">
                  Continue
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-[140px] bg-gray-700 rounded-full py-4 flex-row justify-center items-center gap-2 self-center"
                onPress={() => backupRecoveryKeys(filePath)}
              >
                <CloudUpload color={"white"} size={20} />
                <Text className="text-center text-white font-semibold">
                  Back up
                </Text>
                <View
                  className="absolute -top-1 -left-1"
                  style={{
                    transform: [{ rotate: "-20deg" }],
                    shadowColor: "#000",
                    shadowOpacity: 0.3,
                    elevation: 5,
                  }}
                >
                  <Star fill={"yellow"} color={"gold"} />
                </View>
              </TouchableOpacity>
            </View>
            <Text className="text-sm font-normal text-blue-500 text-center">
              Please save the recovery keys document in a safe place. They are
              essential for account recovery.
            </Text>
            <Text className="text-xs font-medium text-green-400 text-center mt-2">
              File automatically saved to {filePath}.
            </Text>
          </DynamicBottomSheet>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signup;
