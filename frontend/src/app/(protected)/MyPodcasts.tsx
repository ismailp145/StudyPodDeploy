// screens/MyPodcasts.tsx

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
    // ← pull in the 1:1 PodcastSummary relation
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
        {
          // tell Prisma to include the summary relation
          params: { includeSummary: true } 
        }
      );

      // filter down to only this user
      const userEntries = resp.data.filter(e => e.user.firebaseId === firebaseId);

      const podcasts: PodcastItem[] = userEntries.map(e => {
        const { id, s3Key, originalName, uploadDate, summary: sum } = e.audioFile;
        // human‐readable upload date
        const date = new Date(uploadDate).toLocaleDateString();

        // use the generated title/summary if present
        const titleText    = sum?.title    ?? originalName ?? 'Untitled Podcast';
        const summaryText  = sum?.summary  ?? `Uploaded on ${date}`;
        const audioUrl     = `${S3_BASE_URL}/${s3Key}`;

        return {
          id,
          title:   titleText,
          summary: summaryText,
          audioUrl,
        };
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

  // reload on focus or login
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5865F2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>You have no saved podcasts yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={i => i.id}
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
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: '#23272A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  grid: {
    padding: 8,
  },
  errorText: {
    color: '#ED4245',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default MyPodcasts;
