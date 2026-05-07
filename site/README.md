# Pdf Rumos Web

Este site foi criado para que seus usuarios possam comprimir, unir e dividir PDFs sem instalar Python, Ghostscript ou qualquer outra ferramenta local.
Agora esta pasta tambem funciona offline, sem depender de servidor e sem carregar bibliotecas da internet.

## Como usar

1. Extraia a pasta inteira em qualquer computador Windows.
2. Abra o arquivo `abrir-site.bat` ou `index.html`.
3. Escolha entre `Compressao`, `Uniao` e `Divisao`.
4. Arraste os PDFs para a area indicada.
5. Baixe o resultado quando o processamento terminar.

## Como compartilhar com outros usuarios sem servidor

- Compacte a pasta `site` em um arquivo `.zip`.
- Envie esse `.zip` por e-mail, Teams, WhatsApp, OneDrive ou pasta compartilhada.
- O usuario so precisa extrair a pasta e abrir `abrir-site.bat`.
- Como o processamento acontece no navegador, os usuarios nao precisam instalar dependencias na maquina.

## Vantagem desta versao

- Esta interface funciona sem servidor.
- Esta interface funciona sem internet depois de enviada.
- Os arquivos sao processados localmente no navegador do proprio usuario.
- O modo `Divisao` gera PDFs separados e tambem um arquivo ZIP para baixar tudo de uma vez.

## Observacao importante

- A compressao foi pensada principalmente para PDFs escaneados ou baseados em imagem.
- Nesse modo, o arquivo final pode perder texto selecionavel e busca interna, em troca de tamanho menor.
