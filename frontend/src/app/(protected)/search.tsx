import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import PodcastPlayer from '../../components/PodcastPlayer';
import VoiceSelector from '../../components/VoiceSelector';
import { AuthContext } from '@/src/utils/authContext';

const Search: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<string>('s3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json');
  const [pressed, setPressed] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { firebaseId } = useContext(AuthContext);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        'https://studypod-nvau.onrender.com/generate-podcast',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt, 
            firebaseId,
            voice: selectedVoice 
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      setGeneratedContent(data.content);
      setTitle(data.title);
      setUrl(data.audioUrl);
      setPressed(true);
    } catch (error) {
      console.error('Error generating content:', error);
      setGeneratedContent('Failed to generate content. Please try again.');
      setPressed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>StudyPod</Text>
        <Text style={styles.subtitle}>Generate podcasts on any topic</Text>

        {!pressed ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter a topic or prompt..."
              placeholderTextColor="#72767D"
              value={prompt}
              onChangeText={setPrompt}
              multiline
            />
            <VoiceSelector
              onVoiceSelect={setSelectedVoice}
              selectedVoice={selectedVoice}
            />
            <TouchableOpacity style={styles.button} onPress={handleGenerate}>
              <Text style={styles.buttonText}>Generate Podcast</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#5865F2" />
            ) : (
              <>
                {generatedContent && (
                  <Text style={styles.resultText}>{generatedContent}</Text>
                )}
                {url && title && <PodcastPlayer s3Url={url} isExpanded={true} />}
                <TouchableOpacity
                  style={[styles.button, { marginTop: 20 }]}
                  onPress={() => {
                    setPressed(false);
                    setPrompt('');
                    setGeneratedContent(null);
                    setUrl(null);
                    setTitle(null);
                  }}
                >
                  <Text style={styles.buttonText}>Start a New Podcast</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23272A',
  },
  contentContainer: {
    flexGrow: 1,
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
  resultContainer: {
    width: '100%',
    maxWidth: 500,
    padding: 20,
    backgroundColor: '#2C2F33',
    borderRadius: 8,
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
});

export default Search;
