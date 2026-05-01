# 🚀 MR Prodhani Store - Production Deployment Checklist

## Pre-Deployment Security Verification

### ✅ Firebase Security Rules
- [ ] Navigate to [Firebase Console](https://console.firebase.google.com)
- [ ] Select project: `mr-prodhani-store-f2ee3`
- [ ] Go to **Realtime Database → Rules**
- [ ] Verify rules match `database.rules.json`:
  - [ ] `products.write: "auth != null && root.child('admins')..."`
  - [ ] `orders.write: "auth != null && newData.child('userId')..."`
  - [ ] **NOT** `orders.write: true` (CRITICAL: Public write access is INSECURE)
- [ ] Click "Publish" to deploy rules
- [ ] See confirmation: "Rules updated successfully"

### ✅ Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Fill all `VITE_FIREBASE_*` variables from Firebase Console
- [ ] Verify `.env` is in `.gitignore` (NEVER commit secrets)
- [ ] Test with: `npm run dev` - should start without errors
- [ ] Look for: "✅ Firebase App initialized" in console

### ✅ Authentication Setup
- [ ] Firebase Auth is enabled (Email/Password method)
- [ ] Test admin account created in Firebase Console
- [ ] Test customer account created in Firebase Console
- [ ] Login works with both accounts

---

## Code Quality Checks

### ✅ Linting & Formatting
- [ ] Run: `npm run lint` - **0 errors**
- [ ] Run: `npm run format` - all files formatted
- [ ] All TypeScript types correct (if using TS)
- [ ] No console.log statements in production code
- [ ] All imports resolved correctly

### ✅ Testing
- [ ] Run: `npm run test` - all tests passing
- [ ] Test coverage at least 80%:
  - [ ] Validators: ✅ 100% coverage
  - [ ] Sanitizers: ✅ 100% coverage
  - [ ] Checkout validation: ✅ working
  - [ ] Admin form validation: ✅ working
  - [ ] TrackOrder rate limiting: ✅ working
- [ ] No failing tests

### ✅ Validation Implementation
- [ ] Checkout form validates:
  - [ ] Email format (RFC 5322)
  - [ ] Phone (10 digits, optional +91)
  - [ ] PIN code (exactly 6 digits)
  - [ ] Name (no HTML)
  - [ ] Address (no HTML)
  - [ ] Shows inline errors
- [ ] Admin form validates:
  - [ ] Product name (no HTML, max 100 chars)
  - [ ] Price (> 0, max 999,999)
  - [ ] Category selected
  - [ ] Description provided
- [ ] TrackOrder implements:
  - [ ] Rate limiting (max 5 searches/minute)
  - [ ] Order ID validation
  - [ ] Email verification (optional)
  - [ ] Clear error messages

### ✅ Input Sanitization
- [ ] All user inputs sanitized before storage
- [ ] XSS attempts blocked (HTML tags stripped)
- [ ] No SQL injection vulnerable (use parameterized queries)
- [ ] Search queries limited to 200 chars max
- [ ] Form data sanitized in checkout/admin pages

### ✅ Error Handling
- [ ] Error boundary catches React errors
- [ ] Firebase errors properly handled with retries
- [ ] Network timeouts have fallback UI
- [ ] User sees helpful error messages
- [ ] Errors logged for monitoring

---

## Build & Deployment

### ✅ Production Build
```bash
npm run build
```
- [ ] Build succeeds without warnings
- [ ] Output: `dist/` folder created
- [ ] Bundle size reasonable (< 500KB gzipped)
- [ ] Source maps generated for debugging
- [ ] No production console.logs in build

### ✅ Build Preview
```bash
npm run preview
```
- [ ] Preview server starts on port 4173
- [ ] All pages load without 404s
- [ ] Forms submit successfully
- [ ] Firebase connection works
- [ ] No console errors

### ✅ Feature Verification in Production Build
- [ ] **Home page** loads without errors
- [ ] **Shop page** displays products
  - [ ] Search filters work
  - [ ] Category filtering works
  - [ ] Pagination works
- [ ] **Product details** page loads
  - [ ] Product info displays correctly
  - [ ] "Add to Cart" works
- [ ] **Cart page** shows items
  - [ ] Quantity update works
  - [ ] Remove item works
  - [ ] Clear cart works
- [ ] **Checkout page** validates
  - [ ] Form validation works (invalid fields show errors)
  - [ ] Submit button disabled until valid
  - [ ] Order placed successfully
  - [ ] Tracking ID generated
- [ ] **Track Order page** works
  - [ ] Search with order ID works
  - [ ] Email verification works (if provided)
  - [ ] Rate limiting prevents spam
- [ ] **Admin page** (authenticated)
  - [ ] Add product works
  - [ ] Edit product works
  - [ ] Delete product confirms
  - [ ] View orders works
  - [ ] Update order status works
- [ ] **Authentication**
  - [ ] Login works
  - [ ] Logout works
  - [ ] Protected routes work
  - [ ] Redirect to login works
  - [ ] Error messages show on failed login

### ✅ Performance
- [ ] Lighthouse score >= 70 (Performance)
- [ ] Page load time < 3 seconds
- [ ] No N+1 database queries
- [ ] Images optimized
- [ ] CSS/JS minified in production build

---

## Monitoring & Logging

### ✅ Logging Setup
- [ ] Logger utility integrated into critical functions
- [ ] Production logs filtered (ERROR/WARN only)
- [ ] Development logs verbose (DEBUG/INFO)
- [ ] Error reporter captures critical errors
- [ ] Errors can be reviewed with: `getErrorStats()`

### ✅ Error Tracking Preparation
- [ ] Error reporter utility created and tested
- [ ] Global error handlers setup (unhandled promises, etc.)
- [ ] Ready to integrate with: Sentry, Firebase Crashlytics, or similar
- [ ] Error context includes: component, timestamp, user action

---

## Database & Data

### ✅ Sample Data
- [ ] Database auto-seeds with sample products on first run
- [ ] Sample products have correct structure:
  - [ ] id, name, price, category, condition, image
  - [ ] description, specs array
- [ ] Orders structure matches expectations:
  - [ ] userId, customer, items, total, status, date

### ✅ Data Integrity
- [ ] No duplicate products in database
- [ ] No orphaned orders without user
- [ ] All orders have complete data
- [ ] Prices are positive numbers
- [ ] Timestamps are ISO format

---

## Security Final Review

### 🔴 CRITICAL - Must Pass
- [ ] **NO** public write access to orders (orders.write must not be true)
- [ ] **NO** hardcoded credentials in code
- [ ] **NO** Firebase config exposed in client code (use env vars only)
- [ ] All user inputs validated and sanitized
- [ ] Admin operations require authentication
- [ ] Product prices cannot be modified by users

### 🟡 HIGH - Should Pass
- [ ] Rate limiting prevents abuse (5 searches/min on TrackOrder)
- [ ] CORS configured if API separate from frontend
- [ ] No sensitive data in error messages shown to users
- [ ] Password reset flow available (Firebase handles this)
- [ ] Session timeout implemented or browser session

### 🟢 MEDIUM - Nice to Have
- [ ] Two-factor authentication (future enhancement)
- [ ] Payment gateway integration (future enhancement)
- [ ] Email verification flow (future enhancement)
- [ ] Audit logging for admin actions (future enhancement)

---

## Deployment Steps

### Firebase Hosting Deployment
```bash
# 1. Ensure Firebase CLI installed
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Initialize Firebase (if not done)
firebase init hosting

# 4. Build production bundle
npm run build

# 5. Deploy
npm run deploy
# OR
firebase deploy
```

### Verification After Deployment
- [ ] Access live site from `https://mr-prodhani-store-f2ee3.web.app`
- [ ] All features work on live site
- [ ] HTTPS enabled
- [ ] No mixed content warnings
- [ ] Firebase Realtime Database connected
- [ ] All Firebase rules in effect

---

## Post-Deployment Monitoring

### ✅ First 24 Hours
- [ ] Monitor error logs for issues
- [ ] Test all user flows on live site
- [ ] Check Firebase console for unexpected activity
- [ ] Monitor database read/write quotas
- [ ] Check authentication success rate

### ✅ Ongoing Maintenance
- [ ] Weekly error log review
- [ ] Monthly performance review (Lighthouse)
- [ ] Regular database backups configured
- [ ] Keep dependencies updated
- [ ] Monitor Firebase billing

---

## Rollback Plan

If critical issues found after deployment:

1. **Quick Rollback**
   ```bash
   firebase hosting:channels:list  # List deployments
   firebase hosting:rollback      # Revert to previous
   ```

2. **Firebase Rules Rollback**
   - Go to Firebase Console → Realtime Database → Rules
   - Click "Revisions" tab
   - Select previous working version
   - Click "Restore"

3. **Database Backup Restore**
   - Check Firebase backups
   - Restore from previous snapshot
   - Test data integrity

---

## Sign-Off

- **Developer**: _________________ Date: _______
- **Reviewer**: _________________ Date: _______
- **QA**: _________________ Date: _______
- **Production**: _________________ Date: _______

---

## Notes

- This checklist should be completed before every production deployment
- Keep signed checklists for audit trail
- Update checklist if processes change
- Last updated: April 20, 2026
