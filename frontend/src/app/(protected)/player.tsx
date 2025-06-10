// app/Player.tsx
import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PodcastPlayer from '@/src/components/PodcastPlayer';
import { AuthContext } from '@/src/utils/authContext';

const audioURL = 'https://team5-study-pod-s3-bucket.s3.us-east-2.amazonaws.com/uploads/audio-0ed7df8d-dbae-44c4-a71a-9dee9c1a780c.mp3';

export default function Player() {
  
  return (
    <View style={styles.container}>
      <Text style={styles.userIdText}>
      </Text>
      <PodcastPlayer s3Url={audioURL} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#23272A',
  },
  userIdText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 12,
  },
});
