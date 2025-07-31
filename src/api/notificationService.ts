// Notification service temporarily disabled for Expo Go compatibility
// expo-notifications requires development build since SDK 53

class NotificationService {
  async requestPermissions(): Promise<boolean> {
    // Disabled for Expo Go - would require development build
    console.log('Notifications disabled in Expo Go. Use development build for full functionality.');
    return false;
  }

  async scheduleJournalReminder(time: { hour: number; minute: number }): Promise<string | null> {
    // Disabled for Expo Go - would require development build
    console.log('Journal reminders disabled in Expo Go. Use development build for full functionality.');
    return null;
  }

  async cancelAllReminders(): Promise<void> {
    // Disabled for Expo Go - would require development build
    console.log('Cancel reminders disabled in Expo Go. Use development build for full functionality.');
  }

  async sendInsightNotification(insight: string): Promise<void> {
    // Disabled for Expo Go - would require development build
    console.log('Insight notifications disabled in Expo Go. Use development build for full functionality.');
  }
}

export const notificationService = new NotificationService();
