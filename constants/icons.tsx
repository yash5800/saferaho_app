import { Feather } from "@expo/vector-icons";

type TabRouteName = 'home' | 'explore' | 'profile';

const icons = {
    home: (props: any) => <Feather name='home' size={24} color={'#222'} {...props} />,
    explore: (props: any) => <Feather name='compass' size={24} color={'#222'} {...props} />,
    profile: (props: any) => <Feather name='user' size={24} color={'#222'} {...props} />
}

export const getIcon = (routeName: string) => {
  if (routeName in icons) {
    return icons[routeName as TabRouteName];
  }
  return null;
};
