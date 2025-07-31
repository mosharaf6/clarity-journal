import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { JournalEntry } from '../types';
import { firebaseFirestoreService } from '../api/firebaseFirestoreService';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { Button, Card, MoodSelector, Tag } from '../components/UI';

interface EntryCaptureScreenProps {
  navigation: any;
}

export default function EntryCaptureScreen({ navigation }: EntryCaptureScreenProps) {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [context, setContext] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const commonTags = ['life', 'work', 'relationships', 'health', 'goals', 'reflection', 'gratitude', 'challenges'];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const saveEntry = async () => {
    if (!content.trim()) {
      Alert.alert('Missing Content', 'Please write something before saving your entry.');
      return;
    }

    if (!user) {
      Alert.alert('Authentication Error', 'You must be logged in to save entries.');
      return;
    }

    try {
      setSaving(true);
      
      const entryData: any = {
        userId: user.uid,
        content: content.trim(),
        mood,
        tags: selectedTags,
        type: 'text' as const,
      };

      // Only add context if it's not empty
      if (context && context.trim()) {
        entryData.context = context.trim();
      }

      await firebaseFirestoreService.createEntry(entryData);

      Alert.alert(
        'Entry Saved! ✨', 
        'Your thoughts have been safely recorded.',
        [{ text: 'Continue', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Save Failed', 'Unable to save your entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#22c55e', '#16a34a']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>New Journal Entry</Text>
          <Text style={styles.headerSubtitle}>Capture your thoughts and feelings</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Main Content Input */}
          <Card style={styles.contentCard} variant="elevated">
            <Text style={styles.sectionTitle}>What's on your mind?</Text>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Start writing your thoughts here... Let your mind flow freely."
              placeholderTextColor={Colors.neutral[400]}
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />
          </Card>

          {/* Mood Selector */}
          <Card style={styles.sectionCard} variant="elevated">
            <Text style={styles.sectionTitle}>How are you feeling?</Text>
            <Text style={styles.sectionDescription}>Choose the mood that best represents your current state</Text>
            <MoodSelector
              selectedMood={mood}
              onMoodSelect={(newMood) => setMood(newMood as 1 | 2 | 3 | 4 | 5)}
              size="lg"
            />
          </Card>

          {/* Tags Section */}
          <Card style={styles.sectionCard} variant="elevated">
            <Text style={styles.sectionTitle}>Add Tags</Text>
            <Text style={styles.sectionDescription}>Help categorize your entry for better insights</Text>
            <View style={styles.tagsContainer}>
              {commonTags.map(tag => (
                <Tag
                  key={tag}
                  text={tag}
                  selected={selectedTags.includes(tag)}
                  onPress={() => toggleTag(tag)}
                  size="md"
                />
              ))}
            </View>
            {selectedTags.length > 0 && (
              <View style={styles.selectedTagsInfo}>
                <Text style={styles.selectedTagsText}>
                  Selected: {selectedTags.join(', ')}
                </Text>
              </View>
            )}
          </Card>

          {/* Context (Optional) */}
          <Card style={styles.sectionCard} variant="elevated">
            <Text style={styles.sectionTitle}>Context (Optional)</Text>
            <Text style={styles.sectionDescription}>Add additional context or circumstances</Text>
            <TextInput
              style={styles.contextInput}
              placeholder="e.g., Before important meeting, After workout, Morning reflection..."
              placeholderTextColor={Colors.neutral[400]}
              value={context}
              onChangeText={setContext}
            />
          </Card>

          {/* Save Button */}
          <View style={styles.saveSection}>
            <Button
              title={saving ? "Saving..." : "Save Entry"}
              onPress={saveEntry}
              variant="success"
              size="lg"
              fullWidth
              loading={saving}
              style={styles.saveButton}
            />
            <Text style={styles.saveHint}>
              Your entry will be saved securely and can be accessed anytime
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface EntryCaptureScreenProps {
  navigation: any;
}

export default function EntryCaptureScreen({ navigation }: EntryCaptureScreenProps) {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [context, setContext] = useState('');
  const { user } = useAuth();

  const commonTags = ['life', 'work', 'relationships', 'health', 'goals', 'reflection'];
  const moodEmojis = ['😞', '😐', '😊', '😄', '🤩'];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const saveEntry = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write something before saving.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to save entries.');
      return;
    }

    try {
      const entryData: any = {
        userId: user.uid,
        content: content.trim(),
        mood,
        tags: selectedTags,
        type: 'text' as const,
      };

      // Only add context if it's not empty
      if (context && context.trim()) {
        entryData.context = context.trim();
      }

      await firebaseFirestoreService.createEntry(entryData);

      Alert.alert('Success', 'Entry saved!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>New Journal Entry</Text>
        
        {/* Content Input */}
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="What's on your mind?"
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
        />

        {/* Mood Selector */}
        <Text style={styles.sectionTitle}>How are you feeling?</Text>
        <View style={styles.moodContainer}>
          {moodEmojis.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.moodButton,
                mood === (index + 1) && styles.selectedMood
              ]}
              onPress={() => setMood((index + 1) as 1 | 2 | 3 | 4 | 5)}
            >
              <Text style={styles.moodEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tags */}
        <Text style={styles.sectionTitle}>Tags</Text>
        <View style={styles.tagsContainer}>
          {commonTags.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagButton,
                selectedTags.includes(tag) && styles.selectedTag
              ]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={[
                styles.tagText,
                selectedTags.includes(tag) && styles.selectedTagText
              ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Context */}
        <Text style={styles.sectionTitle}>Context (optional)</Text>
        <TextInput
          style={styles.contextInput}
          placeholder="e.g., Before audit, Post-failure, Morning reflection..."
          value={context}
          onChangeText={setContext}
        />

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={saveEntry}>
          <Text style={styles.saveButtonText}>Save Entry</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 12,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  moodButton: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e1e8ed',
  },
  selectedMood: {
    borderColor: '#3498db',
    backgroundColor: '#ebf3fd',
  },
  moodEmoji: {
    fontSize: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tagButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTag: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  tagText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  selectedTagText: {
    color: '#fff',
  },
  contextInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
