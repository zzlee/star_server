@echo off

rem added by GZ
set AE_BIN=C:\Program Files\Adobe\Adobe After Effects CS6\Support Files
set AE_PROJECT=D:\nodejs_projects\i_am_a_super_star
set FFMPEG_BIN=C:\ffmpeg\bin
set HOME=C:\Users\feltmengtest
set DOOH_PROJECT=D:\nodejs_projects\star_dooh
set DOOH_PLAYER=C:\Program Files\Windows Media Player\wmplayer.exe
set STAR_SERVER=www.feltmeng.idv.tw
set STAR_FTP_ID=i_am_a_super_star
set STAR_FTP_PSW=fm@27111650


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

rem If we're in the node.js directory, change to AE project  dir.
if "%CD%\"=="%~dp0" d: && cd /d "%AE_PROJECT%"