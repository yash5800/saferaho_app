import { AuthContext } from "@/components/auth/Auth";
import { Stack } from "expo-router";
import React from "react";

function StackNavigator() {
  const { isAuthenticated } = React.useContext(AuthContext);
  // const { isLocked} = React.useContext(CryptoContext);

  return (
    <Stack>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(login)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default StackNavigator;
