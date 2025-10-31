# Motor.com M1 API Architecture

This document explains the architecture of the Motor.com M1 API integration, including authentication flow and asset proxying.

## System Architecture Overview

```
┌─────────────────┐
│   User Browser  │
│  (localhost:    │
│      4200)      │
└────────┬────────┘
         │
         │ HTTP Request
         │ /api/years
         ▼
┌─────────────────────────────┐
│    Angular Application      │
│   (ProxyAuthInterceptor)    │
│                             │
│  Rewrites URL to:           │
│  localhost:3001/api/        │
│  motor-proxy/api/years      │
└────────┬────────────────────┘
         │
         │ HTTP Request
         │ with rewritten URL
         ▼
┌─────────────────────────────┐
│    Proxy Server             │
│  (localhost:3001)           │
│                             │
│  - Auto-authenticates       │
│  - Maintains session        │
│  - Adds auth cookies        │
└────────┬────────────────────┘
         │
         │ Authenticated
         │ HTTP Request
         ▼
┌─────────────────────────────┐
│   Motor.com M1 API          │
│   (sites.motor.com/m1)      │
│                             │
│   Returns: Vehicle data,    │
│   articles, assets, etc.    │
└─────────────────────────────┘
```

## Authentication Flow

### Automatic Authentication (Server-Side)

```
┌──────────────────┐
│  Proxy Server    │
│   Starts Up      │
└────────┬─────────┘
         │
         │ Reads credentials
         │ from environment
         ▼
┌──────────────────────────────┐
│  Automatic Authentication    │
│                              │
│  1. GET login page           │
│     -> Extract cookies       │
│                              │
│  2. POST card number         │
│     -> Update cookies        │
│                              │
│  3. POST password            │
│     -> Get auth token        │
│                              │
│  4. Follow redirects         │
│     -> Final auth cookies    │
└────────┬─────────────────────┘
         │
         │ Auth successful
         ▼
┌──────────────────────────────┐
│   Server Session Storage     │
│                              │
│   authToken: "cookie=value"  │
│   expiresAt: timestamp       │
│   (25 minutes)               │
└──────────────────────────────┘
         │
         │ Auto-renewal when
         │ session expires
         ▼
┌──────────────────────────────┐
│   All Client Requests        │
│   Automatically Authenticated│
└──────────────────────────────┘
```

## Request Flow Examples

### Example 1: Get Vehicle Years

```
User clicks "Select Vehicle"
         │
         ▼
┌─────────────────────────────────────────┐
│  Angular: vehicleApi.getYears()         │
│  HTTP GET /api/years                    │
└────────┬────────────────────────────────┘
         │ Intercepted by ProxyAuthInterceptor
         ▼
┌─────────────────────────────────────────┐
│  Rewritten to:                          │
│  http://localhost:3001/api/motor-proxy  │
│  /api/years                             │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Proxy Server:                          │
│  1. Check session (valid)               │
│  2. Forward to:                         │
│     https://sites.motor.com/m1/api/years│
│  3. Add Cookie: <auth-token>            │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Motor.com API Response:                │
│  { "data": [2024, 2023, ...] }         │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Proxy Server: Forward response         │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Angular: Display years to user         │
└─────────────────────────────────────────┘
```

### Example 2: Load Article with Assets

