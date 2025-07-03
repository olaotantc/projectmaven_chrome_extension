# Chrome Extension Manual Testing Guide

This guide walks you through testing the Projectmaven ↔ Upwork Chrome Extension.

## 🚀 **Quick Start**

### 1. Build and Load Extension
```bash
# Build the extension
npm run build

# The built extension is in ./dist folder
```

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked" → Select the `dist` folder
4. Extension should appear with green toggle

### 2. Test Environment Setup
You'll need to test on actual Upwork job pages. Use any job URL like:
- `https://www.upwork.com/jobs/Sample-Job-Title~123456`
- Or browse real jobs at `https://www.upwork.com/freelance-jobs/`

## 🧪 **Test Scenarios**

### **Scenario A: New User (Not Authenticated)**

#### Setup:
```javascript
// Open Chrome DevTools Console and run:
chrome.storage.local.clear();
```

#### Expected Behavior:
1. Visit any Upwork job page
2. ✅ "Quick Estimate" button should appear
3. Click button → ✅ Should show authentication prompt
4. Click extension icon → ✅ Should show login form

---

### **Scenario B: Starter Tier User**

#### Setup:
```javascript
// In Chrome DevTools Console:
chrome.storage.local.set({
  user: { 
    email: 'starter@example.com', 
    tier: 'starter', 
    hourlyRate: 50 
  },
  jwt: 'mock-starter-jwt-token'
});
```

#### Expected Behavior:
1. Visit Upwork job page
2. Click "Quick Estimate" → ✅ Should show upgrade prompt
3. Extension popup → ✅ Should show settings with rate field

---

### **Scenario C: Pro User (Full Functionality)**

#### Setup:
```javascript
// In Chrome DevTools Console:
chrome.storage.local.set({
  user: { 
    email: 'pro@example.com', 
    tier: 'pro', 
    hourlyRate: 100 
  },
  jwt: 'mock-pro-jwt-token'
});
```

#### Expected Behavior:
1. Visit Upwork job page
2. Click "Quick Estimate" → ✅ Should show loading modal
3. ✅ Estimate modal should display with:
   - Total cost calculation
   - Development time estimate
   - Hourly rate display
   - Task breakdown (if available)
   - "Generate SOW" button
   - "Copy Estimate" button

---

## 🔍 **Debug & Inspect**

### Chrome DevTools
1. **Content Script**: Inspect any Upwork page → Console tab
2. **Background Script**: `chrome://extensions/` → Click "service worker"
3. **Popup**: Right-click extension icon → "Inspect popup"

### Check Extension Storage
```javascript
// See what's stored:
chrome.storage.local.get(null, console.log);

// Clear storage:
chrome.storage.local.clear();
```

### Monitor API Calls
Background script console will show:
```
🔑 Auth check: true/false
📊 Estimate request: {...}
📄 SOW generation: {...}
📈 Telemetry events: {...}
```

---

## 🐛 **Common Issues & Solutions**

### "Quick Estimate" Button Not Appearing
- **Cause**: DOM selectors may not match current Upwork layout
- **Fix**: Check console for selector errors
- **Debug**: Inspect page and verify selectors in `src/content/selectors.ts`

### Modal Not Showing
- **Cause**: CSS conflicts or z-index issues
- **Fix**: Inspect element and check CSS console errors
- **Debug**: Modal uses `z-index: 999999`

### API Calls Failing
- **Cause**: CORS or network issues (expected in dev)
- **Expected**: API calls will fail without real backend
- **Debug**: Check background script console for request logs

---

## ✅ **Test Checklist**

### Content Script
- [ ] Button injection on Upwork job pages
- [ ] Button styling and hover effects  
- [ ] Job data scraping (check console logs)
- [ ] Modal display and interactions

### Authentication
- [ ] Login prompt for unauthenticated users
- [ ] Upgrade prompt for Starter users
- [ ] Full access for Pro users
- [ ] Storage persistence between sessions

### Popup
- [ ] Login form display
- [ ] Settings view for authenticated users
- [ ] Hourly rate editing
- [ ] Proper tier display

### Background Script
- [ ] Message handling between content/popup
- [ ] JWT validation (mocked)
- [ ] API call structure (will fail without backend)
- [ ] Telemetry event logging

### UI/UX
- [ ] Professional styling
- [ ] Responsive design
- [ ] Error handling
- [ ] Loading states
- [ ] "Not affiliated with Upwork" disclaimer

---

## 🎯 **Next Steps**

After manual testing:
1. Run automated tests: `npm run test:e2e`
2. Test different Upwork page layouts
3. Validate extension permissions
4. Prepare for Chrome Web Store submission 