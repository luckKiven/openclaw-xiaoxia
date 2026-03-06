@echo off
rem OpenClaw Gateway (v2026.2.27)
set "TMPDIR=C:\Users\14015\AppData\Local\Temp"
set "PATH=C:\Users\14015\.local\bin;C:\Program Files\YunMai\utils;g:\Cursor\cursor\resources\app\bin;C:\Program Files\Common Files\Oracle\Java\javapath;G:\oracle\WINDOWS.X64_193000_db_home\bin;C:\Program Files (x86)\VMware\VMware Workstation\bin\;C:\ProgramData\Oracle\Java\javapath;C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0\;C:\Windows\System32\OpenSSH\;C:\Program Files (x86)\NVIDIA Corporation\PhysX\Common;C:\Program Files\NVIDIA Corporation\NVIDIA NvDLISR;C:\Program Files\Java\jdk1.8.0_161\bin;C:\Program Files\MariaDB 10.3\bin;C:\Program Files\Git\cmd;C:\Program Files\nvm\v10.19.0;C:\Users\14015\AppData\Roaming\npm\node_modules;C:\WINDOWS\system32;C:\WINDOWS;C:\WINDOWS\System32\Wbem;C:\WINDOWS\System32\WindowsPowerShell\v1.0\;C:\WINDOWS\System32\OpenSSH\;G:\javaInstall\apache-maven-3.6.3\bin;G:\wechat\微信web开发者工具\dll;C:\ProgramData\chocolatey\bin;C:\Program Files\dotnet\;C:\Users\14015\AppData\Local\Programs\Python\Python310;C:\Program Files\Microsoft SQL Server\150;c:\Users\14015\AppData\Local\Programs\cursor\resources\app\bin;g:\Cursor\gitinstall\cursor\resources\app\bin;G:\conda\condabin;C:\Users\14015\AppData\Local\Programs\Python\Python311\Scripts;C:\Program Files\Java\jdk-21\bin;C:\Program Files\MySQL\MySQL Shell 8.0\bin\;C:\Users\14015\AppData\Local\Programs\Python\Python310\Scripts\;C:\Users\14015\AppData\Local\Programs\Python\Python310\;C:\Users\14015\AppData\Local\Microsoft\WindowsApps;G:\vs\Microsoft VS Code\bin;G:\nvm;G:\nodejs;E:\Ollama;G:\cursor\cursor\resources\app\bin;C:\Users\14015\AppData\Local\Pandoc\;C:\Users\14015\.local\\bin"
set "OPENCLAW_CONFIG=G:\openClaw\xiaoxia\openclaw.json"
set "OPENCLAW_GATEWAY_PORT=18788"
set "OPENCLAW_GATEWAY_TOKEN=8479d410f4a27ab8a9a4e863ef4c05c86b0efd137dcdb880"
set "OPENCLAW_SYSTEMD_UNIT=openclaw-gateway.service"
set "OPENCLAW_SERVICE_MARKER=openclaw"
set "OPENCLAW_SERVICE_KIND=gateway"
set "OPENCLAW_SERVICE_VERSION=2026.2.27"
G:\nodejs\node.exe G:\openClaw\xiaoxia\dist\entry.js gateway --port 18788
