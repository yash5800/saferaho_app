import { usePathname } from "expo-router";

export const useGetPath = () => {
  const path = usePathname();

  const paths = path.split("/");

  return paths[paths.length - 1] || "home";
};
