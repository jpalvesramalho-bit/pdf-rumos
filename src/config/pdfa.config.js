const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..", "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.*)$/);
    if (!match || process.env[match[1]] !== undefined) {
      continue;
    }

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[match[1]] = value;
  }
}

loadEnvFile(path.join(ROOT_DIR, ".env"));

function numberFromEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function pathFromEnv(name, fallback) {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  return path.isAbsolute(value) ? value : path.join(ROOT_DIR, value);
}

module.exports = {
  ROOT_DIR,
  SITE_DIR: path.join(ROOT_DIR, "site"),
  DOWNLOAD_DIR: path.join(ROOT_DIR, "downloads"),
  UPLOAD_DIR: path.join(ROOT_DIR, "storage", "uploads"),
  MAX_UPLOAD_BYTES: numberFromEnv("MAX_UPLOAD_MB", 100) * 1024 * 1024,
  PROCESS_TIMEOUT_MS: numberFromEnv("PDF_PROCESS_TIMEOUT_MS", 120000),
  GHOSTSCRIPT_BIN: process.env.GHOSTSCRIPT_BIN,
  VERAPDF_BIN: process.env.VERAPDF_BIN,
  PDFA_ICC_PROFILE: pathFromEnv(
    "PDFA_ICC_PROFILE",
    path.join(ROOT_DIR, "sRGB_IEC61966-2-1_black_scaled.icc")
  ),
};
