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
  SafeAreaView,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Podcast from '@/src/components/PodcastCard';
import { AuthContext } from '@/src/utils/authContext';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

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
  
  const [searchQuery, setSearchQuery] = useState('');

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
        const { id: audioFileId, s3Key, originalName, uploadDate, summary: sum } =
          e.audioFile;
        const date = new Date(uploadDate).toLocaleDateString();

        const titleText = sum?.title ?? originalName ?? 'Untitled Podcast';
        const summaryText =
          sum?.summary ?? `Uploaded on ${date}`;
        const audioUrl = `${S3_BASE_URL}/${s3Key}`;

        // Create a unique ID by combining entry ID and audio file ID
        const uniqueId = `${e.id}-${audioFileId}`;

        return { id: uniqueId, title: titleText, summary: summaryText, audioUrl };
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


  // Filtered podcasts based on search query
  const filteredPodcasts = items.filter(podcast =>
    podcast.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // unified container for all states
  if (loading || error || items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#23272A', '#2C2F33']}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>My Playlist</Text>
        <Text style={styles.headerSubtitle}>Your personal podcast collection</Text>
      </LinearGradient>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title..."
          placeholderTextColor="#72767D"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredPodcasts}
        keyExtractor={item => item.id}
        numColumns={1}
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
          <View style={styles.podcastContainer}>
            <Podcast
              id={item.id}
              title={item.title}
              summary={item.summary}
              audioUrl={item.audioUrl}
              deleteButton={true}
            />
          </View>
        )}
        ListEmptyComponent={!loading && !error && items.length > 0 && filteredPodcasts.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>No podcasts found matching your search.</Text>
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23272A',
  },
  headerGradient: {
    paddingTop: 10,
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
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#B9BBBE',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#B9BBBE',
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: '#FF3B30',
    marginTop: 10,
    fontSize: 16,
  },
  emptyText: {
    color: '#B9BBBE',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 5,
  },
  emptySubtext: {
    color: '#72767D',
    fontSize: 14,
    textAlign: 'center',
  },
  grid: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#23272A',
  },
  searchInput: {
    backgroundColor: '#2C2F33',
    borderRadius: 8,
    padding: 12,
    marginRight: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
  },
  podcastContainer: {
    // flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default MyPodcasts;
