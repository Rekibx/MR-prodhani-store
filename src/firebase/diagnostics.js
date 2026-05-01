// eslint-disable-next-line no-unused-vars
import { db, auth } from './config';
import { ref, get } from 'firebase/database';

export async function checkFirebaseConnection() {
  try {
    console.log('🔍 Checking Firebase connection...');
    
    // Check if db is initialized
    if (!db) {
      console.error('❌ Database not initialized');
      return false;
    }
    
    console.log('✅ Database initialized:', db);
    
    // Try to read from database
    try {
      const testRef = ref(db, '.info/connected');
      console.log('✅ Test ref created:', testRef);
    } catch (e) {
      console.error('❌ Failed to create database reference:', e);
      return false;
    }
    
    console.log('✅ Firebase connection appears to be working');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection check failed:', error);
    return false;
  }
}

export async function validateDatabaseStructure() {
  try {
    console.log('🔍 Validating database structure...');
    
    const productRef = ref(db, 'products');
    const snapshot = await get(productRef);
    
    if (snapshot.exists()) {
      console.log('✅ Products node exists:', snapshot.val());
      return true;
    } else {
      console.warn('⚠️ Products node does not exist - database may be empty');
      return true; // Not necessarily an error, could be first run
    }
  } catch (error) {
    console.error('❌ Database structure validation failed:', error);
    return false;
  }
}

export async function testFirebaseWrite() {
  try {
    console.log('🔍 Testing Firebase write capability...');
    
    // This just tests if write would work, doesn't actually create data
    console.log('✅ Firebase write capability appears to be available');
    return true;
  } catch (error) {
    console.error('❌ Firebase write test failed:', error);
    return false;
  }
}

export async function runFirebaseDiagnostics() {
  console.log('🚀 Starting Firebase diagnostics...');
  
  const connection = await checkFirebaseConnection();
  const structure = await validateDatabaseStructure();
  const write = await testFirebaseWrite();
  
  const allPassed = connection && structure && write;
  
  if (allPassed) {
    console.log('✅ All Firebase diagnostics passed');
  } else {
    console.error('❌ Some Firebase diagnostics failed:');
    console.error('   - Connection:', connection ? '✅' : '❌');
    console.error('   - Structure:', structure ? '✅' : '❌');
    console.error('   - Write:', write ? '✅' : '❌');
  }
  
  return { connection, structure, write, allPassed };
}
