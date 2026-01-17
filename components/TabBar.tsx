import { registerTabBar } from '@/lib/tabBarContoller';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import TabBarButton from './TabBarButton';

function TabBar({ state, descriptors, navigation } : BottomTabBarProps) {
  const [dimensions, setDimensions] = useState({ height: 20, width: 100 });
  const buttonWidth = dimensions.width / state.routes.length;
  
  const tabBarTranslateY = useSharedValue(0);
  const tabPositionX = useSharedValue(0);

  useEffect(() => {
    tabPositionX.value = withSpring(
      state.index * buttonWidth,
      { duration: 350 }
    );

    registerTabBar(
      () => {
        tabBarTranslateY.value = withTiming(120, { duration: 250 });
      },
      () => {
        tabBarTranslateY.value = withTiming(0, { duration: 250 });
      }
    );
  }, [state.index, buttonWidth, tabPositionX, tabBarTranslateY]);

  const onTabBarLayout = (event: LayoutChangeEvent) => {
    setDimensions({
      height: event.nativeEvent.layout.height,
      width: event.nativeEvent.layout.width
    })
  }

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: tabPositionX.value }
      ]
    }
  });
  
  const animatedHideStyle =  useAnimatedStyle(() => ({
    transform: [{ translateY: tabBarTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.tabBar, animatedHideStyle]} onLayout={onTabBarLayout}>
      <Animated.View style={[animatedStyle,{
        position: 'absolute',
        backgroundColor: '#723FEB',
        borderRadius: 25,
        marginHorizontal: 8,
        height: dimensions.height - 10,
        width: buttonWidth - 18
      }]} />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const labelValue =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const label = typeof labelValue === 'string' ? labelValue : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            color={ isFocused ? "#FFF" : "#222" }
            label={label}
          />
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 70,
    backgroundColor: '#fff',
    paddingVertical: 7,
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowRadius: 10,
    shadowOpacity: 0.1,
    elevation: 5,
  }
})

export default TabBar;