```
User clicks article "Oil Change Procedure"
         │
         ▼
┌─────────────────────────────────────────┐
│  Angular: assetApi.getArticleById()     │
│  GET /api/source/motor/vehicle/123/     │
│      article/oil-change                 │
└────────┬────────────────────────────────┘
         │ Via Proxy
         ▼
┌─────────────────────────────────────────┐
│  Motor.com returns article HTML:        │
│  <html>                                 │
│    <h1>Oil Change</h1>                  │
│    <img src="/api/assets/image-uuid"/>  │
│    <embed src="/api/assets/pdf-uuid"/>  │
│  </html>                                │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Angular: Render article                │
│  Browser tries to load:                 │
│  1. /api/assets/image-uuid              │
│  2. /api/assets/pdf-uuid                │
└────────┬────────────────────────────────┘
         │ Each asset request intercepted
         ▼
┌─────────────────────────────────────────┐
│  ProxyAuthInterceptor rewrites:         │
│  /api/assets/image-uuid                 │
│  -> localhost:3001/api/motor-proxy/     │
│     api/assets/image-uuid               │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Proxy Server forwards to:              │
│  https://sites.motor.com/m1/api/assets/ │
│  image-uuid                             │
│  (with authentication)                  │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Motor.com returns binary asset         │
│  Content-Type: image/jpeg               │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Browser displays image in article      │
└─────────────────────────────────────────┘
```

## API Endpoint Categories

### 1. Vehicle Selection APIs
```
/api/years
/api/year/{year}/makes
/api/year/{year}/make/{make}/models
/api/vin/{vin}/vehicle
/api/motor/year/{year}/make/{make}/models
```

### 2. Content APIs
```
/api/source/{source}/vehicle/{id}/articles/v2    (Search)
/api/source/{source}/vehicle/{id}/article/{id}  (Article)
/api/source/{source}/vehicle/{id}/labor/{id}    (Labor)
/api/source/{source}/xml/{id}                   (Raw XML)
```

### 3. Asset APIs
```
/api/assets/{assetId}                           (Images, PDFs, etc.)
```

### 4. Maintenance APIs
```
/api/source/{source}/vehicle/{id}/maintenance-schedules/frequency
/api/source/{source}/vehicle/{id}/maintenance-schedules/interval
/api/source/{source}/vehicle/{id}/maintenance-schedules/indicators
```

### 5. Utility APIs
```
/api/source/{source}/vehicle/{id}/parts         (Parts)
/api/source/{source}/vehicle/{id}/bookmark      (Bookmarks)
/api/ui/usersettings                            (UI Settings)
/api/ui/favicon                                 (Favicon)
```

## Content Source Types

The API supports multiple content sources:

```
┌─────────────────────────────────────────┐
│  Content Source: "motor"                │
│  Primary Motor.com content              │
│  - OEM repair procedures                │
│  - Service specifications               │
│  - Wiring diagrams                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Content Source: "mitchell"             │
│  Mitchell1 content                      │
│  - Alternative repair information       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Content Source: "alldata"              │
│  AllData content                        │
│  - Additional technical data            │
└─────────────────────────────────────────┘
```

## Session Management

```
┌─────────────────────────────────────────┐
│   Session Lifecycle                     │
│                                         │
│   [Created] ──────> [Active 25 min]    │
│                           │             │
│                           ├──> Expired? │
│                           │       │     │
│                           │       ▼     │
│                           │   [Renew]   │
│                           │       │     │
│                           ◄───────┘     │
│                                         │
│   Auto-renewal on expiration           │
│   No manual intervention needed        │
└─────────────────────────────────────────┘
```

## Error Handling Flow

```
Request Made
     │
     ▼
┌─────────────────┐
│ Is Proxy Up?    │────No───> [Error: Connection Refused]
└────┬────────────┘
     │ Yes
     ▼
┌─────────────────┐
│ Is Authenticated│────No───> [Auto-authenticate]
└────┬────────────┘              │
     │ Yes                       │
     │ ◄─────────────────────────┘
     ▼
┌─────────────────┐
│ Forward Request │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Motor.com       │
│ Response OK?    │────Yes──> [Return Data]
└────┬────────────┘
     │ No
     ▼
┌─────────────────┐
│ Error Type?     │
└────┬────────────┘
     │
     ├──> 401 Unauthorized ──> [Re-authenticate]
     ├──> 404 Not Found ────> [Return 404]
     ├──> 500 Server Error ─> [Return Error]
     └──> Network Error ────> [Return Error]
```

## Asset Types Supported

