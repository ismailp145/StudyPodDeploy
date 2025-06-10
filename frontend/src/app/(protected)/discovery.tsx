import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import Podcast from '@/src/components/Podcast';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { AuthContext } from '@/src/utils/authContext';

interface PodcastData {
  id: string;
  title: string;
  summary: string;
  audio: {
    url: string;
  };
}

const API_BASE_URL = 'https://studypod-nvau.onrender.com';

const Discovery = () => {
  const [podcasts, setPodcasts] = useState<PodcastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { firebaseId } = React.useContext(AuthContext);

  // Redirect if not logged in
  useEffect(() => {
    if (!firebaseId) {
      router.replace('/(auth)/Home');
    }
  }, [firebaseId]);

  const fetchPodcasts = async () => {
    try {
      setError(null);
      const { data } = await axios.get<PodcastData[]>(`${API_BASE_URL}/podcasts`);
      setPodcasts(data);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      setError('Failed to load podcasts. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (firebaseId) {
      fetchPodcasts();
    }
  }, [firebaseId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPodcasts();
  };

  if (!firebaseId) {
    return null; // Don't render anything while redirecting
  }

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
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchPodcasts}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Podcasts</Text>
        <Text style={styles.subtitle}>Explore our curated collection of educational podcasts</Text>
      </View>

      <FlatList
        data={podcasts}
        renderItem={({ item }) => (
          <Podcast
            id={item.id}
            title={item.title}
            summary={item.summary}
            audioUrl={item.audio.url}
          />
        )}
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
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No podcasts available</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23272A',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#23272A',
    padding: 20,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B9BBBE',
    marginBottom: 20,
  },
  grid: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#B9BBBE',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ED4245',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#5865F2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Discovery; 