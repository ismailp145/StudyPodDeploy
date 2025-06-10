import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import Podcast from '@/src/components/Podcast';
import { useRouter } from 'expo-router';

interface PodcastData {
  id: string;
  title: string;
  summary: string;
  audio: {
    url: string;
  };
}

const Discovery = () => {
  const [podcasts, setPodcasts] = useState<PodcastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchPodcasts = async () => {
    try {
      const response = await fetch('https://studypod-nvau.onrender.com/podcasts');
      if (!response.ok) {
        throw new Error('Failed to fetch podcasts');
      }
      const data = await response.json();
      setPodcasts(data);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPodcasts();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5865F2" />
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
});

export default Discovery; 