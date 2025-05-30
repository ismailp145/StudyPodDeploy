import React, { useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import SearchBar from '../../components/SearchBar';

const List: React.FC = () => {
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [ttsInfo, setTtsInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (prompt: string) => {
    setLoading(true);
    setTtsInfo(null);

    try {
      // 1. Generate the text
      const genRes = await fetch(
        `http://localhost:5008/podcast-audio/generate?prompt=${encodeURIComponent(
          prompt
        )}`
      );
      if (!genRes.ok) throw new Error(`Generate failed: ${genRes.status}`);
      const { test: text } = await genRes.json();
      setGeneratedContent(text);

      // 2. POST that text to your TTS endpoint
      const ttsRes = await fetch('http://localhost:5008/tts-server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!ttsRes.ok) throw new Error(`TTS failed: ${ttsRes.status}`);

      // 3. Read the binary and show a summary
      const blob = await ttsRes.blob();
      setTtsInfo(`TTS response: ${blob.type}, ${blob.size.toLocaleString()} bytes`);
    } catch (err: any) {
      console.error(err);
      setTtsInfo(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>List Generator</Text>
      <SearchBar onGenerate={handleGenerate} />

      <View style={styles.content}>
        {loading && <ActivityIndicator size="large" />}

        {!loading && generatedContent && (
          <ScrollView>
            <Text style={styles.heading}>Generated Content:</Text>
            <Text style={styles.text}>{generatedContent}</Text>
          </ScrollView>
        )}

        {!loading && !generatedContent && (
          <Text style={styles.placeholder}>
            Enter a prompt to generate content.
          </Text>
        )}

        {!loading && ttsInfo && (
          <Text style={[styles.text, { marginTop: 20 }]}>{ttsInfo}</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default List;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  content: { flex: 1, marginTop: 12 },
  heading: { fontSize: 20, marginBottom: 8 },
  text: { fontSize: 16, lineHeight: 22 },
  placeholder: { fontSize: 16, color: '#666' },
});
