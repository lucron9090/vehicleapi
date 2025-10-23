const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001;

// ============================================================================
// AUTO-AUTHENTICATION CONFIGURATION
// ============================================================================
// The proxy server will automatically authenticate using these credentials
// and maintain the session for all incoming requests.
// 
// Set these via environment variables or hardcode for development:
const AUTO_AUTH_CONFIG = {
  enabled: true,
  cardNumber: process.env.EBSCO_CARD_NUMBER || '1001600244772',
  password: process.env.EBSCO_PASSWORD || '', // SET THIS PASSWORD!
};

// Server-side session storage
let serverSession = {
  authToken: null,
  expiresAt: null,
  isAuthenticating: false,
};

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to extract cookies from response headers
function extractCookies(headers) {
  const setCookieHeader = headers['set-cookie'];
  if (!setCookieHeader) return '';
  
  return setCookieHeader.map(cookie => cookie.split(';')[0]).join('; ');
}

// Helper function to extract specific cookie value by name
function getCookieValue(cookies, name) {
  const cookieArray = cookies.split('; ');
  for (const cookie of cookieArray) {
    const [key, value] = cookie.split('=');
    if (key === name) {
      return value;
    }
  }
  return null;
}

// ============================================================================
// AUTOMATIC AUTHENTICATION
// ============================================================================

/**
 * Performs EBSCO authentication and stores the session server-side
 * This is called automatically when the server starts or when the session expires
 */
async function performAutoAuthentication() {
  if (!AUTO_AUTH_CONFIG.enabled) {
    console.log('⚠️  Auto-authentication is disabled');
    return false;
  }

  if (!AUTO_AUTH_CONFIG.password) {
    console.log('⚠️  Auto-authentication enabled but password not set!');
    console.log('   Set EBSCO_PASSWORD environment variable or update AUTO_AUTH_CONFIG in index.js');
    return false;
  }

  if (serverSession.isAuthenticating) {
    console.log('⏳ Authentication already in progress...');
    return false;
  }

  serverSession.isAuthenticating = true;

  try {
    console.log('🔐 Performing automatic EBSCO authentication...');
    console.log(`   Card Number: ${AUTO_AUTH_CONFIG.cardNumber}`);

    const { cardNumber, password } = AUTO_AUTH_CONFIG;

    // Step 1: GET login page and save cookies
    const requestIdentifier = uuidv4();
    const loginUrl = `https://login.ebsco.com/?custId=s5672256&groupId=main&profId=autorepso&requestIdentifier=${requestIdentifier}`;
    
    console.log('   Step 1: Getting login page...');
    const loginPageResponse = await axios.get(loginUrl, {
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400
    });
    
    const cookies = extractCookies(loginPageResponse.headers);

    // Step 2: POST to login API with card number
    console.log('   Step 2: Submitting card number...');
    const nextStepUrl = 'https://login.ebsco.com/api/login/v1/prompted/next-step';
    const nextStepResponse = await axios.post(
      nextStepUrl,
      {
        action: 'signin',
        values: {
          prompt: cardNumber
        }
      },
      {
        headers: {
          'Cookie': cookies,
          'Content-Type': 'application/json'
        },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400
      }
    );

    // Update cookies if new ones were set
    let updatedCookies = cookies;
    if (nextStepResponse.headers['set-cookie']) {
      const newCookies = extractCookies(nextStepResponse.headers);
      updatedCookies = newCookies || cookies;
    }

    // Step 3: Submit password
    console.log('   Step 3: Submitting password...');
    const passwordResponse = await axios.post(
      nextStepUrl,
      {
        action: 'signin',
        values: {
          prompt: password
        }
      },
      {
        headers: {
          'Cookie': updatedCookies,
          'Content-Type': 'application/json'
        },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400
      }
    );

    // Extract the auth token
    let authToken = null;
    
    if (passwordResponse.headers['set-cookie']) {
      const finalCookies = extractCookies(passwordResponse.headers);
      authToken = getCookieValue(finalCookies, 'ebsco-auth') || 
                  getCookieValue(finalCookies, 'authToken') ||
                  finalCookies;
    }

    if (!authToken && passwordResponse.data) {
      if (passwordResponse.data.authToken) {
        authToken = passwordResponse.data.authToken;
      } else if (passwordResponse.data.token) {
        authToken = passwordResponse.data.token;
      }
    }

    // Follow redirect if present
    if (passwordResponse.headers.location) {
      console.log('   Step 4: Following redirect...');
      const redirectResponse = await axios.get(passwordResponse.headers.location, {
        headers: {
          'Cookie': updatedCookies
        },
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400
      });

      if (redirectResponse.headers['set-cookie']) {
        const redirectCookies = extractCookies(redirectResponse.headers);
        authToken = getCookieValue(redirectCookies, 'ebsco-auth') || 
                    getCookieValue(redirectCookies, 'authToken') ||
                    redirectCookies;
      }
    }

    if (!authToken) {
      console.error('❌ Auto-authentication failed - no auth token received');
      serverSession.isAuthenticating = false;
      return false;
    }

    // Store the session server-side
    serverSession.authToken = authToken;
    // EBSCO sessions typically last 30 minutes, set expiration to 25 minutes to be safe
    serverSession.expiresAt = Date.now() + (25 * 60 * 1000);
    serverSession.isAuthenticating = false;

    console.log('✅ Auto-authentication successful!');
    console.log(`   Session expires at: ${new Date(serverSession.expiresAt).toLocaleTimeString()}`);
    
    return true;

  } catch (error) {
    console.error('❌ Auto-authentication error:', error.message);
    serverSession.isAuthenticating = false;
    return false;
  }
}

