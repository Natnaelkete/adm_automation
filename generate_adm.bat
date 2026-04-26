@echo off
echo Starting ADM Document Generation...
python main.py %*
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Generation complete. Check the 'outputs' folder.
) else (
    echo.
    echo Error occurred during generation.
)
pause
