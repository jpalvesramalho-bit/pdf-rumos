const pdfaService = require("../services/pdfaService");

async function convertToPdfA(req, res) {
  // Recebe o arquivo salvo pelo middleware e delega a conversao ao service.
  const result = await pdfaService.convertToPdfA(req.file);
  res.status(200).json(result);
}

async function validatePdfA(req, res) {
  // Recebe o PDF enviado e retorna somente o relatorio estruturado de validacao.
  const result = await pdfaService.validatePdfA(req.file);
  res.status(200).json(result);
}

module.exports = {
  convertToPdfA,
  validatePdfA,
};
