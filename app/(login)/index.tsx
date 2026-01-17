import Swipe from "@/components/Swipe";
import { bg3 } from "@/lib/images";
import { router } from "expo-router";
import { Settings } from "lucide-react-native";
import React from 'react';
import { ImageBackground, ScrollView, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const dummyUser = {
  username : "ffjokerking",
  email: "ffjokerking@gmail.com",
  password: "supersecretpassword"
}

const dummyUser2 = {
  username: "ffjokerking",
  password: "supersecretpassword",
  email: "ffjokerking@gmail.com", 
  encryptedMasterKey: {
    cipher: "V8IxebySc2ewpIC/iA+pL8GfdbETlpX+patr1h7h4dFo9RySzMV0+AJT5ajtfPV0Bb96X0JhF22DBaX2KBb9yh/RMj+3IP0Ve4HDbKTK9kY=", 
    mac: "d33ad9eec32d4cda18b72d1ac964d11473ff6f3057173d451f885a66b08e7c41", 
    nonce: "be13cae351c28f1a69ee46e2f349b5f6"
  }, 
  pk_salt: "d25e42ea9ab71617ee9a925f1a8e8aff",
  recoveryKeyData: {
    encryptedRecoveryMasterKey: {
      cipher: "G44sGd7YdwxXJt3DnK5utCiWtkbbvHGNYaBnneye6cUQdMV6rEj5E/98gs/9hEh2pQrTMpaey96gSCbMzHYKLfeOFkvWGY4WKn7lYKKuA4Q=",
      mac: "2b83df62bfb7d8a018162f1a48df99b017e0ed478b598e72f99f224280ebcdf6", 
      nonce: "dd1f92c6511bc113172dfdcf73c5f5b9"
    }, 
    mnemonic: "demise avoid chicken sock memory rural pumpkin copper jar orbit wheel ready arrest hill depend puppy fence salad knee practice olympic need peanut essay"
  }, 
  rk_salt: "29ee70e7b0df8b44ec6f53f389e497a0",
}

const exampleEncryptedMasterKey = "2afc902920edd3500cc2f1a4f97432e21001b7e97ade482f648b06afe0b314f8"

const Index = () => {
  const [showSwipe, setShowSwipe] = React.useState(true);
  const colorScheme = useColorScheme();

  (async ()=>{
    // console.log(await registerUser(dummyUser));
    // const masterKeybyPWD = await signInUser(dummyUser2)
    // const masterKeybyRK = await ForgotPassword({
    //   mnemonic: dummyUser2.recoveryKeyData.mnemonic,
    //   rk_salt: dummyUser2.rk_salt,
    //   encryptedRecoveryMasterKey: dummyUser2.recoveryKeyData.encryptedRecoveryMasterKey
    // });

    // console.log("Master Key by Password: ", masterKeybyPWD);
    // console.log("Master Key by Recovery Key: ", masterKeybyRK);

    // if (masterKeybyPWD === exampleEncryptedMasterKey && masterKeybyRK === exampleEncryptedMasterKey) {
    //   console.log("Master key matches expected value.");
    // } else {
    //   console.log("Master key does not match expected value.");
    // }

  })()

  function navigateTo(path: string) {
    router.replace(`/(login)/${path}` as any);
  }

  return (
  <SafeAreaView className="flex-1 bg-[#dbeaea] dark:bg-[#181818]">
    <ScrollView contentContainerClassName="flex-1">
      <ImageBackground
        source={bg3}
        resizeMode="cover"
        className="flex-1 w-full px-4 py-8"
      >

        {/* Brand */}
        <View className="mt-4 mb-6 bg-black/40 rounded-3xl p-4 justify-center items-center">
          <Text className="text-4xl font-extrabold text-white tracking-wide">
            SafeRaho
          </Text>
          <Text className="text-white/80 mt-1 text-sm">
            Secure • Private • Encrypted
          </Text>
        </View>
        {/* Settings Icon */}
        <TouchableOpacity className="absolute top-4 right-4" onPress={() => router.push("/(login)/settings")}>
          <Settings color={colorScheme === 'dark' ? 'white' : 'gray'} />
        </TouchableOpacity>

        {/* Bottom Card */}
        <View className="flex-1 justify-end">
          <View className="w-full rounded-3xl p-6 bg-white/90 dark:bg-[#1f1f1f]/90 backdrop-blur-md shadow-2xl">

            <Text className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
              Your privacy comes first
            </Text>

            <Text className="text-center text-gray-600 dark:text-gray-400 mt-2 mb-8 leading-relaxed">
              Store, protect, and access your data with
              military-grade encryption using SafeRaho.
            </Text>

            <View className="w-full flex justify-center items-center relative px-3">
              <Swipe 
                 onComplete={() => {
                    setShowSwipe(false);
                    router.push("/(login)/signin");
                 }} 
              />
            </View>
            {/* Toggle Buttons */}
            {/* <View className="flex-row bg-gray-200 dark:bg-[#2a2a2a] rounded-full p-1 shadow-lg">

              <TouchableOpacity
                onPress={() => {
                  setSigninVisible(true);
                  navigateTo('signin');
                }}
                activeOpacity={0.8}
                className={`flex-1 py-4 rounded-full ${
                  signinVisible ? 'bg-black dark:bg-white' : ''
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    signinVisible
                      ? 'text-white dark:text-black'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setSigninVisible(false);
                  navigateTo('signup');
                }}
                activeOpacity={0.8}
                className={`flex-1 py-4 rounded-full ${
                  !signinVisible ? 'bg-black dark:bg-white' : ''
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    !signinVisible
                      ? 'text-white dark:text-black'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>

            </View> */}

          </View>
        </View>

      </ImageBackground>
    </ScrollView>
  </SafeAreaView>

  );

}

export default Index