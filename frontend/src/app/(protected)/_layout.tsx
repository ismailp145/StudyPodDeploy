// src/app/(protected)/_layout.tsx
import { AuthContext } from "../../utils/authContext";
import { Redirect, Tabs } from "expo-router";
import { useContext } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";

type IconName = keyof typeof AntDesign.glyphMap;

export default function TabsLayout() {
  const { isReady, isLoggedIn } = useContext(AuthContext);
  if (!isReady) return null;
  if (!isLoggedIn) return <Redirect href="/(auth)/Home" />;

  const iconMap: Record<string, IconName> = {
    index: "home",
    Settings: "setting",
    MyPodcasts: "sound",
    discovery: "book",
  };

  const titleMap: Record<string, string> = {
    index: "Create",
    Settings: "Settings",
    MyPodcasts: "My Playlist",
    discovery: "Explore",
  };

  return (
    <Tabs
      screenOptions={({ route }) => {
        const name = route.name;
        const iconName = iconMap[name] ?? "question";
        const title = titleMap[name] ?? name;

        return {
          headerShown: false,
          title,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name={iconName} size={size} color={color} />
          ),

          // ← Fix for purple active icon
          tabBarActiveTintColor: "#5865F2",
          tabBarInactiveTintColor: "#c7c7c7",

          // ← your custom bar style
          tabBarStyle: {
            backgroundColor: "#1e2124",
            height: 70,
            paddingTop: 8,
            borderTopWidth: 0,      // gets rid of the default hairline
            elevation: 0,           // Android shadow
            shadowOpacity: 0,
            justifyContent: 'space-around', // Distribute items evenly
            alignItems: 'center', // Center items vertically
          },
          tabBarLabelStyle: {
            paddingBottom: 4,
            fontSize: 12,
          },
          tabBarItemStyle: {
            flex: 1, // Each item takes equal space
            flexDirection: 'column', // Stack icon and text vertically
            alignItems: 'center', // Center icon and text horizontally
            paddingHorizontal: 5, // Add some horizontal padding to prevent cutoff
          },
        };
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="MyPodcasts" />
      <Tabs.Screen name="discovery" />
      <Tabs.Screen name="Settings" />

      {/* if you still need "player" for deep-linking/navigation but don't want it visible: */}
      <Tabs.Screen
        name="player"
        options={{ tabBarButton: () => null }}
      />
    </Tabs>
  );
}
