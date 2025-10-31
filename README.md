# Motor.com M1 Angular Application

This Angular application was extracted from production sourcemaps and reconstructed for local development.

## ⚠️ Important Notes

- This application was reverse-engineered from webpack sourcemaps
- The **API endpoints require authentication** via integrated proxy server
- Some assets (images, fonts, stylesheets) may be missing and need to be recreated
- The original production app is at: `https://sites.motor.com/m1/`

## 🔐 Integrated Proxy Server

This application includes an **integrated proxy server** that handles authentication and API proxying **automatically**.

### Quick Setup (Automatic Authentication)

1. **Configure credentials** (one-time setup):
   ```bash
   cd proxy-server
   cp .env.example .env
   # Edit .env and add your EBSCO password
   ```

2. **Start the proxy server** (Terminal 1):
   ```bash
   cd proxy-server
   npm install
   npm start
   ```
   
   The proxy will automatically authenticate with EBSCO on startup! ✅

3. **Start the Angular app** (Terminal 2):
   ```bash
   npm install --legacy-peer-deps
   npm start
   ```

4. **Use the app** - All API requests (including assets) are automatically proxied with authentication!

📖 **Detailed Instructions**: See [PROXY_INTEGRATION.md](./PROXY_INTEGRATION.md) for complete setup guide.
📋 **API Documentation**: See [API_SCHEMA.md](./API_SCHEMA.md) for complete API reference.
⚡ **Quick Reference**: See [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) for common endpoints.

## ☁️ Cloud Deployment (Vercel)

Both the proxy server and Angular app can be deployed to Vercel for free!

**Deploy Proxy Server**:
```bash
cd proxy-server
vercel --prod
```

**Deploy Angular App**:
```bash
npm run build:prod
vercel --prod
```

📘 See [proxy-server/VERCEL_DEPLOYMENT.md](./proxy-server/VERCEL_DEPLOYMENT.md) for complete deployment guide.

## 🚀 Quick Start

### Prerequisites
- Node.js 14.x or higher
- npm 6.x or higher

### Installation

```bash
# Install dependencies
cd /Users/phobosair/unwebpack-sourcemap/output
npm install
```

### Development Server

```bash
# Start dev server on http://localhost:4200
npm start
```

The application will automatically reload if you change any source files.

### Build

```bash
# Development build
npm run build

# Production build
npm run build:prod
```

Build artifacts will be stored in the `dist/` directory.

## 📡 API Configuration

The app connects to the Motor.com M1 API at `https://sites.motor.com/m1/api/`

### Authentication Required

All API requests require these headers:

```typescript
{
  'x-correlation-id': '<correlation-id>',
  'x-session-id': '<session-id>',
  'Authorization': 'Bearer <api-token>'
}
```

### Getting Credentials

You need to obtain credentials from the authentication endpoint (not included in extracted sources).

### Configuring API Base URL

Edit `src/app/app.module.ts`:

```typescript
ApiModule.forRoot({ rootUrl: 'https://sites.motor.com/m1' })
```

Or use a proxy configuration for development (see below).

## 🔧 Development Proxy (Optional)

To avoid CORS issues during development, create `proxy.conf.json`:

```json
{
  "/api": {
    "target": "https://sites.motor.com/m1",
    "secure": true,
    "changeOrigin": true,
    "headers": {
      "x-correlation-id": "YOUR_CORRELATION_ID",
      "x-session-id": "YOUR_SESSION_ID",
      "Authorization": "Bearer YOUR_TOKEN"
    }
  }
}
```

Then update `package.json` start script:

```json
"start": "ng serve --proxy-config proxy.conf.json"
```

## 📁 Project Structure

```
src/
├── app/
│   ├── app.component.ts          # Root component
│   ├── app.module.ts             # Root module
│   ├── app-routing.module.ts    # Router configuration
│   ├── assets/                   # Assets state management
│   ├── core/                     # Core services & components
│   │   ├── components/           # Shared components (layout, nav, modals)
│   │   ├── state/                # Layout state (Akita)
│   │   └── user-settings/        # User settings service
│   ├── delta-report/             # Change tracking feature
│   ├── directives/               # Custom directives (zoom, routing)
│   ├── generated/                # Auto-generated API client
│   │   └── api/
│   │       ├── models/           # TypeScript models
│   │       └── services/         # API service classes
│   ├── guards/                   # Route guards
│   ├── labor-operation/          # Labor operations feature
│   ├── maintenance-schedules/    # Maintenance schedules feature
│   ├── pipes/                    # Custom pipes (SafeHtml)
│   ├── search/                   # Search feature with state
│   ├── vehicle-selection/        # Vehicle selection feature
│   └── utilities.ts              # Helper functions
├── assets/                       # Static assets
├── environments/                 # Environment configs
├── main.ts                       # Application entry point
└── polyfills.ts                  # Browser polyfills
```

## 🗂️ State Management (Akita)

The app uses **Akita** for state management with the Store → Query → Facade pattern:

### Active Stores

