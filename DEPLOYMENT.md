# Deployment Guide

## Frontend (Vercel)

### 1. Prepare Repository
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3. Environment Variables (Vercel Dashboard)
**IMPORTANT:** After deploying your backend to Render (Step 1 of Backend section below), come back here and update this variable.

Add these in Vercel's project settings under "Environment Variables":

**Required - Update after backend deployment:**
```
VITE_API_URL=https://your-backend-name.onrender.com
```
Replace `your-backend-name` with your actual Render service name.

**Optional - Firebase (if using authentication):**
```
VITE_FIREBASE_API_KEY=AIzaSyCZSdDPxnBgjjgj8pfdr-yfBAkq0964l38
VITE_FIREBASE_AUTH_DOMAIN=todo-62330.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=todo-62330
VITE_FIREBASE_STORAGE_BUCKET=todo-62330.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=670803768931
VITE_FIREBASE_APP_ID=1:670803768931:web:d5a8d0ef71b46b853eaa56
VITE_FIREBASE_MEASUREMENT_ID=G-8KP1L97W4Z
```

**After adding environment variables:**
- Click "Redeploy" in Vercel to apply the changes

---

## Backend (Render)

### 1. Deploy to Render
1. Go to [Render](https://render.com)
2. Click "New" → "Web Service"
3. Connect your repository
4. Configure:
   - **Name**: `checkit-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### 2. Environment Variables (Render Dashboard)
⚠️ **CRITICAL**: Add these in Render's "Environment" tab BEFORE deploying:

```
NODE_ENV=production
PORT=3000
GOOGLE_API_KEY=your_google_gemini_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
MONGODB_URI=your_mongodb_atlas_connection_string
```

**Where to get these values:**
- Copy `GOOGLE_API_KEY` and `TAVILY_API_KEY` from your local `backend/.env`
- Get `MONGODB_URI` from MongoDB Atlas (or use your existing connection string)

### 3. Deploy and Copy URL
1. Click "Create Web Service"
2. Wait for deployment to complete
3. **Copy your Render URL** (e.g., `https://checkit-backend.onrender.com`)
4. Test the health endpoint: `https://your-url.onrender.com/health`

### 4. Update Frontend
Go back to Vercel (Frontend section, step 3) and update `VITE_API_URL` with your Render backend URL.

---

## CORS Configuration

The backend already has CORS enabled (`cors()` middleware in `index.js`), so it will accept requests from your Vercel frontend.

---

## Testing Production
1. Visit your Vercel URL
2. Try a fact-check query
3. Check browser console for any errors
4. Verify DAO voting works

---

## Quick Deployment Checklist

### First Time Setup:
- [ ] Push code to GitHub
- [ ] Deploy backend to Render
- [ ] Add environment variables in Render dashboard
- [ ] Copy Render backend URL
- [ ] Deploy frontend to Vercel
- [ ] Add `VITE_API_URL` in Vercel dashboard (use Render URL)
- [ ] Redeploy frontend in Vercel

### Updating Code:
1. Push changes to GitHub
2. Render and Vercel will auto-deploy
3. If you changed environment variables, update them in dashboards and redeploy

---

## Environment Variables Quick Reference

**Frontend (Vercel):**
```env
VITE_API_URL=https://your-backend.onrender.com
```

**Backend (Render):**
```env
NODE_ENV=production
PORT=3000
GOOGLE_API_KEY=<your-key>
TAVILY_API_KEY=<your-key>
MONGODB_URI=<your-mongodb-uri>
```
