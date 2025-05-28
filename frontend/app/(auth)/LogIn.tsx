import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from "firebase/auth";
import { Ionicons } from '@expo/vector-icons';
import {auth} from '@/firebaseConfig';
export default function LogIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);
         
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Signed in 
            const user = userCredential.user;
            console.log("Logged in user:", user.email);
            
            // Navigate to the main app
            router.replace('/main');
        } catch (error: any) {
            const errorCode = error.code;
            const errorMessage = error.message;

            let message = 'Failed to log in. Please try again.';
            if (errorCode === 'auth/invalid-credential') {
                message = 'Invalid email or password';
            } else if (errorCode === 'auth/too-many-requests') {
                message = 'Too many unsuccessful login attempts. Please try again later.';
            }
            
            Alert.alert('Error', message);
            console.error(errorCode, errorMessage);
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

            <View style={styles.content}>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity 
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons 
                                    name={showPassword ? "eye-off" : "eye"} 
                                    size={24} 
                                    color="#666" 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity 
                    // onPress={() => router.push('/ForgotPassword')}
                    >
                        <Text style={styles.forgotPassword}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Log In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don&apos;t have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/SignUp')}>
                        <Text style={styles.signUpText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        padding: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
    },
    form: {
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        alignItems: 'center',
    },
    passwordInput: {
        flex: 1,
        padding: 16,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 10,
    },
    forgotPassword: {
        color: '#4A6FFF',
        textAlign: 'right',
        marginTop: 10,
        marginBottom: 30,
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#4A6FFF',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 'auto',
        marginBottom: 20,
    },
    footerText: {
        color: '#666',
        fontSize: 14,
    },
    signUpText: {
        color: '#4A6FFF',
        fontWeight: '600',
        fontSize: 14,
    },
});

// screens/LoginScreen.tsx
// import React, { useState, useRef } from 'react'
// import {
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   Keyboard,
//   TouchableWithoutFeedback,
//   ActivityIndicator,
// } from 'react-native'
// import { auth } from '../../firebaseConfig'
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
// } from 'firebase/auth'
// import type { FirebaseError } from 'firebase/app'
// import { router } from 'expo-router'

// function validateEmail(email: string) {
//   const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//   return re.test(email)
// }

// export default function LoginScreen() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [loading, setLoading] = useState(false)
//   const passwordRef = useRef<TextInput>(null)

//   const isFormValid = validateEmail(email) && password.length >= 6

//   const handleAuth = async (
//     action: 'signIn' | 'signUp',
//     email: string,
//     password: string
//   ) => {
//     setLoading(true)
//     try {
//       if (action === 'signIn') {
//         await signInWithEmailAndPassword(auth, email, password)
//       } else {
//         await createUserWithEmailAndPassword(auth, email, password)
//       }
//       router.replace('/')
//     } catch (error: FirebaseError | any) {
//       console.error(error)
//       const msg =
//         error.code === 'auth/user-not-found'
//           ? 'No account found for that email.'
//           : error.code === 'auth/wrong-password'
//           ? 'Incorrect password.'
//           : error.message
//       alert(`${action === 'signIn' ? 'Login' : 'Sign up'} failed: ${msg}`)
//     } finally {
//       setLoading(false)
//     }
//   }

// //   return (
// //     <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
// //       <KeyboardAvoidingView
// //         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
// //         style={styles.container}
// //       >
// //         <Text style={styles.title}>Welcome Back</Text>

// //         <TextInput
// //           style={styles.textInput}
// //           placeholder="Email"
// //           placeholderTextColor="#888"
// //           keyboardType="email-address"
// //           autoCapitalize="none"
// //           autoCorrect={false}
// //           returnKeyType="next"
// //           onSubmitEditing={() => passwordRef.current?.focus()}
// //           value={email}
// //           onChangeText={setEmail}
// //           accessibilityLabel="Email input"
// //         />

// //         <TextInput
// //           ref={passwordRef}
// //           style={styles.textInput}
// //           placeholder="Password"
// //           placeholderTextColor="#888"
// //           secureTextEntry
// //           autoCapitalize="none"
// //           autoCorrect={false}
// //           returnKeyType="go"
// //           onSubmitEditing={() => isFormValid && handleAuth('signIn', email, password)}
// //           value={password}
// //           onChangeText={setPassword}
// //           accessibilityLabel="Password input"
// //         />

// //         <TouchableOpacity
// //           style={[
// //             styles.button,
// //             (!isFormValid || loading) && styles.buttonDisabled,
// //           ]}
// //           onPress={() => handleAuth('signIn', email, password)}
// //           disabled={!isFormValid || loading}
// //           accessibilityRole="button"
// //           accessibilityLabel="Log in"
// //         >
// //           {loading ? (
// //             <ActivityIndicator />
// //           ) : (
// //             <Text style={styles.text}>Log In</Text>
// //           )}
// //         </TouchableOpacity>

// //         <TouchableOpacity
// //           style={[
// //             styles.button,
// //             (!isFormValid || loading) && styles.buttonDisabled,
// //           ]}
// //           onPress={() => handleAuth('signUp', email, password)}
// //           disabled={!isFormValid || loading}
// //           accessibilityRole="button"
// //           accessibilityLabel="Create new account"
// //         >
// //           {loading ? (
// //             <ActivityIndicator />
// //           ) : (
// //             <Text style={styles.text}>Sign Up</Text>
// //           )}
// //         </TouchableOpacity>
// //       </KeyboardAvoidingView>
// //     </TouchableWithoutFeedback>
// //   )
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#FAFAFA',
// //     padding: 20,
// //   },
// //   title: {
// //     fontSize: 28,
// //     fontWeight: '800',
// //     marginBottom: 40,
// //     color: '#1A237E',
// //   },
// //   textInput: {
// //     height: 50,
// //     width: '100%',
// //     backgroundColor: '#FFFFFF',
// //     borderColor: '#E8EAF6',
// //     borderWidth: 2,
// //     borderRadius: 15,
// //     marginVertical: 10,
// //     paddingHorizontal: 20,
// //     fontSize: 16,
// //     color: '#3C4858',
// //     shadowColor: '#9E9E9E',
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 4,
// //     elevation: 4,
// //   },
// //   button: {
// //     width: '100%',
// //     marginVertical: 10,
// //     backgroundColor: '#5C6BC0',
// //     paddingVertical: 15,
// //     borderRadius: 15,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     shadowColor: '#5C6BC0',
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.4,
// //     shadowRadius: 5,
// //     elevation: 5,
// //   },
// //   buttonDisabled: {
// //     backgroundColor: '#B0BEC5',
// //     shadowOpacity: 0.2,
// //   },
// //   text: {
// //     color: '#FFFFFF',
// //     fontSize: 18,
// //     fontWeight: '600',
// //   },
// // })
