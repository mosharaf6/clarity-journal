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
          colors={Colors.gradients.primary}
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
            <Card style={[styles.statCard, { backgroundColor: Colors.success[50] }]}>
              <Text style={[styles.statNumber, { color: Colors.success[600] }]}>{stats.totalEntries}</Text>
              <Text style={styles.statLabel}>Total Entries</Text>
            </Card>
            <Card style={[styles.statCard, { backgroundColor: Colors.warning[50] }]}>
              <Text style={[styles.statNumber, { color: Colors.warning[600] }]}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </Card>
            <Card style={[styles.statCard, { backgroundColor: Colors.secondary[50] }]}>
              <View style={styles.moodStat}>
                <Text style={styles.moodEmoji}>{getMoodEmoji(stats.averageMood)}</Text>
                <Text style={[styles.statNumber, { color: Colors.secondary[600] }]}>
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
        <Card style={styles.inspirationCard}>
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

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back, {user?.displayName || 'User'}!</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Clarity Journal</Text>
        <Text style={styles.subtitle}>Your personal reflection companion</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('EntryCapture')}
          >
            <Text style={styles.primaryButtonText}>New Entry</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('JournalList')}
          >
            <Text style={styles.secondaryButtonText}>View Journal</Text>
          </TouchableOpacity>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Insights')}
            >
              <Text style={styles.actionButtonText}>📊 Insights</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.actionButtonText}>⚙️ Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 280,
  },
  primaryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3498db',
  },
  secondaryButtonText: {
    color: '#3498db',
    fontSize: 18,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#2c3e50',
    fontSize: 14,
    fontWeight: '600',
  },
});
