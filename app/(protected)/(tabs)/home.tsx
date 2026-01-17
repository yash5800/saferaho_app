import { hideTabBar, showTabBar } from '@/lib/tabBarContoller';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { runOnJS, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';


const groceryList = [
  "apples", "bananas", "oranges", "grapes", "strawberries", "blueberries", "raspberries", "blackberries",
  "spinach", "kale", "lettuce", "cabbage", "carrots", "broccoli", "cauliflower", "zucchini", "cucumbers",
  "tomatoes", "peppers", "onions", "garlic", "potatoes", "sweet potatoes", "avocados", "mushrooms",
  "milk", "cheese", "butter", "yogurt", "eggs", "bacon", "chicken", "beef", "pork", "fish", "shrimp",
  "bread", "rice", "pasta", "olive oil", "honey", "coffee", "tea", "juice", "cereal", "oats"
];   

const Home = () => {
  const lastY = useSharedValue(0);
  
  const scrollHandler = useAnimatedScrollHandler(
    (event) => {
      const y = event.contentOffset.y;
      const diff = y - lastY.value;

      if( y <= 0 ){
        runOnJS(showTabBar)();
        lastY.value=0;
        return;
      }

      // hiding when scrolling down
      if (diff > 3) {
        runOnJS(hideTabBar)();
      } 
      
      // showing scrolling up
      if (diff < - 10) {
        runOnJS(showTabBar)();
      }
      lastY.value = y;
    }
  );


  return (
  <SafeAreaView className="flex-1 bg-[#dbeaea] dark:bg-[#181818]">
    <Animated.ScrollView 
       className="px-4 pt-4" 
       onScroll={scrollHandler} 
       scrollEventThrottle={16}
    >  
      <View className="mt-6 justify-center items-center"> 
        <Text>Finally you are here!</Text>

        <TouchableOpacity
          onPress={() => router.push('/(protected)/settings')}
          className="mt-4 p-3 bg-blue-500 rounded-lg"
        >
          <Text>Settings</Text>
        </TouchableOpacity>
      </View>    

      {groceryList.map((item) => (
          <View key={item} className="p-4 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-lg dark:text-white">{item}</Text>
          </View>
        ))}
    </Animated.ScrollView>
  </SafeAreaView>
  )
}

export default Home