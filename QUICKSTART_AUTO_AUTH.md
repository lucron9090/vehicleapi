# 🚀 Quick Start with Automatic Authentication

Get the Motor.com M1 Angular app running in **under 2 minutes** with automatic authentication!

## ⚡ Super Quick Start

```bash
# 1. Set your password and start everything
EBSCO_PASSWORD="your_password_here" ./start-dev.sh

# 2. Open browser to http://localhost:4200

# 3. That's it! 🎉
```

---

## 📋 Prerequisites

- Node.js v14 or higher
- npm
- Library card password for card `1001600244772`

---

## 🎯 Step-by-Step Setup

### Method 1: Environment Variable (Quickest)

```bash
# Start both servers with automatic authentication
EBSCO_PASSWORD="your_password_here" ./start-dev.sh
```

### Method 2: Create .env File (One-time setup)

```bash
# Create .env file in proxy-server directory
cd proxy-server
echo "EBSCO_PASSWORD=your_password_here" > .env
cd ..

# Start both servers
./start-dev.sh
```

### Method 3: Manual (Two terminals)

**Terminal 1 - Proxy Server:**
```bash
cd proxy-server
npm install  # First time only
EBSCO_PASSWORD="your_password_here" npm start
```

**Terminal 2 - Angular App:**
```bash
npm install  # First time only
npm start
```

---

## ✅ What You'll See

### Proxy Server Startup (Successful)

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

### If Password Not Set

```
🔐 Authentication Mode: AUTOMATIC
   Card Number: 1001600244772
   Password: ⚠️  NOT SET!

⚠️  WARNING: Password not configured!
   Set EBSCO_PASSWORD environment variable or update index.js
```

**Fix:** Set the `EBSCO_PASSWORD` environment variable and restart.

---

## 🧪 Quick Test

### 1. Check Proxy Health

```bash
curl http://localhost:3001/health
```

**Expected:**
```json
{
  "status": "ok",
  "autoAuth": true,
  "session": "authenticated",
  "expiresInMinutes": 24
}
```

### 2. Test API Request

```bash
curl http://localhost:3001/api/motor-proxy/api/years
```

Should return a JSON array of years without any authentication headers!

### 3. Use the App

1. Open http://localhost:4200 in your browser
2. Navigate to vehicle selection
3. Year/Make/Model dropdowns load automatically
4. No authentication prompts or token management needed!

---

## 🔧 Configuration

### Library Card

The proxy is pre-configured to use:
- **Card Number:** `1001600244772`
- **Password:** Set via `EBSCO_PASSWORD` environment variable

### Ports

- **Proxy Server:** http://localhost:3001
- **Angular App:** http://localhost:4200

To change ports:
```bash
# Proxy port
PORT=3002 EBSCO_PASSWORD="..." npm start

# Angular port (edit package.json "start" script)
```

---

## 🔐 How Automatic Authentication Works

```
┌──────────────────────────────────────────────────────────┐
│                     You Start Proxy                       │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Proxy Authenticates with     │
        │  EBSCO Using Card 1001...     │
        └───────────┬───────────────────┘
                    │
                    ▼
        ┌───────────────────────────────┐
        │  Session Token Stored         │
        │  Server-Side (25 min)         │
        └───────────┬───────────────────┘
                    │
                    ▼
        ┌───────────────────────────────┐
        │  Angular App Starts           │
        │  (No auth needed!)            │
        └───────────┬───────────────────┘
                    │
                    ▼
        ┌───────────────────────────────┐
        │  User Makes API Request       │
        │  (through interceptor)        │
        └───────────┬───────────────────┘
                    │
                    ▼
        ┌───────────────────────────────┐
        │  Proxy Adds Auth Cookies      │
        │  Automatically                │
        └───────────┬───────────────────┘
                    │
                    ▼
        ┌───────────────────────────────┐
        │  Motor.com API Responds       │
        │  (Authenticated!)             │
        └───────────────────────────────┘
```

### Key Benefits

✅ **No Frontend Auth Code** - Zero authentication logic in Angular  
✅ **No Token Management** - No localStorage/sessionStorage needed  
✅ **Auto Session Refresh** - Sessions auto-renew before expiry  
✅ **Shared Credentials** - Whole team uses same card  
✅ **Secure** - Password never leaves proxy server  

