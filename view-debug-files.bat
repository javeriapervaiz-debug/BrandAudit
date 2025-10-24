@echo off
echo Opening debug text files directory...
if exist "debug-text-files" (
    explorer debug-text-files
) else (
    echo Debug directory not found. It will be created when you upload your first PDF.
    pause
)
