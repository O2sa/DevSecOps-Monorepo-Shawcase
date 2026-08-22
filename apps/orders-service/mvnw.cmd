@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------
@IF "%DEBUG%" == "" @ECHO OFF
@setlocal

set ERROR_CODE=0

@REM To isolate internal variables from possible post scripts, we use another setlocal
@setlocal

@REM ==== START VALIDATION ====
if not "%JAVA_HOME%" == "" goto OkJHome

for %%i in (java.exe) do set "JAVACMD=%%~$PATH:i"
if not "%JAVACMD%" == "" goto checkJVersion

echo.
echo Error: JAVA_HOME is not defined correctly.
echo We cannot execute java
echo.
goto error

:OkJHome
set "JAVACMD=%JAVA_HOME%\bin\java.exe"

:checkJVersion
if exist "%JAVACMD%" goto chkMHome

echo.
echo Error: JAVA_HOME is not defined correctly.
echo We cannot execute "%JAVACMD%"
echo.
goto error

:chkMHome
set "MAVEN_PROJECTBASEDIR=%~dp0"
if "%MAVEN_PROJECTBASEDIR%" == "" goto error

"%JAVACMD%" -version >nul 2>&1
if ERRORLEVEL 1 goto error

@REM Fallback to standard mvn or wrapper
mvn %*
if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%
exit /B %ERROR_CODE%
