# Quick Start Guide

The fastest way to get the Motor.com M1 Angular app running with authentication.

## Option 1: Automated Script (Recommended)

```bash
# Make script executable (first time only)
chmod +x start-dev.sh

# Start both servers
./start-dev.sh
```

Then follow the on-screen instructions to authenticate.

## Option 2: Manual Setup

### Terminal 1: Proxy Server

```bash
cd proxy-server
npm start
```

### Terminal 2: Angular App

```bash
npm start
```

### Terminal 3: Authenticate

```bash
curl -X POST http://localhost:3001/api/auth/ebsco \
  -H "Content-Type: application/json" \
  -d '{"cardNumber":"YOUR_CARD_NUMBER","password":"YOUR_PASSWORD"}'
```

### Browser: Store Token

1. Open http://localhost:4200
2. Open Developer Console (F12)
3. Run:
   ```javascript
   sessionStorage.setItem('motor-auth-token', 'PASTE_TOKEN_HERE');
   ```
4. Refresh the page

## Verification

### Check Proxy Server

```bash
curl http://localhost:3001/health
# Should return: {"status":"ok"}
```

### Check Angular App

Open http://localhost:4200 - you should see the vehicle selection page.

### Check Authentication

In browser console:
```javascript
sessionStorage.getItem('motor-auth-token');
// Should return your token
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3001 in use | `lsof -i :3001` then `kill -9 <PID>` |
| Port 4200 in use | `lsof -i :4200` then `kill -9 <PID>` |
| 401 Unauthorized | Re-authenticate with EBSCO |
| Token missing | Store token in sessionStorage again |
| Proxy not responding | Restart proxy server |

## Server URLs

- **Proxy Server**: http://localhost:3001
- **Angular App**: http://localhost:4200
- **Proxy Health**: http://localhost:3001/health

## Common Commands

```bash
# View proxy logs
tail -f /tmp/proxy-server.log

# View Angular logs
tail -f /tmp/angular-dev.log

# Stop all
# Press CTRL+C in the terminal running start-dev.sh
# Or kill manually:
pkill -f "node.*cruis-api"
pkill -f "ng serve"
```

## Authentication Token

Your EBSCO authentication token contains the credentials for Motor.com M1 API.

**Storage locations:**
- `sessionStorage.motor-auth-token` (cleared on browser close)
- `localStorage.motor-auth-token` (persists across sessions)

**Managing tokens:**
```javascript
// Set token
sessionStorage.setItem('motor-auth-token', 'your-token');

// Get token
sessionStorage.getItem('motor-auth-token');

// Clear token
sessionStorage.removeItem('motor-auth-token');
```

## What's Happening Behind the Scenes

1. Angular HTTP Interceptor captures all API requests
2. Requests are routed to proxy server (localhost:3001)
3. Proxy adds authentication from your EBSCO token
4. Proxy forwards to Motor.com M1 API
5. Response is returned to Angular app

## Next Steps

Once authenticated and running:

1. **Vehicle Selection**: Navigate to http://localhost:4200/vehicles
2. **Select Vehicle**: Choose Year → Make → Model
3. **Search Articles**: Use the search functionality
4. **View Content**: Browse technical documentation

## Need More Help?

- **Full Setup Guide**: [PROXY_INTEGRATION.md](./PROXY_INTEGRATION.md)
- **Proxy API Docs**: [proxy-server/README.md](./proxy-server/README.md)
- **Main README**: [README.md](./README.md)

---

**Happy Coding! 🚀**

