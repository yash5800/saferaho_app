import { AuthContext } from '@/components/auth/Auth'
import CustomSwitch from '@/components/CustomSwitch'
import { router } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { useColorScheme } from 'nativewind'
import React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Settings = () => {
  const { colorScheme , toggleColorScheme } = useColorScheme();
  const { signOut } = React.useContext(AuthContext);

  const toggleTheme = () => {
    toggleColorScheme();
  }

  return (
  <SafeAreaView className="flex-1 bg-[#dbeaea] dark:bg-[#181818]">
    <ScrollView contentContainerClassName="flex-1">
      {/* back header */}
      <View className='w-full flex-row justify-center items-center p-4'>
         <TouchableOpacity
          className='absolute left-4 bg-white dark:bg-slate-700 rounded-full p-2'
          onPress={()=>router.back()}
         >
           <ArrowLeft color={colorScheme === 'dark' ? 'white' : 'gray'} />
         </TouchableOpacity>
          <Text className="text-lg font-semibold dark:text-white">
            Settings
         </Text>
      </View>

      {/* Settings Container */}
      <View className='flex-1 justify-start items-center px-4 pb-8 mt-5'>
        <View
        className='w-full rounded-3xl bg-white flex justify-start items-start p-6  dark:bg-[#1f1f1f]' 
        >
         <View className='w-full flex justify-between items-center flex-row'>
           <View className='flex flex-col'>
              <Text className='text-lg font-semibold dark:text-white'>
                Dark Mode
              </Text>
              <Text className='text-sm dark:text-gray-600'>
                Toggle the app appearance
              </Text>
           </View>
           <CustomSwitch active={colorScheme === 'dark'} activeColor="#81b0ff" inActiveColor="#767577" onToggle={toggleTheme} />
         </View>
        </View>

        <TouchableOpacity
          onPress={signOut}
        >
          <Text className='text-red-500 mt-6 text-lg font-semibold'>
            SignOut
          </Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  </SafeAreaView>
  )
}

export default Settings