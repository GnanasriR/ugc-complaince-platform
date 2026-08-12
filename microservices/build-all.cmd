@echo off
echo ========================================================
echo Building UGC Compliance Microservices Architecture...
echo ========================================================
cd /d "%~dp0"
call mvn clean package -DskipTests
echo.
echo Microservices built successfully!
pause