1. **Layout Store** - UI layout state
2. **Vehicle Selection Store** - Selected vehicle (persisted to sessionStorage)
3. **Search Results Store** - Search results and active article
4. **Filter Tabs Store** - Search filter tabs
5. **Assets Store** - Asset data
6. **Maintenance Schedules Store** - Maintenance schedule data

### State Persistence

Vehicle selection is persisted to `sessionStorage` with key `'selected-vehicle'`.

## 🛣️ Routes

- `/` → Redirects to `/vehicles`
- `/vehicles` → Vehicle selection (Year/Make/Model)
- `/docs/:filterTab` → Main content area with articles
- `/maintenance-schedules` → Maintenance schedules view
- `/delta-report` → Change tracking reports (guarded)
- `/**` → 404 Error page

## 🔌 API Endpoints

### Vehicle API
- `GET /api/years` - Get available years
- `GET /api/year/{year}/makes` - Get makes for year
- `GET /api/year/{year}/make/{make}/models` - Get models

### Search API
- `GET /api/source/{contentSource}/vehicle/{vehicleId}/articles/v2` - Search articles

### Asset API
- `GET /api/source/{contentSource}/vehicle/{vehicleId}/article/{articleId}` - Get article
- `GET /api/source/{contentSource}/vehicle/{vehicleId}/maintenance-schedules/...` - Schedules

### Other APIs
- Bookmark API - Manage bookmarks
- Parts API - Parts information
- UI API - UI configuration
- Error Logging API - Client error tracking
- Track Change API - Change tracking
- Logout API - Session termination

## 🎨 Styling

The app uses **SCSS** for styling with Bootstrap via `@ng-bootstrap/ng-bootstrap`.

Component-specific styles should be created as `*.component.scss` files.

## 🧩 Key Dependencies

- **Angular 12.x** - Framework
- **Akita** - State management
- **ng-bootstrap** - Bootstrap UI components
- **ng-select** - Advanced select dropdowns
- **ngx-extended-pdf-viewer** - PDF viewing
- **RxJS 6.x** - Reactive programming

## ⚠️ Known Issues

1. **Missing Assets** - Images, fonts, and some stylesheets extracted from sourcemaps may not work
2. **API Authentication** - You need valid credentials to use the API
3. **CORS** - Direct API calls from localhost may be blocked (use proxy)
4. **Component Styles** - Some component SCSS files are missing and may need recreation
5. **Environment Variables** - May need additional configuration

## 🔐 Security Notes

**This code was extracted from production sourcemaps** which exposed:
- Full application source code
- API structure and endpoints
- Business logic
- Authentication patterns

This is a **security issue** in the production deployment.

## 📝 Development Notes

### Adding HTTP Interceptor for Auth

Create an HTTP interceptor to automatically add auth headers:

```typescript
// src/app/core/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authReq = req.clone({
      setHeaders: {
        'x-correlation-id': 'YOUR_ID',
        'x-session-id': 'YOUR_SESSION',
        'Authorization': 'Bearer YOUR_TOKEN'
      }
    });
    return next.handle(authReq);
  }
}
```

Register in `app.module.ts`:

```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/auth.interceptor';

providers: [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
]
```

### Debugging Akita State

Enable Akita DevTools in development (already configured):

- Open browser DevTools
- Look for "Akita" tab
- Monitor state changes in real-time

## 📚 Resources

- [Angular Documentation](https://angular.io/docs)
- [Akita State Management](https://datorama.github.io/akita/)
- [RxJS Documentation](https://rxjs.dev/)
- [ng-bootstrap](https://ng-bootstrap.github.io/)

## 🤝 Contributing

This is a reverse-engineered application. Contributions should focus on:
- Recreating missing assets
- Documenting API endpoints
- Improving type safety
- Adding tests

## 📄 License

Unknown - This code was extracted from a production application.

---

## 🔗 Related Documentation

### API & Integration
- **[API_SCHEMA.md](./API_SCHEMA.md)** - Complete API endpoint reference with request/response schemas
- **[API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)** - Quick reference for common API endpoints
- **[PROXY_INTEGRATION.md](./PROXY_INTEGRATION.md)** - Complete proxy server integration guide
- **[Proxy Server README](./proxy-server/README.md)** - Proxy server API documentation

### Project Documentation
- **[SETUP.md](./SETUP.md)** - Original setup notes
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Project organization guide

---

## 🖼️ Asset Handling

Articles from Motor.com often reference images, PDFs, and other assets using URLs like `/api/assets/{unique-id}`. 

**How it works:**
1. Article HTML contains: `<img src="/api/assets/abc-123-def" />`
2. Angular's `ProxyAuthInterceptor` automatically rewrites to: `http://localhost:3001/api/motor-proxy/api/assets/abc-123-def`
3. Proxy server forwards to Motor.com with authentication: `https://sites.motor.com/m1/api/assets/abc-123-def`
4. Asset is returned with proper authentication and CORS headers

**No special configuration needed** - assets are automatically proxied! 🎉

See [API_SCHEMA.md](./API_SCHEMA.md) for complete details on the `/api/assets/{assetId}` endpoint.

---

**Generated from sourcemaps on October 20, 2025**  
**Proxy integration added on October 23, 2025**  
**API schema and asset proxying documented on October 31, 2025**
