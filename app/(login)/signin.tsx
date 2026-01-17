import { AuthContext } from '@/components/auth/Auth';
import { CryptoContext } from '@/components/crypto/Crypto';
import { displayToast } from '@/util/disToast';
import { signInUser } from '@/util/signInUser';
import { Link, router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import React, { useContext } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function reducer(state: { userInput: string; password: string }, action: { type: string; payload: string }) {
  switch (action.type) {
    case 'SET_USER_INPUT':
      return { ...state, userInput: action.payload };
    case 'SET_PASSWORD':
      return { ...state, password: action.payload };
    case 'RESET_FORM':
      return { userInput: '', password: '' };
    default:
      return state;
  }
}

const Signin = () => {
  const colorScheme = useColorScheme();
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [form, setForm] = React.useReducer(reducer,{
    userInput: '',
    password: ''
  });
  const [inputError, setInputError] = React.useState<null | { field: string; message: string }>(null);
  const { setAuthenticated } = useContext(AuthContext);
  const [signInLoading, setSignInLoading] = React.useState(false);
  const { setIsLocked } = useContext(CryptoContext);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  }

  const handleSignIn = async () => {
    setInputError(null);
    setSignInLoading(true);
    const res = await signInUser({
      userInput: form.userInput,
      password: form.password
    });

    if(res?.type === 'error' && res.field && res.message){
      setInputError({ field: res.field, message: res.message });
    }
    else if(res?.type === 'error' && res.field === undefined){
      displayToast({
        type: 'error',
        message: res.message
      });
    }
    else{
      displayToast({
        type: 'success',
        message: 'Signed in successfully!'
      });
      
      setAuthenticated(true);
      console.log('setting is locked to false');
      setIsLocked(false);
    }

    setSignInLoading(false);
  }

  return (
  <SafeAreaView className="flex-1 bg-[#dbeaea] dark:bg-[#181818]">
    <ScrollView contentContainerClassName="flex-1">
      {/* back header */}
      <View className='w-full flex-row justify-center items-center p-4'>
         <TouchableOpacity
          className='absolute left-4 bg-white dark:bg-slate-700 rounded-full p-2'
          onPress={()=>router.replace('/(login)')}
         >
           <ArrowLeft color={colorScheme === 'dark' ? 'white' : 'gray'} />
         </TouchableOpacity>
          <Text className="text-lg font-semibold dark:text-white">
            SafeRaho
         </Text>
      </View>

      {/* Sign in Container */}
      <View className='flex-1 justify-center items-center px-4 pb-8'>
         <View
          className='w-full rounded-3xl bg-white flex justify-center items-center p-6  dark:bg-[#1f1f1f]' 
         >
          <Text className='text-xl font-semibold dark:text-white'>
             Welcome Back!
          </Text>

          <View className='justify-center items-start mt-3 w-full'>
            <Text className='text-gray-800 dark:text-gray-300 mt-4 text-center font-semibold mb-2'>
              Email / Username
            </Text>
            <TextInput 
              className={'w-full rounded-full text-zinc-900 bg-slate-200 pl-5' + ' placeholder:text-zinc-400 dark:bg-slate-700 dark:text-zinc-100'}
              placeholder='Enter your email/username '
              placeholderTextColor={colorScheme === 'dark' ? '#888888' : '#aaaaaa'}
              keyboardType='email-address'
              autoCapitalize='none'
              onChangeText={(text)=> setForm({type: 'SET_USER_INPUT', payload: text})}
            />
            {
              inputError && inputError.field === 'userInput' ?
              <Text className='text-red-600 mt-1 ml-2'>
                {inputError.message}
              </Text>
              :
              null
            }
            <Text className='text-gray-800 dark:text-gray-300 mt-4 text-center font-semibold mb-2'>
              Password
            </Text>
            <View className='w-full'>
              <TextInput 
                className={'rounded-full text-zinc-900 bg-slate-200 pl-5' + ' placeholder:text-zinc-400 dark:bg-slate-700 dark:text-zinc-100 divide-x-8'}
                placeholder='Enter your password'
                placeholderTextColor={colorScheme === 'dark' ? '#888888' : '#aaaaaa'}
                keyboardType='default'
                autoCapitalize='none'
                secureTextEntry={!passwordVisible}
                onChangeText={(text)=> setForm({type:'SET_PASSWORD',payload:text.trim()})}
              />
              <TouchableOpacity
                className='absolute right-4 top-3'
                onPress={togglePasswordVisibility}
              >
                {
                  passwordVisible ? 
                     <EyeOff color={colorScheme === 'dark' ? 'white' : 'gray'} />
                     :
                      <Eye color={colorScheme === 'dark' ? 'white' : 'gray'} />
                }
              </TouchableOpacity>
            </View>
            {
              inputError && inputError.field === 'password' ?
              <Text className='text-red-600 mt-1 ml-2'>
                {inputError.message}
              </Text>
              :
              null
            }
            <Link href="/(login)/forgot" className='text-base text-gray-600 font-medium mt-3 self-end dark:text-gray-400'
            >
              Forgot your password?
            </Link>
            <TouchableOpacity
              className='w-full bg-black dark:bg-white rounded-full mt-6 py-4 flex-row justify-center items-center gap-2'
              onPress={handleSignIn}
              disabled={signInLoading}
            >
              {
                signInLoading ?
                <>
                  <ActivityIndicator color={colorScheme === 'dark' ? 'black' : 'white'} size="small" />
                  <Text className='text-center text-white dark:text-black font-semibold'>
                    Signing In...
                  </Text>
                </>
                :
                <Text className='text-center text-white dark:text-black font-semibold'>
                  Sign In
                </Text>
              }
            </TouchableOpacity>
            <Text className='self-center text-gray-600 dark:text-gray-400 mt-5'>
              {"Don't have an account?"} <Link href="/(login)/signup" className='font-semibold text-black dark:text-white'>Sign Up</Link>
            </Text>
          </View>
         </View>
      </View>
    </ScrollView>
  </SafeAreaView>
  )
}

export default Signin