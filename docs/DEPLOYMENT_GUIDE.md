# ==============================================================================
# Paytm Vyapar-Brain — Deployment Guide (Vercel + Render)
# ==============================================================================

This guide provides step-by-step instructions for deploying Paytm Vyapar-Brain:
- **Backend API**: Hosted on [Render](https://render.com) (FastAPI + Python 3.11 + Uvicorn)
- **Frontend App**: Hosted on [Vercel](https://vercel.com) (React 19 + Vite 8 + Tailwind CSS)

---

## Part 1: Deploy Backend to Render

### Option A: Using Blueprint (`render.yaml`) — Recommended
1. Sign up or log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Blueprint**.
3. Connect your GitHub repository: `https://github.com/Suryaaa81/Paytm_Vyapar`.
4. Render will automatically detect [`render.yaml`](../render.yaml) and configure:
   - **Service Name**: `vyapar-brain-api`
   - **Environment**: Python
   - **Root Directory**: `backend`
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check**: `/api/health`
5. Click **Apply**.
6. Once deployed, copy your Render service URL (e.g., `https://vyapar-brain-api.onrender.com`).

### Option B: Manual Web Service Setup
1. On Render Dashboard, click **New +** > **Web Service**.
2. Connect `Paytm_Vyapar` repository.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Under **Environment Variables**, add:
   - `ENVIRONMENT`: `production`
   - `SECRET_KEY`: *(Generate a secure random string of 32+ characters)*
   - `CORS_ORIGINS`: `*` (or your Vercel frontend URL, e.g., `https://paytm-vyapar.vercel.app`)
   - `SARVAM_ENABLED`: `false`
5. Click **Deploy Web Service**.

> **Note on Database**: By default, the application runs with SQLite (`vyapar_brain.db`) and automatically seeds demonstration data on startup. For production persistent relational storage across restarts, you can optionally provision a free PostgreSQL instance on Render and supply the `DATABASE_URL` environment variable.

---

## Part 2: Deploy Frontend to Vercel

1. Sign up or log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository: `https://github.com/Suryaaa81/Paytm_Vyapar`.
4. In the project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Under **Environment Variables**, add:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Render Backend URL (e.g., `https://vyapar-brain-api.onrender.com` without trailing slash)
6. Click **Deploy**.

> **SPA Routing Support**: The [`frontend/vercel.json`](../frontend/vercel.json) file contains the rewrite rule routing all paths to `/index.html`, ensuring client-side React routes (`/customer/home`, `/merchant/dashboard`, etc.) load without 404 errors.

---

## Part 3: Connect Frontend to Backend

1. Once your Vercel frontend URL is active (e.g., `https://paytm-vyapar.vercel.app`):
2. Go back to your **Render Service Settings** > **Environment Variables**.
3. Update `CORS_ORIGINS` to include your production frontend:
   ```env
   CORS_ORIGINS=https://paytm-vyapar.vercel.app,http://localhost:5173
   ```
4. Click **Save Changes** (Render will redeploy with tightened CORS headers).

---

## Part 4: Verification Checklist

- [ ] Backend health endpoint returns HTTP 200: `curl https://<your-render-url>/api/health`
- [ ] Backend OpenAPI docs are accessible: `https://<your-render-url>/docs`
- [ ] Frontend loads customer view: `https://<your-vercel-url>/customer/home`
- [ ] Merchant dashboard displays live data: `https://<your-vercel-url>/merchant/dashboard`
- [ ] API calls in browser Network tab route to Render URL with status 200
