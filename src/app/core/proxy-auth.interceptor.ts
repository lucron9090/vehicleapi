import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * HTTP Interceptor that routes API requests through the proxy server
 * 
 * This interceptor:
 * 1. Intercepts all HTTP requests to the Motor.com M1 API
 * 2. Rewrites the URL to go through the local proxy server (http://localhost:3001)
 * 3. Adds the X-Auth-Token header from EBSCO authentication
 * 
 * Usage:
 * 1. Start the proxy server: cd proxy-server && npm start
 * 2. Authenticate via EBSCO: POST http://localhost:3001/api/auth/ebsco
 *    with { cardNumber: "...", password: "..." }
 * 3. Store the returned authToken in localStorage or sessionStorage
 * 4. Start Angular dev server: npm start
 * 
 * The proxy server must be running with valid EBSCO authentication.
 * EBSCO authentication returns the credentials needed for Motor.com M1 API.
 */
@Injectable()
export class ProxyAuthInterceptor implements HttpInterceptor {
  private readonly PROXY_URL = 'http://localhost:3001/api/motor-proxy';
  private readonly AUTH_TOKEN_KEY = 'motor-auth-token';
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip if the request is already going to the proxy or to external resources
    if (req.url.startsWith('http://localhost:3001') || 
        req.url.startsWith('assets/') ||
        req.url.includes('ebsco') ||
        req.url.includes('external')) {
      return next.handle(req);
    }

    // If the request is relative (starts with /api or ./api), route through proxy
    let targetUrl = req.url;
    
    // Handle relative URLs
    if (req.url.startsWith('/api') || req.url.startsWith('./api')) {
      targetUrl = req.url.replace(/^\.?\/api/, '/api');
    } else if (req.url.startsWith('.')) {
      // Handle other relative paths
      targetUrl = req.url.substring(1);
    }

    // Get auth token from storage
    const authToken = sessionStorage.getItem(this.AUTH_TOKEN_KEY) || 
                      localStorage.getItem(this.AUTH_TOKEN_KEY);

    // Create the proxied request with auth token
    const headers: any = {};
    if (authToken) {
      headers['X-Auth-Token'] = authToken;
    }

    const proxiedReq = req.clone({
      url: `${this.PROXY_URL}${targetUrl}`,
      setHeaders: headers
    });

    console.log(`[ProxyAuthInterceptor] Routing request through proxy: ${req.url} -> ${proxiedReq.url}`);

    return next.handle(proxiedReq);
  }
  
  /**
   * Store the authentication token
   * Call this after successful EBSCO authentication
   */
  static setAuthToken(token: string, useSessionStorage = true): void {
    if (useSessionStorage) {
      sessionStorage.setItem('motor-auth-token', token);
    } else {
      localStorage.setItem('motor-auth-token', token);
    }
  }
  
  /**
   * Clear the authentication token
   */
  static clearAuthToken(): void {
    sessionStorage.removeItem('motor-auth-token');
    localStorage.removeItem('motor-auth-token');
  }
}

