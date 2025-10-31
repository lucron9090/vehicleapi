import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '~/environment';

/**
 * HTTP Interceptor that routes API requests through the proxy server
 * 
 * This interceptor:
 * 1. Intercepts all HTTP requests to the Motor.com M1 API
 * 2. Rewrites the URL to go through the proxy server (configured in environment)
 * 3. The proxy server handles authentication automatically server-side
 * 
 * Usage:
 * Development:
 * 1. Start the proxy server: cd proxy-server && npm start
 * 2. Start Angular dev server: npm start
 * 3. All requests are automatically authenticated through the proxy!
 * 
 * Production:
 * 1. Deploy proxy server to Vercel/Heroku/etc.
 * 2. Update environment.prod.ts with deployed proxy URL
 * 3. Deploy Angular app to Firebase/Vercel/etc.
 * 
 * No manual authentication needed - the proxy server handles everything!
 */
@Injectable()
export class ProxyAuthInterceptor implements HttpInterceptor {
  private readonly PROXY_URL = environment.proxyUrl;
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip if the request is already going to the proxy or to external resources
    if (req.url.startsWith(this.PROXY_URL) || 
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

    // Create the proxied request (no auth token needed - handled by proxy server!)
    const proxiedReq = req.clone({
      url: `${this.PROXY_URL}${targetUrl}`
    });

    console.log(`[ProxyAuthInterceptor] Routing request through proxy: ${req.url} -> ${proxiedReq.url}`);

    return next.handle(proxiedReq);
  }
}

