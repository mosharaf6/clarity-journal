export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export type EntryType = 'text' | 'voice' | 'image';

export interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  type: EntryType;
  tags: string[];
  mood: 1 | 2 | 3 | 4 | 5;
  createdAt: any; // Using 'any' for now to accommodate Firebase Timestamps
  lastReviewedAt?: any;
  context?: string;
}
