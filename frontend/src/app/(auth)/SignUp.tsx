// app/SignUp.tsx
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '@/firebaseConfig';
import { AuthContext } from '@/src/utils/authContext';
import axios from 'axios';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { logIn } = useContext(AuthContext);

  const handleSignUp = async () => {
    setErrorMessage('');
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Set display name
      await updateProfile(user, { displayName: name });

      // Create in backend
      try {
        await axios.post('https://studypod-nvau.onrender.com/user', {
          firebaseId: user.uid,
          email: user.email,
        });
      } catch {
        console.warn('Backend user creation failed');
      }

      // Store UID & navigate
      logIn(user.uid);
    } catch (error: any) {
      let msg = 'Failed to create account. Please try again.';
      if (error.code === 'auth/email-already-in-use')
        msg = 'This email is already registered.';
      if (error.code === 'auth/weak-password')
        msg = 'Password is too weak.';
      if (error.code === 'auth/invalid-email') msg = 'Please enter a valid email.';
      setErrorMessage(msg);
      console.error(error.code, error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#FF3B30" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Full Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#666"
          />
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#666"
          />
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#666"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              placeholderTextColor="#666"
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
              <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/LogIn')}>
            <Text style={styles.loginText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#23272A' },
  header: { flexDirection: 'row', padding: 20, paddingTop: 10 },
  backButton: { padding: 8 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 8, marginTop: 20 },
  subtitle: { fontSize: 16, color: '#B9BBBE', marginBottom: 30 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, color: '#FFF', marginBottom: 8 },
  input: {
    backgroundColor: '#2C2F33',
    borderRadius: 8,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#2C2F33',
    borderRadius: 8,
    alignItems: 'center',
  },
  passwordInput: { flex: 1, padding: 16, color: '#FFF', fontSize: 16 },
  eyeIcon: { padding: 10 },
  button: { backgroundColor: '#5865F2', borderRadius: 8, padding: 16, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#B9BBBE', fontSize: 14 },
  loginText: { color: '#5865F2', fontWeight: '600', marginLeft: 4 },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ED4245',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: { color: '#FFF', marginLeft: 8, flex: 1 },
});
