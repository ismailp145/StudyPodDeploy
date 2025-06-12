import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, Modal, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';


const PLAYBACK_SPEEDS = [0.5, 1, 1.5, 2];

interface PodcastPlayerProps {
  s3Url: string;
  isExpanded: boolean;
}

const PodcastPlayer = ({ s3Url, isExpanded }: PodcastPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isExpanded && sound) {
      const stopPlayback = async () => {
        try {
          await sound.pauseAsync();
          setIsPlaying(false);
        } catch (error) {
          console.error('Error stopping playback:', error);
        }
      };
      stopPlayback();
    }
  }, [isExpanded, sound]);

  useEffect(() => {
    return () => {
      if (sound) {
        const cleanup = async () => {
          try {
            await sound.stopAsync();
            await sound.unloadAsync();
          } catch (error) {
            console.error('Error cleaning up audio:', error);
          }
        };
        cleanup();
      }
    };
  }, [sound]);

  useEffect(() => {
    const loadAudio = async () => {
      try {
        setIsLoading(true);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: s3Url },
          { shouldPlay: false, rate: playbackSpeed },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
      } catch (error) {
        console.error('Error loading audio:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAudio();
  }, [s3Url]);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis ? status.positionMillis / 1000 : 0);
      setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
      setIsPlaying(status.isPlaying);
    }
  };

  
  useEffect(() => {
    const updatePlaybackSpeed = async () => {
      try {
        if (sound) {
          await sound.setRateAsync(playbackSpeed, true);
        }
      } catch (error) {
        console.error('Error setting playback speed:', error);
      }
    };

    updatePlaybackSpeed();
  }, [playbackSpeed, sound]);

  const handlePlayPause = async () => {
    try {
      if (!sound) return;

      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (err) {
      console.error('Error playing/pausing:', err);
    }
  };

  const handleSeek = async (value: number) => {
    try {
      if (sound) {
        await sound.setPositionAsync(value * 1000);
      }
    } catch (err) {
      console.log('Error seeking:', err);
    }
  };

  const handleSkip = async (seconds: number) => {
    try {
      if (sound) {
        const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
        await sound.setPositionAsync(newTime * 1000);
      }
    } catch (err) {
      console.error('Error skipping:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTouchStart = (e: any) => {
    e.stopPropagation();
  };

  if (isLoading) {
    return (
      <TouchableWithoutFeedback onPress={handleTouchStart}>
        <View style={styles.container}>
          <Text style={styles.loadingText}>Loading audio...</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={handleTouchStart}>
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          <TouchableWithoutFeedback onPress={handleTouchStart}>
            <View>
              <Slider
                style={styles.progressBar}
                minimumValue={0}
                maximumValue={duration || 1}
                value={currentTime}
                onValueChange={handleSeek}
                minimumTrackTintColor="#5865F2"
                maximumTrackTintColor="#23272A"
                thumbTintColor="#5865F2"
                disabled={!sound}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchStart}
              />
            </View>
          </TouchableWithoutFeedback>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={(e) => {
              handleTouchStart(e);
              handleSkip(-10);
            }}
            disabled={!sound}
          >
            <Ionicons name="play-skip-back" size={24} color="#5865F2" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.playButton} 
            onPress={(e) => {
              handleTouchStart(e);
              handlePlayPause();
            }}
            disabled={!sound}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={32} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={(e) => {
              handleTouchStart(e);
              handleSkip(10);
            }}
            disabled={!sound}
          >
            <Ionicons name="play-skip-forward" size={24} color="#5865F2" />
          </TouchableOpacity>
        </View>

        <View style={styles.additionalControls}>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={(e) => {
              handleTouchStart(e);
              setShowSpeedModal(true);
            }}
            disabled={!sound}
          >
            <Ionicons name="speedometer" size={24} color="#5865F2" />
            <Text style={styles.settingsText}>{playbackSpeed}x</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showSpeedModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSpeedModal(false)}
        >
          <TouchableWithoutFeedback onPress={handleTouchStart}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback onPress={handleTouchStart}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Playback Speed</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {PLAYBACK_SPEEDS.map((speed) => (
                      <TouchableOpacity
                        key={speed}
                        style={[
                          styles.speedOption,
                          playbackSpeed === speed && styles.selectedOption
                        ]}
                        onPress={(e) => {
                          handleTouchStart(e);
                          setPlaybackSpeed(speed);
                          setShowSpeedModal(false);
                        }}
                      >
                        <Text style={styles.speedText}>{speed}x</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={(e) => {
                      handleTouchStart(e);
                      setShowSpeedModal(false);
                    }}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2C2F33',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    color: '#B9BBBE',
    textAlign: 'center',
    padding: 20,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: '#B9BBBE',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    backgroundColor: '#5865F2',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5865F2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23272A',
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  settingsText: {
    color: '#B9BBBE',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#2C2F33',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  speedOption: {
    padding: 12,
    marginHorizontal: 8,
    backgroundColor: '#23272A',
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#5865F2',
  },
  speedText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#5865F2',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PodcastPlayer;
