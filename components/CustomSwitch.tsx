import React, { useCallback } from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

interface CustomSwitchProps {
  active: boolean;
  activeColor: string;
  inActiveColor: string;
  thumbColor?: string;
  duration?: number;
  scale?: number;
  onToggle?: (isActive: boolean) => void;
  style?: object;
}

const CustomSwitch = ({ active, activeColor, inActiveColor, thumbColor = '#fff', duration = 300, scale = 1, onToggle, style }: CustomSwitchProps) => {

  const isActive = useSharedValue(active);

  const progess = useDerivedValue(() => {
    return withTiming(isActive.value ? 1 : 0, { duration: duration});
  })
  const handleToggle = useCallback(() => {
    isActive.value = !isActive.value;
    if(onToggle) {
      onToggle(isActive.value);
    }
  },[onToggle, isActive]);

  const thumbStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(isActive.value ? 22 : 1 , {
            damping: 30,
            stiffness: 150,
          })
        }
      ]
    }
  })

  const backgroundColor = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progess.value,
      [0,1],
      [inActiveColor, activeColor]
    )
    return {
      backgroundColor
    }
  })

  const ScaleStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            scale: withTiming(isActive.value ? scale * 1.05 : scale, { duration: 150 })
          }
        ]
      }
    })
  
  return (
    <TouchableWithoutFeedback onPress={handleToggle}>
      <Animated.View 
      className='w-[50px] h-[28px] rounded-3xl flex justify-center bg-[#F2F5F7] p-[2px] elevation-sm dark:bg-gray-500'
      style={[backgroundColor, ScaleStyle, style]}
      >
         <Animated.View className='w-[24px] h-[24px] rounded-full p-2 bg-[#fff]' style={[thumbStyles, {
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.2,
          shadowRadius: 2.5,
          elevation: 4,
        },
        {
          backgroundColor: thumbColor
        }
        ]} />
      </Animated.View>
    </TouchableWithoutFeedback>
  )
}

export default CustomSwitch