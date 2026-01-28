import { ForgotPasswordService } from "@/services/ForgotServices";
import { displayToast } from "@/util/disToast";
import { Link, router } from "expo-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { runOnJS } from "react-native-worklets";

// hidden outer crisp response lazy crucial egg regular detect power flush staff seat wealth robust give square alpha obtain trap walk frost sponsor treat

// hidden outer treat response lazy crucial egg regular detect power flush staff seat wealth robust give square alpha obtain trap walk frost sponsor crisp

function reducer(
  state: { userInput: string; recoveryKey: string },
  action: { type: string; payload: string },
) {
  switch (action.type) {
    case "SET_USER_INPUT":
      return { ...state, userInput: action.payload };
    case "SET_RECOVERY_KEY":
      return { ...state, recoveryKey: action.payload };
    case "RESET_FORM":
      return { userInput: "", recoveryKey: "" };
    default:
      return state;
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

const Forgot = () => {
  const colorScheme = useColorScheme();
  const [recoveryKeyVisible, setRecoveryKeyVisible] = React.useState(false);
  const [form, setForm] = React.useReducer(reducer, {
    userInput: "",
    recoveryKey: "",
  });
  const [inputError, setInputError] = React.useState<null | {
    field: string;
    message: string;
  }>(null);
  const [recoverLoading, setRecoverLoading] = React.useState(false);
  const [isConfirmed, setIsConfirmed] = React.useState(false);

  const [newPassword, setNewPassword] = React.useState("");
  const [newConfirmPassword, setNewConfirmPassword] = React.useState("");
  const [passwordLevel, setPasswordLevel] = React.useState(0);
  const [recoverSuccess, setRecoverSuccess] = React.useState(false);

  const [responseData, setResponseData] = React.useState<null | {
    resetToken?: string;
    recoveryKey?: string;
    recoveryData?: {
      _id: string;
      accoundName: string;
      accountUUID: string;
      email: string;
      encryptedRecoveryMasterKey: {
        cipher: string;
        nonce: string;
        mac: string;
      };
    };
  }>(null);

  function evaluatePasswordStrength(password: string) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    setPasswordLevel(strength);
  }

  function evaluateRecoveryKey(recoveryKey: string) {
    setRecoverSuccess(recoveryKey.trim().split(" ").length >= 12);
  }

  React.useEffect(() => {
    evaluatePasswordStrength(newPassword);
    evaluateRecoveryKey(form.recoveryKey);
  }, [newPassword, form.recoveryKey]);

  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const switchContent = () => {
    opacity.value = withTiming(0, { duration: 200 });
    translateX.value = withTiming(-10, { duration: 200 }, () => {
      runOnJS(setIsConfirmed)(true);

      //Reset position
      translateX.value = 10;
      //Animate in
      opacity.value = withTiming(1, { duration: 250 });
      translateX.value = withTiming(0, { duration: 250 });
    });
  };

  const switchContentBack = () => {
    opacity.value = withTiming(0, { duration: 200 });
    translateX.value = withTiming(10, { duration: 200 }, () => {
      runOnJS(setIsConfirmed)(false);
      runOnJS(setResponseData)(null);
      // runOnJS(setForm)({ type: 'RESET_FORM', payload: '' });
      runOnJS(setInputError)(null);
      runOnJS(setNewPassword)("");
      runOnJS(setNewConfirmPassword)("");
      runOnJS(setPasswordLevel)(0);
      runOnJS(setRecoverLoading)(false);

      //Resetposition
      translateX.value = -10;
      //Animate in
      opacity.value = withTiming(1, { duration: 250 });
      translateX.value = withTiming(0, { duration: 250 });
    });
  };

  const toggleRecoveryKeyVisibility = () => {
    setRecoveryKeyVisible(!recoveryKeyVisible);
  };

  const handleRecover = async () => {
    setInputError(null);
    setRecoverLoading(true);

    // Validate inputs
    if (!form.userInput.trim()) {
      setInputError({
        field: "userInput",
        message: "Email or username is required",
      });
      setRecoverLoading(false);
      return;
    }

    if (!form.recoveryKey.trim()) {
      setInputError({
        field: "recoveryKey",
        message: "Recovery key is required",
      });
      setRecoverLoading(false);
      return;
    }

    try {
      // TODO: Fetch user's recovery data from backend
      // This should include: rk_salt and encryptedRecoveryMasterKey
      // For now, this is a placeholder

      displayToast({
        message: "Validating recovery key...",
        type: "info",
      });

      const recoveryResponse = await ForgotPasswordService.getResetToken(
        form.userInput.trim(),
        form.recoveryKey.trim(),
      );

      console.log("Recovery response:", recoveryResponse);

      if (
        !recoveryResponse.success &&
        recoveryResponse.status === 409 &&
        recoveryResponse.field
      ) {
        displayToast({
          type: "error",
          message:
            recoveryResponse.message ||
            "Failed to recover account. Please check your recovery key.",
        });

        setInputError({
          field: recoveryResponse.field,
          message:
            recoveryResponse.message ||
            "Failed to recover account. Please check your recovery key.",
        });

        console.error("Recovery failed:", recoveryResponse.message);
        return;
      } else if (!recoveryResponse.success) {
        displayToast({
          type: "error",
          message:
            recoveryResponse.message ||
            "Invalid recovery key. Please check and try again.",
        });

        return;
      }

      setResponseData(recoveryResponse);
      switchContent();
    } catch (error) {
      console.error("Recovery error: ", error);
      setInputError({
        field: "recoveryKey",
        message: "Invalid recovery key or user not found",
      });
      displayToast({
        type: "error",
        message: "Failed to recover account. Please check your recovery key.",
      });
    } finally {
      setRecoverLoading(false);
    }
  };

  const handleNewPasswordSet = async () => {
    setRecoverLoading(true);

    // Validate new passwords
    if (
      !responseData ||
      !responseData.resetToken ||
      isTokenExpired(responseData.resetToken) ||
      !responseData.recoveryKey ||
      !responseData.recoveryData
    ) {
      displayToast({
        type: "error",
        message:
          "Missing recovery data. Please restarting the recovery process...",
      });

      switchContentBack();
      return;
    }

    try {
      const res = await ForgotPasswordService.forgotPassword({
        newPassword: newConfirmPassword,
        resetToken: responseData.resetToken,
        recoveryKey: responseData.recoveryKey,
        recoveryData: responseData.recoveryData,
      });

      if (!res.success) {
        displayToast({
          type: "error",
          message: res.message || "Failed to reset password. Please try again.",
        });
        console.error("Password reset failed:", res.message);
        return;
      }

      displayToast({
        type: "success",
        message:
          "Password updated successfully! You can now sign in with your new password.",
      });

      router.replace("/(login)/signin");
    } catch (error) {
      console.error("Password reset error: ", error);
      displayToast({
        type: "error",
        message:
          "An error occurred while resetting your password. Please try again.",
      });
    } finally {
      setRecoverLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#dbeaea] dark:bg-[#181818]">
      <ScrollView contentContainerClassName="flex-grow">
        <View className="flex-1 justify-center items-center px-4 pb-8">
          {/* back header */}
          <View className="w-full flex-row justify-center items-center p-6">
            <TouchableOpacity
              className="absolute left-4 bg-white dark:bg-slate-700 rounded-full p-2"
              onPress={() => router.back()}
            >
              <ArrowLeft color={colorScheme === "dark" ? "white" : "gray"} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold dark:text-white">
              SafeRaho
            </Text>
          </View>

          {/* Recovery Container */}
          <View className="w-full rounded-3xl bg-white flex justify-center items-center p-6 dark:bg-[#1f1f1f]">
            <Text className="text-2xl font-semibold text-center dark:text-white">
              Recover Account 🔑
            </Text>
            <Text className="text-center text-gray-500 dark:text-gray-400 mt-1">
              Enter your recovery information
            </Text>

            <Animated.View
              style={animatedStyle}
              className="justify-center items-start mt-6 w-full"
            >
              {isConfirmed ? (
                <>
                  <TextInput
                    className="w-full rounded-xl bg-slate-200 dark:bg-slate-700 px-5 py-4 pr-12 text-base text-zinc-900 dark:text-zinc-100"
                    placeholder="New Password"
                    placeholderTextColor={
                      colorScheme === "dark" ? "#888" : "#999"
                    }
                    autoCapitalize="none"
                    secureTextEntry={!recoveryKeyVisible}
                    value={newPassword}
                    onChangeText={(text) => setNewPassword(text.trim())}
                  />
                  {passwordLevel < 3 && newPassword.length > 0 && (
                    <Text className="text-red-600 mt-1 ml-2 text-sm">
                      Use uppercase, lowercase, numbers, and special characters
                    </Text>
                  )}

                  <TextInput
                    className="w-full rounded-xl bg-slate-200 dark:bg-slate-700 px-5 py-4 pr-12 text-base text-zinc-900 dark:text-zinc-100 mt-4"
                    placeholder="Confirm Password"
                    placeholderTextColor={
                      colorScheme === "dark" ? "#888" : "#999"
                    }
                    autoCapitalize="none"
                    secureTextEntry={!recoveryKeyVisible}
                    value={newConfirmPassword}
                    onChangeText={(text) => setNewConfirmPassword(text.trim())}
                  />

                  <TouchableOpacity
                    className={`w-full bg-black dark:bg-white rounded-lg mt-6 py-4 flex-row justify-center items-center gap-2 ${
                      newConfirmPassword !== newPassword ||
                      newPassword.length < 8 ||
                      recoverLoading
                        ? "opacity-50"
                        : ""
                    }`}
                    onPress={handleNewPasswordSet}
                    disabled={
                      newConfirmPassword !== newPassword ||
                      newPassword.length < 8 ||
                      recoverLoading
                    }
                  >
                    {recoverLoading ? (
                      <>
                        <ActivityIndicator
                          color={colorScheme === "dark" ? "black" : "white"}
                          size="small"
                        />
                        <Text className="text-center text-white dark:text-black font-semibold">
                          Updating...
                        </Text>
                      </>
                    ) : (
                      <Text className="text-center text-white dark:text-black font-semibold">
                        Update Password
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="mt-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-full py-4"
                    onPress={switchContentBack}
                  >
                    <Text className="text-gray-900 dark:text-white font-semibold text-center">
                      Back
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TextInput
                    className="w-full rounded-xl bg-slate-200 dark:bg-slate-700 px-5 py-4 pr-12 text-base text-zinc-900 dark:text-zinc-100"
                    placeholder="Email or Username"
                    placeholderTextColor={
                      colorScheme === "dark" ? "#888" : "#999"
                    }
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={form.userInput}
                    onChangeText={(text) =>
                      setForm({ type: "SET_USER_INPUT", payload: text })
                    }
                  />
                  {inputError && inputError.field === "userInput" && (
                    <Text className="text-red-600 mt-1 ml-2">
                      {inputError.message}
                    </Text>
                  )}

                  <View className="relative w-full mt-4">
                    <TextInput
                      className="w-full rounded-xl bg-slate-200 dark:bg-slate-700 px-5 py-4 pr-12 text-base text-zinc-900 dark:text-zinc-100"
                      placeholder="Recovery Key"
                      placeholderTextColor={
                        colorScheme === "dark" ? "#888" : "#999"
                      }
                      autoCapitalize="none"
                      secureTextEntry={!recoveryKeyVisible}
                      multiline={!recoveryKeyVisible}
                      numberOfLines={1}
                      value={form.recoveryKey}
                      onChangeText={(text) =>
                        setForm({ type: "SET_RECOVERY_KEY", payload: text })
                      }
                    />
                    <TouchableOpacity
                      onPress={toggleRecoveryKeyVisibility}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      {recoveryKeyVisible ? (
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
                  {inputError && inputError.field === "recoveryKey" && (
                    <Text className="text-red-600 mt-1 ml-2">
                      {inputError.message}
                    </Text>
                  )}
                  {form.recoveryKey.trim().length > 0 && !recoverSuccess && (
                    <Text className="text-red-600 mt-1 ml-2 text-sm">
                      Recovery key should be at least 12 words
                    </Text>
                  )}

                  <TouchableOpacity
                    className={`w-full bg-black dark:bg-white rounded-lg mt-6 py-4 flex-row justify-center items-center gap-2 ${
                      recoverLoading ||
                      !form.userInput.trim() ||
                      !form.recoveryKey.trim() ||
                      !recoverSuccess
                        ? "opacity-50"
                        : ""
                    }`}
                    onPress={handleRecover}
                    disabled={
                      recoverLoading ||
                      !form.userInput.trim() ||
                      !form.recoveryKey.trim() ||
                      !recoverSuccess
                    }
                  >
                    {recoverLoading ? (
                      <>
                        <ActivityIndicator
                          color={colorScheme === "dark" ? "black" : "white"}
                          size="small"
                        />
                        <Text className="text-center text-white dark:text-black font-semibold">
                          Recovering...
                        </Text>
                      </>
                    ) : (
                      <Text className="text-center text-white dark:text-black font-semibold">
                        Recover Account
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </Animated.View>

            <Text className="self-center text-gray-600 dark:text-gray-400 mt-5">
              Remember your password?{" "}
              <Link
                href="/(login)/signin"
                className="font-semibold text-black dark:text-white"
              >
                Sign In
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Forgot;
