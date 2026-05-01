import { db } from '../firebase/config';
import { ref, set, get } from 'firebase/database';

// Sample products data
const SAMPLE_PRODUCTS = [
  {
    id: 'iphone-16-pro-max',
    name: 'iPhone 16 Pro Max',
    price: 99999,
    originalPrice: 129999,
    category: 'smartphone',
    condition: 'Brand New',
    image: 'https://chatgpt.com/s/m_69d493be77c4819193b6e8716bd5a995',
    description: 'Latest flagship iPhone with advanced camera system',
    specs: ['A18 Pro Chip', '6.9-inch Super Retina XDR', '48MP Main Camera']
  },
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    price: 79999,
    originalPrice: 99999,
    category: 'smartphone',
    condition: 'Like New',
    image: 'https://via.placeholder.com/300x300?text=iPhone+15+Pro',
    description: 'Previous generation flagship with excellent performance',
    specs: ['A17 Pro Chip', '6.1-inch Display', '48MP Camera']
  },
  {
    id: 'airpods-pro',
    name: 'AirPods Pro',
    price: 19999,
    originalPrice: 24999,
    category: 'accessories',
    condition: 'Brand New',
    image: 'https://via.placeholder.com/300x300?text=AirPods+Pro',
    description: 'Premium wireless earbuds with noise cancellation',
    specs: ['Active Noise Cancellation', '6-hour Battery', 'Spatial Audio']
  },
  {
    id: 'iphone-14-pro',
    name: 'iPhone 14 Pro',
    price: 59999,
    originalPrice: 79999,
    category: 'smartphone',
    condition: 'Excellent',
    image: 'https://via.placeholder.com/300x300?text=iPhone+14+Pro',
    description: 'Reliable smartphone with great camera',
    specs: ['A16 Bionic', '6.1-inch Display', '48MP Camera']
  },
  {
    id: 'usb-c-cable',
    name: 'USB-C Cable (1m)',
    price: 999,
    originalPrice: 1499,
    category: 'accessories',
    condition: 'Brand New',
    image: 'https://via.placeholder.com/300x300?text=USB-C+Cable',
    description: 'High-quality USB-C charging cable',
    specs: ['1 meter length', '60W Power Delivery', 'Durable']
  }
];

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Check if products already exist
    const productsRef = ref(db, 'products');
    const snapshot = await get(productsRef);
    
    if (snapshot.exists() && Object.keys(snapshot.val()).length > 0) {
      console.log('✅ Database already has products, skipping seed');
      return { success: true, message: 'Database already seeded' };
    }
    
    console.log('📝 Adding sample products...');
    
    // Add sample products
    for (const product of SAMPLE_PRODUCTS) {
      const productRef = ref(db, `products/${product.id}`);
      await set(productRef, product);
      console.log(`✅ Added: ${product.name}`);
    }
    
    console.log('🎉 Database seeding completed successfully');
    return { success: true, message: 'Database seeded with sample data' };
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    return { success: false, error: error.message };
  }
}

export async function clearDatabase() {
  try {
    console.log('🗑️ Clearing database...');
    
    const productsRef = ref(db, 'products');
    await set(productsRef, null);
    
    const ordersRef = ref(db, 'orders');
    await set(ordersRef, null);
    
    console.log('✅ Database cleared');
    return { success: true };
  } catch (error) {
    console.error('❌ Clear database failed:', error);
    return { success: false, error: error.message };
  }
}

export async function checkDataIntegrity() {
  try {
    console.log('🔍 Checking data integrity...');
    
    const productsRef = ref(db, 'products');
    const productsSnapshot = await get(productsRef);
    const products = productsSnapshot.val();
    
    if (!products) {
      console.warn('⚠️ No products found in database');
      return { success: false, message: 'No products', hasProducts: false };
    }
    
    const productCount = Object.keys(products).length;
    console.log(`✅ Found ${productCount} products`);
    
    return { 
      success: true, 
      message: `Database has ${productCount} products`,
      hasProducts: true,
      count: productCount
    };
  } catch (error) {
    console.error('❌ Data integrity check failed:', error);
    return { success: false, error: error.message };
  }
}
