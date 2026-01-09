import { Ionicons } from '@expo/vector-icons';
import React, { useContext, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CryptoContext } from './crypto/Crypto';

interface LockScreenProps {
  onUnlockSuccess?: () => void;
  onUnlockFail?: () => void;
}

const LockScreen = ({ onUnlockSuccess, onUnlockFail }: LockScreenProps) => {
  const { unlock } = useContext(CryptoContext);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async () => {
    setIsUnlocking(true);
    setError(null);

    try {
      const success = await unlock();
      
      if (success) {
        onUnlockSuccess?.();
      } else {
        setError('Authentication failed. Please try again.');
        onUnlockFail?.();
      }
    } catch (err) {
      setError('An error occurred during unlock.');
      console.error('LockScreen unlock error:', err);
      onUnlockFail?.();
    } finally {
      setIsUnlocking(false);
    }
  };


  return (
    <SafeAreaView className="flex-1 bg-[#dbeaea] dark:bg-[#181818]">
      <View className="flex-1 justify-center items-center px-6">
        {/* Lock Icon */}
        <View className="mb-8 bg-white dark:bg-[#2a2a2a] rounded-full p-8 shadow-lg">
          <Ionicons 
            name="lock-closed" 
            size={80} 
            color="#3b82f6" 
          />
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
          SafeRaho is Locked
        </Text>

        {/* Subtitle */}
        <Text className="text-base text-gray-600 dark:text-gray-400 text-center mb-10">
          Unlock to access your secure data
        </Text>

        {/* Error Message */}
        {error && (
          <View className="mb-6 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg border border-red-200 dark:border-red-800">
            <Text className="text-red-600 dark:text-red-400 text-center">
              {error}
            </Text>
          </View>
        )}

        {/* Unlock Button */}
        <TouchableOpacity
          onPress={handleUnlock}
          disabled={isUnlocking}
          className={`w-full bg-blue-500 dark:bg-blue-600 rounded-xl py-4 px-8 flex-row justify-center items-center shadow-md ${
            isUnlocking ? 'opacity-60' : 'active:opacity-80'
          }`}
        >
          {isUnlocking ? (
            <>
              <ActivityIndicator color="white" size="small" />
              <Text className="text-white text-lg font-semibold ml-3">
                Unlocking...
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="finger-print" size={24} color="white" />
              <Text className="text-white text-lg font-semibold ml-3">
                Unlock with Biometrics
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Info Text */}
        <Text className="text-sm text-gray-500 dark:text-gray-500 text-center mt-8">
          Your data is encrypted and protected
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default LockScreen;