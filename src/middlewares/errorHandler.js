const multer = require("multer");

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || 500;
  let code = error.code || "INTERNAL_ERROR";
  let message = error.message || "Erro interno ao processar a requisicao.";

  if (error instanceof multer.MulterError) {
    statusCode = 400;
    code = error.code;
    message = error.code === "LIMIT_FILE_SIZE"
      ? "Arquivo muito grande para upload."
      : "Falha ao receber o arquivo enviado.";
  }

  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  const showDetails = process.env.PDF_SHOW_ERROR_DETAILS === "true"
    || process.env.NODE_ENV !== "production";

  if (error.details && showDetails) {
    response.error.details = error.details;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
