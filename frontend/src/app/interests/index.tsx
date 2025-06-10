import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import axios from 'axios';
import { AuthContext } from "@/src/utils/authContext";

const INTEREST_CATEGORIES = {
  "Academic": [
    "Mathematics",
    "Science",
    "History",
    "Literature",
    "Languages",
    "Philosophy",
  ],
  "Technology": [
    "Programming",
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Artificial Intelligence",
    "Cybersecurity",
  ],
  "Creative": [
    "Art",
    "Music",
    "Design",
    "Photography",
    "Writing",
    "Film",
  ],
  "Professional": [
    "Business",
    "Marketing",
    "Finance",
    "Psychology",
    "Leadership",
    "Entrepreneurship",
  ],
  "Health & Wellness": [
    "Fitness",
    "Nutrition",
    "Mental Health",
    "Yoga",
    "Meditation",
    "Sports",
  ],
};

const MINIMUM_INTERESTS = 3;

const Info = () => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { firebaseId } = useContext(AuthContext);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async () => {
    if (selectedInterests.length < MINIMUM_INTERESTS) return;
    if (!firebaseId) {
      setError("You must be an existing user in the database to save interests");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      await axios.post(`https://studypod-nvau.onrender.com/user/interests/${firebaseId}`, {
        interests: selectedInterests
      });
      router.push("/discovery");
    } catch (error: any) {
      console.error('Error saving interests:', {
        error: error,
        response: error.response?.data,
        status: error.response?.status,
        firebaseId: firebaseId,
        interests: selectedInterests
      });
      setError(error.response?.data?.error || 'Failed to save interests. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressPercentage = () => {
    return Math.min((selectedInterests.length / MINIMUM_INTERESTS) * 100, 100);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${getProgressPercentage()}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {selectedInterests.length}/{MINIMUM_INTERESTS} interests selected
          </Text>
        </View>

        <Text style={styles.title}>Welcome to StudyPod!</Text>
        <Text style={styles.subtitle}>
          Select at least {MINIMUM_INTERESTS} interests to help us personalize your learning experience
        </Text>
        
        {Object.entries(INTEREST_CATEGORIES).map(([category, interests]) => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>
              <MaterialIcons name="category" size={20} color="#5865F2" /> {category}
            </Text>
            <View style={styles.interestsContainer}>
              {interests.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.interestButton,
                    selectedInterests.includes(interest) && styles.selectedInterest,
                  ]}
                  onPress={() => toggleInterest(interest)}
                >
                  <Text
                    style={[
                      styles.interestText,
                      selectedInterests.includes(interest) && styles.selectedInterestText,
                    ]}
                  >
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[
            styles.submitButton,
            (selectedInterests.length < MINIMUM_INTERESTS || isSubmitting) && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={selectedInterests.length < MINIMUM_INTERESTS || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              Continue to Your Feed
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Info;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23272A',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2C2F33',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5865F2',
    borderRadius: 3,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#B9BBBE',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#B9BBBE',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#2C2F33',
    borderWidth: 1,
    borderColor: '#40444B',
    marginBottom: 10,
  },
  selectedInterest: {
    backgroundColor: '#5865F2',
    borderColor: '#5865F2',
  },
  interestText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  selectedInterestText: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#5865F2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: '#40444B',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});