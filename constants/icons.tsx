import { Feather } from "@expo/vector-icons";
import { Vault } from "lucide-react-native";

type TabRouteName = "home" | "vault" | "profile";

const icons = {
  home: (props: any) => (
    <Feather name="home" size={24} color={"#222"} {...props} />
  ),
  vault: (props: any) => <Vault size={24} color={"#222"} {...props} />,
  files: (props: any) => (
    <Feather name="folder" size={24} color={"#222"} {...props} />
  ),
  profile: (props: any) => (
    <Feather name="user" size={24} color={"#222"} {...props} />
  ),
};

export const getIcon = (routeName: string) => {
  if (routeName in icons) {
    return icons[routeName as TabRouteName];
  }
  return null;
};
