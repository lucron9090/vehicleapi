# Motor M1 Proxy Server

Express.js proxy server that handles authentication and proxying for EBSCO and Motor.com M1 API.

## Features

- **Automatic Authentication**: Server-side authentication with EBSCO (no client auth needed!)
- **EBSCO Proxy**: Proxies requests to EBSCO resources with authentication
- **Motor.com M1 API Proxy**: Proxies ALL Motor.com M1 API requests including assets
- **Asset Proxying**: Automatically handles `/api/assets/*` endpoints for images, PDFs, etc.
- **CORS Enabled**: Allows cross-origin requests from Angular frontend
- **Session Management**: Maintains authentication session server-side (25-minute sessions)

## Installation

```bash
cd proxy-server
npm install
```

## Usage

### Start the Server

```bash
npm start
```

Server will start on **http://localhost:3001**

## API Endpoints

### 1. EBSCO Authentication

Authenticate with EBSCO to get credentials for Motor.com M1 API.

**Endpoint:** `POST /api/auth/ebsco`

**Request:**
```json
{
  "cardNumber": "your-card-number",
  "password": "your-password"
}
```

**Response:**
```json
{
  "authToken": "cookie1=value1; cookie2=value2; ..."
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/auth/ebsco \
  -H "Content-Type: application/json" \
  -d '{
    "cardNumber": "12345678",
    "password": "mypassword"
  }'
```

### 2. EBSCO Proxy

Proxy requests to EBSCO resources with authentication.

**Endpoint:** `* /api/ebsco-proxy/*`

**Headers Required:**
- `X-Auth-Token`: The auth token from EBSCO authentication

**Example:**
```bash
curl http://localhost:3001/api/ebsco-proxy/search.ebsco.com/api/search \
  -H "X-Auth-Token: your-auth-token"
```

### 3. Motor.com M1 API Proxy (Automatic Authentication)

Proxy requests to Motor.com M1 API using server-side EBSCO authentication.

**Endpoint:** `* /api/motor-proxy/*`

**Headers Required:**
- None! Authentication is handled server-side automatically.

**Configuration:**
Set environment variables or update `index.js`:
```javascript
const AUTO_AUTH_CONFIG = {
  enabled: true,
  cardNumber: process.env.EBSCO_CARD_NUMBER || '1001600244772',
  password: process.env.EBSCO_PASSWORD || '', // SET THIS!
};
```

**Examples:**
```bash
# Get available years (no auth token needed!)
curl http://localhost:3001/api/motor-proxy/api/years

# Get makes for a year
curl http://localhost:3001/api/motor-proxy/api/year/2023/makes

# Get models
curl http://localhost:3001/api/motor-proxy/api/year/2023/make/Toyota/models

# Search articles
curl http://localhost:3001/api/motor-proxy/api/source/motor/vehicle/12345/articles/v2

# Get article content
curl http://localhost:3001/api/motor-proxy/api/source/motor/vehicle/12345/article/article-123

# Get asset (image, PDF, etc.) - IMPORTANT for proper rendering!
curl http://localhost:3001/api/motor-proxy/api/assets/unique-asset-id-here
```

**Available Motor.com endpoints:**
- `GET /api/years` - Get available years
- `GET /api/year/{year}/makes` - Get makes for a year
- `GET /api/year/{year}/make/{make}/models` - Get models
- `GET /api/source/{source}/vehicle/{id}/articles/v2` - Search articles
- `GET /api/source/{source}/vehicle/{id}/article/{articleId}` - Get article content
- `GET /api/assets/{assetId}` - **Get assets (images, PDFs, documents)**
- `GET /api/source/{source}/vehicle/{id}/labor/{laborId}` - Get labor details
- `GET /api/source/{source}/vehicle/{id}/maintenance-schedules/*` - Maintenance schedules
- And many more... (see [../API_SCHEMA.md](../API_SCHEMA.md) for complete list)

### 4. Health Check

