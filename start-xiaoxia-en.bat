@echo off
echo Starting XiaoXia (Little Shrimp)...
echo Port: 18788
echo.

set OPENCLAW_PORT=18788
set OPENCLAW_SKIP_CHANNELS=1
set CLAWDBOT_SKIP_CHANNELS=1

node scripts/run-node.mjs gateway

pause