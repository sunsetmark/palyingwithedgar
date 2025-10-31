#!/bin/bash

echo "=== Restarting Edgar Online Services (HTTPS) ==="

# Kill only our specific node processes (not Cursor)
echo "Stopping Edgar Online services..."
pkill -f "vite" 2>/dev/null || true
pkill -f "nodemon.*edgaronline" 2>/dev/null || true
sleep 2

# Navigate to frontend directory
cd /home/ec2-user/poc/code/edgaronline

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
# Frontend Environment Variables
# Use relative path for API to leverage Vite proxy
VITE_API_URL=/api
EOF
fi

# Clear Vite cache
echo "Clearing Vite cache..."
rm -rf node_modules/.vite

# Start backend API
echo "Starting backend API on port 3001..."
cd /home/ec2-user/poc/code/edgaronline_api
nohup npm run dev > /tmp/edgaronline_api.log 2>&1 &
API_PID=$!
echo "Backend API started (PID: $API_PID)"

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend on port 3000..."
cd /home/ec2-user/poc/code/edgaronline
nohup npm run dev > /tmp/edgaronline_frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

# Wait for services to initialize
sleep 3

echo ""
echo "=== Services Started (HTTPS) ==="
echo "Backend API:  https://54.175.98.68:3001 (PID: $API_PID) 🔒"
echo "Frontend:     https://54.175.98.68:3000 (PID: $FRONTEND_PID) 🔒"
echo ""
echo "⚠️  Browser Security Warning:"
echo "    You'll see a certificate warning due to self-signed certificate."
echo "    Click 'Advanced' → 'Proceed to site' to continue."
echo ""
echo "SSL Certificate Location: /home/ec2-user/poc/ssl/"
echo "  Valid until: October 30, 2030 (5 years)"
echo ""
echo "View logs:"
echo "  Backend:  tail -f /tmp/edgaronline_api.log"
echo "  Frontend: tail -f /tmp/edgaronline_frontend.log"
echo ""
echo "Check status:"
ps aux | grep -E 'node|npm' | grep -v grep


