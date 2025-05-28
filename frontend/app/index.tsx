import { Text, View,} from "react-native";
import {Link} from "expo-router";
export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    > 
    <Link href = "/SignUp">
      <Text> Go to Sign Up</Text>  
      </Link>
     <Link href = "/LogIn">
      <Text> Go to Log In</Text>  
      </Link>
    </View>
  );
}
