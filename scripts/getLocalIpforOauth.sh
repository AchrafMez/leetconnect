#!/usr/bin/env bash
set -euo pipefail

get_local_ip() {
  local ipaddr
  # Prefer `ip` (iproute2)
  if command -v ip >/dev/null 2>&1; then
    ipaddr=$(ip -4 addr show scope global | awk '/inet /{print $2}' | cut -d/ -f1 | head -n1 || true)
  fi
  # macOS specific (using the command you provided)
  if [ -z "${ipaddr:-}" ] && command -v ipconfig >/dev/null 2>&1; then
    ipaddr=$(ipconfig getifaddr en1 2>/dev/null || true)
  fi
  # Fallback to `hostname -I` if available and returns something
  if [ -z "${ipaddr:-}" ] && command -v hostname >/dev/null 2>&1; then
    ipaddr=$(hostname -I 2>/dev/null | awk '{print $1}' || true)
  fi
  # NetworkManager fallback
  if [ -z "${ipaddr:-}" ] && command -v nmcli >/dev/null 2>&1; then
    ipaddr=$(nmcli -g IP4.ADDRESS device show | sed -n '1p' | cut -d/ -f1 || true)
  fi
  # getent fallback using hostname lookup
  if [ -z "${ipaddr:-}" ]; then
    ipaddr=$(getent hosts "$(hostname)" 2>/dev/null | awk '{print $1}' | head -n1 || true)
  fi
  # final fallback
  if [ -z "${ipaddr:-}" ]; then
    ipaddr="127.0.0.1"
  fi
  printf '%s' "$ipaddr"
}

LOCAL_IP=$(get_local_ip)

cat > .env.ip <<EOF
# Network Config for current machine
FRONTEND_URL=https://${LOCAL_IP}
INTRA_CALLBACK_URL=https://${LOCAL_IP}/api/auth/42/callback
EOF

echo "Environment configured for IP: ${LOCAL_IP}"