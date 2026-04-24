$ErrorActionPreference = "Stop"

$siteDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $siteDir
$distDir = Join-Path $rootDir "Pacote-Envio-PdfRumos"
$zipPath = Join-Path $rootDir "PdfRumos-Offline-Pronto-Para-Enviar.zip"

function Get-FileText {
    param([string]$Path)
    return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
}

function Escape-ScriptText {
    param([string]$Text)
    return $Text -replace "</script>", "<\/script>"
}

$indexHtml = Get-FileText (Join-Path $siteDir "index.html")
$stylesCss = Get-FileText (Join-Path $siteDir "styles.css")
$appJs = Get-FileText (Join-Path $siteDir "app.js")
$pdfLibJs = Escape-ScriptText (Get-FileText (Join-Path $siteDir "vendor\pdf-lib.min.js"))
$jsZipJs = Escape-ScriptText (Get-FileText (Join-Path $siteDir "vendor\jszip.min.js"))
$pdfJs = Escape-ScriptText (Get-FileText (Join-Path $siteDir "vendor\pdf.min.js"))
$workerJs = Escape-ScriptText (Get-FileText (Join-Path $siteDir "vendor\pdf.worker.min.js"))
$faviconFiles = @("favicon-16x16.png", "favicon-32x32.png", "favicon.ico")

$inlineHead = "<style>`r`n$stylesCss`r`n</style>"
$inlineScripts = @"
  <script>$pdfLibJs</script>
  <script>$jsZipJs</script>
  <script>$pdfJs</script>
  <script id="pdf-worker-source" type="text/plain">$workerJs</script>
  <script>$appJs</script>
"@

$standaloneHtml = $indexHtml.Replace('<link rel="stylesheet" href="styles.css">', $inlineHead)
$standaloneHtml = $standaloneHtml.Replace(
@"
  <script src="vendor/pdf-lib.min.js"></script>
  <script src="vendor/jszip.min.js"></script>
  <script src="vendor/pdf.min.js"></script>
  <script src="app.js"></script>
"@.TrimStart("`r", "`n"),
    $inlineScripts.TrimEnd()
)

if (Test-Path $distDir) {
    Remove-Item -LiteralPath $distDir -Recurse -Force
}

New-Item -ItemType Directory -Path $distDir | Out-Null

$htmlOut = Join-Path $distDir "Pdf Rumos Offline.html"

[System.IO.File]::WriteAllText($htmlOut, $standaloneHtml, [System.Text.Encoding]::UTF8)

foreach ($faviconFile in $faviconFiles) {
    Copy-Item -LiteralPath (Join-Path $siteDir $faviconFile) -Destination (Join-Path $distDir $faviconFile) -Force
}

if (Test-Path $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
}

Compress-Archive -LiteralPath $distDir -DestinationPath $zipPath -Force

Write-Output "Pacote gerado:"
Write-Output $distDir
Write-Output $zipPath