/**
 * Checks if the current session is valid, and re-authenticates if needed
 */
async function ensureAuthenticated() {
  // Check if session is still valid
  if (serverSession.authToken && serverSession.expiresAt > Date.now()) {
    return serverSession.authToken;
  }

  // Session expired or doesn't exist, re-authenticate
  console.log('🔄 Session expired or not found, re-authenticating...');
  const success = await performAutoAuthentication();
  
  if (success) {
    return serverSession.authToken;
  }
  
  return null;
}

// POST /api/auth/ebsco - EBSCO authentication endpoint
app.post('/api/auth/ebsco', async (req, res) => {
  try {
    const { cardNumber, password } = req.body;
    
    if (!cardNumber || !password) {
      return res.status(400).json({ error: 'cardNumber and password are required' });
    }

    // Step 1: GET login page and save cookies
    const requestIdentifier = uuidv4();
    const loginUrl = `https://login.ebsco.com/?custId=s5672256&groupId=main&profId=autorepso&requestIdentifier=${requestIdentifier}`;
    
    console.log('Step 1: Getting login page...');
    const loginPageResponse = await axios.get(loginUrl, {
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400
    });
    
    const cookies = extractCookies(loginPageResponse.headers);
    console.log('Cookies received:', cookies);

    // Step 2: POST to login API with card number
    console.log('Step 2: Submitting card number...');
    const nextStepUrl = 'https://login.ebsco.com/api/login/v1/prompted/next-step';
    const nextStepResponse = await axios.post(
      nextStepUrl,
      {
        action: 'signin',
        values: {
          prompt: cardNumber
        }
      },
      {
        headers: {
          'Cookie': cookies,
          'Content-Type': 'application/json'
        },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400
      }
    );

    // Update cookies if new ones were set
    let updatedCookies = cookies;
    if (nextStepResponse.headers['set-cookie']) {
      const newCookies = extractCookies(nextStepResponse.headers);
      updatedCookies = newCookies || cookies;
    }

    // Step 3: Submit password (if needed - there might be another step)
    console.log('Step 3: Submitting password...');
    const passwordResponse = await axios.post(
      nextStepUrl,
      {
        action: 'signin',
        values: {
          prompt: password
        }
      },
      {
        headers: {
          'Cookie': updatedCookies,
          'Content-Type': 'application/json'
        },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400
      }
    );

    // Extract the ebsco-auth-cookie or similar auth token from the response
    let authToken = null;
    
    // Check for redirect and extract cookies
    if (passwordResponse.headers['set-cookie']) {
      const finalCookies = extractCookies(passwordResponse.headers);
      console.log('Final cookies:', finalCookies);
      
      // Try to extract the auth cookie (common names: ebsco-auth, authToken, etc.)
      authToken = getCookieValue(finalCookies, 'ebsco-auth') || 
                  getCookieValue(finalCookies, 'authToken') ||
                  finalCookies; // If specific cookie not found, return all cookies
    }

    // Check response data for auth token
    if (!authToken && passwordResponse.data) {
      if (passwordResponse.data.authToken) {
        authToken = passwordResponse.data.authToken;
      } else if (passwordResponse.data.token) {
        authToken = passwordResponse.data.token;
      }
    }

    // If we have a redirect location, follow it to get the final auth token
    if (passwordResponse.headers.location) {
      console.log('Following redirect to:', passwordResponse.headers.location);
      const redirectResponse = await axios.get(passwordResponse.headers.location, {
        headers: {
          'Cookie': updatedCookies
        },
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400
      });

      if (redirectResponse.headers['set-cookie']) {
        const redirectCookies = extractCookies(redirectResponse.headers);
        authToken = getCookieValue(redirectCookies, 'ebsco-auth') || 
                    getCookieValue(redirectCookies, 'authToken') ||
                    redirectCookies;
      }
    }

    if (!authToken) {
      return res.status(401).json({ error: 'Authentication failed - no auth token received' });
    }

    console.log('Authentication successful!');
    res.json({ authToken });

  } catch (error) {
    console.error('EBSCO authentication error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ 
      error: 'Authentication failed',
      message: error.message 
    });
  }
});

