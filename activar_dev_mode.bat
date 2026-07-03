@echo off
title Activar Modo Desarrollador
echo Intentando activar Modo Desarrollador via registro...
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" /t REG_DWORD /v AllowDevelopmentWithoutDevLicense /d 1 /f >nul 2>&1
if %errorlevel% == 0 (
    echo Modo Desarrollador activado exitosamente.
) else (
    echo No se pudo activar automaticamente (sin permisos de admin).
    echo Abriendo configuracion manual...
    start ms-settings:developers
    echo.
    echo En la ventana que se abrio, activa "Modo Desarrollador".
    echo Luego ejecuta la app Flutter de nuevo.
)
pause
