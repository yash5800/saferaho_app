import { hideExploreHeader, showExploreHeader } from '@/lib/exploreHeaderContoller';
import { hideTabBar, showTabBar } from '@/lib/tabBarContoller';
import { Text, View } from 'react-native';
import Animated, { runOnJS, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

const groceryList = [
  "apples", "bananas", "oranges", "grapes", "strawberries", "blueberries", "raspberries", "blackberries",
  "spinach", "kale", "lettuce", "cabbage", "carrots", "broccoli", "cauliflower", "zucchini", "cucumbers",
  "tomatoes", "peppers", "onions", "garlic", "potatoes", "sweet potatoes", "avocados", "mushrooms",
  "milk", "cheese", "butter", "yogurt", "eggs", "bacon", "chicken", "beef", "pork", "fish", "shrimp",
  "bread", "rice", "pasta", "olive oil", "honey", "coffee", "tea", "juice", "cereal", "oats"
];   

const Vault = () => {
  const lastY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler(
    (event) => {
      const y = event.contentOffset.y;
      const diff = y - lastY.value;

      if(y <=0 ){
        runOnJS(showTabBar)();
        runOnJS(showExploreHeader)();
        lastY.value=0;
        return;
      }

      // hiding when scrolling down
      if (diff > 3) {
        runOnJS(hideTabBar)();
        runOnJS(hideExploreHeader)();
      } 
      
      // showing scrolling up
      if (diff < - 10) {
        runOnJS(showTabBar)();
      }
      
      if(diff < -3){
        runOnJS(showExploreHeader)();
      }
      lastY.value = y;
    }
  )

  return (
    <Animated.ScrollView 
      className="dark:bg-black "
      contentContainerStyle={{ paddingVertical: 16 }}
      onScroll={scrollHandler} 
    >
      {groceryList.map((item) => (
          <View key={item} className="p-4 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-lg dark:text-white">{item}</Text>
          </View>
        ))}
    </Animated.ScrollView>
  )
}

export default Vault