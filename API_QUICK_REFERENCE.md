# Motor.com M1 API Quick Reference

Quick reference guide for the most commonly used API endpoints.

## 🚀 Quick Start

### 1. Start the Proxy Server
```bash
cd proxy-server
npm install
npm start
```

### 2. Configure Authentication
Create a `.env` file in the proxy-server directory (recommended):
```bash
cd proxy-server
cp .env.example .env
# Edit .env file with your credentials
```

Or set environment variables (not recommended - may expose in shell history):
```bash
export EBSCO_CARD_NUMBER="your-card-number"
export EBSCO_PASSWORD="your-password"
```

### 3. Start the Angular App
```bash
npm install --legacy-peer-deps
npm start
```

### 4. Access the App
Open browser to `http://localhost:4200`

---

## 📋 Common API Endpoints

All endpoints should be prefixed with the proxy server URL when testing directly:
- **Proxy URL**: `http://localhost:3001/api/motor-proxy`
- **Direct URL**: `https://sites.motor.com/m1` (requires authentication)

### Vehicle Selection Flow

```bash
# 1. Get available years
GET /api/years
Response: { "data": [2024, 2023, 2022, ...] }

# 2. Get makes for a year
GET /api/year/2023/makes
Response: { "data": ["Toyota", "Ford", "Honda", ...] }

# 3. Get models for year and make
GET /api/year/2023/make/Toyota/models
Response: { "data": [{ "model": "Camry", "vehicleId": "12345", ... }] }
```

### Search and Content

```bash
# 4. Search articles for a vehicle
GET /api/source/motor/vehicle/{vehicleId}/articles/v2?searchTerm=oil+change
Response: { "filterTabs": [...], "articleDetails": [...] }

# 5. Get article content
GET /api/source/motor/vehicle/{vehicleId}/article/{articleId}
Response: { "article": { "content": "<html>...</html>", ... } }

# 6. Get asset (image, PDF, etc.)
GET /api/assets/{assetId}
Response: Binary content (image, PDF, etc.)
```

### Maintenance Schedules

```bash
# Get maintenance schedules by frequency
GET /api/source/motor/vehicle/{vehicleId}/maintenance-schedules/frequency

# Get maintenance schedules by interval
GET /api/source/motor/vehicle/{vehicleId}/maintenance-schedules/interval?intervalType=Miles&severity=Normal

# Get maintenance schedule indicators
GET /api/source/motor/vehicle/{vehicleId}/maintenance-schedules/indicators
```

### Other Endpoints

```bash
# Get labor operation details
GET /api/source/motor/vehicle/{vehicleId}/labor/{laborId}

# Get parts for vehicle
GET /api/source/motor/vehicle/{vehicleId}/parts?searchTerm=filter

# Get vehicle by VIN
GET /api/vin/{vin}/vehicle

# Save bookmark
POST /api/source/motor/vehicle/{vehicleId}/article/{articleId}/bookmark

# Get bookmark
GET /api/bookmark/{bookmarkId}
```

---

## 🔧 Testing with curl

### Test Proxy Health
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "autoAuth": true,
  "session": "authenticated",
  "expiresInMinutes": 25
}
```

### Test Vehicle API
```bash
# Get years
curl http://localhost:3001/api/motor-proxy/api/years

# Get makes for 2023
curl http://localhost:3001/api/motor-proxy/api/year/2023/makes

# Get models for 2023 Toyota
curl "http://localhost:3001/api/motor-proxy/api/year/2023/make/Toyota/models"
```

### Test Search API
```bash
# Search for "oil change" articles
curl "http://localhost:3001/api/motor-proxy/api/source/motor/vehicle/12345/articles/v2?searchTerm=oil+change"
```

### Test Asset API
```bash
# Download an asset (replace {assetId} with actual ID from article)
curl "http://localhost:3001/api/motor-proxy/api/assets/{assetId}" -o asset.jpg
```

---

## 📝 Important Notes

### Content Source
The `contentSource` parameter can be:
- `motor` - Primary Motor.com content
- `mitchell` - Mitchell1 content
- `alldata` - AllData content

Most endpoints use `motor` as the content source.

### Vehicle ID
The vehicle ID is returned from the models endpoint and is required for most content operations.

Example flow:
1. User selects: 2023 Toyota Camry LE 2.5L
2. Models endpoint returns: `{ "vehicleId": "12345", ... }`
3. Use `12345` in subsequent API calls

### Asset URLs in Articles
When articles are retrieved, they may contain asset references like:
```html
<img src="/api/assets/abc-123-def-456" />
<embed src="/api/assets/pdf-uuid-here.pdf" />
```

The Angular app's `ProxyAuthInterceptor` automatically rewrites these to:
```
http://localhost:3001/api/motor-proxy/api/assets/abc-123-def-456
```

This ensures assets are loaded with proper authentication.

### Authentication Session
- **Duration**: 25 minutes (EBSCO standard session)
- **Auto-Renewal**: Server automatically re-authenticates when session expires
- **No Client Action Needed**: Everything is handled server-side

---

## 🐛 Troubleshooting

### Proxy Server Won't Start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill existing process
kill -9 <PID>

# Try again
npm start
```

### Authentication Fails
1. Check password is set in `index.js` or environment variable
2. Verify card number is correct
3. Check server logs for detailed error messages
4. Try manual authentication:
   ```bash
   curl -X POST http://localhost:3001/api/auth/ebsco \
     -H "Content-Type: application/json" \
     -d '{"cardNumber":"YOUR_CARD","password":"YOUR_PASSWORD"}'
   ```

### Assets Not Loading
1. Verify proxy server is running
2. Check browser console for CORS errors
3. Ensure `ProxyAuthInterceptor` is registered in `app.module.ts`
4. Test asset URL directly in browser:
   ```
   http://localhost:3001/api/motor-proxy/api/assets/{assetId}
   ```

### API Returns 401 Unauthorized
1. Check proxy server health: `curl http://localhost:3001/health`
2. Verify session is authenticated
3. Check if session expired (should auto-renew)
4. Restart proxy server to force re-authentication

---

## 📚 Additional Resources

- **Complete API Documentation**: [API_SCHEMA.md](./API_SCHEMA.md)
- **Proxy Server Setup**: [PROXY_INTEGRATION.md](./PROXY_INTEGRATION.md)
- **Proxy Server Details**: [proxy-server/README.md](./proxy-server/README.md)
- **Project Structure**: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
- **Main README**: [README.md](./README.md)

---

## 💡 Tips

1. **Use the Proxy**: Always use the proxy server for development - it handles all authentication
2. **Monitor Logs**: Keep the proxy server terminal open to see request logs
3. **Health Check**: Periodically check `/health` endpoint to verify authentication status
4. **Asset Loading**: If images don't load, check the Network tab for 401 errors
5. **Search Terms**: URL-encode search terms with spaces: `oil+change` or `oil%20change`
6. **Testing**: Use curl for quick API testing before implementing in the app

---

## 🔐 Security Reminder

- Never commit credentials to git
- Use environment variables for sensitive data
- This setup is for local development only
- For production, implement proper authentication and security measures
