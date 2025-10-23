#!/bin/bash

# Development startup script for Motor.com M1 Angular App with Proxy Server
# This script starts both the proxy server and the Angular development server

set -e

echo "🚀 Starting Motor.com M1 Development Environment"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROXY_DIR="$SCRIPT_DIR/proxy-server"

# Function to cleanup on exit
cleanup() {
  echo ""
  echo "🛑 Shutting down servers..."
  if [ ! -z "$PROXY_PID" ]; then
    kill $PROXY_PID 2>/dev/null || true
  fi
  if [ ! -z "$ANGULAR_PID" ]; then
    kill $ANGULAR_PID 2>/dev/null || true
  fi
  echo "✅ Servers stopped"
  exit 0
}

# Setup trap to catch CTRL+C and other termination signals
trap cleanup SIGINT SIGTERM EXIT

# Check if proxy server directory exists
if [ ! -d "$PROXY_DIR" ]; then
  echo -e "${YELLOW}⚠️  Warning: Proxy server directory not found at $PROXY_DIR${NC}"
  echo "Please ensure the cruis-api proxy server is installed."
  exit 1
fi

# Start proxy server
echo -e "${BLUE}📡 Starting proxy server on http://localhost:3001${NC}"

# Check for EBSCO_PASSWORD environment variable
if [ -z "$EBSCO_PASSWORD" ]; then
  echo -e "${YELLOW}⚠️  EBSCO_PASSWORD not set - proxy will require manual configuration${NC}"
  echo "   To enable automatic authentication, set EBSCO_PASSWORD:"
  echo "   EBSCO_PASSWORD=\"your_password\" ./start-dev.sh"
  echo ""
fi

cd "$PROXY_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing proxy server dependencies..."
  npm install
fi

# Pass environment variables to proxy server
EBSCO_PASSWORD="$EBSCO_PASSWORD" npm start > /tmp/proxy-server.log 2>&1 &
PROXY_PID=$!

# Wait for proxy server to start
echo "⏳ Waiting for proxy server to start..."
sleep 3

# Check if proxy server is running
if ! kill -0 $PROXY_PID 2>/dev/null; then
  echo -e "${YELLOW}❌ Failed to start proxy server${NC}"
  echo "Check logs at: /tmp/proxy-server.log"
  cat /tmp/proxy-server.log
  exit 1
fi

echo -e "${GREEN}✅ Proxy server started (PID: $PROXY_PID)${NC}"
echo ""

# Start Angular development server
echo -e "${BLUE}🅰️  Starting Angular development server on http://localhost:4200${NC}"
cd "$SCRIPT_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing Angular dependencies..."
  npm install
fi

npm start > /tmp/angular-dev.log 2>&1 &
ANGULAR_PID=$!

echo -e "${GREEN}✅ Angular dev server started (PID: $ANGULAR_PID)${NC}"
echo ""

echo "================================================"
echo -e "${GREEN}🎉 Development environment is ready!${NC}"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Open browser to: http://localhost:4200"
echo ""
echo "2. Start using the app!"
echo "   ✅ Authentication is handled automatically by the proxy"
echo "   ✅ No need to manually authenticate or set tokens"
echo ""
echo "📊 Server Status:"
echo "   Proxy Server:  http://localhost:3001 (PID: $PROXY_PID)"
echo "   Angular App:   http://localhost:4200 (PID: $ANGULAR_PID)"
echo ""
echo "🔐 Authentication:"
echo "   Library Card:  1001600244772"
echo "   Mode:          Automatic (server-side)"
echo ""
echo "📋 Logs:"
echo "   Proxy:   tail -f /tmp/proxy-server.log"
echo "   Angular: tail -f /tmp/angular-dev.log"
echo ""
echo "💡 Note: If authentication fails, check proxy logs or set EBSCO_PASSWORD:"
echo "   EBSCO_PASSWORD=\"your_password\" ./start-dev.sh"
echo ""
echo "🛑 Press CTRL+C to stop both servers"
echo "================================================"

# Wait indefinitely (until CTRL+C)
wait

