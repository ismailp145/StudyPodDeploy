// This file can be deleted or replaced with:

// If you still need type declarations, use this instead:
declare module '@firebase/auth/react-native' {
  import { Persistence } from 'firebase/auth';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  
  export function getReactNativePersistence(storage: typeof AsyncStorage): Persistence;
}