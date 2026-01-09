import { UserDataContext, UserProfile, UserSettings } from '@/context/mainContext';
import { SettingsProperties } from '@/Operations/Settings';
import { useColorScheme } from 'nativewind';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { AuthContext } from '../auth/Auth';
import { CryptoContext } from '../crypto/Crypto';
import LockScreen from '../LockScreen';

interface UserDataProps {
  children: React.ReactNode;
}

const UserData = ({ children }: UserDataProps) => {
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [userSettings, setUserSettings] = React.useState<UserSettings>({
      darkMode: false,
      biometricAuth: false,
      notificationsEnabled: false
    });

  const [cryptoFailedAttempts, setCryptoFailedAttempts] = React.useState(0);
  const [showLockScreen, setShowLockScreen] = useState(false);


  const { setColorScheme } = useColorScheme();
  const { unlock, isLocked , lock } = useContext(CryptoContext);
  const { isAuthenticated } = useContext(AuthContext);

  const initialUnlockRef = useRef(false);

  useEffect(() => {
    if(!isAuthenticated) return;
    if(initialUnlockRef.current) return;

    initialUnlockRef.current = true;

    if(!isLocked){
      setShowLockScreen(false);
      return;
    }

    unlock().then(value => {
      if(!value){
        setShowLockScreen(true);
      }
    }).catch((err) => {
      console.error('Initial unlock failed:', err);
      setShowLockScreen(true);
    });
  },[isAuthenticated])

  // Monitor authentication status
  useEffect(() => {
    if(!isAuthenticated) return;

    const storeSettings = SettingsProperties.getSettings();
    if(storeSettings){
      setUserSettings(storeSettings);
      setColorScheme(storeSettings.darkMode ? 'dark' : 'light');
    }

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if(nextAppState === 'inactive' || nextAppState === 'background'){
        lock();
        setShowLockScreen(true);
      }
    });

    return () => subscription.remove();
    
  }, [isAuthenticated]);

  // Monitor isLocked changes
  // useEffect(() => {
  //   if(!isAuthenticated) return;
  //   setShowLockScreen(isLocked);
  // },[isLocked,isAuthenticated]);

  const handleUnlockSuccess = () => {
    setCryptoFailedAttempts(0);
    setShowLockScreen(false);
  };

  // Handle unlock failure
  const handleUnlockFail = () => {
    setCryptoFailedAttempts(prev => {
      const next = prev + 1;
      if (next >= 3) {
        console.warn('Maximum unlock attempts reached');
        lock();
      }
      return next;
    });
  };

  // Show lock screen if crypto is locked
  if (isAuthenticated && showLockScreen) {
    return (
      <LockScreen 
        onUnlockSuccess={handleUnlockSuccess} 
        onUnlockFail={handleUnlockFail}
      />
    );
  }

  return (
    <UserDataContext.Provider value={{ userProfile, setUserProfile, userSettings, setUserSettings }}>
      {children}
    </UserDataContext.Provider>
  )
}

export default UserData