import TabBar from "@/components/TabBar";
import { Tabs } from "expo-router";

const TabLayout = () => {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: "Vault",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="files"
        options={{
          title: "Files",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
