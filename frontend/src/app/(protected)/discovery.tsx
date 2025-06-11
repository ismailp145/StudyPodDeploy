import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Podcast from '@/src/components/PodcastCard';
import axios from 'axios';
import { AuthContext } from '@/src/utils/authContext';
import { LinearGradient } from 'expo-linear-gradient';

// Props expected by PodcastCard
interface PodcastData {
  id: string;
  title: string;
  summary: string;
  audioUrl: string;
}

// Internal shapes
interface AudioFileResponse {
  id: string;
  url: string;
  summary: { keywords: string[]; title: string; summary: string } | null;
}
interface UserAudioFileEntry {
  audioFile: { id: string; url: string; summary: { keywords: string[] } | null };
  user: { firebaseId: string };
}

const API_BASE_URL = 'https://studypod-nvau.onrender.com';

export default function Discovery() {
  const [initialPodcasts, setInitialPodcasts] = useState<PodcastData[]>([]);
  const [discoveryPodcasts, setDiscoveryPodcasts] = useState<PodcastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { firebaseId } = useContext(AuthContext);
  const router = useRouter();

  const fetchInitial = useCallback(async () => {
    const res = await axios.post<PodcastData[]>(
      `${API_BASE_URL}/podcasts/initialize`
    );
    return res.data;
  }, []);

  const fetchDiscovery = useCallback(async () => {
    const [audioRes, userAudioRes] = await Promise.all([
      axios.get<AudioFileResponse[]>(`${API_BASE_URL}/mongo/audio-files`),
      axios.get<UserAudioFileEntry[]>(`${API_BASE_URL}/mongo/user-audio-files`),
    ]);

    const keywords = new Set<string>();
    userAudioRes.data
      .filter(entry => entry.user.firebaseId === firebaseId)
      .forEach(entry =>
        entry.audioFile.summary?.keywords.forEach(k => keywords.add(k))
      );

    const matched = audioRes.data.filter(
      file => file.summary?.keywords.some(k => keywords.has(k))
    );

    return matched.map(file => ({
      id: file.id,
      title: file.summary?.title ?? 'Untitled',
      summary: file.summary?.summary ?? '',
      audioUrl: file.url,
    }));
  }, [firebaseId]);

  const fetchAll = useCallback(async () => {
    if (!firebaseId) return;
    try {
      setError(null);
      const [initial, discovery] = await Promise.all([
        fetchInitial(),
        fetchDiscovery(),
      ]);
      setInitialPodcasts(initial);
      setDiscoveryPodcasts(discovery);
    } catch (e) {
      console.error('Error loading podcasts:', e);
      setError('Failed to load podcasts. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [firebaseId, fetchInitial, fetchDiscovery]);

  // Refresh every time this screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (!firebaseId) {
        router.replace('/(auth)/Home');
        return;
      }
      setLoading(true);
      fetchAll();
    }, [firebaseId, fetchAll, router])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  if (!firebaseId) return null;
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5865F2" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#23272A', '#2C2F33']}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>Discover Podcasts</Text>
        <Text style={styles.headerSubtitle}>Explore new content and recommendations</Text>
      </LinearGradient>
      <ScrollView
        style={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Podcasts</Text>
          <FlatList
            data={initialPodcasts}
            renderItem={({ item }) => (
              <Podcast
                id={item.id}
                title={item.title}
                summary={item.summary}
                audioUrl={item.audioUrl}
              />
            )}
            keyExtractor={item => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.grid}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          <FlatList
            data={discoveryPodcasts}
            renderItem={({ item }) => (
              <Podcast
                id={item.id}
                title={item.title}
                summary={item.summary}
                audioUrl={item.audioUrl}
              />
            )}
            keyExtractor={item => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.grid}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#23272A' },
  scrollViewContent: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#B9BBBE',
  },
  section: { marginBottom: 24 },
  sectionTitle: { padding: 20, fontSize: 24, fontWeight: '600', color: '#FFF' },
  grid: { paddingHorizontal: 8 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#23272A',
  },
  errorText: { color: '#ED4245', fontSize: 16 },
});
