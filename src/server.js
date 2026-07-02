const fs = require("fs/promises");

const app = require("./app");
const { DOWNLOAD_DIR, UPLOAD_DIR } = require("./config/pdfa.config");

const port = Number(process.env.PORT) || 3000;

async function bootstrap() {
  // Prepara as pastas de runtime antes de aceitar requisicoes.
  await fs.mkdir(DOWNLOAD_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  app.listen(port, () => {
    console.log(`Pdf Rumos API ouvindo em http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Falha ao iniciar o servidor:", error);
  process.exit(1);
});
