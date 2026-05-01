import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const productData = {
  name: 'iPhone 16 Pro Max',
  price: 1199,
  originalPrice: 1399,
  condition: 'Brand New',
  category: 'smartphone',
  image: '/assets/iphone-16-pro-max.png',
  description: 'The iPhone 16 Pro Max is the ultimate powerhouse. Featuring the A18 Pro chip, a stunning 6.9-inch Super Retina XDR display, and the most advanced Pro camera system ever on an iPhone.',
  specs: ['A18 Pro Chip', '6.9-inch Display', '48MP Main Camera', 'USB-C Charging']
};

async function addProduct() {
  const productsRef = ref(db, 'products');
  const newProductRef = push(productsRef);
  const newId = newProductRef.key;
  
  const finalProduct = {
    ...productData,
    id: newId
  };
  
  await set(newProductRef, finalProduct);
  console.log('SUCCESS_ID:' + newId);
  console.log('Exiting with success');
}

addProduct().catch(err => {
  console.error(err);
  console.log('Exiting with failure');
});
