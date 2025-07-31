import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { JournalEntry } from '../types';
import { firebaseFirestoreService } from '../api/firebaseFirestoreService';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { Card, Tag, MoodSelector } from '../components/UI';

interface JournalListScreenProps {
  navigation: any;
}

export default function JournalListScreen({ navigation }: JournalListScreenProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterMood, setFilterMood] = useState<number | null>(null);
  const { user } = useAuth();

  const loadEntries = async () => {
    if (!user) return;

    try {
      const userEntries = await firebaseFirestoreService.getEntries(user.uid);
      setEntries(userEntries);
    } catch (error) {
      console.error('Load entries error:', error);
      Alert.alert('Error', 'Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  useEffect(() => {
    loadEntries();
  }, [user]);

  const filteredEntries = filterMood 
    ? entries.filter(entry => entry.mood === filterMood)
    : entries;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    
    let date: Date;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoodColor = (mood: number) => {
    const moodColors = {
      1: Colors.error[500],
      2: '#f97316',
      3: '#eab308',
      4: Colors.success[500],
      5: '#8b5cf6'
    };
    return moodColors[mood as keyof typeof moodColors] || Colors.neutral[400];
  };

  const getMoodEmoji = (mood: number) => {
    const moodEmojis = { 1: '😢', 2: '😕', 3: '😐', 4: '😊', 5: '😄' };
    return moodEmojis[mood as keyof typeof moodEmojis] || '😐';
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('EntryDetail', { entryId: item.id })}
      activeOpacity={0.7}
    >
      <Card style={styles.entryCard} variant="elevated">
        <View style={styles.entryHeader}>
          <View style={styles.moodIndicator}>
            <View 
              style={[styles.moodDot, { backgroundColor: getMoodColor(item.mood || 3) }]} 
            />
            <Text style={styles.moodEmoji}>{getMoodEmoji(item.mood || 3)}</Text>
          </View>
          <Text style={styles.entryDate}>{formatDate(item.createdAt)}</Text>
        </View>
        
        <Text style={styles.entryContent} numberOfLines={3}>
          {item.content}
        </Text>
        
        {item.context && (
          <Text style={styles.entryContext} numberOfLines={1}>
            📍 {item.context}
          </Text>
        )}
        
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <Tag
                key={index}
                text={tag}
                size="sm"
                selected={false}
                variant="outline"
              />
            ))}
            {item.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{item.tags.length - 3} more</Text>
            )}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📔</Text>
      <Text style={styles.emptyStateTitle}>No entries yet</Text>
      <Text style={styles.emptyStateText}>
        Start your journaling journey by capturing your first thought
      </Text>
      <TouchableOpacity
        style={styles.createFirstEntryButton}
        onPress={() => navigation.navigate('EntryCapture')}
      >
        <Text style={styles.createFirstEntryText}>Create Your First Entry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Journal Entries</Text>
        <Text style={styles.headerSubtitle}>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} recorded
        </Text>
      </LinearGradient>

      {/* Mood Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Filter by mood:</Text>
        <View style={styles.moodFilterContainer}>
          <TouchableOpacity
            style={[
              styles.allFilterButton,
              !filterMood && styles.allFilterButtonActive
            ]}
            onPress={() => setFilterMood(null)}
          >
            <Text style={[
              styles.allFilterText,
              !filterMood && styles.allFilterTextActive
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          <MoodSelector
            selectedMood={filterMood || undefined}
            onMoodSelect={(mood) => setFilterMood(mood === filterMood ? null : mood)}
            size="sm"
          />
        </View>
      </View>

      {/* Entries List */}
      <FlatList
        data={filteredEntries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id || ''}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary[500]}
            colors={[Colors.primary[500]]}
          />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
      />
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
    ...Typography.h2,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.body1,
    color: Colors.white,
    opacity: 0.9,
  },
  filterSection: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  filterTitle: {
    ...Typography.h6,
    color: Colors.neutral[700],
    marginBottom: Spacing.md,
  },
  moodFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  allFilterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    backgroundColor: Colors.white,
  },
  allFilterButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  allFilterText: {
    ...Typography.body2,
    color: Colors.neutral[600],
    fontWeight: '500',
  },
  allFilterTextActive: {
    color: Colors.white,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  entryCard: {
    marginBottom: Spacing.lg,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  moodIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  moodDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  moodEmoji: {
    fontSize: 20,
  },
  entryDate: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    color: Colors.neutral[600],
  },
  entryContent: {
    ...Typography.body1,
    color: Colors.neutral[900],
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  entryContext: {
    ...Typography.body2,
    color: Colors.neutral[600],
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  moreTagsText: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    color: Colors.neutral[500],
    fontStyle: 'italic' as const,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['8xl'],
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyStateTitle: {
    ...Typography.h3,
    color: Colors.neutral[700],
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptyStateText: {
    ...Typography.body1,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  createFirstEntryButton: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadow.md,
  },
  createFirstEntryText: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    color: Colors.white,
  },
});
