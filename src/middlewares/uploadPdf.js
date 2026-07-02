const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");
const multer = require("multer");

const AppError = require("../errors/AppError");
const { MAX_UPLOAD_BYTES, UPLOAD_DIR } = require("../config/pdfa.config");

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/x-pdf",
  "application/octet-stream",
]);

function sanitizeFilename(filename) {
  const parsed = path.parse(filename || "arquivo.pdf");
  return parsed.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "arquivo";
}

async function ensureUploadDirectory(req, res, next) {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    next();
  } catch (error) {
    next(new AppError("Nao foi possivel preparar a pasta temporaria de upload.", 500, "UPLOAD_DIR_ERROR"));
  }
}

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, UPLOAD_DIR);
  },
  filename(req, file, callback) {
    const baseName = sanitizeFilename(file.originalname);
    callback(null, `${Date.now()}-${randomUUID()}-${baseName}.pdf`);
  },
});

const upload = multer({
  storage,
  limits: {
    files: 1,
    fileSize: MAX_UPLOAD_BYTES,
  },
  fileFilter(req, file, callback) {
    const hasPdfExtension = path.extname(file.originalname || "").toLowerCase() === ".pdf";
    const hasAcceptedMimeType = !file.mimetype || allowedMimeTypes.has(file.mimetype);

    if (!hasPdfExtension || !hasAcceptedMimeType) {
      return callback(new AppError("Arquivo invalido. Envie um PDF com extensao .pdf.", 400, "INVALID_FILE"));
    }

    callback(null, true);
  },
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function removeUploadedFile(filePath) {
  if (!filePath) {
    return;
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await fs.unlink(filePath);
      return;
    } catch (error) {
      if (error.code === "ENOENT") {
        return;
      }

      if (["EPERM", "EBUSY"].includes(error.code)) {
        await delay(75 * (attempt + 1));
        continue;
      }

      return;
    }
  }
}

async function validatePdfSignature(req, res, next) {
  try {
    if (!req.file) {
      return next(new AppError("Nenhum arquivo PDF foi enviado no campo 'file'.", 400, "MISSING_FILE"));
    }

    // Confere a assinatura binaria antes de chamar ferramentas externas.
    let handle;
    const buffer = Buffer.alloc(5);

    try {
      handle = await fs.open(req.file.path, "r");
      await handle.read(buffer, 0, 5, 0);
    } finally {
      if (handle) {
        await handle.close();
      }
    }

    if (buffer.toString("utf8") !== "%PDF-") {
      await removeUploadedFile(req.file.path);
      return next(new AppError("Arquivo invalido. O conteudo enviado nao parece ser um PDF.", 400, "INVALID_FILE"));
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadPdf: [ensureUploadDirectory, upload.single("file"), validatePdfSignature],
  removeUploadedFile,
};