---

## 🐛 Troubleshooting

### Problem: "Password not set" warning

**Solution:**
```bash
EBSCO_PASSWORD="your_password" ./start-dev.sh
```

Or create `.env` file in `proxy-server/`:
```env
EBSCO_PASSWORD=your_password_here
```

---

### Problem: Port 3001 already in use

**Solution:**
```bash
# Find and kill the process
lsof -i :3001
kill -9 <PID>

# Or use a different port
PORT=3002 EBSCO_PASSWORD="..." npm start
```

---

### Problem: Authentication fails with correct password

**Possible Causes:**
1. EBSCO service is down
2. Network issues
3. Card credentials changed

**Solution:**
1. Check proxy server logs: `tail -f /tmp/proxy-server.log`
2. Test EBSCO service availability
3. Verify card credentials with library

---

### Problem: Frontend gets CORS errors

**Solution:**
- Ensure proxy server is running on port 3001
- Check that Angular is using the interceptor
- Verify requests are going through proxy (check browser DevTools Network tab)

---

### Problem: "Cannot connect to proxy"

**Solution:**
```bash
# Check proxy is running
curl http://localhost:3001/health

# If not, restart proxy
cd proxy-server
EBSCO_PASSWORD="..." npm start
```

---

## 📁 Project Structure

```
vehicleapi/
├── proxy-server/          # Proxy with auto-auth
│   ├── index.js           # Main proxy code
│   ├── package.json       # Proxy dependencies
│   └── .env               # Your password (create this)
├── src/
│   └── app/
│       └── core/
│           └── proxy-auth.interceptor.ts  # Routes requests through proxy
├── start-dev.sh           # Convenience startup script
├── QUICKSTART_AUTO_AUTH.md  # This file
└── AUTO_AUTH_SETUP.md     # Detailed authentication docs
```

---

## 📚 Additional Documentation

- **Detailed Setup:** See [AUTO_AUTH_SETUP.md](./AUTO_AUTH_SETUP.md)
- **Proxy Integration:** See [PROXY_INTEGRATION.md](./PROXY_INTEGRATION.md)
- **Proxy Server Docs:** See [proxy-server/README.md](./proxy-server/README.md)

---

## 🎉 Success Checklist

- [ ] Proxy server starts successfully
- [ ] See "✅ Auto-authentication successful!" in proxy logs
- [ ] Health check shows `"session": "authenticated"`
- [ ] Angular app loads at http://localhost:4200
- [ ] Year/Make/Model dropdowns populate
- [ ] No authentication errors in browser console

---

## 💡 Pro Tips

### Tip 1: Check Session Status Anytime

```bash
curl http://localhost:3001/health | jq
```

### Tip 2: Monitor Proxy Logs

```bash
tail -f /tmp/proxy-server.log
```

### Tip 3: Use .env for Convenience

Create `proxy-server/.env` once, never type password again:
```env
EBSCO_PASSWORD=your_password_here
```

### Tip 4: One Command Development

```bash
# Create this alias in ~/.bashrc or ~/.zshrc
alias motor-dev='EBSCO_PASSWORD="..." ./start-dev.sh'

# Then just run:
motor-dev
```

---

## 🔄 Daily Workflow

### Starting Your Day

```bash
# In project directory
EBSCO_PASSWORD="your_password" ./start-dev.sh

# Open http://localhost:4200
# Start coding! 🎉
```

### During Development

- Proxy session auto-refreshes every 25 minutes
- No need to re-authenticate manually
- Just code and test normally

### Ending Your Day

```bash
# Press CTRL+C in the terminal running start-dev.sh
# Both servers stop automatically
```

---

## 🆘 Need Help?

1. **Check the logs:**
   - Proxy: `tail -f /tmp/proxy-server.log`
   - Angular: `tail -f /tmp/angular-dev.log`

2. **Test connectivity:**
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:4200
   ```

3. **Restart everything:**
   ```bash
   # Kill everything
   pkill -f "node.*proxy-server"
   pkill -f "ng serve"
   
   # Start again
   EBSCO_PASSWORD="..." ./start-dev.sh
   ```

---

**Last Updated:** October 23, 2025  
**Card:** 1001600244772  
**Proxy:** http://localhost:3001  
**App:** http://localhost:4200

