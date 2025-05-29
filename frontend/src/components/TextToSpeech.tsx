import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';

interface TextToSpeechProps {
  text: string;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ text }) => {
  const [speaking, setSpeaking] = useState(false);

  const handlePlay = () => {
    if (!text) return;
    Speech.speak(text, {
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
    });
    setSpeaking(true);
  };

  const handleStop = () => {
    Speech.stop();
    setSpeaking(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePlay}
        disabled={!text || speaking}
        style={[styles.button, speaking && styles.disabled]}
      >
        <Ionicons name="play" size={32} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleStop}
        disabled={!speaking}
        style={[styles.button, !speaking && styles.disabled]}
      >
        <Ionicons name="stop" size={32} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 12,
  },
  button: {
    marginHorizontal: 16,
  },
  disabled: {
    opacity: 0.3,
  },
});

export default TextToSpeech;
