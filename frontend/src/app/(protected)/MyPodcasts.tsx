import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import PodcastPlayer from '../../components/PodcastPlayer';
import { AuthContext } from '@/src/utils/authContext';

// Base URL for your S3 bucket
const S3_BASE_URL = 'https://team5-study-pod-s3-bucket.s3.us-east-2.amazonaws.com';

type AudioItem = {
  id: string;
  s3Key: string;
  url: string;
  originalName?: string;
};

const MyPodcasts: React.FC = () => {
  const { firebaseId } = useContext(AuthContext);
  const [audios, setAudios] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPodcasts = async () => {
      try {
        const response = await fetch('https://studypod-nvau.onrender.com/mongo/user-audio-files');
        if (!response.ok) {
          throw new Error(`Status: ${response.status}`);
        }
        const data = await response.json();
        // Filter entries by the logged-in user's Firebase UID
        const userEntries = (data as any[]).filter(
          entry => entry.user.firebaseId === firebaseId
        );
        const audioList: AudioItem[] = userEntries.map(entry => {
          const s3Key: string = entry.audioFile.s3Key;
          return {
            id: entry.audioFile.id,
            s3Key,
            url: `${S3_BASE_URL}/${s3Key}`,
            originalName: entry.audioFile.originalName,
          };
        });
        setAudios(audioList);
      } catch (err) {
        console.error('Error fetching podcasts:', err);
        setError('Failed to load your podcasts.');
      } finally {
        setLoading(false);
      }
    };

    if (firebaseId) {
      fetchUserPodcasts();
    } else {
      setError('User not logged in.');
      setLoading(false);
    }
  }, [firebaseId]);

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

  if (audios.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>You have no saved podcasts yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={audios}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <View style={styles.podcastContainer}>
          {item.originalName && <Text style={styles.title}>{item.originalName}</Text>}
          <PodcastPlayer s3Url={item.url} />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#23272A',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
    backgroundColor: '#23272A',
  },
  podcastContainer: {
    marginBottom: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 8,
  },
});

export default MyPodcasts;
