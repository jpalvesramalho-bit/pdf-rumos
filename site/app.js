(function () {
  const dependencyStatus = document.getElementById("dependency-status");
  const compressInput = document.getElementById("compress-input");
  const mergeInput = document.getElementById("merge-input");
<<<<<<< HEAD
  const splitInput = document.getElementById("split-input");
  const compressFileList = document.getElementById("compress-file-list");
  const mergeFileList = document.getElementById("merge-file-list");
  const splitFileList = document.getElementById("split-file-list");
  const compressResults = document.getElementById("compress-results");
  const mergeResults = document.getElementById("merge-results");
  const splitResults = document.getElementById("split-results");
  const compressCount = document.getElementById("compress-count");
  const mergeCount = document.getElementById("merge-count");
  const splitCount = document.getElementById("split-count");
  const compressStatus = document.getElementById("compress-status");
  const mergeStatus = document.getElementById("merge-status");
  const splitStatus = document.getElementById("split-status");
  const mergeOutputName = document.getElementById("merge-output-name");
  const splitRanges = document.getElementById("split-ranges");
  const splitRangesGroup = document.getElementById("split-ranges-group");
  const startCompressButton = document.getElementById("start-compress");
  const startMergeButton = document.getElementById("start-merge");
  const startSplitButton = document.getElementById("start-split");
=======
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
>>>>>>> 474f7cacba6e71f8609d15411ae07d0fbaea4ca3

  const state = {
    compressFiles: [],
    mergeFiles: [],
<<<<<<< HEAD
    splitFile: null,
    compressResults: [],
    mergeResult: null,
    splitParts: [],
    splitZipResult: null,
=======
    compressResults: [],
    mergeResult: null,
>>>>>>> 474f7cacba6e71f8609d15411ae07d0fbaea4ca3
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
<<<<<<< HEAD
    if (!window.PDFLib || !window.pdfjsLib || !window.JSZip) {
      setDependencyError(
        "As bibliotecas de PDF/ZIP n\u00e3o foram carregadas. Verifique se a pasta do projeto est\u00e1 completa e tente abrir a p\u00e1gina novamente."
=======
    if (!window.PDFLib || !window.pdfjsLib) {
      setDependencyError(
        "As bibliotecas de PDF não foram carregadas. Verifique se a pasta do projeto está completa e tente abrir a página novamente."
>>>>>>> 474f7cacba6e71f8609d15411ae07d0fbaea4ca3
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
<<<<<<< HEAD
    bindSplitOptions();
    bindDropzone("compress-dropzone", handleCompressDrop);
    bindDropzone("merge-dropzone", handleMergeDrop);
    bindDropzone("split-dropzone", handleSplitDrop);
=======
    bindDropzone("compress-dropzone", handleCompressDrop);
    bindDropzone("merge-dropzone", handleMergeDrop);
>>>>>>> 474f7cacba6e71f8609d15411ae07d0fbaea4ca3

    compressInput.addEventListener("change", (event) => {
      addCompressFiles(event.target.files);
      compressInput.value = "";
    });

    mergeInput.addEventListener("change", (event) => {
      addMergeFiles(event.target.files);
      mergeInput.value = "";
    });

<<<<<<< HEAD
    splitInput.addEventListener("change", (event) => {
      addSplitFile(event.target.files);
      splitInput.value = "";
    });

=======
>>>>>>> 474f7cacba6e71f8609d15411ae07d0fbaea4ca3
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

<<<<<<< HEAD
    document.getElementById("clear-split-file").addEventListener("click", () => {
      state.splitFile = null;
      resetSplitResults();
      setSplitStatus("Aguardando arquivo.", "");
      renderSplitFile();
    });

    startCompressButton.addEventListener("click", processCompression);
    startMergeButton.addEventListener("click", processMerge);
    startSplitButton.addEventListener("click", processSplit);
=======
    startCompressButton.addEventListener("click", processCompression);
    startMergeButton.addEventListener("click", processMerge);
>>>>>>> 474f7cacba6e71f8609d15411ae07d0fbaea4ca3

    renderCompressFiles();
    renderCompressResults();
    renderMergeFiles();
    renderMergeResult();
<<<<<<< HEAD
    renderSplitFile();
    renderSplitResults();
=======
>>>>>>> 474f7cacba6e71f8609d15411ae07d0fbaea4ca3
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

<<<<<<< HEAD
  function bindSplitOptions() {
    const updateRangesState = () => {
      const isPageMode = getSelectedSplitMode() === "pages";
      splitRanges.disabled = isPageMode;
      splitRangesGroup.classList.toggle("is-disabled", isPageMode);
    };

    document.querySelectorAll('input[name="split-mode"]').forEach((input) => {
      input.addEventListener("change", updateRangesState);
    });
    updateRangesState();
  }

=======
>>>>>>> 474f7cacba6e71f8609d15411ae07d0fbaea4ca3
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

<<<<<<< HEAD
  function handleSplitDrop(files) {
    addSplitFile(files);
  }

=======
>>>>>>> 474f7cacba6e71f8609d15411ae07d0fbaea4ca3
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

<<<<<<< HEAD
  function addSplitFile(fileList) {
    const files = filterPdfFiles(fileList);
    if (!files.length) {
      setSplitStatus("Selecione um arquivo PDF para dividir.", "error");
      return;
    }

    state.splitFile = files[0];
    resetSplitResults();
    setSplitStatus(`${state.splitFile.name} pronto para divis\u00e3o.`, "");
    renderSplitFile();
  }

=======
>>>>>>> 474f7cacba6e71f8609d15411ae07d0fbaea4ca3
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

<<<<<<< HEAD
  function renderSplitFile() {
    splitCount.textContent = formatFileCount(state.splitFile ? 1 : 0);
    if (!state.splitFile) {
      splitFileList.innerHTML = '<p class="empty-state">Nenhum PDF selecionado ainda.</p>';
      return;
    }

    splitFileList.innerHTML = `
      <div class="file-item">
        <div class="file-item-head">
          <div class="file-meta">
            <div class="file-name">${escapeHtml(state.splitFile.name)}</div>
            <div class="file-subline">${formatBytes(state.splitFile.size)}</div>
          </div>
          <div class="file-actions">
            <button class="reorder-button" type="button" id="remove-split-file">Remover</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("remove-split-file").addEventListener("click", () => {
      state.splitFile = null;
      resetSplitResults();
      setSplitStatus("Aguardando arquivo.", "");
      renderSplitFile();
    });
  }

  function renderSplitResults() {
    if (!state.splitZipResult && !state.splitParts.length) {
      splitResults.innerHTML = '<p class="empty-state">Os PDFs gerados aparecer&atilde;o aqui para download.</p>';
      return;
    }

    splitResults.innerHTML = "";

    if (state.splitZipResult) {
      const zipItem = document.createElement("div");
      zipItem.className = "result-item is-optimized";
      zipItem.innerHTML = `
        <div class="result-item-head">
          <div class="result-meta">
            <div class="result-name">${escapeHtml(state.splitZipResult.outputName)}</div>
            <div class="result-subline">${formatBytes(state.splitZipResult.size)} com ${state.splitZipResult.count} arquivo(s) PDF.</div>
            <div class="result-note">O download autom&aacute;tico do ZIP foi iniciado. Voc&ecirc; tamb&eacute;m pode baixar novamente por aqui.</div>
          </div>
          <div class="result-actions">
            <span class="result-badge is-success">ZIP pronto</span>
            <button class="download-button" type="button" id="download-split-zip">Baixar ZIP</button>
          </div>
        </div>
      `;
      splitResults.appendChild(zipItem);
    }

    state.splitParts.forEach((part, index) => {
      const item = document.createElement("div");
      item.className = "result-item";
      item.innerHTML = `
        <div class="result-item-head">
          <div class="result-meta">
            <div class="result-name">${escapeHtml(part.outputName)}</div>
            <div class="result-subline">P&aacute;ginas: ${escapeHtml(part.pageLabel)} | ${formatBytes(part.size)}</div>
          </div>
          <div class="result-actions">
            <button class="download-button" type="button" data-download-split-part="${index}">Baixar PDF</button>
          </div>
        </div>
      `;
      splitResults.appendChild(item);
    });

    const zipButton = document.getElementById("download-split-zip");
    if (zipButton) {
      zipButton.addEventListener("click", () => {
        downloadFile(state.splitZipResult.url, state.splitZipResult.outputName);
      });
    }

    splitResults.querySelectorAll("[data-download-split-part]").forEach((button) => {
      button.addEventListener("click", () => {
        const result = state.splitParts[Number(button.dataset.downloadSplitPart)];
        downloadFile(result.url, result.outputName);
      });
    });
  }

=======
>>>>>>> 474f7cacba6e71f8609d15411ae07d0fbaea4ca3
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

<<<<<<< HEAD
  async function processSplit() {
    if (state.processing) {
      return;
    }

    if (!state.splitFile) {
      setSplitStatus("Selecione um PDF antes de dividir.", "error");
      return;
    }

    state.processing = true;
    disableActions(true);
    resetSplitResults();

    setSplitStatus("Lendo o PDF selecionado...", "running");

    try {
      const result = await splitPdf(state.splitFile, getSelectedSplitMode(), splitRanges.value, (message) => {
        setSplitStatus(message, "running");
      });

      state.splitParts = result.parts.map((part) => {
        const blob = new Blob([part.bytes], { type: "application/pdf" });
        return {
          outputName: part.outputName,
          pageLabel: part.pageLabel,
          size: blob.size,
          url: URL.createObjectURL(blob),
        };
      });

      const zipUrl = URL.createObjectURL(result.zipBlob);
      state.splitZipResult = {
        outputName: "pdf_dividido.zip",
        url: zipUrl,
        size: result.zipBlob.size,
        count: state.splitParts.length,
      };

      renderSplitResults();
      downloadFile(zipUrl, state.splitZipResult.outputName);
      setSplitStatus(`Divis\u00e3o conclu\u00edda. ${state.splitParts.length} arquivo(s) PDF gerado(s).`, "success");
    } catch (error) {
      console.error(error);
      resetSplitResults();
      setSplitStatus(`Falha na divis\u00e3o: ${error.message}`, "error");
    } finally {
      state.processing = false;
      disableActions(false);
    }
  }

=======
>>>>>>> 474f7cacba6e71f8609d15411ae07d0fbaea4ca3
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

<<<<<<< HEAD
  async function splitPdf(file, mode, rangesText, onProgress) {
    const sourceBytes = await file.arrayBuffer();
    const sourcePdf = await PDFLib.PDFDocument.load(sourceBytes, { ignoreEncryption: true });
    const totalPages = sourcePdf.getPageCount();
    const splitPlan = mode === "pages" ? buildSinglePagePlan(totalPages) : parseSplitRanges(rangesText, totalPages);
    const baseName = sanitizeOutputName(file.name.replace(/\.pdf$/i, ""), "pdf-dividido");
    const usedNames = new Set();
    const parts = [];

    for (let index = 0; index < splitPlan.length; index += 1) {
      const plan = splitPlan[index];
      onProgress(`Gerando PDF ${index + 1} de ${splitPlan.length}...`);
      const outputPdf = await PDFLib.PDFDocument.create();
      const copiedPages = await outputPdf.copyPages(
        sourcePdf,
        plan.pages.map((pageNumber) => pageNumber - 1)
      );
      copiedPages.forEach((page) => outputPdf.addPage(page));

      const bytes = await outputPdf.save({ useObjectStreams: true });
      const outputName = makeUniqueFileName(buildSplitPartName(baseName, plan, mode, totalPages), usedNames);
      parts.push({
        outputName,
        pageLabel: plan.label,
        bytes,
        size: bytes.byteLength,
      });
    }

    const zip = new window.JSZip();
    parts.forEach((part) => {
      zip.file(part.outputName, part.bytes);
    });

    onProgress("Compactando arquivos em ZIP...");
    const zipBlob = await zip.generateAsync(
      {
        type: "blob",
        compression: "DEFLATE",
      },
      (metadata) => {
        onProgress(`Compactando arquivos em ZIP... ${Math.round(metadata.percent)}%`);
      }
    );

    return {
      parts,
      zipBlob,
    };
  }

=======
>>>>>>> 474f7cacba6e71f8609d15411ae07d0fbaea4ca3
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

<<<<<<< HEAD
  function resetSplitResults() {
    clearResultUrls(state.splitParts);
    state.splitParts = [];
    if (state.splitZipResult) {
      URL.revokeObjectURL(state.splitZipResult.url);
      state.splitZipResult = null;
    }
    renderSplitResults();
  }

=======
>>>>>>> 474f7cacba6e71f8609d15411ae07d0fbaea4ca3
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

<<<<<<< HEAD
  function setSplitStatus(message, type) {
    setStatus(splitStatus, message, type);
  }

=======
>>>>>>> 474f7cacba6e71f8609d15411ae07d0fbaea4ca3
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
<<<<<<< HEAD
    startSplitButton.disabled = disabled;
=======
>>>>>>> 474f7cacba6e71f8609d15411ae07d0fbaea4ca3
  }

  function getSelectedPreset() {
    const selected = document.querySelector('input[name="compress-preset"]:checked');
    return selected ? selected.value : "equilibrado";
  }

<<<<<<< HEAD
  function getSelectedSplitMode() {
    const selected = document.querySelector('input[name="split-mode"]:checked');
    return selected ? selected.value : "ranges";
  }

=======
>>>>>>> 474f7cacba6e71f8609d15411ae07d0fbaea4ca3
  function buildCompressedName(fileName) {
    const dotIndex = fileName.toLowerCase().lastIndexOf(".pdf");
    const baseName = dotIndex > -1 ? fileName.slice(0, dotIndex) : fileName;
    return `${baseName}_comprimido.pdf`;
  }

<<<<<<< HEAD
  function buildSplitPartName(baseName, plan, mode, totalPages) {
    if (mode === "pages") {
      const paddedPage = String(plan.start).padStart(String(totalPages).length, "0");
      return `${baseName}_pagina_${paddedPage}.pdf`;
    }

    return `${baseName}_paginas_${plan.label}.pdf`;
  }

  function buildSinglePagePlan(totalPages) {
    return Array.from({ length: totalPages }, (_, index) => {
      const pageNumber = index + 1;
      return {
        start: pageNumber,
        end: pageNumber,
        label: String(pageNumber),
        pages: [pageNumber],
      };
    });
  }

  function parseSplitRanges(value, totalPages) {
    const tokens = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!tokens.length) {
      throw new Error("Informe pelo menos um intervalo, como 1-3, 4-6.");
    }

    return tokens.map((token) => {
      const match = token.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if (!match) {
        throw new Error("Use intervalos no formato 1-3, 4-6 ou p\u00e1ginas avulsas como 8.");
      }

      const start = Number(match[1]);
      const end = match[2] ? Number(match[2]) : start;
      if (start < 1 || end < 1) {
        throw new Error("Os intervalos devem come\u00e7ar na p\u00e1gina 1 ou maior.");
      }
      if (start > end) {
        throw new Error(`O intervalo ${token} est\u00e1 invertido. Use ${end}-${start}.`);
      }
      if (end > totalPages) {
        throw new Error(`O PDF tem ${totalPages} p\u00e1gina(s). Ajuste o intervalo ${token}.`);
      }

      return {
        start,
        end,
        label: start === end ? String(start) : `${start}-${end}`,
        pages: buildPageRange(start, end),
      };
    });
  }

  function buildPageRange(start, end) {
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  function makeUniqueFileName(fileName, usedNames) {
    if (!usedNames.has(fileName)) {
      usedNames.add(fileName);
      return fileName;
    }

    const dotIndex = fileName.toLowerCase().lastIndexOf(".pdf");
    const baseName = dotIndex > -1 ? fileName.slice(0, dotIndex) : fileName;
    const extension = dotIndex > -1 ? fileName.slice(dotIndex) : ".pdf";
    let counter = 2;
    let candidate = `${baseName}_${counter}${extension}`;

    while (usedNames.has(candidate)) {
      counter += 1;
      candidate = `${baseName}_${counter}${extension}`;
    }

    usedNames.add(candidate);
    return candidate;
  }

=======
>>>>>>> 474f7cacba6e71f8609d15411ae07d0fbaea4ca3
  function getSavingsRatio(originalSize, newSize) {
    if (!originalSize || !Number.isFinite(originalSize) || !Number.isFinite(newSize)) {
      return 0;
    }
    return Math.max(0, 1 - newSize / originalSize);
  }

  function getSavingsPercent(originalSize, newSize) {
    return Math.round(getSavingsRatio(originalSize, newSize) * 100);
  }

<<<<<<< HEAD
  function sanitizeOutputName(value, fallbackName = "pdfs-unidos") {
=======
  function sanitizeOutputName(value) {
>>>>>>> 474f7cacba6e71f8609d15411ae07d0fbaea4ca3
    return value
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
<<<<<<< HEAD
      .replace(/^-|-$/g, "") || fallbackName;
=======
      .replace(/^-|-$/g, "") || "pdfs-unidos";
>>>>>>> 474f7cacba6e71f8609d15411ae07d0fbaea4ca3
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
