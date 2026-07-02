# Pdf Rumos Web

Este site foi criado para que seus usuarios possam comprimir, unir e dividir PDFs sem instalar Python, Ghostscript ou qualquer outra ferramenta local.
Essas tres funcoes continuam funcionando offline, sem depender de servidor e sem carregar bibliotecas da internet.
Agora o site tambem tem uma aba PDF/A, que usa o backend Node.js com Ghostscript e VeraPDF.

## Como usar

1. Extraia a pasta inteira em qualquer computador Windows.
2. Para `Compressao`, `Uniao` e `Divisao` sem servidor, abra `index.html`.
3. Para `PDF/A`, abra `abrir-site.bat` ou rode `npm start` na raiz do projeto e acesse `http://localhost:3000`.
4. Escolha a funcao desejada.
5. Arraste os PDFs para a area indicada.
6. Baixe o resultado quando o processamento terminar.

## Como compartilhar com outros usuarios sem servidor

- Compacte a pasta `site` em um arquivo `.zip`.
- Envie esse `.zip` por e-mail, Teams, WhatsApp, OneDrive ou pasta compartilhada.
- O usuario so precisa extrair a pasta e abrir `index.html`.
- Como o processamento de compressao, uniao e divisao acontece no navegador, os usuarios nao precisam instalar dependencias na maquina.
- A funcao PDF/A precisa do backend e das dependencias configuradas.

## Vantagem desta versao

- Compressao, uniao e divisao funcionam sem servidor.
- Essas tres funcoes funcionam sem internet depois de enviadas.
- Compressao, uniao e divisao sao processadas localmente no navegador do proprio usuario.
- O modo `Divisao` gera PDFs separados e tambem um arquivo ZIP para baixar tudo de uma vez.

## Observacao importante

- A compressao foi pensada principalmente para PDFs escaneados ou baseados em imagem.
- Nesse modo, o arquivo final pode perder texto selecionavel e busca interna, em troca de tamanho menor.
