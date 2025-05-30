import { Text, View,} from "react-native";
import {Link} from "expo-router";
import Auth from "./(auth)/index"

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    > 
    <Auth />
    </View>
  );
}