Check if the server is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok"
}
```

## How It Works

### Automatic Authentication Flow (Recommended)

1. **Server Startup** - Proxy server authenticates automatically with EBSCO on startup
2. **Session Management** - Server maintains a 25-minute authentication session
3. **Auto-Renewal** - Session is automatically renewed when it expires
4. **Client Requests** - Angular app makes requests without any auth headers
5. **Server Proxying** - Proxy server adds authentication cookies automatically
6. **Response** - Authenticated response is returned to the client

**No client-side authentication needed!** Just start the proxy server and make requests.

### Manual Authentication Flow (Optional)

If you disable automatic authentication, you can authenticate manually:

1. **Client** sends card number and password to `/api/auth/ebsco`
2. **Proxy Server** performs multi-step authentication with EBSCO:
   - Gets login page and initial cookies
   - Submits card number
   - Submits password
   - Follows redirects to get final auth cookies
3. **EBSCO** returns authentication cookies/token
4. **Proxy Server** returns the auth token to client
5. **Client** stores the auth token for subsequent requests

### Proxying Flow

1. **Client** makes request to proxy endpoint (e.g., `/api/motor-proxy/api/years`)
2. **Proxy Server** checks if session is valid (or authenticates automatically if needed)
3. **Proxy Server** extracts the target URL from the request path
4. **Proxy Server** forwards the request with server-side auth token as cookies
5. **Target API** (EBSCO or Motor.com) processes the authenticated request
6. **Proxy Server** returns the response to the client

### Asset Proxying (Critical for Proper Rendering)

Articles from Motor.com often contain references to assets like:
- Images: `/api/assets/image-uuid-here.jpg`
- PDFs: `/api/assets/document-uuid-here.pdf`
- SVG diagrams: `/api/assets/diagram-uuid-here.svg`

These asset URLs are automatically proxied:
1. **Angular App** loads article with asset reference `/api/assets/{id}`
2. **ProxyAuthInterceptor** rewrites to `http://localhost:3001/api/motor-proxy/api/assets/{id}`
3. **Proxy Server** forwards to `https://sites.motor.com/m1/api/assets/{id}` with auth
4. **Asset** is returned with proper authentication and CORS headers

## Integration with Angular Frontend

This proxy server is integrated with the Motor.com M1 Angular application located in the parent directory.

- **HTTP Interceptor**: Angular app automatically routes API requests through this proxy
- **Auth Token Management**: Stores and sends auth tokens with requests

See `../PROXY_INTEGRATION.md` for detailed setup instructions.

## Configuration

### Port

Default port is `3001`. To change it, modify the `PORT` constant in `index.js`:

```javascript
const PORT = 3001;
```

### EBSCO Configuration

The EBSCO authentication URL is configured in `index.js`:

```javascript
const loginUrl = `https://login.ebsco.com/?custId=s5672256&groupId=main&profId=autorepso&requestIdentifier=${requestIdentifier}`;
```

## Dependencies

- **express** - Web framework
- **cors** - CORS middleware
- **axios** - HTTP client
- **uuid** - UUID generation

## Development

### Project Structure

```
proxy-server/
├── index.js           # Main server file
├── package.json       # Dependencies and scripts
├── README.md          # This file
└── .gitignore         # Git ignore rules
```

### Adding New Endpoints

Add new routes in `index.js`:

```javascript
app.post('/api/my-endpoint', async (req, res) => {
  // Your logic here
});
```

## Error Handling

The proxy includes comprehensive error handling:

- **400**: Missing required parameters
- **401**: Authentication failed or missing auth token
- **500**: Server errors with detailed messages
- **Proxy errors**: Includes original error status and data

## Logging

The server logs all important operations:

- Authentication attempts
- Cookie extraction
- Proxy requests
- Errors with details

Check the console output for debugging information.

## Security Considerations

⚠️ **Important:**

1. **Local Development Only**: This server is for local development
2. **No Production Use**: Never deploy this to production
3. **Credentials**: Keep your EBSCO credentials secure
4. **CORS**: Configured for local development (any origin)
5. **HTTPS**: Consider adding SSL for production-like testing

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Authentication Fails

- Verify card number and password are correct
- Check EBSCO service status
- Review server logs for detailed error messages

### Proxy Requests Fail

- Ensure auth token is valid and not expired
- Check that `X-Auth-Token` header is being sent
- Verify target URL is correct

## Testing

### Test Authentication

```bash
curl -X POST http://localhost:3001/api/auth/ebsco \
  -H "Content-Type: application/json" \
  -d '{"cardNumber":"YOUR_CARD","password":"YOUR_PASSWORD"}'
```

### Test Health

```bash
curl http://localhost:3001/health
```

### Test Motor.com Proxy

```bash
curl http://localhost:3001/api/motor-proxy/api/years \
  -H "X-Auth-Token: YOUR_TOKEN"
```

## Deployment

### Vercel Deployment

This proxy server is ready for Vercel deployment! See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for complete instructions.

**Quick Deploy**:
```bash
npm install -g vercel
vercel login
vercel --prod
```

Your proxy will be available at: `https://your-project.vercel.app`

### Environment-Based Configuration

For production deployments, consider using environment variables:

```javascript
// Add to index.js
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
```

## License

ISC

---

**Note**: EBSCO authentication returns the credentials needed for Motor.com M1 API access.

**Deploy to Vercel**: See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for cloud deployment instructions.

