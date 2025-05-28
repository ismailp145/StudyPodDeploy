import { Text, View } from "react-native";
import { Link } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";


export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setIsLoading(false);
      } else {
        // User is signed out, redirect to login
        return(
         <View> 
          <Link href="/(auth)">
            <Text>Login</Text>
          </Link>
        </View>  
        );
      }
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Link href="/(auth)">
        <Text>Welcome to the Main screen!</Text>
      </Link>
    </View>
  );
}