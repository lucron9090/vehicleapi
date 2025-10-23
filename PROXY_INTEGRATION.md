# Proxy Server Integration Guide

This guide explains how to use the integrated proxy server to authenticate and access the Motor.com M1 API.

## Architecture Overview

```
┌─────────────────┐      ┌─────────────────┐      ┌──────────────────┐
│   Angular App   │─────▶│  Proxy Server   │─────▶│   Motor.com API  │
│  localhost:4200 │      │  localhost:3001 │      │  sites.motor.com │
└─────────────────┘      └─────────────────┘      └──────────────────┘
        │                         │
        │                         │
        │                         ▼
        │                  ┌──────────────────┐
        └─────────────────▶│  EBSCO Auth API  │
                           │  login.ebsco.com │
                           └──────────────────┘
```

## How It Works

1. **EBSCO Authentication**: The proxy server authenticates with EBSCO using your card number and password
2. **Token Retrieval**: EBSCO returns an authentication token that contains Motor.com M1 API credentials
3. **Request Proxying**: The Angular app sends API requests through the proxy, which adds the auth token
4. **Transparent Access**: All Motor.com M1 API calls work seamlessly through the proxy

## Setup Instructions

### Step 1: Start the Proxy Server

```bash
# Navigate to the proxy server directory
cd proxy-server

# Install dependencies (first time only)
npm install

# Start the proxy server
npm start
```

You should see:
```
🚀 Proxy Server is running on http://localhost:3001

📡 Available endpoints:
   EBSCO Auth:      POST http://localhost:3001/api/auth/ebsco
   EBSCO Proxy:     *    http://localhost:3001/api/ebsco-proxy/*
   Motor.com Proxy: *    http://localhost:3001/api/motor-proxy/*
   Health Check:    GET  http://localhost:3001/health

ℹ️  Note: EBSCO authentication returns credentials for Motor.com M1 API
```

### Step 2: Authenticate with EBSCO

Use curl, Postman, or your browser console to authenticate:

```bash
curl -X POST http://localhost:3001/api/auth/ebsco \
  -H "Content-Type: application/json" \
  -d '{
    "cardNumber": "YOUR_CARD_NUMBER",
    "password": "YOUR_PASSWORD"
  }'
```

**Response:**
```json
{
  "authToken": "cookie1=value1; cookie2=value2; ..."
}
```

**Save this `authToken`** - you'll need it for Step 3.

### Step 3: Configure Authentication in Angular

Open your browser's developer console and run:

```javascript
// Store the auth token (replace with your actual token from Step 2)
sessionStorage.setItem('motor-auth-token', 'YOUR_AUTH_TOKEN_HERE');

// Or use the helper method if you're in the app context
ProxyAuthInterceptor.setAuthToken('YOUR_AUTH_TOKEN_HERE');
```

### Step 4: Start the Angular Development Server

```bash
# From the project root directory
npm start
```

Open your browser to: **http://localhost:4200**

## Testing the Integration

### 1. Check Proxy Health

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status": "ok"}
```

### 2. Test Motor.com API Through Proxy

After setting up authentication, try accessing an API endpoint:

```bash
curl http://localhost:3001/api/motor-proxy/api/years \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN"
```

### 3. Test in Angular App

The Angular app will automatically route all API requests through the proxy. Try:

1. Open http://localhost:4200
2. Navigate to the vehicle selection page
3. The year/make/model dropdowns should load data through the proxy

## API Endpoints

### Proxy Server Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/ebsco` | Authenticate with EBSCO (returns authToken) |
| `*` | `/api/ebsco-proxy/*` | Proxy requests to EBSCO resources |
| `*` | `/api/motor-proxy/*` | Proxy requests to Motor.com M1 API |
| `GET` | `/health` | Health check endpoint |

### Motor.com M1 API Endpoints (via proxy)

All these requests are automatically routed through the proxy by the Angular interceptor:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/years` | Get available years |
| `GET` | `/api/year/{year}/makes` | Get makes for a year |
| `GET` | `/api/year/{year}/make/{make}/models` | Get models |
| `GET` | `/api/source/{source}/vehicle/{id}/articles/v2` | Search articles |
| `GET` | `/api/source/{source}/vehicle/{id}/article/{articleId}` | Get article details |

## Authentication Token Management

### Storing the Token

The auth token is stored in `sessionStorage` by default (cleared when browser closes) or `localStorage` (persists across sessions).

```javascript
// Store in sessionStorage (default)
ProxyAuthInterceptor.setAuthToken('your-token', true);

