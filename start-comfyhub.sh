#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
API_DIR="$ROOT/server"
WEB_DIR="$ROOT/front-end"

install_if_needed() {
  if [ ! -d "$1/node_modules" ]; then
    echo "Installing dependencies in $1 ..."
    npm install --prefix "$1"
  fi
}

install_if_needed "$API_DIR"
install_if_needed "$WEB_DIR"

echo "Starting ComfyHub API ..."
(cd "$API_DIR" && npm run dev) &
API_PID=$!

echo "Starting ComfyHub web app ..."
(cd "$WEB_DIR" && npm run dev) &
WEB_PID=$!

trap 'kill "$API_PID" "$WEB_PID" 2>/dev/null || true' EXIT

LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || true)"
[ -n "$LAN_IP" ] || LAN_IP="localhost"

echo ""
echo "ComfyHub is starting."
echo "On this device:  http://localhost:5173"
echo "On same Wi-Fi:   http://${LAN_IP}:5173"
echo "Built app only:  http://localhost:4000 (after npm run build in front-end)"
echo ""
echo "Press Ctrl+C to stop both servers."

wait
