@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Start Up Batch script
@REM ----------------------------------------------------------------------------
@IF "%DEBUG%" == "" @ECHO OFF
@setlocal

set ERROR_CODE=0
@setlocal

set "MAVEN_PROJECTBASEDIR=%~dp0"
if "%MAVEN_PROJECTBASEDIR:~-1%"=="\" set "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"

if not "%JAVA_HOME%" == "" goto OkJHome

for %%i in (java.exe) do set "JAVACMD=%%~$PATH:i"
if not "%JAVACMD%" == "" goto checkJVersion

set "JAVACMD=java"
goto exec

:OkJHome
set "JAVACMD=%JAVA_HOME%\bin\java.exe"

:checkJVersion
if not exist "%JAVACMD%" set "JAVACMD=java"

:exec
set "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"

"%JAVACMD%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" -cp "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%
exit /B %ERROR_CODE%
