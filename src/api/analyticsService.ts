import { JournalEntry } from '../types';

export interface MoodTrend {
  date: string;
  averageMood: number;
  entryCount: number;
}

export interface TagAnalysis {
  tag: string;
  count: number;
  averageMood: number;
}

export interface JournalInsight {
  type: 'mood_trend' | 'frequent_tags' | 'writing_streak' | 'reflection_prompt';
  title: string;
  description: string;
  data?: any;
}

class AnalyticsService {
  calculateMoodTrends(entries: JournalEntry[], days: number = 7): MoodTrend[] {
    const today = new Date();
    const trends: MoodTrend[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      const dayEntries = entries.filter(entry => {
        const entryDate = new Date(entry.createdAt).toISOString().split('T')[0];
        return entryDate === dateString;
      });

      if (dayEntries.length > 0) {
        const averageMood = dayEntries.reduce((sum, entry) => sum + entry.mood, 0) / dayEntries.length;
        trends.push({
          date: dateString,
          averageMood: Math.round(averageMood * 10) / 10,
          entryCount: dayEntries.length,
        });
      } else {
        trends.push({
          date: dateString,
          averageMood: 0,
          entryCount: 0,
        });
      }
    }

    return trends;
  }

  analyzeTopTags(entries: JournalEntry[], limit: number = 5): TagAnalysis[] {
    const tagMap = new Map<string, { count: number; totalMood: number }>();

    entries.forEach(entry => {
      entry.tags.forEach(tag => {
        const existing = tagMap.get(tag) || { count: 0, totalMood: 0 };
        tagMap.set(tag, {
          count: existing.count + 1,
          totalMood: existing.totalMood + entry.mood,
        });
      });
    });

    return Array.from(tagMap.entries())
      .map(([tag, data]) => ({
        tag,
        count: data.count,
        averageMood: Math.round((data.totalMood / data.count) * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  calculateWritingStreak(entries: JournalEntry[]): number {
    if (entries.length === 0) return 0;

    const sortedEntries = entries.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].createdAt);
      entryDate.setHours(0, 0, 0, 0);

      if (entryDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (entryDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  }

  generateInsights(entries: JournalEntry[]): JournalInsight[] {
    const insights: JournalInsight[] = [];

    // Mood trend insight
    const trends = this.calculateMoodTrends(entries, 7);
    const validTrends = trends.filter(t => t.entryCount > 0);
    
    if (validTrends.length >= 2) {
      const recentAvg = validTrends.slice(-3).reduce((sum, t) => sum + t.averageMood, 0) / 3;
      const earlierAvg = validTrends.slice(0, 3).reduce((sum, t) => sum + t.averageMood, 0) / 3;
      
      if (recentAvg > earlierAvg + 0.5) {
        insights.push({
          type: 'mood_trend',
          title: 'Mood Improving! 📈',
          description: `Your average mood has increased from ${earlierAvg.toFixed(1)} to ${recentAvg.toFixed(1)} over the past week.`,
          data: { recentAvg, earlierAvg }
        });
      } else if (earlierAvg > recentAvg + 0.5) {
        insights.push({
          type: 'mood_trend',
          title: 'Consider Self-Care 💙',
          description: `Your mood has dipped recently. Remember to be kind to yourself and consider what might help.`,
          data: { recentAvg, earlierAvg }
        });
      }
    }

    // Writing streak insight
    const streak = this.calculateWritingStreak(entries);
    if (streak > 0) {
      insights.push({
        type: 'writing_streak',
        title: `${streak} Day Writing Streak! 🔥`,
        description: streak === 1 
          ? 'Great start! Keep building your journaling habit.'
          : `Amazing consistency! You've journaled for ${streak} days in a row.`,
        data: { streak }
      });
    }

    // Top tags insight
    const topTags = this.analyzeTopTags(entries, 3);
    if (topTags.length > 0) {
      const mostFrequentTag = topTags[0];
      insights.push({
        type: 'frequent_tags',
        title: 'Most Common Theme 🏷️',
        description: `You've written about "${mostFrequentTag.tag}" ${mostFrequentTag.count} times with an average mood of ${mostFrequentTag.averageMood}.`,
        data: { topTags }
      });
    }

    // Reflection prompts based on recent patterns
    if (entries.length > 5) {
      const recentEntries = entries.slice(0, 5);
      const avgMood = recentEntries.reduce((sum, e) => sum + e.mood, 0) / recentEntries.length;
      
      if (avgMood >= 4) {
        insights.push({
          type: 'reflection_prompt',
          title: 'Reflect on Joy ✨',
          description: 'You seem to be in a good place! What has been contributing to your positive mood lately?',
        });
      } else if (avgMood <= 2) {
        insights.push({
          type: 'reflection_prompt',
          title: 'Gentle Reflection 🌱',
          description: 'What small thing could bring you comfort today? Sometimes the littlest acts of self-care make a big difference.',
        });
      }
    }

    return insights;
  }

  getWeeklyStats(entries: JournalEntry[]) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyEntries = entries.filter(entry => 
      new Date(entry.createdAt) >= weekAgo
    );

    return {
      totalEntries: weeklyEntries.length,
      averageMood: weeklyEntries.length > 0 
        ? weeklyEntries.reduce((sum, e) => sum + e.mood, 0) / weeklyEntries.length
        : 0,
      topTags: this.analyzeTopTags(weeklyEntries, 3),
      writingStreak: this.calculateWritingStreak(entries),
    };
  }
}

export const analyticsService = new AnalyticsService();
