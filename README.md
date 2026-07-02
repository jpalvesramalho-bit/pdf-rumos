# Pdf Rumos API

Backend Express e interface web para converter PDFs em PDF/A-2b. A conversao usa Ghostscript com perfil ICC sRGB e a API so libera o download depois que o VeraPDF aprova o arquivo.

## Requisitos

- Node.js 20 ou superior
- Ghostscript disponivel no PATH, ou `GHOSTSCRIPT_BIN` apontando para o executavel
- VeraPDF disponivel no PATH, ou `VERAPDF_BIN` apontando para o executavel
- Perfil ICC sRGB em `sRGB_IEC61966-2-1_black_scaled.icc`, ou `PDFA_ICC_PROFILE` apontando para outro perfil RGB

No Windows, exemplos comuns:

```env
GHOSTSCRIPT_BIN=C:\Program Files\gs\gs10.07.0\bin\gswin64c.exe
VERAPDF_BIN=C:\Program Files\veraPDF\verapdf.bat
PDFA_ICC_PROFILE=C:\pdf-rumos\sRGB_IEC61966-2-1_black_scaled.icc
```

## Executar

```bash
npm install
npm start
```

O servidor sobe em `http://localhost:3000` e serve a interface da pasta `site/`.

## Endpoints

Todos os uploads usam `multipart/form-data` com o PDF no campo `file`.

### Converter para PDF/A

`POST /api/pdf/convert-to-pdfa`

Converte o PDF para PDF/A-2b com Ghostscript, valida com VeraPDF e retorna o link de download apenas quando o arquivo esta conforme.

```json
{
  "success": true,
  "pdfaLevel": "PDF/A-2b",
  "validated": true,
  "downloadUrl": "/downloads/arquivo_pdfa.pdf"
}
```

### Validar PDF/A

`POST /api/pdf/validate-pdfa`

Valida o PDF enviado sem converter.

```json
{
  "success": true,
  "isPdfA": true,
  "compliant": true,
  "detectedStandard": "PDF/A-2b"
}
```

## Configuracao

```env
PORT=3000
MAX_UPLOAD_MB=100
PDF_PROCESS_TIMEOUT_MS=120000
PDF_SHOW_ERROR_DETAILS=false
```

Arquivos temporarios ficam em `storage/uploads/`. PDFs convertidos ficam em `downloads/` e sao expostos em `/downloads`.
