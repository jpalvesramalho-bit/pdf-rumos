const express = require("express");
const helmet = require("helmet");
const path = require("path");

const { DOWNLOAD_DIR, SITE_DIR } = require("./config/pdfa.config");
const errorHandler = require("./middlewares/errorHandler");
const pdfRoutes = require("./routes/pdfRoutes");

const app = express();

app.disable("x-powered-by");

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      workerSrc: ["'self'", "blob:"],
      connectSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'self'"],
    },
  },
  referrerPolicy: { policy: "no-referrer" },
  hsts: process.env.NODE_ENV === "production"
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,
}));

app.use(express.json({ limit: "1mb" }));

// Arquivos finais ficam disponiveis para download somente pela pasta controlada.
app.use("/downloads", express.static(DOWNLOAD_DIR, {
  fallthrough: false,
  immutable: false,
  maxAge: 0,
  setHeaders(res, filePath) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${path.basename(filePath)}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
  },
}));

app.use("/api/pdf", pdfRoutes);

// Mantem o site atual sendo servido pelo mesmo backend Express.
app.use(express.static(SITE_DIR));

app.use(errorHandler);

module.exports = app;
