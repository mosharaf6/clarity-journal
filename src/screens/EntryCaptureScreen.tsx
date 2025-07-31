import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
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
          colors={Colors.gradients.success as any}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.xl,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.body1,
    color: Colors.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  contentCard: {
    marginBottom: Spacing.lg,
  },
  sectionCard: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    ...Typography.body2,
    color: Colors.neutral[600],
    marginBottom: Spacing.md,
  },
  textInput: {
    ...Typography.body1,
    color: Colors.neutral[900],
    minHeight: 140,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    textAlignVertical: 'top',
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * 1.5,
  },
  contextInput: {
    ...Typography.body1,
    color: Colors.neutral[900],
    height: 48,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.white,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  selectedTagsInfo: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.sm,
  },
  selectedTagsText: {
    ...Typography.caption,
    color: Colors.primary[700],
  },
  saveSection: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  saveButton: {
    marginBottom: Spacing.md,
  },
  saveHint: {
    ...Typography.caption,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
});
