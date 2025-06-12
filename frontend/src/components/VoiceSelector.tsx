import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AVAILABLE_VOICES: { [key: string]: string } = {
  'Ruby : Female British – Soft-spoken': 's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json',
  'Charles : Male American – Articulate': 's3://voice-cloning-zero-shot/9f1ee23a-9108-4538-90be-8e62efc195b6/charlessaad/manifest.json',
  'Madison : Female English – Calm': 's3://voice-cloning-zero-shot/473c81b1-93ea-4662-9e63-7d65392e5f9b/madisonsaad/manifest.json',
  'Calvin : Male American – Clear expressive' : "s3://voice-cloning-zero-shot/743575eb-efdc-4c10-b185-a5018148822f/original/manifest.json"
};

interface VoiceSelectorProps {
  onVoiceSelect: (voice: string) => void;
  selectedVoice?: string;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ onVoiceSelect, selectedVoice }) => {
  const defaultVoice = Object.values(AVAILABLE_VOICES)[0];
  const [voice, setVoice] = useState(selectedVoice || defaultVoice);
  const [modalVisible, setModalVisible] = useState(false);

  const handleVoiceChange = (voiceUrl: string) => {
    setVoice(voiceUrl);
    onVoiceSelect(voiceUrl);
    setModalVisible(false);
  };

  const getVoiceName = (voiceUrl: string) => {
    return Object.entries(AVAILABLE_VOICES).find(([_, url]) => url === voiceUrl)?.[0] || 'Select Voice';
  };

  const renderVoiceItem = ({ item }: { item: [string, string] }) => {
    const [name, voiceUrl] = item;
    const isSelected = voiceUrl === voice;

    return (
      <TouchableOpacity
        style={[styles.voiceItem, isSelected && styles.selectedVoiceItem]}
        onPress={() => handleVoiceChange(voiceUrl)}
      >
        <View style={styles.voiceItemContent}>
          <Ionicons 
            name="person-circle-outline" 
            size={24} 
            color={isSelected ? '#5865F2' : '#666'} 
          />
          <Text style={[styles.voiceItemText, isSelected && styles.selectedVoiceText]}>
            {name}
          </Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#5865F2" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Voice</Text>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorButtonContent}>
          <Ionicons name="person-circle-outline" size={24} color="#5865F2" />
          <Text style={styles.selectorButtonText}>
            {getVoiceName(voice)}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={24} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a Voice</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={Object.entries(AVAILABLE_VOICES)}
              renderItem={renderVoiceItem}
              keyExtractor={(item) => item[1]}
              style={styles.voiceList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: 'white',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  selectorButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectorButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  voiceList: {
    paddingHorizontal: 16,
  },
  voiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  selectedVoiceItem: {
    backgroundColor: '#F0F2FF',
  },
  voiceItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voiceItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedVoiceText: {
    color: '#5865F2',
    fontWeight: '500',
  },
});

export default VoiceSelector; 