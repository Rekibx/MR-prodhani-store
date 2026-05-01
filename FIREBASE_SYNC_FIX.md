# Firebase Syncing Troubleshooting Guide

## Critical: Check Firebase Security Rules

Your Firebase Realtime Database might have restrictive rules. Follow these steps:

### Step 1: Go to Firebase Console
1. Open https://console.firebase.google.com
2. Select your project: `mr-prodhani-store-f2ee3`
3. Go to **Realtime Database** (left menu)
4. Click **Rules** tab

### Step 2: Check Current Rules
Current rules might be:
```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

### Step 3: Update Rules for Development (Testing Only)
Replace with:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**Click Publish**

### Step 4: Verify Database Has Data
1. Go to **Data** tab in Realtime Database
2. Check if you see any data under:
   - `products` → should have product entries
   - `orders` → should have order entries

If empty, you need to seed initial data.

### Step 5: Check Connection
In browser console, run:
```javascript
import { db } from './src/firebase/config.js';
console.log('Database object:', db);
```

If this shows undefined, Firebase isn't initialized.

---

## Common Causes & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| **No data shows** | Empty database OR rules deny read | Add test data & fix rules |
| **Console shows errors** | Connection refused | Check database URL in .env |
| **"Permission denied"** | Rules set to false | Set rules to true for testing |
| **App loads but no products** | Data not syncing | Check browser console for errors |

---

## Data Seeding

If database is empty, add test products:
1. In Realtime Database console, click **+** next to "products"
2. Add: `test-product-1`
3. Add this JSON:
```json
{
  "name": "iPhone 16 Pro Max",
  "price": 1199,
  "category": "smartphone",
  "image": "https://example.com/iphone.jpg"
}
```

Or use the provided add_product_tmp.js script to add data.

---

## If Still Not Working

Run these diagnostics in browser console:

```javascript
// Check if Firebase is initialized
import { db } from './src/firebase/config.js';
console.log('1. Database initialized:', !!db);

// Try to read data
import { ref, get } from 'firebase/database';
const productsRef = ref(db, 'products');
get(productsRef).then(snapshot => {
  console.log('2. Data fetch successful:', snapshot.val());
}).catch(err => {
  console.error('2. Data fetch failed:', err);
});
```

Report the errors you see.