// Store in localStorage (persists)
ProxyAuthInterceptor.setAuthToken('your-token', false);
```

### Clearing the Token

```javascript
// Clear from both storage locations
ProxyAuthInterceptor.clearAuthToken();
```

### Token Expiration

EBSCO tokens may expire after a certain period. If you get 401 errors:

1. Re-authenticate using `POST /api/auth/ebsco`
2. Update the stored token with the new one

## Creating a Login Component (Optional)

You can create a login form in your Angular app to handle EBSCO authentication:

```typescript
// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ProxyAuthInterceptor } from '../core/proxy-auth.interceptor';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_URL = 'http://localhost:3001/api/auth/ebsco';

  constructor(private http: HttpClient) {}

  login(cardNumber: string, password: string): Observable<{ authToken: string }> {
    return this.http.post<{ authToken: string }>(this.AUTH_URL, {
      cardNumber,
      password
    }).pipe(
      tap(response => {
        ProxyAuthInterceptor.setAuthToken(response.authToken);
      })
    );
  }

  logout(): void {
    ProxyAuthInterceptor.clearAuthToken();
  }

  isAuthenticated(): boolean {
    const token = sessionStorage.getItem('motor-auth-token') || 
                  localStorage.getItem('motor-auth-token');
    return !!token;
  }
}
```

```typescript
// src/app/auth/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <h2>Login to Motor.com M1</h2>
      <form (submit)="onSubmit()">
        <div class="form-group">
          <label>Card Number:</label>
          <input type="text" [(ngModel)]="cardNumber" name="cardNumber" required>
        </div>
        <div class="form-group">
          <label>Password:</label>
          <input type="password" [(ngModel)]="password" name="password" required>
        </div>
        <button type="submit">Login</button>
        <div *ngIf="error" class="error">{{ error }}</div>
      </form>
    </div>
  `
})
export class LoginComponent {
  cardNumber = '';
  password = '';
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error = '';
    this.authService.login(this.cardNumber, this.password).subscribe({
      next: () => {
        this.router.navigate(['/vehicles']);
      },
      error: (err) => {
        this.error = 'Authentication failed. Please check your credentials.';
        console.error('Login error:', err);
      }
    });
  }
}
```

## Troubleshooting

### Issue: "Proxy server not responding"

**Solution:**
- Ensure the proxy server is running on port 3001
- Check that no other service is using port 3001
- Try: `lsof -i :3001` to see what's using the port

### Issue: "401 Unauthorized" errors

**Solutions:**
1. Verify you've authenticated with EBSCO
2. Check that the auth token is stored: `sessionStorage.getItem('motor-auth-token')`
3. Token may have expired - re-authenticate
4. Verify proxy server logs show the auth token being received

### Issue: "CORS errors"

**Solution:**
- The proxy server has CORS enabled by default
- Ensure you're making requests to `localhost:3001`, not directly to Motor.com

### Issue: "Connection refused"

**Solutions:**
1. Start the proxy server first
2. Check proxy server logs for errors
3. Verify proxy server is listening on 3001

### Issue: Requests not being proxied

**Solution:**
- Check browser console for `[ProxyAuthInterceptor]` log messages
- Verify the interceptor is registered in `app.module.ts`
- Make sure API requests are using relative URLs (e.g., `/api/years` or `./api/years`)

## Development Workflow

### Standard Development

```bash
# Terminal 1: Start proxy server
cd proxy-server
npm start

# Terminal 2: Start Angular app (from project root)
npm start

# Browser Console: Authenticate
sessionStorage.setItem('motor-auth-token', 'YOUR_TOKEN');

# Now use the app normally
```

### One-Time Setup Script

A helper script `start-dev.sh` is already included in the project root.

Simply run:
```bash
./start-dev.sh
```

This will automatically:
- Start the proxy server in the background
- Start the Angular development server
- Display instructions for authentication
- Clean up both servers on exit (Ctrl+C)

## Security Notes

⚠️ **Important Security Considerations:**

1. **Local Development Only**: This proxy is for local development only. Never deploy to production.
2. **Credentials**: Never commit your EBSCO credentials or auth tokens to git
3. **Token Storage**: SessionStorage is cleared when browser closes (more secure)
4. **HTTPS**: The proxy doesn't use HTTPS locally, so don't use on public networks
5. **Authentication**: Each developer needs their own EBSCO credentials

## Environment Variables (Optional)

You can configure the proxy using environment variables:

```bash
# .env file in cruis-api/
PORT=3001
NODE_ENV=development
```

## Additional Resources

- [Angular HTTP Interceptors](https://angular.io/guide/http#intercepting-requests-and-responses)
- [Express.js Documentation](https://expressjs.com/)
- [Axios Documentation](https://axios-http.com/)

## Support

If you encounter issues:

1. Check the proxy server logs (Terminal 1)
2. Check the Angular console logs (Browser DevTools)
3. Verify authentication token is set correctly
4. Test the proxy endpoint directly with curl

---

**Last Updated:** October 23, 2025

