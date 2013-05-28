@echo off

rem added by GZ
set WORK_PATH=D:\nodejs_projects\star_ae_server

rem settings for star_ae_server

set AE_BIN=C:\Program Files\Adobe\Adobe After Effects CS6\Support Files
set FFMPEG_BIN=C:\ffmpeg\bin

rem Ensure this Node.js and NPM are first in the PATH
::set PATH=%APPDATA%\npm;%~dp0;%PATH%
set PATH=%APPDATA%\npm;%~dp0;%PATH%;%AE_BIN%;%FFMPEG_BIN%

rem Figure out node version and architecture and print it.
setlocal
pushd "%~dp0"
set print_version=.\node.exe -p -e "process.versions.node + ' (' + process.arch + ')'"
for /F "usebackq delims=" %%v in (`%print_version%`) do set version=%%v
echo Your environment has been set up for using Node.js %version% and NPM
popd
endlocal

rem If we're in the node.js directory, change to the user's home dir.
::if "%CD%\"=="%~dp0" cd /d "%HOMEDRIVE%%HOMEPATH%"
if "%CD%\"=="%~dp0" d: && cd /d "%WORK_PATH%"
::if "%CD%\"=="%~dp0" d: && cd /d "%DOOH_PROJECT%"
