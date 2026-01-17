import TabBar from '@/components/TabBar'
import { Tabs } from 'expo-router'

const TabLayout = () => {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen 
        name='home' 
        options={{ 
          title: 'Home',
          headerShown: false 
        }} 
      />
      <Tabs.Screen 
        name='explore' 
        options={{ 
          title: 'Explore',
          headerShown: false 
        }} 
      />      
      <Tabs.Screen 
        name='profile' 
        options={{ 
          title: 'Profile',
          headerShown: false
        }} 
      />
    </Tabs>
  )
}

export default TabLayout