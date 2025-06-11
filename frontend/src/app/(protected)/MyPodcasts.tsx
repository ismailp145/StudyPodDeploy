import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Podcast from '@/src/components/PodcastCard';
import { AuthContext } from '@/src/utils/authContext';
import axios from 'axios';

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
      setError('Couldn’t load your podcasts.');
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
        {loading && (
          <ActivityIndicator size="large" color="#5865F2" />
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
        {!loading && !error && items.length === 0 && (
          <Text style={styles.emptyText}>
            You have no saved podcasts yet.
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
    padding: 20,
    backgroundColor: '#23272A',
  },
  grid: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  errorText: {
    color: '#ED4245',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MyPodcasts;
