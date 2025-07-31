import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { JournalEntry } from '../types';

class FirebaseFirestoreService {
  private entriesCollection = 'entries';

  async createEntry(entry: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
    try {
      // Create a clean entry object with only defined values
      const cleanEntry: any = {
        userId: entry.userId,
        content: entry.content,
        type: entry.type,
        tags: entry.tags || [],
        mood: entry.mood,
        createdAt: Timestamp.fromDate(new Date()),
      };

      // Only add context if it exists and is not empty
      if (entry.context && typeof entry.context === 'string' && entry.context.trim()) {
        cleanEntry.context = entry.context.trim();
      }

      // Only add lastReviewedAt if it exists
      if (entry.lastReviewedAt) {
        cleanEntry.lastReviewedAt = Timestamp.fromDate(new Date(entry.lastReviewedAt));
      }

      console.log('Creating entry with data:', cleanEntry);
      
      const docRef = await addDoc(collection(db, this.entriesCollection), cleanEntry);
      
      return {
        ...entry,
        id: docRef.id,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error creating entry:', error);
      throw error;
    }
  }

  async getEntries(userId: string): Promise<JournalEntry[]> {
    try {
      // Try the optimized query first
      let q = query(
        collection(db, this.entriesCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (indexError) {
        console.log('Index not ready, using fallback query...');
        // Fallback: query without orderBy while index is building
        q = query(
          collection(db, this.entriesCollection),
          where('userId', '==', userId)
        );
        querySnapshot = await getDocs(q);
      }
      
      const entries: JournalEntry[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastReviewedAt: data.lastReviewedAt?.toDate() || null,
        } as JournalEntry);
      });
      
      // Sort manually if we used fallback query
      entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return entries;
    } catch (error) {
      console.error('Error getting entries:', error);
      throw error;
    }
  }

  async updateEntry(entryId: string, updates: Partial<JournalEntry>): Promise<void> {
    try {
      const entryRef = doc(db, this.entriesCollection, entryId);
      const updateData = { ...updates };
      
      // Convert dates to Timestamps
      if (updateData.lastReviewedAt) {
        updateData.lastReviewedAt = Timestamp.fromDate(new Date(updateData.lastReviewedAt));
      }
      
      await updateDoc(entryRef, updateData);
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  }

  async deleteEntry(entryId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.entriesCollection, entryId));
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  }

  async getEntriesForReview(userId: string, daysSinceReview: number = 7): Promise<JournalEntry[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysSinceReview);
      
      const q = query(
        collection(db, this.entriesCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const entriesForReview: JournalEntry[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const entry = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastReviewedAt: data.lastReviewedAt?.toDate() || null,
        } as JournalEntry;
        
        // Check if entry needs review
        if (!entry.lastReviewedAt || entry.lastReviewedAt < cutoffDate) {
          entriesForReview.push(entry);
        }
      });
      
      return entriesForReview.slice(0, 3); // Return max 3 entries
    } catch (error) {
      console.error('Error getting entries for review:', error);
      throw error;
    }
  }
}

// Export the Firebase service
export const firebaseFirestoreService = new FirebaseFirestoreService();
