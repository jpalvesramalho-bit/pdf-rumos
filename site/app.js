(function () {
  const dependencyStatus = document.getElementById("dependency-status");
  const compressInput = document.getElementById("compress-input");
  const mergeInput = document.getElementById("merge-input");
  const compressFileList = document.getElementById("compress-file-list");
  const mergeFileList = document.getElementById("merge-file-list");
  const compressResults = document.getElementById("compress-results");
  const mergeResults = document.getElementById("merge-results");
  const compressCount = document.getElementById("compress-count");
  const mergeCount = document.getElementById("merge-count");
  const compressStatus = document.getElementById("compress-status");
  const mergeStatus = document.getElementById("merge-status");
  const mergeOutputName = document.getElementById("merge-output-name");
  const startCompressButton = document.getElementById("start-compress");
  const startMergeButton = document.getElementById("start-merge");

  const state = {
    compressFiles: [],
    mergeFiles: [],
    compressResults: [],
    mergeResult: null,
    processing: false,
  };

  const compressionPresets = {
    compacto: {
      label: "Compacto",
      targetSavings: 0.18,
      attempts: [
        { scale: 0.82, quality: 0.50, label: "compacto 1" },
        { scale: 0.68, quality: 0.40, label: "compacto 2" },
        { scale: 0.58, quality: 0.32, label: "compacto 3" },
      ],
    },
    equilibrado: {
      label: "Equilibrado",
      targetSavings: 0.1,
      attempts: [
        { scale: 0.92, quality: 0.62, label: "equilibrado 1" },
        { scale: 0.8, quality: 0.50, label: "equilibrado 2" },
        { scale: 0.7, quality: 0.42, label: "equilibrado 3" },
      ],
    },
    qualidade: {
      label: "Alta qualidade",
      targetSavings: 0.03,
      attempts: [
        { scale: 1.0, quality: 0.74, label: "qualidade 1" },
        { scale: 0.9, quality: 0.66, label: "qualidade 2" },
        { scale: 0.82, quality: 0.58, label: "qualidade 3" },
      ],
    },
  };

  function init() {
    if (!window.PDFLib || !window.pdfjsLib) {
      setDependencyError(
        "As bibliotecas de PDF não foram carregadas. Verifique se a pasta do projeto está completa e tente abrir a página novamente."
      );
      disableActions(true);
      return;
    }

    configurePdfJsWorker();

    setDependencySuccess(
      "Os arquivos são processados localmente no navegador, sem envio para servidores externos, e não precisam de Python nem Ghostscript no computador do usuário."
    );

    bindTabs();
    bindPresetCards();
    bindDropzone("compress-dropzone", handleCompressDrop);
    bindDropzone("merge-dropzone", handleMergeDrop);

    compressInput.addEventListener("change", (event) => {
      addCompressFiles(event.target.files);
      compressInput.value = "";
    });

    mergeInput.addEventListener("change", (event) => {
      addMergeFiles(event.target.files);
      mergeInput.value = "";
    });

    document.getElementById("clear-compress-files").addEventListener("click", () => {
      state.compressFiles = [];
      clearResultUrls(state.compressResults);
      state.compressResults = [];
      setCompressStatus("Aguardando arquivos.", "");
      renderCompressFiles();
      renderCompressResults();
    });

    document.getElementById("clear-merge-files").addEventListener("click", () => {
      state.mergeFiles = [];
      if (state.mergeResult) {
        URL.revokeObjectURL(state.mergeResult.url);
      }
      state.mergeResult = null;
      setMergeStatus("Aguardando arquivos.", "");
      renderMergeFiles();
      renderMergeResult();
    });

    startCompressButton.addEventListener("click", processCompression);
    startMergeButton.addEventListener("click", processMerge);

    renderCompressFiles();
    renderCompressResults();
    renderMergeFiles();
    renderMergeResult();
  }

  function bindTabs() {
    const buttons = document.querySelectorAll("[data-tab-button]");
    const panels = document.querySelectorAll("[data-tab-panel]");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.tabButton;
        buttons.forEach((item) => {
          item.classList.toggle("is-active", item.dataset.tabButton === target);
          if (item.classList.contains("action-button") || item.classList.contains("ghost-button")) {
            return;
          }
        });
        panels.forEach((panel) => {
          panel.classList.toggle("is-active", panel.dataset.tabPanel === target);
        });

        document.querySelectorAll(".tab-button").forEach((tabButton) => {
          tabButton.classList.toggle("is-active", tabButton.dataset.tabButton === target);
        });
      });
    });
  }

  function configurePdfJsWorker() {
    const inlineWorker = document.getElementById("pdf-worker-source");
    if (inlineWorker && inlineWorker.textContent.trim()) {
      const workerBlob = new Blob([inlineWorker.textContent], { type: "text/javascript" });
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);
      return;
    }

    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "vendor/pdf.worker.min.js";
  }

  function bindPresetCards() {
    document.querySelectorAll(".preset-option input").forEach((input) => {
      input.addEventListener("change", () => {
        document.querySelectorAll(".preset-option").forEach((item) => {
          item.classList.toggle("is-selected", item.querySelector("input").checked);
        });
      });
    });
  }

  function bindDropzone(id, onDropFiles) {
    const dropzone = document.getElementById(id);
    ["dragenter", "dragover"].forEach((eventName) => {
      dropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropzone.classList.add("is-over");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropzone.classList.remove("is-over");
      });
    });

    dropzone.addEventListener("drop", (event) => {
      onDropFiles(event.dataTransfer.files);
    });
  }

  function handleCompressDrop(files) {
    addCompressFiles(files);
  }

  function handleMergeDrop(files) {
    addMergeFiles(files);
  }

  function addCompressFiles(fileList) {
    const files = filterPdfFiles(fileList);
    if (!files.length) {
      return;
    }
    state.compressFiles = state.compressFiles.concat(files);
    resetCompressResults();
    setCompressStatus(`${state.compressFiles.length} arquivo(s) pronto(s) para compressão.`, "");
    renderCompressFiles();
  }

  function addMergeFiles(fileList) {
    const files = filterPdfFiles(fileList);
    if (!files.length) {
      return;
    }
    state.mergeFiles = state.mergeFiles.concat(files);
    resetMergeResult();
    setMergeStatus(`${state.mergeFiles.length} arquivo(s) adicionado(s) para união.`, "");
    renderMergeFiles();
  }

  function filterPdfFiles(fileList) {
    return Array.from(fileList || []).filter((file) => {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      return isPdf;
    });
  }

  function renderCompressFiles() {
    compressCount.textContent = formatFileCount(state.compressFiles.length);
    if (!state.compressFiles.length) {
      compressFileList.innerHTML = '<p class="empty-state">Nenhum PDF selecionado ainda.</p>';
      return;
    }

    compressFileList.innerHTML = "";
    state.compressFiles.forEach((file, index) => {
      const item = document.createElement("div");
      item.className = "file-item";
      item.innerHTML = `
        <div class="file-item-head">
          <div class="file-meta">
            <div class="file-name">${escapeHtml(file.name)}</div>
            <div class="file-subline">${formatBytes(file.size)}</div>
          </div>
          <div class="file-actions">
            <button class="reorder-button" type="button" data-remove-compress="${index}" aria-label="Remover arquivo">Remover</button>
          </div>
        </div>
      `;
      compressFileList.appendChild(item);
    });

    compressFileList.querySelectorAll("[data-remove-compress]").forEach((button) => {
      button.addEventListener("click", () => {
        state.compressFiles.splice(Number(button.dataset.removeCompress), 1);
        resetCompressResults();
        setCompressStatus("Lista de compressão atualizada.", "");
        renderCompressFiles();
      });
    });
  }

  function renderCompressResults() {
    if (!state.compressResults.length) {
      compressResults.innerHTML = '<p class="empty-state">Os resultados comprimidos aparecerão aqui.</p>';
      return;
    }

    compressResults.innerHTML = "";
    state.compressResults.forEach((result, index) => {
      const savedPercent = getSavingsPercent(result.originalSize, result.compressedSize);
      const badgeClass = result.keptOriginal ? "is-neutral" : "is-success";
      const badgeText = result.keptOriginal ? "Mantido original" : `Redução ${savedPercent}%`;
      const item = document.createElement("div");
      item.className = `result-item ${result.keptOriginal ? "is-original" : "is-optimized"}`;
      item.innerHTML = `
        <div class="result-item-head">
          <div class="result-meta">
            <div class="result-name">${escapeHtml(result.outputName)}</div>
            <div class="result-subline">
              Original: ${formatBytes(result.originalSize)} | Novo: ${formatBytes(result.compressedSize)}${result.keptOriginal ? "" : ` | Redução: ${savedPercent}%`}
            </div>
            <div class="result-note">${escapeHtml(result.note)}</div>
          </div>
          <div class="result-actions">
            <span class="result-badge ${badgeClass}">${badgeText}</span>
            <button class="download-button" type="button" data-download-compress="${index}">Baixar PDF</button>
          </div>
        </div>
      `;
      compressResults.appendChild(item);
    });

    compressResults.querySelectorAll("[data-download-compress]").forEach((button) => {
      button.addEventListener("click", () => {
        const result = state.compressResults[Number(button.dataset.downloadCompress)];
        downloadFile(result.url, result.outputName);
      });
    });
  }

  function renderMergeFiles() {
    mergeCount.textContent = formatFileCount(state.mergeFiles.length);
    if (!state.mergeFiles.length) {
      mergeFileList.innerHTML = '<p class="empty-state">Adicione pelo menos 2 PDFs para unir.</p>';
      return;
    }

    mergeFileList.innerHTML = "";
    state.mergeFiles.forEach((file, index) => {
      const item = document.createElement("div");
      item.className = "file-item";
      item.innerHTML = `
        <div class="file-item-head">
          <div class="file-meta">
            <div class="file-name">${index + 1}. ${escapeHtml(file.name)}</div>
            <div class="file-subline">${formatBytes(file.size)}</div>
          </div>
          <div class="file-actions">
            <button class="reorder-button" type="button" data-move-up="${index}" ${index === 0 ? "disabled" : ""}>Subir</button>
            <button class="reorder-button" type="button" data-move-down="${index}" ${index === state.mergeFiles.length - 1 ? "disabled" : ""}>Descer</button>
            <button class="reorder-button" type="button" data-remove-merge="${index}">Remover</button>
          </div>
        </div>
      `;
      mergeFileList.appendChild(item);
    });

    mergeFileList.querySelectorAll("[data-move-up]").forEach((button) => {
      button.addEventListener("click", () => reorderMergeFiles(Number(button.dataset.moveUp), -1));
    });

    mergeFileList.querySelectorAll("[data-move-down]").forEach((button) => {
      button.addEventListener("click", () => reorderMergeFiles(Number(button.dataset.moveDown), 1));
    });

    mergeFileList.querySelectorAll("[data-remove-merge]").forEach((button) => {
      button.addEventListener("click", () => {
        state.mergeFiles.splice(Number(button.dataset.removeMerge), 1);
        resetMergeResult();
        setMergeStatus("Lista de união atualizada.", "");
        renderMergeFiles();
      });
    });
  }

  function renderMergeResult() {
    if (!state.mergeResult) {
      mergeResults.innerHTML = '<p class="empty-state">O PDF final aparecerá aqui para download.</p>';
      return;
    }

    mergeResults.innerHTML = `
      <div class="result-item">
        <div class="result-item-head">
          <div class="result-meta">
            <div class="result-name">${escapeHtml(state.mergeResult.outputName)}</div>
            <div class="result-subline">${formatBytes(state.mergeResult.size)} gerados a partir de ${state.mergeFiles.length} arquivo(s).</div>
          </div>
          <div class="result-actions">
            <button class="download-button" type="button" id="download-merge-result">Baixar PDF final</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("download-merge-result").addEventListener("click", () => {
      downloadFile(state.mergeResult.url, state.mergeResult.outputName);
    });
  }

  function reorderMergeFiles(index, offset) {
    const targetIndex = index + offset;
    if (targetIndex < 0 || targetIndex >= state.mergeFiles.length) {
      return;
    }
    const current = state.mergeFiles[index];
    state.mergeFiles[index] = state.mergeFiles[targetIndex];
    state.mergeFiles[targetIndex] = current;
    resetMergeResult();
    setMergeStatus("Ordem da união atualizada.", "");
    renderMergeFiles();
  }

  async function processCompression() {
    if (state.processing) {
      return;
    }

    if (!state.compressFiles.length) {
      setCompressStatus("Adicione pelo menos um PDF para comprimir.", "error");
      return;
    }

    state.processing = true;
    disableActions(true);
    clearResultUrls(state.compressResults);
    state.compressResults = [];
    renderCompressResults();

    const preset = compressionPresets[getSelectedPreset()];
    setCompressStatus(`Iniciando compressão em modo ${preset.label}...`, "running");

    try {
      for (let i = 0; i < state.compressFiles.length; i += 1) {
        const file = state.compressFiles[i];
        setCompressStatus(`Comprimindo ${file.name} (${i + 1}/${state.compressFiles.length})...`, "running");
        const result = await compressPdf(file, preset, (message) => {
          setCompressStatus(`${file.name}: ${message}`, "running");
        });
        const outputName = result.keptOriginal ? file.name : buildCompressedName(file.name);
        const url = URL.createObjectURL(result.blob);
        state.compressResults.push({
          outputName,
          url,
          originalSize: file.size,
          compressedSize: result.blob.size,
          keptOriginal: result.keptOriginal,
          note: result.note,
        });
        renderCompressResults();
      }

      setCompressStatus("Compressão concluída. Os arquivos estão prontos para download.", "success");
    } catch (error) {
      console.error(error);
      setCompressStatus(`Falha na compressão: ${error.message}`, "error");
    } finally {
      state.processing = false;
      disableActions(false);
    }
  }

  async function processMerge() {
    if (state.processing) {
      return;
    }

    if (state.mergeFiles.length < 2) {
      setMergeStatus("Adicione pelo menos dois PDFs para unir.", "error");
      return;
    }

    state.processing = true;
    disableActions(true);

    resetMergeResult();

    setMergeStatus("Unindo os arquivos...", "running");

    try {
      const mergedBytes = await mergePdfs(state.mergeFiles, (message) => {
        setMergeStatus(message, "running");
      });
      const blob = new Blob([mergedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const rawOutputName = (mergeOutputName.value || "pdfs-unidos").replace(/\.pdf$/i, "");
      const outputName = sanitizeOutputName(rawOutputName);
      state.mergeResult = {
        outputName: `${outputName}.pdf`,
        url,
        size: blob.size,
      };
      renderMergeResult();
      setMergeStatus("PDF final gerado com sucesso.", "success");
    } catch (error) {
      console.error(error);
      setMergeStatus(`Falha na união: ${error.message}`, "error");
    } finally {
      state.processing = false;
      disableActions(false);
    }
  }

  async function mergePdfs(files, onProgress) {
    const mergedPdf = await PDFLib.PDFDocument.create();
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      onProgress(`Importando ${file.name} (${index + 1}/${files.length})...`);
      const sourceBytes = await file.arrayBuffer();
      const sourcePdf = await PDFLib.PDFDocument.load(sourceBytes, { ignoreEncryption: true });
      const pages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    return mergedPdf.save({ useObjectStreams: true });
  }

  async function compressPdf(file, preset, onProgress) {
    const inputBytes = new Uint8Array(await file.arrayBuffer());
    const loadingTask = window.pdfjsLib.getDocument({ data: inputBytes });
    const sourcePdf = await loadingTask.promise;
    let bestBlob = null;

    try {
      for (let attemptIndex = 0; attemptIndex < preset.attempts.length; attemptIndex += 1) {
        const attempt = preset.attempts[attemptIndex];
        onProgress(`testando ${attempt.label}...`);
        const blob = await renderCompressedPdf(sourcePdf, attempt, onProgress);

        if (!bestBlob || blob.size < bestBlob.size) {
          bestBlob = blob;
        }

        const savings = getSavingsRatio(file.size, blob.size);
        if (blob.size < file.size && savings >= preset.targetSavings) {
          break;
        }
      }
    } finally {
      await loadingTask.destroy();
    }

    if (!bestBlob || bestBlob.size >= file.size) {
      return {
        blob: file,
        keptOriginal: true,
        note: "Esse PDF já estava otimizado para a compressão web. Mantivemos o arquivo original para não aumentar o tamanho.",
      };
    }

    return {
      blob: bestBlob,
      keptOriginal: false,
      note: "Arquivo reduzido localmente no navegador. Este modo funciona melhor em PDFs escaneados ou baseados em imagem.",
    };
  }

  async function renderCompressedPdf(sourcePdf, attempt, onProgress) {
    const outputPdf = await PDFLib.PDFDocument.create();

    for (let pageNumber = 1; pageNumber <= sourcePdf.numPages; pageNumber += 1) {
      onProgress(`renderizando página ${pageNumber} de ${sourcePdf.numPages}...`);
      const sourcePage = await sourcePdf.getPage(pageNumber);
      const baseViewport = sourcePage.getViewport({ scale: 1 });
      const viewport = sourcePage.getViewport({ scale: attempt.scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) {
        throw new Error("O navegador não conseguiu criar o canvas de processamento.");
      }
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      await sourcePage.render({ canvasContext: context, viewport }).promise;

      const jpgBlob = await canvasToBlob(canvas, attempt.quality);
      const jpgBytes = await jpgBlob.arrayBuffer();
      const embeddedImage = await outputPdf.embedJpg(jpgBytes);

      const pageWidth = baseViewport.width;
      const pageHeight = baseViewport.height;
      const targetPage = outputPdf.addPage([pageWidth, pageHeight]);
      targetPage.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });

      canvas.width = 0;
      canvas.height = 0;
    }

    return new Blob([await outputPdf.save({ useObjectStreams: true })], { type: "application/pdf" });
  }

  function canvasToBlob(canvas, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Não foi possível converter a página para imagem."));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        quality
      );
    });
  }

  function clearResultUrls(results) {
    results.forEach((result) => {
      if (result.url) {
        URL.revokeObjectURL(result.url);
      }
    });
  }

  function resetCompressResults() {
    if (!state.compressResults.length) {
      renderCompressResults();
      return;
    }
    clearResultUrls(state.compressResults);
    state.compressResults = [];
    renderCompressResults();
  }

  function resetMergeResult() {
    if (!state.mergeResult) {
      renderMergeResult();
      return;
    }
    URL.revokeObjectURL(state.mergeResult.url);
    state.mergeResult = null;
    renderMergeResult();
  }

  function downloadFile(url, name) {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  function setCompressStatus(message, type) {
    setStatus(compressStatus, message, type);
  }

  function setMergeStatus(message, type) {
    setStatus(mergeStatus, message, type);
  }

  function setStatus(element, message, type) {
    element.textContent = message;
    element.classList.remove("is-running", "is-success", "is-error");
    if (type) {
      element.classList.add(`is-${type}`);
    }
  }

  function setDependencySuccess(message) {
    dependencyStatus.textContent = message;
    dependencyStatus.classList.add("is-success");
    dependencyStatus.classList.remove("is-error");
  }

  function setDependencyError(message) {
    dependencyStatus.textContent = message;
    dependencyStatus.classList.add("is-error");
    dependencyStatus.classList.remove("is-success");
  }

  function disableActions(disabled) {
    startCompressButton.disabled = disabled;
    startMergeButton.disabled = disabled;
  }

  function getSelectedPreset() {
    const selected = document.querySelector('input[name="compress-preset"]:checked');
    return selected ? selected.value : "equilibrado";
  }

  function buildCompressedName(fileName) {
    const dotIndex = fileName.toLowerCase().lastIndexOf(".pdf");
    const baseName = dotIndex > -1 ? fileName.slice(0, dotIndex) : fileName;
    return `${baseName}_comprimido.pdf`;
  }

  function getSavingsRatio(originalSize, newSize) {
    if (!originalSize || !Number.isFinite(originalSize) || !Number.isFinite(newSize)) {
      return 0;
    }
    return Math.max(0, 1 - newSize / originalSize);
  }

  function getSavingsPercent(originalSize, newSize) {
    return Math.round(getSavingsRatio(originalSize, newSize) * 100);
  }

  function sanitizeOutputName(value) {
    return value
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "pdfs-unidos";
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes < 1024) {
      return `${bytes || 0} B`;
    }

    const units = ["KB", "MB", "GB"];
    let value = bytes / 1024;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex += 1;
    }

    return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unitIndex]}`;
  }

  function formatFileCount(count) {
    return `${count} ${count === 1 ? "arquivo" : "arquivos"}`;
  }

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  init();
})();
