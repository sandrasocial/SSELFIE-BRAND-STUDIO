#!/bin/bash
cd server
npx tsx index.ts &
SERVER_PID=$!
echo "Started server with PID: $SERVER_PID"
echo $SERVER_PID > /tmp/server.pid

# Wait for server to be ready
sleep 5

# Test server
curl -s http://localhost:5000/api/health || echo "Server not responding yet"

# Keep the script running
wait $SERVER_PID