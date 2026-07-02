# Publicacao no XAMPP Apache

Objetivo: publicar o sistema em:

```text
https://rumospetroleo.com.br/flow/pdfflow/
```

## Como este projeto deve ficar publicado

O HTML, compressao, uniao e divisao rodam no navegador. A funcao PDF/A nao roda em HTML puro: ela precisa do backend Node.js, Ghostscript e VeraPDF.

Modelo recomendado:

```text
Internet
  -> Apache/XAMPP HTTPS: https://rumospetroleo.com.br/flow/pdfflow/
  -> proxy interno para Node: http://127.0.0.1:3000/
```

Nao exponha a porta 3000 na internet. Ela deve ficar acessivel apenas no proprio servidor.

## 1. Preparar o projeto no servidor

Copie a pasta do projeto para o servidor. Exemplo usado neste guia:

```powershell
C:\pdf-rumos
```

No servidor, abra PowerShell nessa pasta e rode:

```powershell
cd C:\pdf-rumos
node -v
npm install --omit=dev
```

O Node precisa ser versao 20 ou superior.

## 2. Configurar o arquivo .env

Crie ou ajuste `C:\pdf-rumos\.env`:

```env
PORT=3000
NODE_ENV=production

GHOSTSCRIPT_BIN=C:\Program Files\gs\gs10.07.0\bin\gswin64c.exe
VERAPDF_BIN=C:\Program Files\veraPDF\verapdf.bat
PDFA_ICC_PROFILE=C:\pdf-rumos\sRGB_IEC61966-2-1_black_scaled.icc

MAX_UPLOAD_MB=100
PDF_PROCESS_TIMEOUT_MS=180000
PDF_SHOW_ERROR_DETAILS=false
```

Ajuste a versao/pasta do Ghostscript e do VeraPDF conforme o que estiver instalado no servidor.

## 3. Testar o Node sem Apache

Ainda em `C:\pdf-rumos`:

```powershell
npm start
```

Abra no proprio servidor:

```text
http://127.0.0.1:3000/
```

Teste a aba PDF/A. Se funcionar aqui, o backend esta correto e falta apenas o Apache publicar o caminho externo.

## 4. Ativar modulos do Apache

No XAMPP, abra:

```text
C:\xampp\apache\conf\httpd.conf
```

Garanta que estas linhas estejam ativas, sem `#` no inicio:

```apache
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule headers_module modules/mod_headers.so
```

Se o HTTPS tambem for gerenciado pelo Apache/XAMPP, confira se o SSL ja esta ativo no virtual host do dominio.

## 5. Configurar o proxy no VirtualHost HTTPS

No arquivo onde o dominio `rumospetroleo.com.br` esta configurado, normalmente:

```text
C:\xampp\apache\conf\extra\httpd-vhosts.conf
```

Dentro do `<VirtualHost *:443>` do dominio, adicione:

```apache
ProxyRequests Off
ProxyPreserveHost On

RewriteEngine On
RewriteRule ^/flow/pdfflow$ /flow/pdfflow/ [R=301,L]

ProxyPass        /flow/pdfflow/ http://127.0.0.1:3000/ retry=0 timeout=180
ProxyPassReverse /flow/pdfflow/ http://127.0.0.1:3000/

RequestHeader set X-Forwarded-Proto "https"
RequestHeader set X-Forwarded-Prefix "/flow/pdfflow"
ProxyTimeout 180
```

Exemplo parcial:

```apache
<VirtualHost *:443>
    ServerName rumospetroleo.com.br
    DocumentRoot "C:/xampp/htdocs"

    # Configuracoes SSL existentes ficam aqui.

    ProxyRequests Off
    ProxyPreserveHost On

    RewriteEngine On
    RewriteRule ^/flow/pdfflow$ /flow/pdfflow/ [R=301,L]

    ProxyPass        /flow/pdfflow/ http://127.0.0.1:3000/ retry=0 timeout=180
    ProxyPassReverse /flow/pdfflow/ http://127.0.0.1:3000/

    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Prefix "/flow/pdfflow"
    ProxyTimeout 180
</VirtualHost>
```

Reinicie o Apache pelo painel do XAMPP.

## 6. Manter o Node rodando como servico

Para teste, `npm start` resolve. Para producao, o Node precisa subir sozinho quando o servidor reiniciar.

Opcao com NSSM:

```text
Application: C:\Program Files\nodejs\node.exe
Startup directory: C:\pdf-rumos
Arguments: src\server.js
Service name: PdfRumosFlow
```

Opcao com Agendador de Tarefas do Windows:

```powershell
schtasks /Create /TN "PdfRumosFlow" /SC ONSTART /TR "\"C:\Program Files\nodejs\node.exe\" C:\pdf-rumos\src\server.js" /RL HIGHEST /F
```

Depois de criar o servico/tarefa, reinicie ou inicie manualmente e confirme:

```powershell
Invoke-WebRequest http://127.0.0.1:3000/
```

## 7. Teste final

Abra:

```text
https://rumospetroleo.com.br/flow/pdfflow/
```

Teste nesta ordem:

1. Carregar a pagina e ver os estilos.
2. Comprimir um PDF pequeno.
3. Unir/dividir um PDF pequeno.
4. Converter para PDF/A.
5. Baixar o PDF/A gerado.

As chamadas esperadas no navegador sao:

```text
/flow/pdfflow/api/pdf/convert-to-pdfa
/flow/pdfflow/api/pdf/validate-pdfa
/flow/pdfflow/downloads/arquivo.pdf
```

## Erros comuns

`A API nao respondeu`

O Node nao esta rodando, ou o `ProxyPass` nao esta ativo no VirtualHost HTTPS.

`404` em `/flow/pdfflow/api/...`

Confira a barra final em `ProxyPass /flow/pdfflow/ http://127.0.0.1:3000/`.

Erro do Ghostscript ou VeraPDF

Confira `GHOSTSCRIPT_BIN` e `VERAPDF_BIN` no `.env`. Teste os executaveis no PowerShell do servidor.

Upload muito grande

Aumente `MAX_UPLOAD_MB` no `.env` e confira se o Apache nao possui `LimitRequestBody` menor no VirtualHost.

