import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { firebaseFirestoreService } from '../api/firebaseFirestoreService';
import { analyticsService } from '../api/analyticsService';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { Button, Card } from '../components/UI';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

interface QuickStats {
  totalEntries: number;
  currentStreak: number;
  averageMood: number;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<QuickStats>({ totalEntries: 0, currentStreak: 0, averageMood: 0 });
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    loadQuickStats();
    setGreeting(getTimeBasedGreeting());
  }, [user]);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const loadQuickStats = async () => {
    if (!user) return;
    
    try {
      const entries = await firebaseFirestoreService.getEntries(user.uid);
      const streak = analyticsService.calculateWritingStreak(entries);
      const avgMood = entries.length > 0 
        ? entries.reduce((sum, e) => sum + e.mood, 0) / entries.length 
        : 0;
      
      setStats({
        totalEntries: entries.length,
        currentStreak: streak,
        averageMood: Math.round(avgMood * 10) / 10,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getMoodEmoji = (mood: number) => {
    if (mood === 0) return '😐';
    const emojis = ['😞', '😐', '😊', '😄', '🤩'];
    return emojis[Math.round(mood) - 1] || '😐';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#0ea5e9', '#3b82f6']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <Text style={styles.greetingText}>{greeting},</Text>
              <Text style={styles.nameText}>{user?.displayName || user?.email?.split('@')[0] || 'Journaler'}</Text>
            </View>
            <TouchableOpacity style={styles.avatarButton} onPress={handleLogout}>
              <Text style={styles.avatarText}>
                {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Quick Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <Card style={StyleSheet.flatten([styles.statCard, { backgroundColor: Colors.success[50] }])} variant="elevated">
              <Text style={StyleSheet.flatten([styles.statNumber, { color: Colors.success[600] }])}>{stats.totalEntries}</Text>
              <Text style={styles.statLabel}>Total Entries</Text>
            </Card>
            <Card style={StyleSheet.flatten([styles.statCard, { backgroundColor: Colors.warning[50] }])} variant="elevated">
              <Text style={StyleSheet.flatten([styles.statNumber, { color: Colors.warning[600] }])}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </Card>
            <Card style={StyleSheet.flatten([styles.statCard, { backgroundColor: Colors.secondary[50] }])} variant="elevated">
              <View style={styles.moodStat}>
                <Text style={styles.moodEmoji}>{getMoodEmoji(stats.averageMood)}</Text>
                <Text style={StyleSheet.flatten([styles.statNumber, { color: Colors.secondary[600] }])}>
                  {stats.averageMood > 0 ? stats.averageMood : '--'}
                </Text>
              </View>
              <Text style={styles.statLabel}>Avg Mood</Text>
            </Card>
          </View>
        </View>

        {/* Main Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>What would you like to do?</Text>
          
          <Button
            title="✨ New Entry"
            onPress={() => navigation.navigate('EntryCapture')}
            variant="primary"
            size="lg"
            fullWidth
            style={styles.primaryAction}
          />

          <View style={styles.secondaryActions}>
            <Button
              title="📖 View Journal"
              onPress={() => navigation.navigate('JournalList')}
              variant="outline"
              style={styles.secondaryButton}
            />
            <Button
              title="📊 Insights"
              onPress={() => navigation.navigate('Insights')}
              variant="outline"
              style={styles.secondaryButton}
            />
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinksContainer}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          
          <View style={styles.quickLinksGrid}>
            <TouchableOpacity 
              style={styles.quickLinkCard}
              onPress={() => navigation.navigate('Settings')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.neutral[100], Colors.neutral[50]]}
                style={styles.quickLinkGradient}
              >
                <Text style={styles.quickLinkIcon}>⚙️</Text>
                <Text style={styles.quickLinkText}>Settings</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickLinkCard}
              onPress={() => {/* Future: Daily Goals */}}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.primary[100], Colors.primary[50]]}
                style={styles.quickLinkGradient}
              >
                <Text style={styles.quickLinkIcon}>🎯</Text>
                <Text style={styles.quickLinkText}>Goals</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickLinkCard}
              onPress={() => {/* Future: Memories */}}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.secondary[100], Colors.secondary[50]]}
                style={styles.quickLinkGradient}
              >
                <Text style={styles.quickLinkIcon}>💭</Text>
                <Text style={styles.quickLinkText}>Memories</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickLinkCard}
              onPress={() => {/* Future: Export */}}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.success[100], Colors.success[50]]}
                style={styles.quickLinkGradient}
              >
                <Text style={styles.quickLinkIcon}>📤</Text>
                <Text style={styles.quickLinkText}>Export</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inspiration Quote */}
        <Card style={styles.inspirationCard} variant="elevated">
          <Text style={styles.inspirationText}>
            "The unexamined life is not worth living." - Socrates
          </Text>
          <Text style={styles.inspirationSubtext}>
            Take time today to reflect on your journey.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing['4xl'],
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  greetingText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '400',
    color: Colors.neutral[0],
    opacity: 0.9,
  },
  nameText: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: '700',
    color: Colors.neutral[0],
    marginTop: Spacing.xs,
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.neutral[0],
  },
  statsContainer: {
    marginTop: -Spacing['3xl'],
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  statNumber: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  moodStat: {
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: Typography.fontSize.lg,
    marginBottom: Spacing.xs,
  },
  actionsContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: Spacing.lg,
  },
  primaryAction: {
    marginBottom: Spacing.lg,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  secondaryButton: {
    flex: 1,
  },
  quickLinksContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  quickLinkCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    height: 100,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.md,
  },
  quickLinkGradient: {
    flex: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLinkIcon: {
    fontSize: Typography.fontSize['2xl'],
    marginBottom: Spacing.sm,
  },
  quickLinkText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.neutral[700],
    textAlign: 'center',
  },
  inspirationCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
    backgroundColor: Colors.primary[50],
  },
  inspirationText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '500',
    color: Colors.primary[800],
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  inspirationSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[600],
    textAlign: 'center',
  },
});
