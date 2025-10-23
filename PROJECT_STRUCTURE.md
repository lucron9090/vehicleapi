# Project Structure

Clean, organized structure for the Motor.com M1 Angular application with integrated proxy server.

## Directory Overview

```
motor-m1-app/                       # Project Root
├── src/                            # Angular source code
├── proxy-server/                   # Authentication proxy server
├── node_modules/                   # Angular dependencies
└── [config files]                  # Angular configuration
```

## Project Structure

```
motor-m1-app/ (project root)
├── src/                           # Source code
│   ├── app/                       # Angular application
│   │   ├── core/                  # Core services & components
│   │   │   ├── components/        # Shared UI components
│   │   │   ├── proxy-auth.interceptor.ts  # HTTP interceptor for proxy
│   │   │   └── state/             # Akita state management
│   │   ├── generated/             # Auto-generated API client
│   │   │   └── api/               # API services & models
│   │   ├── vehicle-selection/     # Vehicle selection feature
│   │   ├── search/                # Search feature
│   │   ├── maintenance-schedules/ # Maintenance schedules feature
│   │   ├── delta-report/          # Change tracking feature
│   │   ├── guards/                # Route guards
│   │   ├── directives/            # Custom directives
│   │   └── pipes/                 # Custom pipes
│   ├── assets/                    # Static assets (images, fonts)
│   ├── environments/              # Environment configurations
│   ├── scripts/                   # JavaScript utilities
│   └── styles.scss                # Global styles
│
├── node_modules/                  # Dependencies (not in git)
├── package.json                   # NPM dependencies
├── angular.json                   # Angular CLI configuration
├── tsconfig.json                  # TypeScript configuration
├── start-dev.sh                   # Development startup script
│
└── Documentation/
    ├── README.md                  # Main documentation
    ├── QUICK_START.md            # Quick setup guide
    ├── PROXY_INTEGRATION.md      # Proxy integration guide
    ├── SETUP.md                  # Original setup notes
    └── PROJECT_STRUCTURE.md      # This file
```

│
├── proxy-server/                  # Authentication Proxy Server
│   ├── index.js                   # Express server with proxy logic
│   ├── package.json               # NPM dependencies
│   ├── node_modules/              # Dependencies (not in git)
│   ├── README.md                  # Proxy server documentation
│   └── .gitignore                 # Git ignore rules
│

## Key Files

### Configuration Files

| File | Purpose |
|------|---------|
| `angular.json` | Angular CLI build & dev server configuration |
| `tsconfig.json` | TypeScript compiler options |
| `package.json` | Dependencies and NPM scripts (both projects) |
| `.gitignore` | Files to exclude from version control |

### Entry Points

| File | Purpose |
|------|---------|
| `src/main.ts` | Angular application bootstrap |
| `src/index.html` | HTML entry point |
| `proxy-server/index.js` | Proxy server entry point |

### Core Integration Files

| File | Purpose |
|------|---------|
| `src/app/core/proxy-auth.interceptor.ts` | Routes requests through proxy |
| `src/app/app.module.ts` | Registers HTTP interceptor |
| `proxy-server/index.js` | Proxy server with authentication |
| `start-dev.sh` | Starts both servers together |

### Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Main documentation with overview |
| `QUICK_START.md` | Fastest way to get running |
| `PROXY_INTEGRATION.md` | Complete proxy setup guide |
| `SETUP.md` | Historical setup notes |
| `PROJECT_STRUCTURE.md` | This file - project organization |
| `proxy-server/README.md` | Proxy server API documentation |

## Cleaned Files

The following unnecessary files have been removed:

### Webpack Artifacts (Removed)
- ✅ `parent_dir/` - 74 empty_* subdirectories with extracted webpack modules
- ✅ `(webpack)/` - Webpack builtin files
- ✅ `webpack/` - Webpack runtime files
- ✅ `_lazy_route_resourceslazygroupOptions207B7Dnamespace20object` - Webpack artifact
- ✅ `src/assets sync .` - Webpack sync artifact