// GET /api/ebsco-proxy/* - Proxy endpoint for EBSCO resources
// Now uses AUTOMATIC server-side authentication - no X-Auth-Token header needed!
app.all('/api/ebsco-proxy/*', async (req, res) => {
  try {
    // Get or refresh the server-side authentication token
    const authToken = await ensureAuthenticated();
    
    if (!authToken) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Unable to authenticate with EBSCO. Check server logs for details.'
      });
    }

    // Extract the path after /api/ebsco-proxy/
    const targetPath = req.path.replace('/api/ebsco-proxy/', '');
    const targetUrl = `https://${targetPath}`;

    console.log(`🔄 Proxying ${req.method} request to: ${targetUrl}`);

    // Forward the request with the server-side auth token as a cookie
    const proxyConfig = {
      method: req.method,
      url: targetUrl,
      headers: {
        ...req.headers,
        'Cookie': authToken,
        'host': undefined, // Remove original host header
        'x-auth-token': undefined // Remove custom header if present
      },
      data: req.body,
      params: req.query,
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 600 // Accept all statuses
    };

    const proxyResponse = await axios(proxyConfig);

    // Forward response headers (except connection-related ones)
    const headersToForward = { ...proxyResponse.headers };
    delete headersToForward['connection'];
    delete headersToForward['transfer-encoding'];
    
    res.status(proxyResponse.status).set(headersToForward).send(proxyResponse.data);

  } catch (error) {
    console.error('❌ EBSCO proxy error:', error.message);
    if (error.response) {
      res.status(error.response.status).json({
        error: 'Proxy request failed',
        message: error.message,
        status: error.response.status
      });
    } else {
      res.status(500).json({
        error: 'Proxy request failed',
        message: error.message
      });
    }
  }
});

