import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState } from 'react'

const Home = () => {
  const [prompt, setPrompt] = useState('')

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>StudyPod</Text>
        <Text style={styles.subtitle}>Generate podcasts on any topic</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter a topic or prompt..."
            placeholderTextColor="#72767D"
            value={prompt}
            onChangeText={setPrompt}
            multiline
          />
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Generate Podcast</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23272A',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B9BBBE',
    marginBottom: 32,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 500,
  },
  input: {
    backgroundColor: '#2C2F33', 
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#5865F2', 
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default Home