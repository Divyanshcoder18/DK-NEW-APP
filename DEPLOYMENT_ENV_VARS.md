# Environment Variables for Render Deployment

## 🔧 Backend Environment Variables (Render Web Service)

Add these in Render Dashboard → Your Backend Service → Environment tab:

```env
# Server Configuration
PORT=10000
NODE_ENV=production

# Database
MONGO_DB_URI=<your-mongodb-connection-string>

# Authentication
JWT_SECRET_KEY=<your-secret-key>

# Agora (for voice/video calls)
AGORA_APP_ID=<your-agora-app-id>
AGORA_APP_CERTIFICATE=<your-agora-certificate>

# Frontend URL (add after frontend deployment)
FRONTEND_URL=<your-frontend-render-url>

# Optional: Redis (if you're using Redis)
REDIS_URL=<your-redis-url>
```

---

## 🎨 Frontend Environment Variables (Render Static Site)

Add these in Render Dashboard → Your Frontend Static Site → Environment tab:

```env
# Backend API URL
VITE_BACKEND_URL=<your-backend-render-url>
```

---

## 📝 Where to Get These Values

### MONGO_DB_URI
- From MongoDB Atlas dashboard
- Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`
- [Get it from MongoDB Atlas](https://cloud.mongodb.com/)

### JWT_SECRET_KEY
- Any random string (keep it secret!)
- You can generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### AGORA Credentials
- From your Agora.io dashboard
- [Get it from Agora Console](https://console.agora.io/)

### FRONTEND_URL
- Get this AFTER deploying frontend
- Example: `https://chat-app-frontend-yyyy.onrender.com`

### VITE_BACKEND_URL
- Get this AFTER deploying backend
- Example: `https://chat-app-backend-xxxx.onrender.com`

---

## ⚠️ Important Notes

1. **Never commit `.env` files to GitHub** - they contain secrets!
2. **Add environment variables directly in Render dashboard**
3. **Restart services** after adding/updating environment variables
4. **Frontend must be deployed with `VITE_BACKEND_URL`** - it's baked into the build
