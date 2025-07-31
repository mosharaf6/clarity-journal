import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { firebaseFirestoreService } from '../api/firebaseFirestoreService';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { Button, Card } from '../components/UI';

interface ExportScreenProps {
  navigation: any;
}

export default function ExportScreen({ navigation }: ExportScreenProps) {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);

  const exportEntries = async () => {
    if (!user) return;

    try {
      setExporting(true);
      const entries = await firebaseFirestoreService.getEntries(user.uid);
      
      if (entries.length === 0) {
        Alert.alert('No Entries', 'You have no journal entries to export.');
        return;
      }

      // Format entries as text
      const exportText = entries
        .map(entry => {
          const date = entry.createdAt?.toDate?.() ? 
            entry.createdAt.toDate().toLocaleDateString() : 
            new Date(entry.createdAt).toLocaleDateString();
          
          let text = `Date: ${date}\n`;
          text += `Mood: ${getMoodText(entry.mood || 3)}\n`;
          text += `Content: ${entry.content}\n`;
          
          if (entry.context) {
            text += `Context: ${entry.context}\n`;
          }
          
          if (entry.tags && entry.tags.length > 0) {
            text += `Tags: ${entry.tags.join(', ')}\n`;
          }
          
          return text + '\n' + '---'.repeat(20) + '\n';
        })
        .join('\n');

      // Share the export
      await Share.share({
        message: `My Journal Entries\n\n${exportText}`,
        title: 'Journal Export',
      });

      Alert.alert('Export Complete', 'Your journal entries have been shared successfully!');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Unable to export your journal entries. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const getMoodText = (mood: number) => {
    const moodTexts = {
      1: '😢 Very Sad',
      2: '😕 Sad',
      3: '😐 Neutral',
      4: '😊 Happy',
      5: '😄 Very Happy'
    };
    return moodTexts[mood as keyof typeof moodTexts] || '😐 Neutral';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={Colors.gradients.cool as any}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Export Journal</Text>
        <Text style={styles.headerSubtitle}>Share your thoughts and memories</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Card style={styles.infoCard} variant="elevated">
          <Text style={styles.cardTitle}>📤 Export Your Entries</Text>
          <Text style={styles.cardDescription}>
            Export all your journal entries in a readable text format. 
            You can share them via email, save to cloud storage, or backup locally.
          </Text>
        </Card>

        <Card style={styles.featuresCard} variant="elevated">
          <Text style={styles.cardTitle}>✨ What's Included</Text>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>• All your journal entries</Text>
            <Text style={styles.featureItem}>• Dates and timestamps</Text>
            <Text style={styles.featureItem}>• Mood ratings with emojis</Text>
            <Text style={styles.featureItem}>• Tags and context information</Text>
            <Text style={styles.featureItem}>• Formatted for easy reading</Text>
          </View>
        </Card>

        <Button
          title={exporting ? "Exporting..." : "Export My Journal"}
          onPress={exportEntries}
          variant="primary"
          size="lg"
          loading={exporting}
          style={styles.exportButton}
        />

        <Text style={styles.disclaimer}>
          Your data remains private and secure. Only you control where it's shared.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  headerGradient: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '600' as const,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  infoCard: {
    marginBottom: Spacing.lg,
  },
  featuresCard: {
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600' as const,
    color: Colors.neutral[800],
    marginBottom: Spacing.md,
  },
  cardDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[600],
    lineHeight: 24,
  },
  featuresList: {
    gap: Spacing.sm,
  },
  featureItem: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[700],
    lineHeight: 22,
  },
  exportButton: {
    marginBottom: Spacing.lg,
  },
  disclaimer: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[500],
    textAlign: 'center',
    fontStyle: 'italic' as const,
    lineHeight: 20,
  },
});
