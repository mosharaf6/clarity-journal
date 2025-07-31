import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Replace this with your actual Firebase project config from Step 5
const firebaseConfig = {
  apiKey: "AIzaSyD2ljygtCT-VPCymsc_XTBl2wS3qzlXnlU",
  authDomain: "clarity-d44eb.firebaseapp.com",
  projectId: "clarity-d44eb",
  storageBucket: "clarity-d44eb.firebasestorage.app",
  messagingSenderId: "816400405239",
  appId: "1:816400405239:web:014916dd8569d54d30f9f2",
  measurementId: "G-2Z75KB5529"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);
export default app;
