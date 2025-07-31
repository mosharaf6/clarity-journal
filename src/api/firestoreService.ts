import { JournalEntry } from '../types';

// Mock Firestore service - will be replaced with actual Firebase integration
class FirestoreService {
  private entries: JournalEntry[] = [
    {
      id: '1',
      userId: 'mock-user-id',
      content: 'Had a great day today! Finally finished that project I\'ve been working on. Feeling accomplished and ready for new challenges.',
      type: 'text',
      tags: ['work', 'goals', 'reflection'],
      mood: 4,
      createdAt: new Date('2025-01-20'),
      context: 'Evening reflection',
    },
    {
      id: '2',
      userId: 'mock-user-id',
      content: 'Feeling overwhelmed with everything on my plate. Need to prioritize better and maybe delegate some tasks.',
      type: 'text',
      tags: ['work', 'life'],
      mood: 2,
      createdAt: new Date('2025-01-19'),
      context: 'Morning thoughts',
    },
    {
      id: '3',
      userId: 'mock-user-id',
      content: 'Amazing conversation with a friend today. Really made me think about what matters most in life.',
      type: 'text',
      tags: ['relationships', 'reflection'],
      mood: 5,
      createdAt: new Date('2025-01-18'),
      context: 'Post-conversation',
    },
  ];

  async createEntry(entry: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    this.entries.unshift(newEntry);
    return newEntry;
  }

  async getEntries(userId: string): Promise<JournalEntry[]> {
    return this.entries
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateEntry(entryId: string, updates: Partial<JournalEntry>): Promise<void> {
    const index = this.entries.findIndex(entry => entry.id === entryId);
    if (index !== -1) {
      this.entries[index] = { ...this.entries[index], ...updates };
    }
  }

  async deleteEntry(entryId: string): Promise<void> {
    this.entries = this.entries.filter(entry => entry.id !== entryId);
  }

  async getEntriesForReview(userId: string, daysSinceReview: number = 7): Promise<JournalEntry[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysSinceReview);
    
    return this.entries
      .filter(entry => 
        entry.userId === userId && 
        (!entry.lastReviewedAt || new Date(entry.lastReviewedAt) < cutoffDate)
      )
      .slice(0, 3); // Return max 3 entries for review
  }
}

export const firestoreService = new FirestoreService();
