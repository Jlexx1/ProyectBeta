@echo off
cd /d "%~dp0"
echo ========================================
echo  ALDIA - Iniciando servidor...
echo ========================================
echo.
echo  Abri en el navegador: http://localhost:3000
echo.
echo  Admin: admin@aldia.com / Admin123!
echo.
echo  Para detener: cerrar esta ventana
echo ========================================
echo.
node server.js
pause
