import { registerExploreHeader } from '@/lib/exploreHeaderContoller';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { Text } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Files from '../../../components/explore-tabs/files';
import Vault from '../../../components/explore-tabs/vault';

const TopTab = createMaterialTopTabNavigator();

const Explore = () => {
  const { colorScheme } = useColorScheme();

  const translateY = useSharedValue(0);

  useEffect(() => {
    registerExploreHeader(
      () => (translateY.value = withTiming(1, { duration: 250 })),
      () => (translateY.value = withTiming(0, { duration: 250 }))
    );
  }, [translateY]);

  
  return (
    <SafeAreaView className='flex-1 dark:bg-black'>

      {/* Header */}
      <Text className='text-center font-bold dark:text-white text-lg py-2' >Explore</Text>

      {/* Tabs */}
      <TopTab.Navigator
        screenOptions={{
          tabBarIndicatorStyle: { 
            backgroundColor: '#2563eb',
            height: 3,
            borderRadius: 5
          },
          tabBarLabelStyle: { 
            fontWeight: 'bold',
            fontSize: 14,
            textTransform: 'capitalize',
            color: colorScheme === 'dark' ? '#ffffff' : '#000000',
          },
          tabBarStyle:{
            backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff',
            borderBottomColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
            borderBottomWidth: 1
          }
        }}
      >
        <TopTab.Screen name='Vaults' component={Vault} />
        <TopTab.Screen name='Files' component={Files} />
      </TopTab.Navigator>
    </SafeAreaView>
  )
}

export default Explore