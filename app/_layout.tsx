import Auth from "@/components/auth/Auth";
import Crypto from "@/components/crypto/Crypto";
import UserData from "@/components/Data/userData";
import StackNavigator from "@/globals/stack/StackNavigator";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import "../global.css";


export default function RootLayout() {
  return (
  <GestureHandlerRootView style={{ flex: 1 }}>
   <Auth>
    <Crypto>
      <UserData>
      <View style={{ flex: 1 }}>
        <StatusBar
          style="auto"
          backgroundColor="transparent"
          translucent
        />
        <StackNavigator />
        <Toast />
      </View>
      </UserData>
    </Crypto>
   </Auth>
  </GestureHandlerRootView>
  );
}
