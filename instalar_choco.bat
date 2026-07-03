@echo off
echo Instalando Chocolatey...
powershell -NoProfile -ExecutionPolicy Bypass -Command "[System.Net.ServicePointManager]::SecurityProtocol = 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
echo.
echo Hecho! Cerra y abri de nuevo la terminal.
pause
