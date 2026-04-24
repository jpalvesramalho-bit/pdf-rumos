@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Unir PDFs

set "BASE_DIR=%~dp0"
set "INPUT_DIR=%BASE_DIR%entrada"
set "OUTPUT_DIR=%BASE_DIR%saida"
set "OUTPUT_FILE=%OUTPUT_DIR%\pdfs_unidos.pdf"

if not exist "%INPUT_DIR%" mkdir "%INPUT_DIR%"
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

call :find_mutool
if not defined MUTOOL_EXE (
    echo Nao foi possivel localizar o mutool.exe.
    echo.
    echo Instale a ferramenta com:
    echo winget install --id ArtifexSoftware.mutool
    goto :error_end
)

set "MERGE_INPUTS="
set /a PDF_COUNT=0

for /f "delims=" %%F in ('dir /b /a-d /on "%INPUT_DIR%\*.pdf" 2^>nul') do (
    set /a PDF_COUNT+=1
    echo !PDF_COUNT!. %%F
    set "MERGE_INPUTS=!MERGE_INPUTS! "%INPUT_DIR%\%%F""
)

if %PDF_COUNT% EQU 0 (
    echo Nenhum PDF encontrado em:
    echo %INPUT_DIR%
    echo.
    echo Coloque os arquivos PDF na pasta "entrada" e execute novamente.
    goto :success_end
)

echo.
echo Unindo %PDF_COUNT% arquivo(s) em ordem alfabetica...

if exist "%OUTPUT_FILE%" del /q "%OUTPUT_FILE%" >nul 2>nul

"%MUTOOL_EXE%" merge -o "%OUTPUT_FILE%" -O compress,compress-fonts,compress-images,linearize,garbage=deduplicate %MERGE_INPUTS%

if errorlevel 1 (
    echo Falha ao unir os PDFs.
    if exist "%OUTPUT_FILE%" del /q "%OUTPUT_FILE%" >nul 2>nul
    goto :error_end
)

echo.
echo Arquivo gerado com sucesso em:
echo %OUTPUT_FILE%
goto :success_end

:find_mutool
set "MUTOOL_EXE="

for %%I in (mutool.exe) do (
    if not defined MUTOOL_EXE set "MUTOOL_EXE=%%~$PATH:I"
)

if not defined MUTOOL_EXE (
    for /f "delims=" %%I in ('where.exe /r "%LOCALAPPDATA%\Microsoft\WinGet\Packages" mutool.exe 2^>nul') do (
        if not defined MUTOOL_EXE set "MUTOOL_EXE=%%I"
    )
)

if not defined MUTOOL_EXE if exist "%ProgramFiles%\MuPDF\mutool.exe" set "MUTOOL_EXE=%ProgramFiles%\MuPDF\mutool.exe"
if not defined MUTOOL_EXE if exist "%ProgramFiles(x86)%\MuPDF\mutool.exe" set "MUTOOL_EXE=%ProgramFiles(x86)%\MuPDF\mutool.exe"

exit /b

:error_end
echo.
pause
exit /b 1

:success_end
echo.
pause
exit /b 0
