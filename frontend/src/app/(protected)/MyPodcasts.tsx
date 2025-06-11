import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Podcast from '@/src/components/PodcastCard';
import { AuthContext } from '@/src/utils/authContext';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

const S3_BASE_URL = 'https://team5-study-pod-s3-bucket.s3.us-east-2.amazonaws.com';

interface RawEntry {
  id: string;
  audioFile: {
    id: string;
    s3Key: string;
    originalName?: string;
    uploadDate: string;
    summary?: {
      id: string;
      title: string;
      content: string;
      summary: string;
      keywords: string[];
    };
  };
  user: {
    firebaseId: string;
  };
}

interface PodcastItem {
  id: string;
  title: string;
  summary: string;
  audioUrl: string;
}

const MyPodcasts: React.FC = () => {
  const { firebaseId } = useContext(AuthContext);
  const isFocused = useIsFocused();

  const [items, setItems] = useState<PodcastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPodcasts = async () => {
    if (!firebaseId) return;
    setError(null);

    try {
      const resp = await axios.get<RawEntry[]>(
        'https://studypod-nvau.onrender.com/mongo/user-audio-files',
        { params: { includeSummary: true } }
      );

      const userEntries = resp.data.filter(
        e => e.user.firebaseId === firebaseId
      );

      const podcasts: PodcastItem[] = userEntries.map(e => {
        const { id, s3Key, originalName, uploadDate, summary: sum } =
          e.audioFile;
        const date = new Date(uploadDate).toLocaleDateString();

        const titleText = sum?.title ?? originalName ?? 'Untitled Podcast';
        const summaryText =
          sum?.summary ?? `Uploaded on ${date}`;
        const audioUrl = `${S3_BASE_URL}/${s3Key}`;

        return { id, title: titleText, summary: summaryText, audioUrl };
      });

      setItems(podcasts);
    } catch (err) {
      console.error(err);
      setError("Couldn't load your podcasts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused && firebaseId) {
      setLoading(true);
      fetchUserPodcasts();
    }
  }, [isFocused, firebaseId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserPodcasts();
  };

  // unified container for all states
  if (loading || error || items.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#23272A', '#2C2F33']}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>My Playlist</Text>
          <Text style={styles.headerSubtitle}>Your personal podcast collection</Text>
        </LinearGradient>
        <View style={styles.contentContainer}>
          {loading && (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#5865F2" />
              <Text style={styles.loadingText}>Loading your podcasts...</Text>
            </View>
          )}
          {error && (
            <View style={styles.centerContent}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {!loading && !error && items.length === 0 && (
            <View style={styles.centerContent}>
              <Text style={styles.emptyText}>
                Your podcast collection is empty
              </Text>
              <Text style={styles.emptySubtext}>
                Create your first podcast to get started!
              </Text>
            </View>
          )}
        </View>
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
        <Text style={styles.headerTitle}>Let&apos;s get to listening!</Text>
        <Text style={styles.headerSubtitle}>
          {items.length} {items.length === 1 ? 'podcast' : 'podcasts'} in your library
        </Text>
      </LinearGradient>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5865F2']}
            tintColor="#5865F2"
          />
        }
        renderItem={({ item }) => (
          <Podcast
            id={item.id}
            title={item.title}
            summary={item.summary}
            audioUrl={item.audioUrl}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23272A',
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
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  grid: {
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 16,
  },
  errorText: {
    color: '#ED4245',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#B9BBBE',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingText: {
    color: '#B9BBBE',
    fontSize: 16,
    marginTop: 12,
  },
});

export default MyPodcasts;
