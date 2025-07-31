import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { firebaseFirestoreService } from '../api/firebaseFirestoreService';
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

// Daily inspirational quotes for journaling
const DAILY_QUOTES = [
  {
    text: "The unexamined life is not worth living.",
    author: "Socrates"
  },
  {
    text: "Writing is thinking on paper.",
    author: "William Zinsser"
  },
  {
    text: "Fill your paper with the breathings of your heart.",
    author: "William Wordsworth"
  },
  {
    text: "The life worth living is not the life without problems.",
    author: "Tara Brach"
  },
  {
    text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.",
    author: "Rumi"
  }
];

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<QuickStats>({ totalEntries: 0, currentStreak: 0, averageMood: 0 });
  const [greeting, setGreeting] = useState('');
  const [dailyQuote, setDailyQuote] = useState(DAILY_QUOTES[0]);

  useEffect(() => {
    loadQuickStats();
    setGreeting(getTimeBasedGreeting());
    setDailyQuote(getDailyQuote());
  }, [user]);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getDailyQuote = () => {
    const today = new Date().getDate();
    return DAILY_QUOTES[today % DAILY_QUOTES.length];
  };

  const loadQuickStats = async () => {
    if (!user) return;
    
    try {
      const entries = await firebaseFirestoreService.getEntries(user.uid);
      const totalEntries = entries.length;
      const currentStreak = calculateCurrentStreak(entries);
      const averageMood = entries.length > 0 
        ? entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length 
        : 0;

      setStats({ totalEntries, currentStreak, averageMood });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const calculateCurrentStreak = (entries: any[]) => {
    if (entries.length === 0) return 0;
    
    const sortedEntries = entries.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const latestEntry = sortedEntries[0];
    const latestDate = latestEntry.createdAt?.toDate?.() || new Date(latestEntry.createdAt);
    latestDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 1) return 0;
    
    let currentDate = new Date(today);
    if (daysDiff === 1) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    for (const entry of sortedEntries) {
      const entryDate = entry.createdAt?.toDate?.() || new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getUserDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'Friend';
  };

  const getInitials = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Personal Greeting Header - Softer Design */}
        <View style={styles.greetingContainer}>
          <LinearGradient
            colors={['#f8fafc', '#f1f5f9']}
            style={styles.greetingGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.greetingContent}>
              <View style={styles.welcomeSection}>
                <Text style={styles.greetingText}>{greeting},</Text>
                <Text style={styles.nameText}>{getUserDisplayName()}</Text>
                <Text style={styles.encouragementText}>
                  Take a moment to reflect and capture your thoughts
                </Text>
              </View>
              <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
                <Text style={styles.profileInitial}>{getInitials()}</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Primary Action - New Journal Entry */}
        <View style={styles.primaryActionContainer}>
          <TouchableOpacity
            style={styles.newEntryButton}
            onPress={() => navigation.navigate('EntryCapture')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={Colors.gradients.primary as any}
              style={styles.newEntryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.newEntryContent}>
                <Text style={styles.newEntryIcon}>✍️</Text>
                <View style={styles.newEntryTextContainer}>
                  <Text style={styles.newEntryTitle}>Start a New Entry</Text>
                  <Text style={styles.newEntrySubtitle}>Capture your thoughts and feelings</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Progress Cards - Unified Design */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressTitle}>Your Journey</Text>
          <Text style={styles.progressSubtitle}>See how you're growing through reflection</Text>
          
          <View style={styles.progressCards}>
            <Card style={styles.progressCard} variant="elevated">
              <View style={styles.progressIcon}>
                <Text style={styles.progressIconText}>📔</Text>
              </View>
              <Text style={styles.progressNumber}>{stats.totalEntries}</Text>
              <Text style={styles.progressLabel}>Entries</Text>
              <Text style={styles.progressEncouragement}>
                {stats.totalEntries > 0 ? "Keep writing!" : "Start your journey"}
              </Text>
            </Card>
            
            <Card style={styles.progressCard} variant="elevated">
              <View style={styles.progressIcon}>
                <Text style={styles.progressIconText}>📅</Text>
              </View>
              <Text style={styles.progressNumber}>{stats.currentStreak}</Text>
              <Text style={styles.progressLabel}>Day Streak</Text>
              <Text style={styles.progressEncouragement}>
                {stats.currentStreak > 0 ? "Consistency is key!" : "Start today"}
              </Text>
            </Card>
            
            <Card style={styles.progressCard} variant="elevated">
              <View style={styles.progressIcon}>
                <Text style={styles.progressIconText}>💭</Text>
              </View>
              <Text style={styles.progressNumber}>
                {stats.averageMood > 0 ? stats.averageMood.toFixed(1) : '—'}
              </Text>
              <Text style={styles.progressLabel}>Avg Mood</Text>
              <Text style={styles.progressEncouragement}>
                {stats.averageMood > 0 ? "Reflecting helps!" : "Track your mood"}
              </Text>
            </Card>
          </View>
        </View>

        {/* Navigation Hub */}
        <View style={styles.navigationContainer}>
          <Text style={styles.navigationTitle}>Explore Your Insights</Text>
          
          <View style={styles.navigationGrid}>
            <TouchableOpacity 
              style={styles.navCard}
              onPress={() => navigation.navigate('JournalList')}
              activeOpacity={0.8}
            >
              <View style={styles.navIconContainer}>
                <Text style={styles.navIcon}>📖</Text>
              </View>
              <Text style={styles.navTitle}>Your Journal</Text>
              <Text style={styles.navSubtitle}>Read past entries</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.navCard}
              onPress={() => navigation.navigate('Insights')}
              activeOpacity={0.8}
            >
              <View style={styles.navIconContainer}>
                <Text style={styles.navIcon}>📊</Text>
              </View>
              <Text style={styles.navTitle}>Insights</Text>
              <Text style={styles.navSubtitle}>Discover patterns</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.navCard}
              onPress={() => navigation.navigate('Search')}
              activeOpacity={0.8}
            >
              <View style={styles.navIconContainer}>
                <Text style={styles.navIcon}>🔍</Text>
              </View>
              <Text style={styles.navTitle}>Search</Text>
              <Text style={styles.navSubtitle}>Find memories</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.navCard}
              onPress={() => navigation.navigate('Settings')}
              activeOpacity={0.8}
            >
              <View style={styles.navIconContainer}>
                <Text style={styles.navIcon}>⚙️</Text>
              </View>
              <Text style={styles.navTitle}>Settings</Text>
              <Text style={styles.navSubtitle}>Personalize</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Inspiration - Enhanced Quote Section */}
        <View style={styles.inspirationContainer}>
          <Card style={styles.inspirationCard} variant="elevated">
            <View style={styles.quoteIconContainer}>
              <Text style={styles.quoteIcon}>"</Text>
            </View>
            <Text style={styles.quoteText}>{dailyQuote.text}</Text>
            <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
            <View style={styles.reflectionPrompt}>
              <Text style={styles.reflectionText}>
                Take time today to reflect on your journey
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe', // Off-white for calm feel
  },
  
  // Personal Greeting Header - Softer Design
  greetingContainer: {
    paddingBottom: Spacing.md,
  },
  greetingGradient: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['2xl'],
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
  },
  greetingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  welcomeSection: {
    flex: 1,
  },
  greetingText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '400' as const,
    color: Colors.neutral[700],
    marginBottom: Spacing.xs,
  },
  nameText: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: '700' as const,
    color: Colors.neutral[900],
    marginBottom: Spacing.sm,
  },
  encouragementText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '400' as const,
    color: Colors.neutral[600],
    lineHeight: Typography.fontSize.base * 1.4,
  },
  profileButton: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  profileInitial: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600' as const,
    color: Colors.primary[700],
  },

  // Primary Action - New Journal Entry
  primaryActionContainer: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing['2xl'],
  },
  newEntryButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.lg,
    elevation: 8,
  },
  newEntryGradient: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  newEntryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newEntryIcon: {
    fontSize: Typography.fontSize['3xl'],
    marginRight: Spacing.lg,
  },
  newEntryTextContainer: {
    flex: 1,
  },
  newEntryTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  newEntrySubtitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '400' as const,
    color: Colors.white,
    opacity: 0.9,
  },

  // Progress Cards - Unified Design
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  progressTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700' as const,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  progressSubtitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '400' as const,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  progressCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  progressCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    ...Shadow.md,
  },
  progressIcon: {
    marginBottom: Spacing.md,
  },
  progressIconText: {
    fontSize: Typography.fontSize['2xl'],
  },
  progressNumber: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700' as const,
    color: Colors.primary[600],
    marginBottom: Spacing.xs,
  },
  progressLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600' as const,
    color: Colors.neutral[700],
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  progressEncouragement: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '400' as const,
    color: Colors.neutral[500],
    textAlign: 'center',
    fontStyle: 'italic' as const,
  },

  // Navigation Hub
  navigationContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  navigationTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700' as const,
    color: Colors.neutral[900],
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  navigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  navCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadow.sm,
  },
  navIconContainer: {
    marginBottom: Spacing.md,
  },
  navIcon: {
    fontSize: Typography.fontSize['2xl'],
  },
  navTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600' as const,
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  navSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '400' as const,
    color: Colors.neutral[600],
    textAlign: 'center',
  },

  // Daily Inspiration - Enhanced Quote Section
  inspirationContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['3xl'],
  },
  inspirationCard: {
    backgroundColor: Colors.primary[25] || Colors.primary[50],
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  quoteIconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  quoteIcon: {
    fontSize: Typography.fontSize['4xl'],
    color: Colors.primary[400],
    fontWeight: '300' as const,
  },
  quoteText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '500' as const,
    color: Colors.neutral[800],
    fontStyle: 'italic' as const,
    textAlign: 'center',
    lineHeight: Typography.fontSize.lg * 1.5,
    marginBottom: Spacing.md,
  },
  quoteAuthor: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600' as const,
    color: Colors.primary[700],
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  reflectionPrompt: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.primary[200],
  },
  reflectionText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '500' as const,
    color: Colors.neutral[700],
    textAlign: 'center',
    fontStyle: 'italic' as const,
  },
});
