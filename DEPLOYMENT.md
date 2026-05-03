# 🚀 Railway Deployment Guide

This guide walks you through deploying the Team Task Manager to Railway.

## Prerequisites

- GitHub account with your project repository
- Railway account (free tier available at [railway.app](https://railway.app))
- MongoDB Atlas account (for cloud MongoDB)

## Step 1: Prepare Your Project

### 1.1 Create a GitHub Repository

If you haven't already:

```bash
git init
git add .
git commit -m "Initial commit: Team Task Manager"
git remote add origin https://github.com/YOUR_USERNAME/team-task-manager.git
git push -u origin main
```

### 1.2 Configure Environment Files

Ensure your `.env` files are **NOT** committed (they should be in `.gitignore`):

```bash
# Check .gitignore includes:
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Update gitignore"
```

## Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 Free Tier)
4. Create a database user with a strong password
5. Get your connection string: `mongodb+srv://user:password@cluster.mongodb.net/mydata?...`
6. Save this for later

## Step 3: Deploy Backend on Railway

### 3.1 Create Backend Project

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Select "Backend" or confirm the service detection

### 3.2 Add Environment Variables

In Railway Project Dashboard → Variables:

```
PORT=8080
NODE_ENV=production
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/team-task-manager?retryWrites=true&w=majority
JWT_SECRET=generate_a_random_32_char_string_here_abc123def456
JWT_EXPIRES_IN=7d
CLIENT_URL=https://YOUR_FRONTEND_URL.railway.app
```

**Important:** 
- Generate a strong `JWT_SECRET` (use a password generator or `openssl rand -hex 16`)
- Replace `MONGO_URI` with your actual MongoDB connection string
- Update `CLIENT_URL` after frontend deployment

### 3.3 Railway Configuration

Railway auto-detects Node.js and runs:
- Build: `npm install`
- Start: `npm start`

This should work out of the box. If not, create `railway.json`:

```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "always"
  }
}
```

### 3.4 Get Backend URL

After deployment, Railway gives you a URL like:
```
https://team-task-manager-backend.railway.app
```

Copy this URL for the frontend configuration.

## Step 4: Deploy Frontend on Railway

### 4.1 Create Frontend Project

1. In Railway, click "New Project" (or in your main project, add service)
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Specify the working directory: `frontend`

### 4.2 Add Environment Variables

In Railway Variables for Frontend:

```
VITE_API_URL=https://team-task-manager-backend.railway.app/api
```

Replace the backend URL with your actual deployed backend URL from Step 3.4

### 4.3 Build Configuration

Railway auto-detects Vite and runs:
- Build: `cd frontend && npm install && npm run build`
- Start: `npm run preview`

The frontend will be available at Railway's assigned URL.

## Step 5: Update Backend Client URL

Now that you have your frontend URL, update the backend:

1. Go to Backend Project → Variables
2. Update `CLIENT_URL` to your frontend Railway URL
3. Redeploy by pushing a commit to main

## Step 6: Test the Deployment

1. Open your frontend URL in a browser
2. Try signing up with a test account
3. Create a project and task
4. Verify everything works end-to-end

## Troubleshooting

### Backend won't start
- Check logs in Railway dashboard
- Ensure `npm start` works locally: `npm start`
- Verify all environment variables are set

### Frontend shows blank page
- Check browser console for errors (F12)
- Verify `VITE_API_URL` points to correct backend
- Redeploy frontend after updating variables

### API calls fail (CORS error)
- Ensure `CLIENT_URL` in backend matches frontend URL
- Check backend logs for CORS errors
- Redeploy backend after updating `CLIENT_URL`

### MongoDB connection fails
- Verify `MONGO_URI` is correct
- Ensure your IP is whitelisted in MongoDB Atlas (or use "Allow access from anywhere")
- Test connection string locally first

## Environment Variables Reference

### Backend

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Server port (Railway sets this) | 8080 |
| `MONGO_URI` | MongoDB connection | `mongodb+srv://user:pass@...` |
| `JWT_SECRET` | JWT signing key | `abc123...` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `CLIENT_URL` | Frontend URL for CORS | `https://frontend.railway.app` |

### Frontend

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_URL` | Backend API URL | `https://backend.railway.app/api` |

## Scaling & Limits

Railway Free Tier includes:
- 5GB memory
- Suitable for small projects
- Can upgrade to paid plans for more resources

## Monitoring

In Railway Dashboard:
- **Logs**: Check real-time logs for errors
- **Metrics**: CPU, memory, network usage
- **Deployments**: View deployment history and rollback if needed

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add custom domain: `yourdomain.com`
3. Configure DNS records as instructed
4. SSL certificate auto-installed

## Security Best Practices

- ✅ Never commit `.env` files
- ✅ Use strong JWT_SECRET (32+ random characters)
- ✅ Enable CORS only for your frontend domain
- ✅ Use MongoDB password with special characters
- ✅ Enable MongoDB IP whitelist or use "Allow access from anywhere" cautiously
- ✅ Regularly rotate JWT_SECRET

## Need Help?

- Check Railway docs: https://docs.railway.app
- Check MongoDB docs: https://docs.mongodb.com
- Create an issue on GitHub for project-specific problems

---

**Last Updated:** May 2026
