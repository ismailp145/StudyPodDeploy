import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { AuthContext } from "@/src/utils/authContext";

const Settings = () => {
  const authState = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>This is the settings page.</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => authState.logOut()}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#B9BBBE',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#5865F2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
