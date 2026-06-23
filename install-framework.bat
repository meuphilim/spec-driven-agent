@echo off
setlocal

echo.
echo ========================================
echo   Spec-Driven Framework v3.1
echo   Instalador
echo ========================================
echo.

set FRAMEWORK_SRC=%~dp0
set FRAMEWORK_DST=%cd%

echo Destino: %FRAMEWORK_DST%
echo.

REM Copiar skills
if not exist "%FRAMEWORK_DST%\skills" mkdir "%FRAMEWORK_DST%\skills"
xcopy "%FRAMEWORK_SRC%skills\*" "%FRAMEWORK_DST%\skills\" /E /I /Y /Q
echo OK: skills/

REM Copiar .knowledge
if not exist "%FRAMEWORK_DST%\.knowledge" mkdir "%FRAMEWORK_DST%\.knowledge"
xcopy "%FRAMEWORK_SRC%.knowledge\*" "%FRAMEWORK_DST%\.knowledge\" /E /I /Y /Q
echo OK: .knowledge/

REM Copiar .specs
if not exist "%FRAMEWORK_DST%\.specs" mkdir "%FRAMEWORK_DST%\.specs"
xcopy "%FRAMEWORK_SRC%.specs\*" "%FRAMEWORK_DST%\.specs\" /E /I /Y /Q
echo OK: .specs/

REM Copiar .sessions
if not exist "%FRAMEWORK_DST%\.sessions" mkdir "%FRAMEWORK_DST%\.sessions"
xcopy "%FRAMEWORK_SRC%.sessions\*" "%FRAMEWORK_DST%\.sessions\" /E /I /Y /Q
echo OK: .sessions/

REM Copiar CLAUDE.md
copy "%FRAMEWORK_SRC%CLAUDE.md" "%FRAMEWORK_DST%\CLAUDE-framework.md" /Y
echo OK: CLAUDE-framework.md

echo.
echo ========================================
echo   FRAMEWORK INSTALADO!
echo ========================================
echo.
echo Proximos passos:
echo   1. Renomeie CLAUDE-framework.md para CLAUDE.md
echo   2. Ou copie o conteudo para o CLAUDE.md existente
echo.