// ALL /api/motor-proxy/* - Proxy endpoint for Motor.com M1 API
// Now uses AUTOMATIC server-side authentication - no X-Auth-Token header needed!
app.all('/api/motor-proxy/*', async (req, res) => {
  try {
    // Get or refresh the server-side authentication token
    const authToken = await ensureAuthenticated();
    
    if (!authToken) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Unable to authenticate with EBSCO. Check server logs for details.'
      });
    }

    // Extract the path after /api/motor-proxy/
    const targetPath = req.path.replace('/api/motor-proxy', '');
    const targetUrl = `https://sites.motor.com/m1${targetPath}`;

    console.log(`🔄 Proxying ${req.method} request to: ${targetUrl}`);

    // Forward the request with the server-side auth token as a cookie
    const proxyConfig = {
      method: req.method,
      url: targetUrl,
      headers: {
        ...req.headers,
        'Cookie': authToken,
        'host': undefined, // Remove original host header
        'x-auth-token': undefined // Remove custom header if present
      },
      data: req.body,
      params: req.query,
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 600 // Accept all statuses
    };

    const proxyResponse = await axios(proxyConfig);

    // Forward response headers (except connection-related ones)
    const headersToForward = { ...proxyResponse.headers };
    delete headersToForward['connection'];
    delete headersToForward['transfer-encoding'];
    
    res.status(proxyResponse.status).set(headersToForward).send(proxyResponse.data);

  } catch (error) {
    console.error('❌ Motor proxy error:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
      res.status(error.response.status).json({
        error: 'Proxy request failed',
        message: error.message,
        status: error.response.status,
        data: error.response.data
      });
    } else {
      res.status(500).json({
        error: 'Proxy request failed',
        message: error.message
      });
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const sessionStatus = serverSession.authToken ? 'authenticated' : 'not authenticated';
  const expiresIn = serverSession.expiresAt 
    ? Math.round((serverSession.expiresAt - Date.now()) / 1000 / 60) 
    : 0;
  
  res.json({ 
    status: 'ok',
    autoAuth: AUTO_AUTH_CONFIG.enabled,
    session: sessionStatus,
    expiresInMinutes: expiresIn > 0 ? expiresIn : 0
  });
});

// Start server
app.listen(PORT, async () => {
  console.log('\n' + '='.repeat(70));
  console.log(`🚀 Motor.com M1 Proxy Server`);
  console.log('='.repeat(70));
  console.log(`\n📡 Server running on: http://localhost:${PORT}\n`);
  
  console.log(`🔐 Authentication Mode: ${AUTO_AUTH_CONFIG.enabled ? 'AUTOMATIC' : 'MANUAL'}`);
  
  if (AUTO_AUTH_CONFIG.enabled) {
    console.log(`   Card Number: ${AUTO_AUTH_CONFIG.cardNumber}`);
    console.log(`   Password: ${AUTO_AUTH_CONFIG.password ? '***SET***' : '⚠️  NOT SET!'}\n`);
    
    if (AUTO_AUTH_CONFIG.password) {
      console.log('🔄 Initializing automatic authentication...\n');
      await performAutoAuthentication();
    } else {
      console.log('⚠️  WARNING: Password not configured!');
      console.log('   Set EBSCO_PASSWORD environment variable or update index.js\n');
    }
  }
  
  console.log('📡 Available endpoints:');
  console.log(`   Motor.com Proxy: *    http://localhost:${PORT}/api/motor-proxy/*`);
  console.log(`   EBSCO Proxy:     *    http://localhost:${PORT}/api/ebsco-proxy/*`);
  console.log(`   Manual Auth:     POST http://localhost:${PORT}/api/auth/ebsco`);
  console.log(`   Health Check:    GET  http://localhost:${PORT}/health\n`);
  
  if (AUTO_AUTH_CONFIG.enabled && AUTO_AUTH_CONFIG.password) {
    console.log('✅ Frontend requests will be automatically authenticated!');
    console.log('   No need to pass X-Auth-Token headers.\n');
  } else {
    console.log('ℹ️  Manual authentication required for requests.\n');
  }
  
  console.log('='.repeat(70) + '\n');
});


