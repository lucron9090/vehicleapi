# Firebase Deployment Guide for Motor.com M1 Angular App

This guide walks through deploying the Motor.com M1 Angular application to Firebase Hosting.

## Prerequisites

1. **Firebase Account**: Create a free account at [firebase.google.com](https://firebase.google.com)
2. **Firebase CLI**: Install globally
   ```bash
   npm install -g firebase-tools
   ```
3. **Deployed Proxy Server**: The proxy server must be deployed first (see options below)

## Important: Proxy Server Deployment

⚠️ **Critical**: This Angular app requires a proxy server for authentication. You must deploy the proxy server BEFORE deploying the Angular app.

### Option 1: Deploy Proxy Server to Vercel (Recommended)

```bash
# Navigate to proxy server directory
cd proxy-server

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add EBSCO_PASSWORD

# Deploy to production
vercel --prod

# Note the deployed URL (e.g., https://your-proxy-server.vercel.app)
```

See [proxy-server/VERCEL_DEPLOYMENT.md](./proxy-server/VERCEL_DEPLOYMENT.md) for detailed instructions.

### Option 2: Deploy Proxy Server to Heroku

```bash
cd proxy-server

# Install Heroku CLI and login
heroku login

# Create new Heroku app
heroku create your-motor-proxy

# Set environment variables
heroku config:set EBSCO_CARD_NUMBER=your-card-number
heroku config:set EBSCO_PASSWORD=your-password

# Deploy
git push heroku main

# Note the deployed URL (e.g., https://your-motor-proxy.herokuapp.com)
```

### Option 3: Deploy to Other Platforms

The proxy server can be deployed to any Node.js hosting platform:
- AWS Lambda / API Gateway
- Google Cloud Functions
- Azure Functions
- DigitalOcean App Platform
- Railway
- Render

Ensure you set the `EBSCO_CARD_NUMBER` and `EBSCO_PASSWORD` environment variables.

---

## Step 1: Update Production Environment Configuration

After deploying your proxy server, update the production environment file with your proxy server URL:

**Edit `src/environments/environment.prod.ts`:**

```typescript
export const environment = {
  production: true,
  proxyUrl: 'https://your-proxy-server.vercel.app/api/motor-proxy'
  // Replace with your actual deployed proxy server URL
};
```

**Important URLs to configure:**
- Vercel: `https://your-project.vercel.app/api/motor-proxy`
- Heroku: `https://your-app.herokuapp.com/api/motor-proxy`
- Other: `https://your-domain.com/api/motor-proxy`

---

## Step 2: Firebase Project Setup

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name (e.g., `motor-m1-app`)
4. Follow the setup wizard
5. Note your project ID (e.g., `motor-m1-app-12345`)

### 2.2 Update Firebase Configuration

**Edit `.firebaserc`:**

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

Replace `your-firebase-project-id` with your actual Firebase project ID.

---

## Step 3: Build the Angular Application

### 3.1 Install Dependencies (if not already done)

```bash
npm install --legacy-peer-deps
```

### 3.2 Build for Production

```bash
npm run build:prod
```

This creates optimized production files in `dist/motor-m1-app/`.

**Expected output:**
```
✔ Browser application bundle generation complete.
✔ Copying assets complete.
✔ Index html generation complete.

Build at: 2024-10-31T14:00:00.000Z - Hash: 1234567890ab
Time: 45678ms

dist/motor-m1-app/
  ├── index.html
  ├── main.js
  ├── polyfills.js
  ├── runtime.js
  ├── styles.css
  └── assets/
```

---

## Step 4: Deploy to Firebase

### 4.1 Login to Firebase

```bash
firebase login
```

This opens a browser window for authentication.

### 4.2 Initialize Firebase (First Time Only)

If you haven't initialized Firebase yet:

```bash
firebase init hosting
```

**Configuration prompts:**
- "What do you want to use as your public directory?" → `dist/motor-m1-app`
- "Configure as a single-page app?" → `Yes`
- "Set up automatic builds and deploys with GitHub?" → `No` (optional)
- "File dist/motor-m1-app/index.html already exists. Overwrite?" → `No`

### 4.3 Deploy to Firebase

```bash
firebase deploy
```

**Expected output:**
```
=== Deploying to 'motor-m1-app'...

i  deploying hosting
i  hosting[motor-m1-app]: beginning deploy...
i  hosting[motor-m1-app]: found 25 files in dist/motor-m1-app
✔  hosting[motor-m1-app]: file upload complete
i  hosting[motor-m1-app]: finalizing version...
✔  hosting[motor-m1-app]: version finalized
i  hosting[motor-m1-app]: releasing new version...
✔  hosting[motor-m1-app]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/motor-m1-app/overview
Hosting URL: https://motor-m1-app.web.app
```

**Your app is now live at**: `https://your-project.web.app` or `https://your-project.firebaseapp.com`

---

## Step 5: Test the Deployment

1. **Open your deployed app**: `https://your-project.web.app`
2. **Verify proxy connection**: 
   - Open browser DevTools (F12)
   - Go to Network tab
   - Navigate through the app
   - Verify API requests go to your proxy server URL
3. **Test vehicle selection**: Select year, make, and model
4. **Test article loading**: View an article and verify images load correctly

---

## Troubleshooting

### Images Not Loading

**Problem**: Images show broken or don't load

**Solution**:
1. Verify proxy server is running: `curl https://your-proxy-server.vercel.app/health`
2. Check `environment.prod.ts` has correct proxy URL
3. Check browser console for CORS errors
4. Verify proxy server has correct EBSCO credentials

### API Requests Failing

**Problem**: API requests return 401 Unauthorized or fail

**Solution**:
1. Check proxy server logs
2. Verify EBSCO credentials in proxy server environment variables
3. Test proxy server directly:
   ```bash
   curl https://your-proxy-server.vercel.app/api/motor-proxy/api/years
   ```

### Build Fails

**Problem**: `npm run build:prod` fails

**Solution**:
1. Clear node_modules: `rm -rf node_modules && npm install --legacy-peer-deps`
2. Clear Angular cache: `rm -rf .angular/cache`
3. Check TypeScript errors: `npx tsc --noEmit`

### Deployment Fails

**Problem**: `firebase deploy` fails

**Solution**:
1. Ensure you're logged in: `firebase login`
2. Verify project ID in `.firebaserc`
3. Check Firebase quota/billing
4. Try deploying specific target: `firebase deploy --only hosting`

---

## Updating Your Deployment

When you make changes to the code:

```bash
# 1. Build updated version
npm run build:prod

# 2. Deploy to Firebase
firebase deploy

# 3. (Optional) View previous deployments
firebase hosting:channel:list
```

---

## Custom Domain Setup

To use a custom domain:

1. Go to Firebase Console → Hosting → Add custom domain
2. Follow the DNS configuration steps
3. Wait for SSL certificate provisioning (can take up to 24 hours)
4. Your app will be available at your custom domain

---

## Environment-Specific Deployments

### Preview Deployment (Staging)

```bash
# Build and deploy to a preview channel
npm run build:prod
firebase hosting:channel:deploy preview

# Output will show preview URL
# Preview URL: https://motor-m1-app--preview-abc123.web.app
```

### Multiple Environments

Create additional environment files:

**src/environments/environment.staging.ts:**
```typescript
export const environment = {
  production: false,
  proxyUrl: 'https://your-staging-proxy.vercel.app/api/motor-proxy'
};
```

Update `angular.json` to add staging configuration:
```json
"configurations": {
  "staging": {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.staging.ts"
      }
    ]
  }
}
```

Build and deploy:
```bash
ng build --configuration=staging
firebase hosting:channel:deploy staging
```

---

## Monitoring and Analytics

### Enable Firebase Analytics

1. Go to Firebase Console → Analytics
2. Click "Enable Google Analytics"
3. Link to Google Analytics account

### View Hosting Metrics

Firebase Console → Hosting → Usage tab shows:
- Total requests
- Bandwidth usage
- Top pages
- Top countries

---

## CI/CD Setup (Optional)

### GitHub Actions

Create `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci --legacy-peer-deps
      - run: npm run build:prod
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

---

## Security Considerations

1. **Never commit credentials**: `.env` files are gitignored
2. **Use environment variables**: For all sensitive configuration
3. **HTTPS only**: Firebase Hosting automatically uses HTTPS
4. **CORS configuration**: Ensure proxy server has proper CORS settings
5. **Rate limiting**: Consider adding rate limiting to proxy server
6. **Monitor costs**: Check Firebase usage dashboard regularly

---

## Cost Estimation

### Firebase Hosting (Free Tier Limits)
- Storage: 10 GB
- Transfer: 360 MB/day
- Custom domain: 1 included

### Vercel Proxy Server (Free Tier)
- 100 GB bandwidth/month
- Unlimited requests
- Serverless functions

**Typical monthly cost**: $0 (within free tiers for most users)

Paid plans start at $25/month for Firebase and $20/month for Vercel if you exceed free limits.

---

## Additional Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Angular Deployment Guide](https://angular.io/guide/deployment)
- [Vercel Deployment Documentation](https://vercel.com/docs)
- [Proxy Server Setup](./proxy-server/README.md)
- [API Documentation](./API_SCHEMA.md)

---

## Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review Firebase Console logs
3. Check proxy server logs (Vercel/Heroku dashboard)
4. Verify environment configuration

---

**Last Updated**: October 31, 2024
**Version**: 1.0.0
