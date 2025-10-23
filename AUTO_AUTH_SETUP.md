# Automatic Authentication Setup Guide

This guide explains the automatic authentication system for the Motor.com M1 proxy server.

## 🎯 Overview

The proxy server now handles authentication **automatically** using a configured library card. No manual authentication or token management required!

**Library Card:** `1001600244772`

## 🚀 Quick Setup

### Option 1: Set Password in Environment Variable (Recommended)

1. Navigate to the proxy server directory:
   ```bash
   cd proxy-server
   ```

2. Set the password environment variable and start:
   ```bash
   EBSCO_PASSWORD="your_password_here" npm start
   ```

### Option 2: Create .env File

1. Create a `.env` file in the `proxy-server` directory:
   ```bash
   cd proxy-server
   touch .env
   ```

2. Add your password to the `.env` file:
   ```env
   EBSCO_CARD_NUMBER=1001600244772
   EBSCO_PASSWORD=your_password_here
   ```

3. Start the proxy server:
   ```bash
   npm start
   ```

### Option 3: Hardcode Password (Development Only)

1. Edit `proxy-server/index.js`
2. Find the `AUTO_AUTH_CONFIG` section (around line 16)
3. Set the password:
   ```javascript
   const AUTO_AUTH_CONFIG = {
     enabled: true,
     cardNumber: process.env.EBSCO_CARD_NUMBER || '1001600244772',
     password: process.env.EBSCO_PASSWORD || 'YOUR_PASSWORD_HERE',
   };
   ```

⚠️ **Warning:** Never commit passwords to git!

## 📋 How It Works

### Server-Side Session Management

```
┌─────────────────────────────────────────────────────────────┐
│                    Proxy Server (Port 3001)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. On Startup:                                              │
│     ✅ Automatically authenticates with EBSCO                │
│     ✅ Stores session token in memory                        │
│                                                               │
│  2. On Each Request:                                         │
│     ✅ Checks if session is still valid                      │
│     ✅ Auto-refreshes if expired                             │
│     ✅ Adds auth cookies to proxied requests                 │
│                                                               │
│  3. Frontend (Angular):                                      │
│     ✅ No authentication code needed!                        │
│     ✅ Just make API calls normally                          │
│     ✅ Proxy handles everything automatically                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
Server Startup
      │
      ▼
  Authenticate with EBSCO
  (Card: 1001600244772)
      │
      ▼
  Store Session Token
  (Expires in 25 min)
      │
      ▼
  ┌──────────────────┐
  │  Ready to Proxy  │◄──── All frontend requests authenticated
  └──────────────────┘
      │
      ▼
  Session Expires?
      │
      ▼
  Auto Re-authenticate
```

## 🔧 Installation

### First Time Setup

```bash
# 1. Install proxy server dependencies
cd proxy-server
npm install

# 2. Set your password (choose one method above)
export EBSCO_PASSWORD="your_password_here"

# 3. Start the proxy server
npm start

# 4. In a new terminal, start the Angular app
cd ..
npm start
```

### Startup Messages

When configured correctly, you'll see:

```
======================================================================
🚀 Motor.com M1 Proxy Server
======================================================================

📡 Server running on: http://localhost:3001

🔐 Authentication Mode: AUTOMATIC
   Card Number: 1001600244772
   Password: ***SET***

🔄 Initializing automatic authentication...

🔐 Performing automatic EBSCO authentication...
   Card Number: 1001600244772
   Step 1: Getting login page...
   Step 2: Submitting card number...
   Step 3: Submitting password...
✅ Auto-authentication successful!
   Session expires at: 2:45:00 PM

📡 Available endpoints:
   Motor.com Proxy: *    http://localhost:3001/api/motor-proxy/*
   EBSCO Proxy:     *    http://localhost:3001/api/ebsco-proxy/*
   Manual Auth:     POST http://localhost:3001/api/auth/ebsco
   Health Check:    GET  http://localhost:3001/health

✅ Frontend requests will be automatically authenticated!
   No need to pass X-Auth-Token headers.

======================================================================
```

### Password Not Set Warning

If password is missing:

```
🔐 Authentication Mode: AUTOMATIC
   Card Number: 1001600244772
   Password: ⚠️  NOT SET!

⚠️  WARNING: Password not configured!
   Set EBSCO_PASSWORD environment variable or update index.js
```

## 🧪 Testing

