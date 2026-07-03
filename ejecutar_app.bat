@echo off
title ALDIA App
echo Iniciando servidor...
start /min cmd /c "cd /d D:\ALDIA && node server.js"
echo Servidor iniciado en http://localhost:3000
echo.
echo Iniciando app Flutter...
cd /d D:\ALDIA\flutter_app
D:\ALDIA\flutter_sdk\flutter\bin\flutter.bat run -d windows
pause
