const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const AppError = require("../errors/AppError");

const OUTPUT_LIMIT_BYTES = 2 * 1024 * 1024;

function appendLimited(current, chunk) {
  const next = current + chunk.toString("utf8");
  if (Buffer.byteLength(next, "utf8") <= OUTPUT_LIMIT_BYTES) {
    return next;
  }

  return next.slice(0, OUTPUT_LIMIT_BYTES) + "\n[saida truncada]";
}

function isWindowsScript(command) {
  return process.platform === "win32" && /\.(bat|cmd)$/i.test(command);
}

function quoteWindowsArg(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function buildSpawnCommand(command, args) {
  if (!isWindowsScript(command)) {
    return { executable: command, args, shell: false };
  }

  // VeraPDF no Windows normalmente e distribuido como .bat.
  // Para .bat/.cmd, o shell do Windows lida melhor com o primeiro argumento cotado.
  const commandLine = [quoteWindowsArg(command), ...args.map(quoteWindowsArg)].join(" ");
  return {
    executable: commandLine,
    args: [],
    shell: true,
  };
}

function commandExists(command) {
  const hasDirectory = path.dirname(command) !== ".";

  if (hasDirectory) {
    return fs.existsSync(command);
  }

  const pathEntries = (process.env.PATH || "").split(path.delimiter).filter(Boolean);
  const extensions = process.platform === "win32" && !path.extname(command)
    ? (process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM").split(";")
    : [""];

  return pathEntries.some((entry) => extensions.some((extension) => (
    fs.existsSync(path.join(entry, `${command}${extension}`))
  )));
}

function toStartError(command, error) {
  const notFoundCodes = new Set(["ENOENT", "ENOTDIR"]);

  if (notFoundCodes.has(error.code) || (process.platform === "win32" && error.code === "EPERM" && !commandExists(command))) {
    return new AppError(`Executavel nao encontrado: ${command}.`, 500, "COMMAND_NOT_FOUND", { command });
  }

  return new AppError(`Falha ao iniciar processo externo: ${command}.`, 502, "PROCESS_START_FAILED", {
    command,
    cause: error.message,
  });
}

function hasCommandNotFoundOutput(result) {
  const output = `${result.stdout}\n${result.stderr}`.toLowerCase();
  return /is not recognized as an internal or external command/.test(output)
    || /the system cannot find the (file|path) specified/.test(output)
    || /nao e reconhecido como um comando interno ou externo/.test(output)
    || /n.o . reconhecido como um comando interno ou externo/.test(output)
    || /o sistema n.o pode encontrar o (arquivo|caminho) especificado/.test(output);
}

function runProcess(command, args, options = {}) {
  const timeoutMs = options.timeoutMs || 120000;

  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let settled = false;

    const spawnCommand = buildSpawnCommand(command, args);
    let child;

    try {
      // Usa spawn sem shell; scripts .bat/.cmd sao encapsulados de forma controlada.
      child = spawn(spawnCommand.executable, spawnCommand.args, {
        windowsHide: true,
        shell: spawnCommand.shell,
      });
    } catch (error) {
      return reject(toStartError(command, error));
    }

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout = appendLimited(stdout, chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderr = appendLimited(stderr, chunk);
    });

    child.on("error", (error) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timer);

      reject(toStartError(command, error));
    });

    child.on("close", (exitCode, signal) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timer);

      if (timedOut) {
        return reject(new AppError("Tempo limite de processamento excedido.", 504, "PROCESS_TIMEOUT", {
          command,
          timeoutMs,
        }));
      }

      resolve({ command, exitCode, signal, stdout, stderr });
    });
  });
}

async function runFirstAvailable(commands, args, options = {}) {
  for (const command of commands) {
    try {
      const result = await runProcess(command, args, options);
      if (hasCommandNotFoundOutput(result)) {
        continue;
      }

      return result;
    } catch (error) {
      if (error.code === "COMMAND_NOT_FOUND") {
        continue;
      }

      throw error;
    }
  }

  throw new AppError("Nenhum executavel compativel foi encontrado.", 500, "COMMAND_NOT_FOUND", { commands });
}

module.exports = {
  runFirstAvailable,
};
