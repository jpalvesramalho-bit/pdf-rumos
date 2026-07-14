const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const AppError = require("../errors/AppError");
const {
  DOWNLOAD_DIR,
  GHOSTSCRIPT_BIN,
  PDFA_ICC_PROFILE,
  PROCESS_TIMEOUT_MS,
  UPLOAD_DIR,
  VERAPDF_BIN,
} = require("../config/pdfa.config");
const { removeUploadedFile } = require("../middlewares/uploadPdf");
const { runFirstAvailable } = require("./processRunner");

function getGhostscriptCommands() {
  if (GHOSTSCRIPT_BIN) {
    return [GHOSTSCRIPT_BIN];
  }

  return process.platform === "win32"
    ? ["gswin64c.exe", "gswin64c", "gswin32c.exe", "gswin32c", "gs.exe", "gs"]
    : ["gs"];
}

function getVeraPdfCommands() {
  if (VERAPDF_BIN) {
    return [VERAPDF_BIN];
  }

  return process.platform === "win32"
    ? ["verapdf.exe", "verapdf.bat", "verapdf.cmd", "verapdf"]
    : ["verapdf"];
}

function normalizeBaseName(filename) {
  const parsed = path.parse(filename || "arquivo.pdf");
  const normalized = parsed.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return normalized || "arquivo";
}

function createOutputName(originalName) {
  return `${normalizeBaseName(originalName)}_pdfa_${randomUUID()}.pdf`;
}

function compactLog(text) {
  return (text || "").replace(/\s+/g, " ").trim().slice(0, 2000);
}

function toGhostscriptPath(filePath) {
  return path.resolve(filePath).replace(/\\/g, "/");
}

function escapePostScriptString(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

async function ensureDownloadDirectory() {
  await fs.mkdir(DOWNLOAD_DIR, { recursive: true });
}

async function ensureIccProfile() {
  try {
    await fs.access(PDFA_ICC_PROFILE);
  } catch (error) {
    throw new AppError("Perfil ICC para PDF/A nao encontrado.", 500, "ICC_PROFILE_NOT_FOUND", {
      path: PDFA_ICC_PROFILE,
    });
  }
}

async function createPdfaDefinitionFile() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const definitionPath = path.join(UPLOAD_DIR, `pdfa-definition-${randomUUID()}.ps`);
  const iccPath = escapePostScriptString(toGhostscriptPath(PDFA_ICC_PROFILE));
  const content = `%!
[ /Title (Documento convertido para PDF/A)
  /DOCINFO pdfmark

/ICCProfile (${iccPath}) def

[/_objdef {icc_PDFA} /type /stream /OBJ pdfmark
[{icc_PDFA} << /N 3 >> /PUT pdfmark

[
{icc_PDFA}
{ICCProfile (r) file} stopped
{
  (Failed to open ICC profile for PDF/A output.) =
  /ICCProfile cvx /undefinedfilename signalerror
}
{
  /PUT pdfmark
  [/_objdef {OutputIntent_PDFA} /type /dict /OBJ pdfmark
  [{OutputIntent_PDFA} <<
    /Type /OutputIntent
    /S /GTS_PDFA1
    /DestOutputProfile {icc_PDFA}
    /OutputConditionIdentifier (sRGB IEC61966-2.1)
  >> /PUT pdfmark
  [{Catalog} << /OutputIntents [ {OutputIntent_PDFA} ] >> /PUT pdfmark
} ifelse
`;

  await fs.writeFile(definitionPath, content, "utf8");
  return definitionPath;
}

async function safeUnlink(filePath) {
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
        await new Promise((resolve) => setTimeout(resolve, 75 * (attempt + 1)));
        continue;
      }

      return;
    }
  }
}

function detectStandard(output) {
  const xmlFlavour = output.match(/flavou?r\s*=\s*"([1-4])([abuf])"/i);
  if (xmlFlavour) {
    return `PDF/A-${xmlFlavour[1]}${xmlFlavour[2].toLowerCase()}`;
  }

  const profileName = output.match(/PDF\/A\s*-?\s*([1-4])\s*[- ]?\s*([ABUFabuf])/i);
  if (profileName) {
    return `PDF/A-${profileName[1]}${profileName[2].toLowerCase()}`;
  }

  const partAndConformance = output.match(/part\s*=\s*"([1-4])"[\s\S]*?conformance\s*=\s*"([ABUFabuf])"/i);
  if (partAndConformance) {
    return `PDF/A-${partAndConformance[1]}${partAndConformance[2].toLowerCase()}`;
  }

  const xmpPart = output.match(/pdfaid:part>\s*([1-4])\s*</i);
  const xmpConformance = output.match(/pdfaid:conformance>\s*([ABUFabuf])\s*</i);
  if (xmpPart && xmpConformance) {
    return `PDF/A-${xmpPart[1]}${xmpConformance[1].toLowerCase()}`;
  }

  return null;
}

