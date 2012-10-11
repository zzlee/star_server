:: %1: project ID
:: %2: working_project (ex: xxx.aep)
:: %3: compositon
:: %4: output (xxx.avi)

@echo off
set AE_PROJECT=%~dp0
afterfx -r %AE_PROJECT%\ae_replace.jsx
aerender -reuse -project %2 -comp %3 -output %4
ffmpeg -i %AE_PROJECT%\public\contents\user_project\%1\%1.avi -acodec aac -b:a 128k -vcodec mpeg4 -b:v 10M -y  %AE_PROJECT%\public\contents\user_project\%1\%1.mp4
