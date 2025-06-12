import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import PodcastPlayer from './PodcastPlayer';
import axios from 'axios';


interface PodcastProps {
  id: string;
  title: string;
  summary: string;
  audioUrl: string;
  deleteButton?: boolean;
  firebaseId: string;

}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32; // Full width with padding on sides

const Podcast: React.FC<PodcastProps> = ({ id, title, summary, audioUrl, deleteButton = false, firebaseId  }) => {
  const [isExpanded, setIsExpanded] = useState(false);
   
  const handleDelete = async () => {

    const audioId = id.split('-')[1];
    try {
      await axios.delete(`https://studypod-nvau.onrender.com/user/${firebaseId}/playlist/${audioId}`);
    } catch (error) {
      console.error('Error deleting podcast:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.card}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <MaterialIcons name="podcasts" size={24} color="#5865F2" />
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {deleteButton && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <MaterialIcons name="delete" size={24} color="#ED4245" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.summary} numberOfLines={isExpanded ? undefined : 2}>
          {summary}
        </Text>

        {isExpanded && (
          <View style={styles.playerContainer}>
            <PodcastPlayer s3Url={audioUrl} isExpanded={isExpanded}/>
          </View>
        )}

        <View style={styles.footer}>
          <MaterialIcons 
            name={isExpanded ? "expand-less" : "expand-more"} 
            size={24} 
            color="#B9BBBE" 
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    padding: 8,
  },
  card: {
    backgroundColor: '#2C2F33',
    borderRadius: 12,
    padding: 16,
    height: 'auto', // Changed from '100%' to 'auto' to prevent elongation
    borderWidth: 1,
    borderColor: '#40444B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  summary: {
    fontSize: 14,
    color: '#B9BBBE',
    lineHeight: 20,
    marginBottom: 12,
  },
  playerContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 8,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default Podcast;
