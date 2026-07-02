const express = require("express");

const pdfController = require("../controllers/pdfController");
const asyncHandler = require("../middlewares/asyncHandler");
const { uploadPdf } = require("../middlewares/uploadPdf");

const router = express.Router();

// POST /api/pdf/convert-to-pdfa
// 1. Recebe PDF via multipart/form-data no campo "file".
// 2. Salva temporariamente.
// 3. Converte para PDF/A-2b com Ghostscript.
// 4. Valida com VeraPDF e devolve link de download.
router.post(
  "/convert-to-pdfa",
  uploadPdf,
  asyncHandler(pdfController.convertToPdfA)
);

// POST /api/pdf/validate-pdfa
// Valida um PDF enviado sem gerar uma nova copia convertida.
router.post(
  "/validate-pdfa",
  uploadPdf,
  asyncHandler(pdfController.validatePdfA)
);

module.exports = router;
