/**
 * Безопасный исполнитель учебного кода.
 * Ученический JavaScript выполняется в Worker внутри изолированного
 * iframe (sandbox="allow-scripts"), с CSP-ограничениями и остановкой
 * по тайм-ауту. Возвращает логи и результаты автотестов.
 */

export interface RunnerTest {
  name: string;
  /** JS-выражение, вычисляемое после кода ученика; true = тест пройден */
  code: string;
}

export interface RunnerTestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export interface RunResult {
  ok: boolean;
  timeout: boolean;
  logs: string[];
  error?: string;
  tests?: RunnerTestResult[];
}

let nonce = 0;

export function runStudentCode(
  code: string,
  tests: RunnerTest[],
  timeoutMs = 4000,
): Promise<RunResult> {
  nonce++;
  const id = nonce;

  return new Promise((resolve) => {
    const workerSrc = `
self.onmessage = (e) => {
  const logs = [];
  const fakeConsole = {
    log: (...a) => logs.push(a.map((x) =>
      typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')),
    info: (...a) => logs.push(a.map(String).join(' ')),
    error: (...a) => logs.push('ERROR: ' + a.map(String).join(' ')),
  };
  const harness = e.data.code + '\\n;const __tests = ' + JSON.stringify(e.data.tests) + ';'
    + 'const __results = [];'
    + 'for (const t of __tests) {'
    + '  try { const r = eval(t.code); __results.push({ name: t.name, passed: !!r }); }'
    + '  catch (err) { __results.push({ name: t.name, passed: false, error: String(err) }); }'
    + '}'
    + 'return __results;';
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('console', harness);
    const results = fn(fakeConsole);
    postMessage({ ok: true, logs, tests: results });
  } catch (err) {
    postMessage({ ok: false, logs, error: String(err) });
  }
};
`;
    const html = `<!doctype html><html><head>
<meta http-equiv="Content-Security-Policy"
  content="default-src 'none'; script-src 'unsafe-inline' blob:; connect-src 'none';">
</head><body><script>
const blob = new Blob([${JSON.stringify(workerSrc)}], { type: 'application/javascript' });
let worker = null;
self.onmessage = (e) => {
  if (worker) worker.terminate();
  worker = new Worker(URL.createObjectURL(blob));
  worker.onmessage = (ev) => { parent.postMessage({ id: e.data.id, result: ev.data }, '*'); };
  worker.postMessage(e.data);
};
</` + `script></body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.style.display = "none";
    iframe.src = url;

    let done = false;
    const finish = (res: RunResult) => {
      if (done) return;
      done = true;
      window.removeEventListener("message", onMsg);
      iframe.remove();
      URL.revokeObjectURL(url);
      resolve(res);
    };

    const timer = window.setTimeout(() => {
      finish({
        ok: false,
        timeout: true,
        logs: [],
        error: `Превышено время выполнения (${timeoutMs} мс)`,
      });
    }, timeoutMs + 1500);

    const onMsg = (ev: MessageEvent) => {
      const data = ev.data as { id?: number; result?: RunResult };
      if (!data || data.id !== id || !data.result) return;
      window.clearTimeout(timer);
      finish({ ...data.result, timeout: false });
    };
    window.addEventListener("message", onMsg);

    const onLoad = () => {
      iframe.contentWindow?.postMessage({ id, code, tests }, "*");
    };
    iframe.addEventListener("load", onLoad);
    document.body.appendChild(iframe);
  });
}
