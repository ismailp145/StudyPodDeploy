import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from "firebase/auth";
import { Ionicons } from '@expo/vector-icons';
import {auth} from '@/firebaseConfig';
import { AuthContext } from "@/src/utils/authContext";
import { useContext } from "react";

export default function LogIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    const authContext = useContext(AuthContext);

    const handleLogin = async () => {
        setErrorMessage(''); // Clear any previous errors
        
        if (!email || !password) {
            setErrorMessage('Please enter both email and password');
            return;
        }

        setLoading(true);
         
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Signed in 
            const user = userCredential.user;
            console.log("Logged in user:", user.email);
            
            // Navigate to the main app
            authContext.logIn(); // Update auth context state
            router.replace('/');
        } catch (error: any) {
            const errorCode = error.code;
            const errorMessage = error.message;

            let message = 'Failed to log in. Please try again.';
            if (errorCode === 'auth/invalid-credential') {
                message = 'Invalid email or password';
            } else if (errorCode === 'auth/too-many-requests') {
                message = 'Too many unsuccessful login attempts. Please try again later.';
            }
            
            setErrorMessage(message);
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

                {errorMessage ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={20} color="#FF3B30" />
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                ) : null}

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
                            placeholderTextColor={'#666'}
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
                                placeholderTextColor={'#666'}
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
        backgroundColor: '#23272A', // Not Quite Black
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
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#B9BBBE',
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
        color: '#FFFFFF',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#2C2F33', // Dark Not Black
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        color: '#FFFFFF',
    },
    passwordContainer: {
        flexDirection: 'row',
        backgroundColor: '#2C2F33', // Dark Not Black
        borderRadius: 8,
        alignItems: 'center',
    },
    passwordInput: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        color: '#FFFFFF',
    },
    eyeIcon: {
        padding: 10,
    },
    forgotPassword: {
        color: '#5865F2', // Blurple
        textAlign: 'right',
        marginTop: 10,
        marginBottom: 30,
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#5865F2', // Blurple
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
        color: '#B9BBBE',
        fontSize: 14,
    },
    signUpText: {
        color: '#5865F2', // Blurple
        fontWeight: '600',
        fontSize: 14,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ED4245', // Discord Red
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        opacity: 0.9,
    },
    errorText: {
        color: '#FFFFFF',
        marginLeft: 8,
        flex: 1,
        fontSize: 14,
    },
});
