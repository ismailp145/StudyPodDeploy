// src/app/(protected)/_layout.tsx
import { AuthContext } from "../../utils/authContext";
import { Redirect, Tabs } from "expo-router";
import { useContext } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function TabsLayout() {
  const { isReady, isLoggedIn } = useContext(AuthContext);
  if (!isReady) return null;
  if (!isLoggedIn) return <Redirect href="/(auth)/Home" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#bb86fc",
        tabBarInactiveTintColor: "#a0a0a0",
        tabBarStyle: {
          backgroundColor: "#1e2124",
          height: 80,
          paddingTop: 8,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          paddingBottom: 4,
          fontSize: 12,
        },
        tabBarItemStyle: {
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Create",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="arch" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="MyPodcasts"
        options={{
          title: "My Playlist",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="podcast" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discovery"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
