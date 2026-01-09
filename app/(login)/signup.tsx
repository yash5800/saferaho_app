import { AuthContext } from '@/components/auth/Auth';
import { CryptoContext } from '@/components/crypto/Crypto';
import { displayToast } from '@/util/disToast';
import { registerUser, registerUserExists } from '@/util/registerUser';
import { Link, router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import React, { useContext } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import valid from 'validator';

type FormState = {
  state : {
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
  },
  action:{
    type: string;
    payload: string;
  }
}

function reducer(state: FormState['state'], action: FormState['action']) {
  switch (action.type) {
    case 'SET_USERNAME':
      return { ...state, userName: action.payload };
    case 'SET_EMAIL':
      return { ...state, email: action.payload };
    case 'SET_PASSWORD':
      return { ...state, password: action.payload };
    case 'SET_CONFIRM_PASSWORD':
      return { ...state, confirmPassword: action.payload };
    case 'RESET_FORM':
      return { userName: '', email: '', password: '', confirmPassword: '' };
    default:
      return state;
  }
}

const Signup = () => {
  const colorScheme = useColorScheme();
  const [form,setForm] = React.useReducer(reducer, {
    userName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });  
  const [inputError, setInputError] = React.useState<{ field: string , message: string }[]>([]);
  const [passwordLevel, setPasswordLevel] = React.useState(0);
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [enableSignup, setEnableSignup] = React.useState(false);
  const { setAuthenticated } = useContext(AuthContext);
  const [signUpLoading, setSignUpLoading] = React.useState(false);
    const { setIsLocked } = useContext(CryptoContext);

  function evaluatePasswordStrength(password: string) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    setPasswordLevel(strength);
  }

  React.useEffect(() => {
    evaluatePasswordStrength(form.password);

    if(form.userName.length > 0 && form.email.length > 0 && form.password.length > 0 && form.confirmPassword.length > 0 && passwordLevel >= 3 && form.password === form.confirmPassword && emailIsValid(form.email) && form.userName.length >=6) {
      setEnableSignup(true);
    } else {
      setEnableSignup(false);
    }

    // Clear input errors when user starts typing
    setInputError((prev) => prev.filter(err => {
      if(err.field === 'userName' && form.userName.length > 0) return false;
      if(err.field === 'email' && form.email.length > 0) return false;
      if(err.field === 'password' && form.password.length > 0) return false;
      if(err.field === 'confirmPassword' && form.confirmPassword.length > 0) return false;
      return true;
    }));
  }, [form.password, form.userName, form.email, form.confirmPassword, passwordLevel]);

  function emailIsValid(email: string) {
    return valid.isEmail(email);
  }

  const handleSignup = async () => {
    setSignUpLoading(true);
    setInputError([]);
    
    displayToast({
      message: 'Signup functionality is implemented...',
      type: 'info'
    });

    try{
      const userExists = await registerUserExists(
        form.userName,
        form.email
      );

      if(userExists.type === 'error' && userExists.field){
        setInputError((prev) => [...prev, { field: userExists.field as string, message: userExists.message }]);
        return;
      }
      else if(userExists.type === 'unknown error'){
        displayToast({
          message: userExists.message || 'An unknown error occurred.',
          type: 'error'
        });
        return;
      }

      const res = await registerUser({
        userName: form.userName,
        email: form.email,
        password: form.password
      })

      console.log("Registration Result: ", res);

      // accountUUID: res.accountUUID,
      // accountName: res.accountName,
      // email: res.email,
      // _id: res._id,
      // _createdAt: res._createdAt,
      // secret : {
      //   pk_salt: res.pk_salt,
      //   encryptedMasterKey: res.encryptedMasterKey
      // }

      //TODO: Store user data and token

      displayToast({
        message: 'User registered successfully!',
        type: 'success'
      });

      // Reset form after successful registration
      setForm({ type: 'RESET_FORM', payload: '' });
      setAuthenticated(true);
      setIsLocked(false);

    }
    catch(error){
      console.error("Signup error: ", error);
      displayToast({
        message: 'An error occurred during signup. Please try again.',
        type: 'error'
      });

      setSignUpLoading(false);
    }
    finally{
      setSignUpLoading(false);
    }

  }

  return (
    <SafeAreaView className="flex-1 bg-[#dbeaea] dark:bg-[#181818]">
      <ScrollView contentContainerClassName="flex-1">
        {/* back header */}
        <View className="w-full flex-row justify-center items-center p-4">
          <TouchableOpacity
            className="absolute left-4 bg-white dark:bg-slate-700 rounded-full p-2"
            onPress={() => router.replace('/(login)')}
          >
            <ArrowLeft color={colorScheme === 'dark' ? 'white' : 'gray'} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold dark:text-white">
            SafeRaho
          </Text>
        </View>

        {/* Sign up Container */}
        <View className="flex-1 justify-center items-center px-4 pb-6 mt-2">
          <View className="w-full rounded-3xl bg-white flex justify-center items-center p-6 dark:bg-[#1f1f1f]">
            <Text className="text-xl font-semibold dark:text-white">
              Create Account
            </Text>

            <View className="justify-center items-start w-full">
              <Text className="text-gray-800 dark:text-gray-300 mt-4 text-center font-semibold mb-2">
                User Name
              </Text>
              <TextInput
                className={'w-full rounded-full text-zinc-900 bg-slate-200 pl-5' + ' placeholder:text-zinc-400 dark:bg-slate-700 dark:text-zinc-100'}
                placeholder="Enter user name"
                placeholderTextColor={colorScheme === 'dark' ? '#888888' : '#aaaaaa'}
                keyboardType="default"
                autoCapitalize="words"
                onChangeText={(text) => setForm({ type: 'SET_USERNAME', payload: text.trim() })}
                value={form.userName}
              />
              {
                inputError.find(err => err.field === 'userName') && (
                  <Text className="text-red-500 mt-1 ml-2 text-xs">
                    {inputError.find(err => err.field === 'userName')?.message}
                  </Text>
                )
              }
              {
                form.userName.length < 6 && form.userName.length > 0 && (
                  <Text className="text-red-500 mt-1 ml-2 text-xs">
                    User name must be at least 6 characters long.
                  </Text>
                )
              }

              <Text className="text-gray-800 dark:text-gray-300 mt-4 text-center font-semibold mb-2">
                Email
              </Text>
              <TextInput
                className={'w-full rounded-full text-zinc-900 bg-slate-200 pl-5' + ' placeholder:text-zinc-400 dark:bg-slate-700 dark:text-zinc-100'}
                placeholder="Enter your email"
                placeholderTextColor={colorScheme === 'dark' ? '#888888' : '#aaaaaa'}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(text) => setForm({
                  type:'SET_EMAIL',
                  payload: text.trim()
                })}
                value={form.email}
              />
              {
                inputError.find(err => err.field === 'email') && (
                  <Text className="text-red-500 mt-1 ml-2 text-xs">
                    {inputError.find(err => err.field === 'email')?.message}
                  </Text>
                )
              }
              {
                form.email && !emailIsValid(form.email) && (
                  <Text className="text-red-500 mt-1 ml-2 text-xs">
                    Please enter a valid email address.
                  </Text>
                )
              }

              <Text className="text-gray-800 dark:text-gray-300 mt-4 text-center font-semibold mb-2">
                Password
              </Text>
              <View className="w-full">
                <TextInput
                  className={'rounded-full text-zinc-900 bg-slate-200 pl-5 pr-12' + ' placeholder:text-zinc-400 dark:bg-slate-700 dark:text-zinc-100'}
                  placeholder="Create a password"
                  placeholderTextColor={colorScheme === 'dark' ? '#888888' : '#aaaaaa'}
                  keyboardType="default"
                  autoCapitalize="none"
                  secureTextEntry={!passwordVisible}
                  value={form.password}
                  onChangeText={(text) => setForm({ type: 'SET_PASSWORD', payload: text.trim() })}
                />
                <TouchableOpacity
                  className="absolute right-4 top-3"
                  onPress={() => setPasswordVisible((prev) => !prev)}
                >
                  {passwordVisible ? (
                    <EyeOff color={colorScheme === 'dark' ? 'white' : 'gray'} />
                  ) : (
                    <Eye color={colorScheme === 'dark' ? 'white' : 'gray'} />
                  )}
                </TouchableOpacity>
              </View>
              {
                passwordLevel < 3 && form.password.length > 0 && (
                  <Text className="text-red-500 mt-1 ml-2 text-xs">
                    Password is too weak. Use at least 8 characters, including uppercase, lowercase, numbers, and special characters.
                  </Text>
                )
              }
              {
                inputError.find(err => err.field === 'password') && (
                  <Text className="text-red-500 mt-1 ml-2 text-xs">
                    {inputError.find(err => err.field === 'password')?.message}
                  </Text>
                )
              }

              <Text className="text-gray-800 dark:text-gray-300 mt-4 text-center font-semibold mb-2">
                Confirm Password
              </Text>
              <View className="w-full">
                <TextInput
                  className={'rounded-full text-zinc-900 bg-slate-200 pl-5 pr-12' + ' placeholder:text-zinc-400 dark:bg-slate-700 dark:text-zinc-100'}
                  placeholder="Re-enter your password"
                  placeholderTextColor={colorScheme === 'dark' ? '#888888' : '#aaaaaa'}
                  keyboardType="default"
                  autoCapitalize="none"
                  secureTextEntry={!passwordVisible}
                  onChangeText={(text) => setForm({ type: 'SET_CONFIRM_PASSWORD', payload: text.trim() })}
                  value={form.confirmPassword}
                />
                <TouchableOpacity
                  className="absolute right-4 top-3"
                  onPress={() => setPasswordVisible((prev) => !prev)}
                >
                  {passwordVisible ? (
                    <EyeOff color={colorScheme === 'dark' ? 'white' : 'gray'} />
                  ) : (
                    <Eye color={colorScheme === 'dark' ? 'white' : 'gray'} />
                  )}
                </TouchableOpacity>
              </View>
              {
                inputError.find(err => err.field === 'confirmPassword') && (
                  <Text className="text-red-500 mt-1 ml-2 text-xs">
                    {inputError.find(err => err.field === 'confirmPassword')?.message}
                  </Text>
                )
              }

              <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1 self-start">
                By signing up, you agree to our Terms of Service and Privacy Policy.
              </Text>

              <TouchableOpacity className={`w-full bg-black dark:bg-white rounded-full mt-4 py-4 flex-row justify-center items-center gap-2 ${!enableSignup ? 'opacity-50' : ''}`}
                onPress={handleSignup}
                disabled={!enableSignup || signUpLoading}
              >
                {
                  signUpLoading ?
                  <>
                    <ActivityIndicator color={colorScheme === 'dark' ? 'black' : 'white'} size="small" />
                    <Text className="text-center text-white dark:text-black font-semibold">
                      Creating Account...
                    </Text>
                  </>
                  :
                  <Text className="text-center text-white dark:text-black font-semibold">
                    Create Account
                  </Text>
                }
              </TouchableOpacity>

              <Text className="self-center text-gray-600 dark:text-gray-400 mt-5">
                Already have an account? <Link href="/(login)/signin" className='font-semibold text-black dark:text-white'>Sign In</Link>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signup;