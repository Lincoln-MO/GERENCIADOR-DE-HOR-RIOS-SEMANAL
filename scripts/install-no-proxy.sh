#!/usr/bin/env bash
set -euo pipefail

echo "[timeplanner] Running npm install without proxy environment variables (Option D)"
env -u HTTP_PROXY \
    -u HTTPS_PROXY \
    -u http_proxy \
    -u https_proxy \
    -u npm_config_http_proxy \
    -u npm_config_https_proxy \
    npm install