import { router } from 'expo-router'
import React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Home = () => {

  return (
  <SafeAreaView className="flex-1 bg-[#dbeaea] dark:bg-[#181818]">
    <ScrollView contentContainerClassName="flex-1">  
      <View className="flex-1 justify-center items-center"> 
        <Text>Finally you are here!</Text>

        <TouchableOpacity
          onPress={() => router.push('/(protected)/settings')}
          className="mt-4 p-3 bg-blue-500 rounded-lg"
        >
          <Text>Settings</Text>
        </TouchableOpacity>
      </View>    
    </ScrollView>
  </SafeAreaView>
  )
}

export default Home