function parseVeraPdfOutput(output) {
  const xmlCompliance = output.match(/isCompliant\s*=\s*"([^"]+)"/i);
  const textCompliance = output.match(/\bcompliant\b\s*[:=]\s*(true|false|yes|no)/i);
  const detectedStandard = detectStandard(output);

  let compliant = false;
  if (xmlCompliance) {
    compliant = xmlCompliance[1].toLowerCase() === "true";
  } else if (textCompliance) {
    compliant = ["true", "yes"].includes(textCompliance[1].toLowerCase());
  }

  return {
    isPdfA: Boolean(detectedStandard) || compliant,
    compliant,
    detectedStandard,
  };
}

async function runGhostscript(inputPath, outputPath) {
  await ensureIccProfile();

  const definitionPath = await createPdfaDefinitionFile();

  try {
    const args = [
      `--permit-file-read=${toGhostscriptPath(PDFA_ICC_PROFILE)}`,
      "-dPDFA=2",
      "-dPDFACompatibilityPolicy=1",
      "-dBATCH",
      "-dNOPAUSE",
      "-sColorConversionStrategy=RGB",
      "-sBlendConversionStrategy=Simple",
      "-sDEVICE=pdfwrite",
      `-sOutputFile=${toGhostscriptPath(outputPath)}`,
      toGhostscriptPath(definitionPath),
      toGhostscriptPath(inputPath),
    ];

    const result = await runFirstAvailable(getGhostscriptCommands(), args, {
      timeoutMs: PROCESS_TIMEOUT_MS,
    });

    const output = compactLog(`${result.stdout}\n${result.stderr}`);

    if (result.exitCode !== 0 || /Failed to open ICC profile|PDF\/A processing aborted/i.test(output)) {
      throw new AppError("Falha do Ghostscript ao converter o PDF para PDF/A.", 502, "GHOSTSCRIPT_FAILED", {
        exitCode: result.exitCode,
        output,
        command: result.command,
      });
    }
  } finally {
    await safeUnlink(definitionPath);
  }
}

async function runVeraPdf(filePath) {
  // Etapa 2: valida o arquivo gerado ou enviado usando VeraPDF.
  const result = await runFirstAvailable(getVeraPdfCommands(), [filePath], {
    timeoutMs: PROCESS_TIMEOUT_MS,
  });

  const output = `${result.stdout}\n${result.stderr}`.trim();
  const hasValidationReport = /isCompliant\s*=/i.test(output) || /\bcompliant\b/i.test(output);

  if (result.exitCode !== 0 && !hasValidationReport) {
    throw new AppError("Falha da validacao PDF/A com VeraPDF.", 502, "VERAPDF_FAILED", {
      exitCode: result.exitCode,
      output: compactLog(output),
    });
  }

  if (!output) {
    throw new AppError("VeraPDF nao retornou um relatorio de validacao.", 502, "VERAPDF_EMPTY_OUTPUT");
  }

  return parseVeraPdfOutput(output);
}

async function convertToPdfA(uploadedFile) {
  if (!uploadedFile) {
    throw new AppError("Nenhum arquivo PDF foi enviado no campo 'file'.", 400, "MISSING_FILE");
  }

  await ensureDownloadDirectory();

  const outputName = createOutputName(uploadedFile.originalname);
  const outputPath = path.join(DOWNLOAD_DIR, outputName);

  try {
    // Etapa 3: depois da conversao, valida o resultado antes de liberar o link.
    await runGhostscript(uploadedFile.path, outputPath);
    const validation = await runVeraPdf(outputPath);

    if (!validation.compliant) {
      await safeUnlink(outputPath);
      throw new AppError("O PDF foi convertido, mas nao passou na validacao PDF/A.", 422, "PDFA_VALIDATION_FAILED", {
        detectedStandard: validation.detectedStandard,
      });
    }

    return {
      success: true,
      pdfaLevel: validation.detectedStandard || "PDF/A-2b",
      validated: true,
      downloadUrl: `downloads/${encodeURIComponent(outputName)}`,
    };
  } catch (error) {
    await safeUnlink(outputPath);
    throw error;
  } finally {
    // Etapa 4: remove sempre o upload temporario, mesmo em erro ou timeout.
    await removeUploadedFile(uploadedFile.path);
  }
}

async function validatePdfA(uploadedFile) {
  if (!uploadedFile) {
    throw new AppError("Nenhum arquivo PDF foi enviado no campo 'file'.", 400, "MISSING_FILE");
  }

  try {
    // Esta rota nao converte: apenas valida o PDF recebido pelo usuario.
    const validation = await runVeraPdf(uploadedFile.path);

    return {
      success: true,
      isPdfA: validation.isPdfA,
      compliant: validation.compliant,
      detectedStandard: validation.detectedStandard,
    };
  } finally {
    await removeUploadedFile(uploadedFile.path);
  }
}

module.exports = {
  convertToPdfA,
  validatePdfA,
};
