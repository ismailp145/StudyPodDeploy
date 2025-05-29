import { Tabs } from 'expo-router';

export default () => {
  return (
    <Tabs>
        <Tabs.Screen name="home" options={{headerShown: false}}/>
        <Tabs.Screen name="search" options={{headerShown: false}}/>
        <Tabs.Screen name="combined" options={{headerShown: false}}/>
        <Tabs.Screen name="frontend_audio" options={{headerShown: false}}/>
        <Tabs.Screen name="localtts" options={{headerShown: false}}/>
    </Tabs>
    
  );
}