# How to Check Performance Metrics

## 🚀 Quick Start

### 1. Check Browser Console (Development)
Performance metrics are automatically logged in development mode:

```bash
# Start the app
cd frontend && npm run dev

# Open browser console (F12)
# You'll see logs like:
[Performance] LCP: { value: 2341, rating: 'good' }
[Custom Metric] api_call: 234 { endpoint: '/api/chat', status: 200 }
```

### 2. Check Backend Metrics API
```bash
# Start backend
cd backend && npm start

# In another terminal, check metrics:
curl http://localhost:5000/api/metrics

# Response:
{
  "requests": {
    "total": 100,
    "avgDuration": 234,
    "slowest": { ... }
  },
  "errors": {
    "total": 2,
    "recent": [...]
  }
}
```

### 3. Check Frontend Analytics API
```bash
# Get Web Vitals data
curl http://localhost:3000/api/analytics/vitals

# Response:
{
  "total": 150,
  "byName": {
    "LCP": 25,
    "FID": 25,
    "CLS": 25
  },
  "recent": [...]
}
```

---

## 📊 Viewing Metrics

### Option 1: Browser DevTools

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to **Lighthouse** tab
3. Click "Generate report"
4. See Core Web Vitals scores

**Performance Tab:**
1. Open DevTools (F12)
2. Go to **Performance** tab
3. Click Record
4. Interact with app
5. Stop recording
6. Analyze timeline

### Option 2: Console Logs

In development, metrics are logged automatically:
```javascript
// Web Vitals
[Performance] LCP: 2341
[Performance] FID: 45
[Performance] CLS: 0.05

// API Calls
[Custom Metric] api_call: 234 { endpoint: '/api/chat' }

// Backend
{"level":"info","message":"Request completed","duration":234,"status":200}
```

### Option 3: API Endpoints

**Backend Metrics:**
```bash
curl http://localhost:5000/api/metrics | jq
```

**Frontend Metrics:**
```bash
curl http://localhost:3000/api/analytics/vitals | jq
```

---

## 🔍 What to Look For

### Good Performance
```
✅ LCP < 2.5s
✅ FID < 100ms
✅ CLS < 0.1
✅ API calls < 500ms
✅ No slow requests warnings
```

### Poor Performance
```
❌ LCP > 4s
❌ FID > 300ms
❌ CLS > 0.25
❌ API calls > 1000ms
❌ "Slow request detected" warnings
```

---

## 🛠️ Testing Performance

### Test 1: Page Load Speed
```bash
# Open browser
# Go to http://localhost:3000
# Check console for LCP metric
# Should be < 2.5s
```

### Test 2: API Performance
```bash
# Make a chat request
# Check console for api_call metric
# Should be < 500ms
```

### Test 3: Backend Performance
```bash
# Check backend logs
grep "Request completed" logs
# Look for duration values
```

---

## 📈 Monitoring in Production

### 1. Sentry Dashboard
- Already integrated
- Go to sentry.io
- View performance metrics
- Set up alerts

### 2. Custom Dashboard (Optional)
Create a simple dashboard page:

```typescript
// app/admin/metrics/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function MetricsPage() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetch('/api/analytics/vitals')
      .then(r => r.json())
      .then(setMetrics);
  }, []);

  if (!metrics) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Performance Metrics</h1>
      <div className="grid gap-4">
        <div className="border p-4 rounded">
          <h2>Total Metrics: {metrics.total}</h2>
        </div>
        <div className="border p-4 rounded">
          <h2>By Type:</h2>
          <pre>{JSON.stringify(metrics.byName, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
```

### 3. Real-Time Monitoring
```bash
# Watch backend logs
tail -f backend/logs/app.log | grep Performance

# Watch for slow requests
tail -f backend/logs/app.log | grep "Slow request"
```

---

## 🎯 Quick Commands

```bash
# Check backend metrics
curl http://localhost:5000/api/metrics

# Check frontend metrics
curl http://localhost:3000/api/analytics/vitals

# Watch backend logs
cd backend && npm start | grep "Request completed"

# Run Lighthouse
npx lighthouse http://localhost:3000 --view

# Check bundle size
cd frontend && npm run build
# Look for "First Load JS" in output
```

---

## 📊 Example Output

### Backend Metrics
```json
{
  "requests": {
    "total": 150,
    "avgDuration": 234,
    "slowest": {
      "endpoint": "/api/chat",
      "duration": 890,
      "timestamp": 1234567890
    }
  },
  "errors": {
    "total": 2,
    "recent": [
      {
        "message": "Validation failed",
        "timestamp": 1234567890
      }
    ]
  }
}
```

### Frontend Metrics
```json
{
  "total": 150,
  "byName": {
    "LCP": 45,
    "FID": 30,
    "CLS": 25,
    "FCP": 25,
    "TTFB": 15,
    "INP": 10
  },
  "recent": [
    {
      "name": "LCP",
      "value": 2341,
      "rating": "good",
      "timestamp": 1234567890
    }
  ]
}
```

---

## 🚨 Alerts Setup (Optional)

### Simple Alert Script
```javascript
// scripts/check-performance.js
const fetch = require('node-fetch');

async function checkPerformance() {
  const res = await fetch('http://localhost:5000/api/metrics');
  const data = await res.json();
  
  if (data.requests.avgDuration > 500) {
    console.error('⚠️  ALERT: Average response time too high!');
    console.error(`Current: ${data.requests.avgDuration}ms`);
  }
  
  if (data.errors.total > 10) {
    console.error('⚠️  ALERT: Too many errors!');
    console.error(`Total errors: ${data.errors.total}`);
  }
}

setInterval(checkPerformance, 60000); // Check every minute
```

---

## ✅ Summary

**To check performance:**

1. **Development**: Check browser console
2. **Backend**: `curl http://localhost:5000/api/metrics`
3. **Frontend**: `curl http://localhost:3000/api/analytics/vitals`
4. **Production**: Use Sentry dashboard
5. **Detailed**: Use Chrome DevTools Lighthouse

**Key Metrics:**
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- API response times
- Error rates

**Good Performance:**
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- API < 500ms
