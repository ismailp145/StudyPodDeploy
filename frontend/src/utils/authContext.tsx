import React, { createContext, PropsWithChildren, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SplashScreen, useRouter } from 'expo-router';

SplashScreen.preventAutoHideAsync();

type StoredAuth = {
  isLoggedIn: boolean;
  firebaseId: string | null;
};

type AuthState = {
  isReady: boolean;
  isLoggedIn: boolean;
  firebaseId: string | null;
  logIn: (uid: string) => void;
  logOut: () => void;
};

const authStorageKey = 'auth-key';

export const AuthContext = createContext<AuthState>({
  isReady: false,
  isLoggedIn: false,
  firebaseId: null,
  logIn: () => {},
  logOut: () => {},
});

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firebaseId, setFirebaseId] = useState<string | null>(null);
  const router = useRouter();

  const storeAuthState = async (newState: StoredAuth) => {
    try {
      await AsyncStorage.setItem(authStorageKey, JSON.stringify(newState));
    } catch (error) {
      console.log('Error saving auth state', error);
    }
  };

  const logIn = (uid: string) => {
    setIsLoggedIn(true);
    setFirebaseId(uid);
    storeAuthState({ isLoggedIn: true, firebaseId: uid });
    router.replace('/');
  };

  const logOut = () => {
    setIsLoggedIn(false);
    setFirebaseId(null);
    storeAuthState({ isLoggedIn: false, firebaseId: null });
    router.replace('/(auth)/Home');
  };

  useEffect(() => {
    const bootstrap = async () => {
      await new Promise((r) => setTimeout(r, 1000));
      try {
        const raw = await AsyncStorage.getItem(authStorageKey);
        if (raw) {
          const { isLoggedIn, firebaseId } = JSON.parse(raw) as StoredAuth;
          setIsLoggedIn(isLoggedIn);
          setFirebaseId(firebaseId);
        }
      } catch (error) {
        console.log('Error restoring auth state', error);
      }
      setIsReady(true);
    };
    bootstrap();
  }, []);

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync();
  }, [isReady]);

  return (
    <AuthContext.Provider value={{ isReady, isLoggedIn, firebaseId, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

