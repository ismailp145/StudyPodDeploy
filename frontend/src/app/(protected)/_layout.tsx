import { AuthContext } from "../../utils/authContext";
import { Redirect, Tabs } from 'expo-router';
import { useContext } from "react";

export default function TabsLayout () {

  const authState = useContext(AuthContext);
  if (!authState.isReady) {
    return null;
  }

  if (!authState.isLoggedIn) {
    return <Redirect href="/(auth)/Home" />;
  }
  return (
      <Tabs>
        <Tabs.Screen name="Home" options={{headerShown: false}}/>
        <Tabs.Screen name="Search" options={{headerShown: false}}/>
        <Tabs.Screen name="Settings" options={{headerShown: false}}/>
        <Tabs.Screen name="My Podcasts" options={{headerShown: false}}/>
    </Tabs>
  );
}