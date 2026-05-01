import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { ref, onValue } from 'firebase/database';

// Global connection state
let isConnected = false;

export function useFirebaseConnection() {
  const [connected, setConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    let timeoutId;
    try {
      const connectedRef = ref(db, '.info/connected');
      
      console.log('🔌 Subscribing to Firebase connection...');
      
      // Set a 10s safety timeout for the initial connection
      timeoutId = setTimeout(() => {
        if (!isConnected) {
          console.warn('⚠️ Firebase connection attempt timed out (10s)');
          setIsTimedOut(true);
        }
      }, 10000);
      
      const unsubscribe = onValue(connectedRef, (snapshot) => {
        const isConnectedToFirebase = snapshot.val() === true;
        isConnected = isConnectedToFirebase;
        setConnected(isConnectedToFirebase);
        
        if (isConnectedToFirebase) {
          console.log('✅ Connected to Firebase');
          setConnectionAttempts(0);
          setIsTimedOut(false);
          if (timeoutId) clearTimeout(timeoutId);
        } else {
          console.warn('⚠️ Disconnected from Firebase');
          // Only increment attempts if it's an actual disconnection after first success
          setConnectionAttempts((prev) => prev + 1);
        }
      });

      return () => {
        console.log('🔌 Unsubscribing from Firebase connection');
        if (timeoutId) clearTimeout(timeoutId);
        unsubscribe();
      };
    } catch (error) {
      console.error('❌ Firebase connection monitoring error:', error);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConnected(false);
    }
  }, []);

  return { connected, connectionAttempts, isTimedOut };
}

export function isFirebaseConnected() {
  return isConnected;
}

// Retry logic with exponential backoff
export async function fetchWithRetry(fetchFn, maxRetries = 3, delayMs = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📡 Fetch attempt ${attempt}/${maxRetries}`);
      const result = await fetchFn();
      console.log('✅ Fetch successful on attempt', attempt);
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = delayMs * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('❌ All fetch attempts failed', lastError);
  throw lastError;
}
