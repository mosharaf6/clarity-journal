import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { firebaseFirestoreService } from '../api/firebaseFirestoreService';
import { JournalEntry } from '../types';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { Card, Tag } from '../components/UI';

interface SearchScreenProps {
  navigation: any;
}

export default function SearchScreen({ navigation }: SearchScreenProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<JournalEntry[]>([]);
  const [allEntries, setAllEntries] = useState<JournalEntry[]>([]);
  const [searching, setSearching] = useState(false);

  React.useEffect(() => {
    loadAllEntries();
  }, [user]);

  const loadAllEntries = async () => {
    if (!user) return;
    
    try {
      const entries = await firebaseFirestoreService.getEntries(user.uid);
      setAllEntries(entries);
    } catch (error) {
      console.error('Failed to load entries:', error);
    }
  };

  const performSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    
    const lowercaseTerm = term.toLowerCase();
    const filtered = allEntries.filter(entry => 
      entry.content.toLowerCase().includes(lowercaseTerm) ||
      entry.context?.toLowerCase().includes(lowercaseTerm) ||
      entry.tags?.some(tag => tag.toLowerCase().includes(lowercaseTerm))
    );
    
    setSearchResults(filtered);
    setSearching(false);
  };

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
      year: 'numeric'
    });
  };

  const getMoodEmoji = (mood: number) => {
    const moodEmojis = { 1: '😢', 2: '😕', 3: '😐', 4: '😊', 5: '😄' };
    return moodEmojis[mood as keyof typeof moodEmojis] || '😐';
  };

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '**$1**'); // Simple highlighting placeholder
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('EntryDetail', { entryId: item.id })}
      activeOpacity={0.7}
    >
      <Card style={styles.resultCard} variant="elevated">
        <View style={styles.resultHeader}>
          <Text style={styles.resultDate}>{formatDate(item.createdAt)}</Text>
          <Text style={styles.moodEmoji}>{getMoodEmoji(item.mood || 3)}</Text>
        </View>
        
        <Text style={styles.resultContent} numberOfLines={3}>
          {item.content}
        </Text>
        
        {item.context && (
          <Text style={styles.resultContext} numberOfLines={1}>
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

  const renderEmptyState = () => {
    if (searching) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Searching...</Text>
        </View>
      );
    }

    if (searchTerm && searchResults.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🔍</Text>
          <Text style={styles.emptyStateTitle}>No Results Found</Text>
          <Text style={styles.emptyStateText}>
            Try different keywords or check your spelling
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateIcon}>🔍</Text>
        <Text style={styles.emptyStateTitle}>Search Your Journal</Text>
        <Text style={styles.emptyStateText}>
          Find entries by content, tags, or context
        </Text>
      </View>
    );
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
        <Text style={styles.headerTitle}>Search Journal</Text>
        <Text style={styles.headerSubtitle}>Find your thoughts and memories</Text>
      </LinearGradient>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search your entries..."
          placeholderTextColor={Colors.neutral[400]}
          value={searchTerm}
          onChangeText={performSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Search Results */}
      <View style={styles.resultsContainer}>
        {searchTerm && (
          <Text style={styles.resultsHeader}>
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchTerm}"
          </Text>
        )}
        
        <FlatList
          data={searchResults}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id || ''}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.resultsList}
        />
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
  searchContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.base,
    backgroundColor: Colors.neutral[50],
  },
  resultsContainer: {
    flex: 1,
    padding: Spacing.lg,
  },
  resultsHeader: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
    marginBottom: Spacing.md,
  },
  resultsList: {
    flexGrow: 1,
  },
  resultCard: {
    marginBottom: Spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  resultDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
  },
  moodEmoji: {
    fontSize: Typography.fontSize.base,
  },
  resultContent: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[900],
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  resultContext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
    fontStyle: 'italic' as const,
    marginBottom: Spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  moreTagsText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[500],
    fontStyle: 'italic' as const,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  emptyStateTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600' as const,
    color: Colors.neutral[700],
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: 22,
  },
});
