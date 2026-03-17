# Frontend-Backend Connection Guide

This guide explains how to properly connect your frontend and backend in different scenarios.

## ⚡ Quick Fix (Local Development)

### 1. Start Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

You should see:
```
🚀  RecoAI backend running at http://localhost:5000
📡  CORS enabled for frontend at: http://localhost:5173
🔗  Test connection: curl http://localhost:5000/api/health
```

### 2. Start Frontend (in a new terminal)
```bash
npm run dev
```

Frontend should open at `http://localhost:5173`

### ✅ Verify Connection
Check browser console for:
```
🔗 API configured to: http://localhost:5000
```

If you see this, the connection is working! ✨

---

## 🛠️ Troubleshooting Connection Issues

### Error: "Cannot reach backend at http://localhost:5000"

**Solution 1: Backend not running**
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# If not, start it:
cd backend
python app.py
```

**Solution 2: Wrong API URL**
- Check `.env.local` in the root directory
- For local dev, it should be: `VITE_API_BASE_URL=http://localhost:5000`
- Restart frontend after changing

**Solution 3: Port conflict**
```bash
# Find what's using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or use a different port
PORT=5001 python backend/app.py
# Then update VITE_API_BASE_URL=http://localhost:5001
```

---

## 📍 Configuration for Different Environments

### Local Development (Default)
**.env.local** (root directory)
```
VITE_API_BASE_URL=http://localhost:5000
```

Backend runs on: `http://localhost:5000`  
Frontend runs on: `http://localhost:5173`

### GitHub Codespaces
**.env.local** (root directory)
```
# Find your Codespace URL in the address bar, example:
# https://ubiquitous-goldfish-xxxx-5000.app.github.dev

VITE_API_BASE_URL=https://ubiquitous-goldfish-xxxx-5000.app.github.dev
```

**Backend .env** (backend/.env)
```
FLASK_DEBUG=true
FRONTEND_URL=https://ubiquitous-goldfish-xxxx-5173.app.github.dev
PORT=5000
```

### Production
**.env.local**
```
VITE_API_BASE_URL=https://api.yoursite.com
```

**Backend .env**
```
FLASK_DEBUG=false
FRONTEND_URL=https://yoursite.com
PORT=5000
```

---

## 🔍 How the Connection Works

### 1. Frontend Startup
- Frontend reads `VITE_API_BASE_URL` from `.env.local`
- Logs: `🔗 API configured to: <URL>`
- Makes API calls to: `<URL>/api/...`

### 2. Backend Startup
- Backend reads `FRONTEND_URL` from environment
- Configures CORS to allow requests from:
  - `FRONTEND_URL` (e.g., http://localhost:5173)
  - All common localhost ports (5173, 5174, 3000)
  - Codespace URLs if detected

### 3. API Request
```
Frontend → Browser → Fetch Request → Backend
           (includes CORS headers)              ↓
Backend ← Browser ← CORS Check ← Allowed?
```

---

## 📱 Testing the Connection

### Test Backend Health
```bash
# Should return: {"status": "ok", "version": "1.0.0"}
curl http://localhost:5000/api/health
```

### Test CORS
```bash
# Should work if CORS is enabled
curl -X GET http://localhost:5000/api/stores/
```

### Test from Frontend Console
```javascript
// Run in browser console
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Connected!', d))
  .catch(e => console.error('❌ Error:', e))
```

---

## 🚀 Common Scenarios

### Scenario 1: API Errors After Starting

**Problem**: Backend returns CORS error  
**Solution**: 
1. Check `.env.local` has correct URL
2. Restart backend with correct `FRONTEND_URL`
3. Reload frontend

### Scenario 2: "Network Error" in Frontend

**Problem**: Frontend can't reach backend  
**Solution**:
1. Make sure backend is running: `python backend/app.py`
2. Check frontend .env.local: `VITE_API_BASE_URL=http://localhost:5000`
3. Check browser console for detailed error
4. Try: `curl http://localhost:5000/api/health`

### Scenario 3: Works on Localhost, Fails on Codespaces

**Problem**: Different URLs needed  
**Solution**:
1. Get Codespace URL from browser address bar
2. Update `.env.local`: `VITE_API_BASE_URL=https://ubiquitous-goldfish-xxxx-5000.app.github.dev`
3. Create `backend/.env` with matching frontend URL
4. Restart both frontend and backend

### Scenario 4: Ports Already in Use

**Problem**: "Address already in use"  
**Solution**:
```bash
# Use different port
PORT=5001 python backend/app.py

# Update frontend
VITE_API_BASE_URL=http://localhost:5001
```

---

## 📊 Environment Variables Reference

### Frontend (.env.local)
| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:5000` |

### Backend (backend/.env)
| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Backend port | `5000` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `FLASK_DEBUG` | Debug mode | `true` |
| `DATABASE_URL` | Database connection | `sqlite:///recoai.db` |

---

## 🔐 Security Notes

### Local Development (Safe)
- localhost connections are secure by default
- No credentials needed
- Debug mode is OK

### Codespaces (Use HTTPS)
- Always use `https://` for Codespace URLs
- CORS is properly configured
- No special setup needed

### Production (Important!)
- Use `https://` for all URLs
- Set `FLASK_DEBUG=false`
- Use strong `SECRET_KEY`
- Set production database URL
- Whitelist specific frontend domain only

---

## ✅ Checklist: Getting Connected

- [ ] Backend running: `python backend/app.py`
- [ ] Backend shows: "RecoAI backend running at http://localhost:5000"
- [ ] Frontend running: `npm run dev`
- [ ] Frontend shows: "🔗 API configured to: http://localhost:5000"
- [ ] `.env.local` has correct `VITE_API_BASE_URL`
- [ ] Test: `curl http://localhost:5000/api/health` returns success
- [ ] Test: Frontend console shows no connection errors
- [ ] Can see data loading in frontend

---

## 🆘 Still Having Issues?

### Check Backend Startup
```bash
cd backend
python app.py

# Should see:
# 🚀  RecoAI backend running at http://localhost:5000
# 📡  CORS enabled for frontend at: http://localhost:5173
# 🔗  Test connection: curl http://localhost:5000/api/health
```

### Check Frontend Configuration
1. Open `.env.local` in root directory
2. Verify: `VITE_API_BASE_URL=http://localhost:5000`
3. Check browser console (F12) for connection info

### Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for messages starting with 🔗 or ❌
4. Check Network tab for failed requests

### Manual API Test
```bash
# Replace localhost:5000 with your backend URL
curl -X GET http://localhost:5000/api/health

# Should return:
# {"status":"ok","version":"1.0.0"}
```

---

## 📚 Related Files

- Backend config: `backend/config.py`
- Frontend API client: `src/lib/api.js`
- CORS setup: `backend/app.py` (lines 28-46)
- Frontend env: `.env.local`
- Backend env: `backend/.env`

---

**Version**: 1.0  
**Last Updated**: March 17, 2026
