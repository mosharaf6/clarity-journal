import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../api/notificationService';

interface NotificationSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

export default function SettingsScreen() {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false,
    hour: 19, // 7 PM default
    minute: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('notificationSettings');
      if (saved) {
        setNotificationSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (settings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const toggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      const hasPermission = await notificationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive journal reminders.',
          [{ text: 'OK' }]
        );
        return;
      }

      await notificationService.scheduleJournalReminder({
        hour: notificationSettings.hour,
        minute: notificationSettings.minute,
      });

      Alert.alert(
        'Reminder Set! 🔔',
        `You'll receive daily reminders at ${formatTime(notificationSettings.hour, notificationSettings.minute)}.`,
        [{ text: 'OK' }]
      );
    } else {
      await notificationService.cancelAllReminders();
      Alert.alert(
        'Reminders Disabled',
        'You will no longer receive journal reminders.',
        [{ text: 'OK' }]
      );
    }

    await saveSettings({ ...notificationSettings, enabled });
  };

  const changeReminderTime = (hour: number, minute: number = 0) => {
    const newSettings = { ...notificationSettings, hour, minute };
    saveSettings(newSettings);

    if (notificationSettings.enabled) {
      notificationService.scheduleJournalReminder({ hour, minute });
      Alert.alert(
        'Time Updated! ⏰',
        `Your reminder has been updated to ${formatTime(hour, minute)}.`,
        [{ text: 'OK' }]
      );
    }
  };

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const timeOptions = [
    { label: '7:00 AM', hour: 7, minute: 0 },
    { label: '8:00 AM', hour: 8, minute: 0 },
    { label: '12:00 PM', hour: 12, minute: 0 },
    { label: '6:00 PM', hour: 18, minute: 0 },
    { label: '7:00 PM', hour: 19, minute: 0 },
    { label: '8:00 PM', hour: 20, minute: 0 },
    { label: '9:00 PM', hour: 21, minute: 0 },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Reminders</Text>
          <Text style={styles.sectionDescription}>
            Get gentle reminders to journal and reflect on your day.
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Reminders</Text>
              <Text style={styles.settingSubtext}>
                {notificationSettings.enabled 
                  ? `Daily at ${formatTime(notificationSettings.hour, notificationSettings.minute)}`
                  : 'No reminders set'
                }
              </Text>
            </View>
            <Switch
              value={notificationSettings.enabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#e1e8ed', true: '#3498db' }}
              thumbColor={notificationSettings.enabled ? '#ffffff' : '#ffffff'}
            />
          </View>

          {notificationSettings.enabled && (
            <View style={styles.timeOptionsContainer}>
              <Text style={styles.timeOptionsTitle}>Reminder Time</Text>
              {timeOptions.map((option) => (
                <TouchableOpacity
                  key={`${option.hour}-${option.minute}`}
                  style={[
                    styles.timeOption,
                    notificationSettings.hour === option.hour && 
                    notificationSettings.minute === option.minute &&
                    styles.timeOptionSelected
                  ]}
                  onPress={() => changeReminderTime(option.hour, option.minute)}
                >
                  <Text style={[
                    styles.timeOptionText,
                    notificationSettings.hour === option.hour && 
                    notificationSettings.minute === option.minute &&
                    styles.timeOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {notificationSettings.hour === option.hour && 
                   notificationSettings.minute === option.minute && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Clarity Journal</Text>
          <Text style={styles.aboutText}>
            Clarity Journal helps you reflect on your thoughts, track your moods, and 
            gain insights into your personal growth journey. Regular journaling can 
            improve mental clarity, emotional awareness, and overall well-being.
          </Text>
          
          <View style={styles.tipContainer}>
            <Text style={styles.tipTitle}>💡 Journaling Tips</Text>
            <Text style={styles.tipText}>
              • Write freely without worrying about grammar or structure{'\n'}
              • Include your emotions and how you felt{'\n'}
              • Use tags to categorize your experiences{'\n'}
              • Review your past entries to see patterns{'\n'}
              • Be consistent - even short entries help!
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
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  section: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  settingSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  timeOptionsContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  timeOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  timeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  timeOptionSelected: {
    backgroundColor: '#3498db',
  },
  timeOptionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  timeOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  aboutText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 20,
  },
  tipContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
});
