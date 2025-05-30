import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthIndex() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    {/* <Image 
                        source={require('../../../assets/icon.png')} // Adjust the path to your logo image
                        style={styles.logo}
                        resizeMode="contain"
                    /> */}
                    <Text style={styles.title}>StudyPod</Text>
                    <Text style={styles.subtitle}>Learn together, grow together</Text>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={() => router.push('/LogIn')}
                    >
                        <Text style={styles.buttonText}>Log In</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.button, styles.secondaryButton]} 
                        onPress={() => router.push('/SignUp')}
                    >
                        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Create Account</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.termsText}>
                    By continuing, you agree to our{' '}
                    <Text style={styles.linkText}>Terms of Service</Text> and{' '}
                    <Text style={styles.linkText}>Privacy Policy</Text>
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#23272A', // Discord Not Quite Black
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 20,
        paddingBottom: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#B9BBBE', // Discord Grey
        textAlign: 'center',
    },
    buttonContainer: {
        marginBottom: 20,
        width: '100%',
    },
    button: {
        backgroundColor: '#5865F2', // Discord Blurple
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#2C2F33', // Discord Dark Not Black
        borderWidth: 1,
        borderColor: '#5865F2', // Discord Blurple
    },
    secondaryButtonText: {
        color: '#FFFFFF',
    },
    termsText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#B9BBBE', // Discord Grey
    },
    linkText: {
        color: '#5865F2', // Discord Blurple
        fontWeight: '500',
    },
});