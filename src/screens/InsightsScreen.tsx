import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../contexts/AuthContext';
import { firebaseFirestoreService } from '../api/firebaseFirestoreService';
import { analyticsService, JournalInsight, MoodTrend } from '../api/analyticsService';
import { JournalEntry } from '../types';

const screenWidth = Dimensions.get('window').width;

export default function InsightsScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [insights, setInsights] = useState<JournalInsight[]>([]);
  const [moodTrends, setMoodTrends] = useState<MoodTrend[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userEntries = await firebaseFirestoreService.getEntries(user.uid);
      setEntries(userEntries);

      // Generate analytics
      const trends = analyticsService.calculateMoodTrends(userEntries, 7);
      const generatedInsights = analyticsService.generateInsights(userEntries);
      const stats = analyticsService.getWeeklyStats(userEntries);

      setMoodTrends(trends);
      setInsights(generatedInsights);
      setWeeklyStats(stats);
    } catch (error) {
      console.error('Error loading insights data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😞', '😐', '😊', '😄', '🤩'];
    return emojis[mood - 1] || '😐';
  };

  const renderInsightCard = (insight: JournalInsight, index: number) => (
    <View key={index} style={styles.insightCard}>
      <Text style={styles.insightTitle}>{insight.title}</Text>
      <Text style={styles.insightDescription}>{insight.description}</Text>
    </View>
  );

  const renderMoodChart = () => {
    const validTrends = moodTrends.filter(t => t.entryCount > 0);
    
    if (validTrends.length < 2) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Mood Trends (7 Days)</Text>
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Not enough data for trends</Text>
            <Text style={styles.noDataSubtext}>Keep journaling to see your mood patterns!</Text>
          </View>
        </View>
      );
    }

    const chartData = {
      labels: validTrends.map(t => new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [{
        data: validTrends.map(t => t.averageMood),
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
      }],
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Mood Trends (7 Days)</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={200}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#3498db',
            },
          }}
          style={styles.chart}
          yAxisSuffix=""
        />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Analyzing your journal...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Insights</Text>
          <TouchableOpacity onPress={loadData} style={styles.refreshButton}>
            <Text style={styles.refreshText}>↻</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Stats */}
        {weeklyStats && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{weeklyStats.totalEntries}</Text>
                <Text style={styles.statLabel}>Entries</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {weeklyStats.averageMood > 0 ? weeklyStats.averageMood.toFixed(1) : '—'}
                </Text>
                <Text style={styles.statLabel}>Avg Mood</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{weeklyStats.writingStreak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>
          </View>
        )}

        {/* Mood Chart */}
        {renderMoodChart()}

        {/* Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>Personal Insights</Text>
          {insights.length > 0 ? (
            insights.map(renderInsightCard)
          ) : (
            <View style={styles.noInsightsContainer}>
              <Text style={styles.noInsightsText}>Keep writing to unlock insights!</Text>
              <Text style={styles.noInsightsSubtext}>
                Journal regularly to discover patterns in your thoughts and moods.
              </Text>
            </View>
          )}
        </View>

        {/* Top Tags */}
        {weeklyStats?.topTags && weeklyStats.topTags.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.sectionTitle}>Most Common Themes</Text>
            {weeklyStats.topTags.map((tag: any, index: number) => (
              <View key={index} style={styles.tagItem}>
                <View style={styles.tagInfo}>
                  <Text style={styles.tagName}>#{tag.tag}</Text>
                  <Text style={styles.tagCount}>{tag.count} times</Text>
                </View>
                <View style={styles.tagMood}>
                  <Text style={styles.tagMoodText}>{getMoodEmoji(Math.round(tag.averageMood))}</Text>
                  <Text style={styles.tagMoodValue}>{tag.averageMood.toFixed(1)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  refreshButton: {
    backgroundColor: '#3498db',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  statsContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 8,
    textAlign: 'center',
  },
  insightsContainer: {
    margin: 20,
  },
  insightCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  insightDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  noInsightsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  noInsightsText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  noInsightsSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  tagsContainer: {
    margin: 20,
    marginTop: 0,
  },
  tagItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagInfo: {
    flex: 1,
  },
  tagName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  tagCount: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  tagMood: {
    alignItems: 'center',
  },
  tagMoodText: {
    fontSize: 20,
  },
  tagMoodValue: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
});
