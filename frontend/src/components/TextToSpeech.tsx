import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

interface TextToSpeechProps {
  text: string;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ text }) => {
  const [voices, setVoices] = useState<Speech.Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    (async () => {
      const available = await Speech.getAvailableVoicesAsync();
      setVoices(available);
      if (available.length > 0) {
        setSelectedVoice(available[0].identifier);
      }
    })();
  }, []);

  const handlePlay = () => {
    if (!text || !selectedVoice) return;
    Speech.stop();
    Speech.speak(text, {
      voice: selectedVoice,
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
      <Text style={styles.label}>Select Voice:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedVoice}
          onValueChange={value => setSelectedVoice(value)}
          style={styles.picker}
        >
          {voices.map(v => (
            <Picker.Item
              key={v.identifier}
              label={`${v.name} (${v.language})`}
              value={v.identifier}
            />
          ))}
        </Picker>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={handlePlay}
          disabled={!text || speaking}
          style={[styles.button, speaking && styles.disabled]}
        >
          <Ionicons name="play-circle" size={48} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleStop}
          disabled={!speaking}
          style={[styles.button, !speaking && styles.disabled]}
        >
          <Ionicons name="stop-circle" size={48} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  button: {
    marginHorizontal: 20,
  },
  disabled: {
    opacity: 0.3,
  },
});

export default TextToSpeech;
