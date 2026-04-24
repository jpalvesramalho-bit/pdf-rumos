@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Comprimir PDFs

set "BASE_DIR=%~dp0"
set "INPUT_DIR=%BASE_DIR%entrada"
set "OUTPUT_DIR=%BASE_DIR%saida"

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

set /a PDF_COUNT=0
for /f "delims=" %%F in ('dir /b /a-d /on "%INPUT_DIR%\*.pdf" 2^>nul') do (
    set /a PDF_COUNT+=1
)

if %PDF_COUNT% EQU 0 (
    echo Nenhum PDF encontrado em:
    echo %INPUT_DIR%
    echo.
    echo Coloque um ou mais arquivos PDF na pasta "entrada" e execute novamente.
    goto :success_end
)

echo Encontrados %PDF_COUNT% arquivo(s) para compressao.
echo.

set /a SUCCESS_COUNT=0
set /a ERROR_COUNT=0

for /f "delims=" %%F in ('dir /b /a-d /on "%INPUT_DIR%\*.pdf" 2^>nul') do (
    set "INPUT_FILE=%INPUT_DIR%\%%F"
    set "OUTPUT_FILE=%OUTPUT_DIR%\%%~nF_comprimido.pdf"

    if exist "!OUTPUT_FILE!" del /q "!OUTPUT_FILE!" >nul 2>nul

    echo Comprimindo: %%F
    "%MUTOOL_EXE%" clean -gggg -z -f -i -c -m "!INPUT_FILE!" "!OUTPUT_FILE!"

    if errorlevel 1 (
        echo Falha ao comprimir: %%F
        if exist "!OUTPUT_FILE!" del /q "!OUTPUT_FILE!" >nul 2>nul
        set /a ERROR_COUNT+=1
    ) else (
        echo Arquivo salvo em: !OUTPUT_FILE!
        set /a SUCCESS_COUNT+=1
    )

    echo.
)

echo Processo finalizado.
echo Sucesso(s): %SUCCESS_COUNT%
echo Falha(s): %ERROR_COUNT%
echo.
echo Observacao: alguns PDFs podem reduzir pouco, dependendo de como foram gerados originalmente.
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
