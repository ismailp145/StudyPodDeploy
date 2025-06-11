// src/app/(protected)/_layout.tsx
import { AuthContext } from "../../utils/authContext";
import { Redirect, Tabs } from "expo-router";
import { useContext } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text } from "react-native";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function TabsLayout() {
  const { isReady, isLoggedIn } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  if (!isReady) return null;
  if (!isLoggedIn) return <Redirect href="/(auth)/Home" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#5865F2",
        tabBarInactiveTintColor: "#a0a0a0",
        tabBarShowLabel: true,
        tabBarLabelPosition: "below-icon",
        tabBarStyle: {
          backgroundColor: "#1e2124",
          height: 74,
          paddingBottom: insets.bottom,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
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
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="arch" size={size} color={color} />
          ),
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12, marginTop: 4 }}>Home</Text>
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
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12, marginTop: 4 }}>My Playlist</Text>
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
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12, marginTop: 4 }}>Explore</Text>
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
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12, marginTop: 4 }}>Create</Text>
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
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12, marginTop: 4 }}>Settings</Text>
          ),
        }}
      />
    </Tabs>
  );
}