```
┌──────────────────────────────────────────┐
│  Image Assets                            │
│  /api/assets/{id}.jpg                    │
│  /api/assets/{id}.png                    │
│  /api/assets/{id}.gif                    │
│  /api/assets/{id}.svg                    │
│                                          │
│  Used in: Articles, diagrams, photos    │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  Document Assets                         │
│  /api/assets/{id}.pdf                    │
│                                          │
│  Used in: Technical specs, manuals      │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  Other Assets                            │
│  /api/assets/{id}.xml                    │
│  /api/assets/{id}.json                   │
│                                          │
│  Used in: Data files, configurations    │
└──────────────────────────────────────────┘
```

## Development vs Production

### Development (Current Setup)

```
┌──────────────────────────────────────────┐
│  Development Environment                 │
│                                          │
│  Angular Dev Server: localhost:4200      │
│  Proxy Server:       localhost:3001      │
│  Target API:         sites.motor.com/m1  │
│                                          │
│  ✅ CORS handled by proxy                │
│  ✅ Auth handled server-side             │
│  ✅ Hot reload enabled                   │
└──────────────────────────────────────────┘
```

### Production Considerations

```
┌──────────────────────────────────────────┐
│  Production Environment                  │
│                                          │
│  Option 1: Deploy proxy + app together   │
│  - Use Vercel/Heroku/AWS                 │
│  - Configure env vars for credentials    │
│  - Use HTTPS                             │
│                                          │
│  Option 2: Backend API integration       │
│  - Integrate auth into your backend      │
│  - Proxy Motor.com through your API      │
│  - Add rate limiting & caching           │
│                                          │
│  ⚠️  Never expose credentials in frontend│
└──────────────────────────────────────────┘
```

## Security Considerations

```
┌──────────────────────────────────────────┐
│  Security Best Practices                 │
│                                          │
│  ✅ Credentials stored server-side       │
│  ✅ Session tokens not exposed to client │
│  ✅ CORS configured for specific origins │
│  ✅ HTTPS in production                  │
│  ✅ Environment variables for secrets    │
│                                          │
│  ❌ Don't commit credentials to git      │
│  ❌ Don't expose auth tokens in logs     │
│  ❌ Don't use in production as-is        │
└──────────────────────────────────────────┘
```

## Troubleshooting Decision Tree

```
Problem: API Request Fails
         │
         ▼
    Is proxy running?
    /              \
   No              Yes
   │               │
   │               ▼
   │          Is authenticated?
   │          /              \
   │         No              Yes
   │         │               │
   │         │               ▼
   │         │          Check network logs
   │         │          /              \
   │         │   CORS error        404/500
   │         │         │               │
   │         │         │               │
   ▼         ▼         ▼               ▼
Start    Check      Verify         Check
proxy   password   proxy URL      endpoint
         in .env    is correct     exists
```

## Performance Optimization

```
┌──────────────────────────────────────────┐
│  Optimization Strategies                 │
│                                          │
│  1. Cache API responses                  │
│     - Vehicle data (rarely changes)      │
│     - Article content (version-based)    │
│     - Assets (permanent URLs)            │
│                                          │
│  2. Batch requests                       │
│     - Group multiple API calls           │
│     - Use bulk endpoints when available  │
│                                          │
│  3. Lazy load assets                     │
│     - Load images on-demand              │
│     - Use placeholder images             │
│     - Progressive PDF loading            │
│                                          │
│  4. Session management                   │
│     - Keep session alive                 │
│     - Proactive renewal                  │
│     - Connection pooling                 │
└──────────────────────────────────────────┘
```

## Related Documentation

- [API_SCHEMA.md](./API_SCHEMA.md) - Complete endpoint reference
- [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) - Common usage examples
- [PROXY_INTEGRATION.md](./PROXY_INTEGRATION.md) - Detailed proxy setup
- [proxy-server/README.md](./proxy-server/README.md) - Proxy server documentation

---

**Last Updated**: October 31, 2025