### System Files (Removed)
- ✅ `.DS_Store` files - macOS system metadata
- ✅ `/tmp/*.log` files - Temporary development logs

### Ignored Files (Not Tracked)

These files are generated or contain sensitive data and are excluded from git:

- `node_modules/` - Dependencies (install with `npm install`)
- `dist/` - Build output
- `.angular/cache/` - Angular build cache
- `*.log` - Log files
- `.DS_Store` - macOS system files
- `proxy.conf.json` - Custom proxy configuration (if created)
- `.env` - Environment variables (if created)

## File Counts

### Angular Application

```
Source Files:
- TypeScript: ~100 files
- HTML Templates: ~30 files
- SCSS Styles: ~30 files
- Assets: 6 files

Total Source Size: ~1.5MB (excluding node_modules)
Dependencies: 1,381 packages
```

### Proxy Server

```
Source Files:
- JavaScript: 1 file (index.js)
- Configuration: 1 file (package.json)

Total Size: ~4KB (excluding node_modules)
Dependencies: 4 packages
```

## Important Directories

### Do Not Delete

These directories are essential and should never be deleted:

- `src/` - All application source code
- `src/app/` - Angular application logic
- `src/app/generated/api/` - Auto-generated API client
- `src/app/core/` - Core services including proxy interceptor
- `src/assets/` - Images and fonts
- `proxy-server/` - Proxy server

### Safe to Delete (Regenerable)

These can be safely deleted and regenerated:

- `node_modules/` - Regenerate with `npm install`
- `dist/` - Regenerate with `npm run build`
- `.angular/` - Angular build cache (auto-regenerated)
- `*.log` files - Development logs

## Git Status

### Tracked Files

- All source code (`.ts`, `.html`, `.scss`)
- Configuration files (`package.json`, `tsconfig.json`, `angular.json`)
- Documentation (`.md` files)
- Assets (images, fonts)
- Scripts (`start-dev.sh`)

### Not Tracked (in .gitignore)

- `node_modules/`
- `dist/`
- Build artifacts
- Log files
- System files (`.DS_Store`)
- Credentials/secrets

## Development Workflow

### Quick Start

```bash
# Start both servers
./start-dev.sh

# Or manually:
# Terminal 1: Proxy
cd proxy-server && npm start

# Terminal 2: Angular (from project root)
npm start
```

### Port Usage

- `3001` - Proxy server (authentication & API proxying)
- `4200` - Angular development server (frontend)

### Logs Location

When using `start-dev.sh`:
- Proxy logs: `/tmp/proxy-server.log`
- Angular logs: `/tmp/angular-dev.log`

## Clean Installation

To start fresh:

```bash
# From project root
# Clean Angular app
rm -rf node_modules package-lock.json dist .angular
npm install

# Clean proxy server
cd proxy-server
rm -rf node_modules package-lock.json
npm install
cd ..
```

## Size Optimization

If you need to reduce size:

1. **Remove node_modules**: `rm -rf node_modules` (reinstall when needed)
2. **Clean Angular cache**: `rm -rf .angular/cache`
3. **Remove dist**: `rm -rf dist`
4. **Clear logs**: `rm -f *.log /tmp/*.log`

This can reduce the total size from ~500MB to ~2MB (source only).

## Backup Recommendations

### Essential Files to Backup

- `src/` - All source code
- `package.json` - Dependencies list
- `*.md` files - Documentation
- `angular.json`, `tsconfig.json` - Configuration
- `cruis-api/index.js` - Proxy server logic

### No Need to Backup

- `node_modules/` - Regenerable with `npm install`
- `dist/` - Regenerable with build
- `.angular/` - Build cache
- `*.log` - Temporary logs

## Security Notes

⚠️ **Never commit these files:**

- Authentication tokens
- EBSCO credentials
- `.env` files with secrets
- Personal configuration files

All authentication should be done through the proxy server and stored in browser sessionStorage.

---

**Last Updated:** October 23, 2025  
**Project Status:** Clean and ready for development

