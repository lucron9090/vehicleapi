# Vercel Deployment Guide

This proxy server can be deployed to Vercel as a serverless function.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally
   ```bash
   npm install -g vercel
   ```

## Deployment Steps

### Option 1: Deploy via CLI (Recommended)

1. **Navigate to proxy-server directory**:
   ```bash
   cd /Users/phobosair/unwebpack-sourcemap/output/proxy-server
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? `Y`
   - Which scope? Choose your account
   - Link to existing project? `N` (first time)
   - Project name? `motor-m1-proxy` (or your choice)
   - Directory? `./`
   - Override settings? `N`

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Set Root Directory**:
   - In project settings, set "Root Directory" to `proxy-server`

## Configuration

### Environment Variables (Optional)

If you want to configure settings via environment variables:

1. In Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables:
   - `NODE_ENV`: `production`
   - `PORT`: `3001` (for reference, Vercel assigns its own port)

### CORS Configuration

The proxy is configured with permissive CORS for development. For production, consider restricting origins in `index.js`:

```javascript
app.use(cors({
  origin: 'https://your-angular-app-domain.vercel.app',
  credentials: true
}));
```

## After Deployment

### Get Your Proxy URL

After deployment, Vercel will provide a URL like:
```
https://motor-m1-proxy.vercel.app
```

### Update Angular App

Update the proxy URL in your Angular app's interceptor:

**File**: `/Users/phobosair/unwebpack-sourcemap/output/src/app/core/proxy-auth.interceptor.ts`

```typescript
export class ProxyAuthInterceptor implements HttpInterceptor {
  // Change from localhost to your Vercel URL
  private readonly PROXY_URL = 'https://motor-m1-proxy.vercel.app/api/motor-proxy';
  // ...
}
```

Or better yet, use environment variables:

**File**: `src/environments/environment.prod.ts`
```typescript
export const environment = {
  production: true,
  proxyUrl: 'https://motor-m1-proxy.vercel.app'
};
```

**File**: `src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  proxyUrl: 'http://localhost:3001'
};
```

**Update interceptor**:
```typescript
import { environment } from '~/environment';

export class ProxyAuthInterceptor implements HttpInterceptor {
  private readonly PROXY_URL = `${environment.proxyUrl}/api/motor-proxy`;
  // ...
}
```

## Testing Your Deployment

### Test Health Endpoint

```bash
curl https://motor-m1-proxy.vercel.app/health
```

Expected response:
```json
{"status":"ok"}
```

### Test Authentication

```bash
curl -X POST https://motor-m1-proxy.vercel.app/api/auth/ebsco \
  -H "Content-Type: application/json" \
  -d '{"cardNumber":"YOUR_CARD","password":"YOUR_PASSWORD"}'
```

### Test Motor.com Proxy

```bash
curl https://motor-m1-proxy.vercel.app/api/motor-proxy/api/years \
  -H "X-Auth-Token: YOUR_TOKEN"
```

## Important Considerations

### ⚠️ Serverless Function Limits

Vercel serverless functions have execution time limits:
- **Hobby Plan**: 10 seconds
- **Pro Plan**: 60 seconds  
- **Enterprise**: 900 seconds

The EBSCO authentication flow involves multiple HTTP requests and may take 5-15 seconds. Consider upgrading to Pro if authentication timeouts occur.

### 🔒 Security Best Practices

1. **Restrict CORS**: Don't allow all origins in production
   ```javascript
   app.use(cors({
     origin: 'https://your-angular-app.vercel.app'
   }));
   ```

2. **Rate Limiting**: Add rate limiting to prevent abuse
   ```bash
   npm install express-rate-limit
   ```

   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use(limiter);
   ```

3. **Environment Variables**: Never commit credentials
   - Use Vercel environment variables for sensitive data
   - Add `.env` to `.gitignore`

### 🌐 Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `proxy.yourdomain.com`)
3. Configure DNS as instructed
4. Update Angular app with new domain

## Monitoring

### View Logs

```bash
vercel logs YOUR_DEPLOYMENT_URL
```

Or view in dashboard: Dashboard → Your Project → Deployments → View Logs

### Analytics

Vercel provides built-in analytics:
- Dashboard → Your Project → Analytics

## Rollback

If a deployment has issues:

```bash
vercel rollback
```

Or in Dashboard → Deployments → Click previous deployment → "Promote to Production"

## Local Development

For local development, continue using:

```bash
npm start
```

This runs the Express server on `localhost:3001`.

## CI/CD

Vercel automatically deploys:
- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with unique URL

## Cost

- **Hobby Plan** (Free):
  - 100 GB bandwidth/month
  - Serverless function execution: 100 GB-hours
  - Good for personal projects

- **Pro Plan** ($20/month):
  - 1 TB bandwidth
  - 1,000 GB-hours execution
  - 60-second function timeout
  - Recommended for production

## Troubleshooting

### Issue: Authentication Timeout

**Solution**: Upgrade to Pro plan for 60-second timeout, or optimize authentication flow

### Issue: CORS Errors

**Solution**: Check CORS configuration in `index.js` and ensure your Angular app domain is allowed

### Issue: Cold Starts

**Symptom**: First request after inactivity is slow  
**Solution**: This is normal for serverless. Consider keeping the function warm with periodic health checks

### Issue: 404 Errors

**Solution**: Ensure `vercel.json` routes are configured correctly

## Alternative: Deploy Angular + Proxy Together

You can deploy both the Angular app and proxy server to Vercel:

**Project Structure**:
```
your-repo/
├── angular.json (root Angular app)
├── proxy-server/ (serverless functions)
└── vercel.json (routes to both)
```

**Root `vercel.json`**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/motor-m1-app"
      }
    },
    {
      "src": "proxy-server/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "proxy-server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

This way, everything is hosted on one domain!

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Node.js Runtime](https://vercel.com/docs/runtimes#official-runtimes/node-js)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

---

**Questions?** Check Vercel's support or deploy and test with the free tier first!

