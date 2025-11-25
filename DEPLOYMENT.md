# Deployment Guide - Static Hosting (No Server Required)

## Option 1: Vercel (Recommended - Easiest)

### Steps:
1. **Sign up at [vercel.com](https://vercel.com)** (free)
2. **Connect your GitHub repository**
3. **Configure project:**
   - Root Directory: `frontend`
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. **Add Environment Variables:**
   - `NEXT_PUBLIC_API_URL` = Your backend API URL (see Backend Hosting below)

### Your website will be live at: `https://your-project.vercel.app`

---

## Option 2: Netlify

### Steps:
1. **Sign up at [netlify.com](https://netlify.com)** (free)
2. **Connect your GitHub repository**
3. **Build settings:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/.next`
4. **Add Environment Variables:**
   - `NEXT_PUBLIC_API_URL` = Your backend API URL

### Your website will be live at: `https://your-project.netlify.app`

---

## Option 3: GitHub Pages (Static Export)

If you want pure static hosting, you need to export Next.js as static files:

1. **Update `next.config.js`** to enable static export
2. **Build and export:**
   ```bash
   cd frontend
   npm run build
   npm run export
   ```
3. **Deploy the `out` folder to GitHub Pages**

---

## Backend Hosting (Required for API)

Your backend needs to be hosted separately. Options:

### Option A: Railway (Easiest)
1. Sign up at [railway.app](https://railway.app) (free tier available)
2. Connect GitHub repo
3. Select `backend` folder
4. Add MongoDB (Railway provides MongoDB addon)
5. Your backend will be at: `https://your-backend.railway.app`

### Option B: Render
1. Sign up at [render.com](https://render.com) (free tier)
2. Create new Web Service
3. Connect GitHub, select `backend` folder
4. Add MongoDB database
5. Your backend will be at: `https://your-backend.onrender.com`

### Option C: Heroku
1. Sign up at [heroku.com](https://heroku.com)
2. Create new app
3. Connect GitHub, deploy `backend` folder
4. Add MongoDB Atlas (free)

---

## Quick Start with Vercel + Railway

1. **Deploy Backend to Railway:**
   - Go to railway.app
   - New Project → Deploy from GitHub
   - Select your repo, choose `backend` folder
   - Add MongoDB service
   - Copy the backend URL (e.g., `https://solidex-backend.railway.app`)

2. **Deploy Frontend to Vercel:**
   - Go to vercel.com
   - Import your GitHub repo
   - Set Root Directory to `frontend`
   - Add Environment Variable:
     - `NEXT_PUBLIC_API_URL` = `https://solidex-backend.railway.app/api`
   - Deploy!

3. **Your website is live!** 🎉

---

## Environment Variables Needed

### Frontend (.env.local or Vercel/Netlify settings):
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
```

### Backend (.env or Railway/Render settings):
```
MONGODB_URI=mongodb://your-mongodb-connection-string
PORT=5000
```

---

## Notes:
- **Vercel** is best for Next.js (made by Next.js creators)
- **Railway** is easiest for Node.js backends
- Both have free tiers that are perfect for getting started
- Your site will have a public URL that anyone can access!