### 1. Check Server Health

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "autoAuth": true,
  "session": "authenticated",
  "expiresInMinutes": 24
}
```

### 2. Test Motor.com API Proxy

```bash
curl http://localhost:3001/api/motor-proxy/api/years
```

Should return a list of years without needing any auth headers!

### 3. Test from Angular App

1. Start the proxy server: `cd proxy-server && npm start`
2. Start Angular: `npm start`
3. Open http://localhost:4200
4. Navigate to vehicle selection
5. Year/Make/Model dropdowns should load automatically!

## 📁 Frontend Integration

The Angular app is already configured to use the proxy automatically!

### Interceptor Configuration

The `ProxyAuthInterceptor` in `src/app/core/proxy-auth.interceptor.ts`:
- Routes all API requests through the proxy
- No manual token management needed
- Works transparently in the background

### Example API Call

In your Angular service:

```typescript
// Just make the API call normally!
this.http.get('/api/years').subscribe(years => {
  console.log('Years:', years);
  // Proxy automatically adds authentication
});
```

## 🔄 Session Management

### Automatic Refresh

- Sessions last **25 minutes** (EBSCO default is 30, we refresh early)
- The proxy automatically re-authenticates when the session expires
- No downtime or manual intervention required

### Monitoring Session Status

```bash
# Check current session status
curl http://localhost:3001/health
```

Response includes:
- `session`: "authenticated" or "not authenticated"
- `expiresInMinutes`: Time until session expires

## 📝 Development Workflow

### Standard Workflow

```bash
# Terminal 1: Start proxy with auto-auth
cd proxy-server
EBSCO_PASSWORD="your_password" npm start

# Terminal 2: Start Angular app
cd ..
npm start

# That's it! Everything is automatically authenticated.
```

### Using the Helper Script

A convenience script is included:

```bash
./start-dev.sh
```

This will:
- Start the proxy server in the background
- Start the Angular development server
- Handle cleanup on exit (Ctrl+C)

## 🔐 Security Notes

### Best Practices

1. **Never commit passwords**
   - Use environment variables or .env files
   - Add `.env` to `.gitignore` (already configured)

2. **Local Development Only**
   - This setup is for local development
   - For production, use proper authentication flows

3. **Shared Credentials**
   - The card `1001600244772` is shared for development
   - All team members route through the same proxy
   - Each developer needs their own password

### Environment Variables Priority

The proxy checks for passwords in this order:

1. `EBSCO_PASSWORD` environment variable (highest priority)
2. `.env` file in `proxy-server/` directory
3. Hardcoded value in `index.js` (lowest priority)

## 🐛 Troubleshooting

### "Password not set" error

**Solution:** Set the password using one of the three methods above

### "Authentication failed" in logs

**Causes:**
- Wrong password
- EBSCO service down
- Network issues

**Solution:**
- Verify password is correct
- Check EBSCO service status
- Check internet connection

### Frontend gets 401 errors

**Check:**
1. Is proxy server running? `curl http://localhost:3001/health`
2. Is session authenticated? Check the health response
3. Are proxy server logs showing errors?

**Solution:**
```bash
# Restart proxy server
cd proxy-server
npm start
```

### Port 3001 already in use

**Solution:**
```bash
# Find and kill the process
lsof -i :3001
kill -9 <PID>

# Or use a different port
PORT=3002 npm start
```

### Session keeps expiring

**Cause:** EBSCO sessions last 25 minutes by default

**Solution:** This is normal! The proxy automatically re-authenticates. Check logs for:
```
🔄 Session expired or not found, re-authenticating...
```

## 📚 API Reference

### Proxy Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/motor-proxy/*` | ALL | Motor.com M1 API | Automatic |
| `/api/ebsco-proxy/*` | ALL | EBSCO resources | Automatic |
| `/api/auth/ebsco` | POST | Manual authentication | No |
| `/health` | GET | Health check | No |

### Manual Authentication (Optional)

You can still authenticate manually if needed:

```bash
curl -X POST http://localhost:3001/api/auth/ebsco \
  -H "Content-Type: application/json" \
  -d '{
    "cardNumber": "your_card",
    "password": "your_password"
  }'
```

But with automatic authentication enabled, this is not necessary!

## ⚙️ Configuration Reference

### AUTO_AUTH_CONFIG Options

In `proxy-server/index.js`:

```javascript
const AUTO_AUTH_CONFIG = {
  // Enable/disable automatic authentication
  enabled: true,
  
  // Library card number
  cardNumber: process.env.EBSCO_CARD_NUMBER || '1001600244772',
  
  // Password (from env var or hardcoded)
  password: process.env.EBSCO_PASSWORD || '',
};
```

### Environment Variables

- `EBSCO_CARD_NUMBER`: Library card number (default: 1001600244772)
- `EBSCO_PASSWORD`: Password for the library card (required)
- `PORT`: Proxy server port (default: 3001)

## 🎉 Benefits of Automatic Authentication

✅ **No Manual Token Management**
   - Frontend doesn't need to handle auth tokens
   - No localStorage/sessionStorage token management

✅ **Automatic Session Refresh**
   - Sessions refresh automatically before expiring
   - No interrupted workflows

✅ **Simplified Development**
   - Start proxy, start app, done!
   - No authentication UI needed

✅ **Consistent Authentication**
   - All developers use the same card
   - Consistent behavior across team

✅ **Security**
   - Credentials never exposed to frontend
   - Password stored server-side only

## 📞 Support

If you encounter issues:

1. Check proxy server logs for detailed error messages
2. Verify password is set correctly
3. Test health endpoint: `curl http://localhost:3001/health`
4. Check that port 3001 is available
5. Restart both proxy and Angular if needed

---

**Last Updated:** October 23, 2025  
**Card Number:** 1001600244772  
**Proxy Port:** 3001

