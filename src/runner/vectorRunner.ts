/**
 * Исполнитель учебного JS: код студента изолирован в sandbox iframe + Worker.
 * Только доверенный обработчик формирует оценку. Проверки выполняются в
 * отдельном лексическом окружении с замороженными стандартными объектами.
 * Это защита от подмены результатов в ходе упражнения, НЕ серверная аттестация.
 */
export interface RunnerTest {
  name: string;
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

let sequence = 0;

/** Эта функция сериализуется в изолированный Worker через toString(). */
function workerRuntime() {
  const send = self.postMessage.bind(self);

  self.onmessage = (event: MessageEvent) => {
    const payload = event.data as {
      code: string;
      tests: RunnerTest[];
      entrypoint: string;
      token: string;
    };
    const logs: string[] = [];
    const fakeConsole = Object.freeze({
      log: (...items: unknown[]) => {
        if (logs.length < 100) logs.push(items.map((x) => String(x)).join(" ").slice(0, 500));
      },
      info: (...items: unknown[]) => {
        if (logs.length < 100) logs.push(items.map((x) => String(x)).join(" ").slice(0, 500));
      },
      error: (...items: unknown[]) => {
        if (logs.length < 100) logs.push("ERROR: " + items.map((x) => String(x)).join(" ").slice(0, 500));
      },
    });

    let result: RunResult;
    try {
      if (!/^[A-Za-z_$][\w$]*$/.test(payload.entrypoint)) throw new Error("Не указана корректная функция для проверки.");
      if (payload.code.length > 25000) throw new Error("Слишком большой объём кода для учебной песочницы.");
      if (!payload.tests.length || payload.tests.length > 30) throw new Error("Для задания отсутствует корректный набор проверок.");

      // Эти экземпляры используются проверками, а не пользовательским кодом.
      const trustedMath = Object.freeze(
        Object.fromEntries(Object.getOwnPropertyNames(Math).map((k) => [k, (Math as unknown as Record<string, unknown>)[k]])),
      );
      const trustedJSON = Object.freeze({ stringify: JSON.stringify.bind(JSON), parse: JSON.parse.bind(JSON) });
      for (const object of [
        Math, JSON, Array, Array.prototype, Number, Number.prototype,
        String, String.prototype, Boolean, Boolean.prototype, Object, Object.prototype,
        Function, Function.prototype, RegExp, RegExp.prototype, Date, Date.prototype,
      ]) Object.freeze(object);

      // В код ученика никогда не передаются тесты, токен или обработчик результата.
      const source = '"use strict";\n' + payload.code +
        '\nreturn typeof ' + payload.entrypoint + ' === "function" ? ' + payload.entrypoint + ' : undefined;';
      const makeFunction = new Function(
        "Math", "JSON", "console", "self", "postMessage", "globalThis", "window", "parent", source,
      );
      const studentFunction = makeFunction(trustedMath, trustedJSON, fakeConsole, undefined, undefined, undefined, undefined, undefined);
      if (typeof studentFunction !== "function") throw new Error("Определите функцию " + payload.entrypoint + " в редакторе.");

      // Test expressions проверяются вне области видимости студентского решения.
      const tests: RunnerTestResult[] = [];
      for (const test of payload.tests) {
        try {
          const judge = new Function(
            payload.entrypoint, "Math", "JSON",
            '"use strict"; return !!(' + test.code + ');',
          );
          tests.push({ name: test.name, passed: !!judge(studentFunction, trustedMath, trustedJSON) });
        } catch (error) {
          tests.push({ name: test.name, passed: false, error: String(error).slice(0, 300) });
        }
      }
      result = { ok: true, timeout: false, logs, tests };
    } catch (error) {
      result = { ok: false, timeout: false, logs, error: String(error).slice(0, 300) };
    }
    // Токен доступен только внешнему обработчику события, не студентскому коду.
    send({ token: payload.token, result });
  };
}

export function runStudentCode(
  code: string,
  tests: RunnerTest[],
  timeoutMs = 4000,
  entrypoint?: string,
): Promise<RunResult> {
  const id = ++sequence;
  const token = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now()) + "-" + String(Math.random());
  const inferred = [...code.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map((m) => m[1]).pop();
  const functionName = entrypoint ?? inferred ?? "";

  return new Promise((resolve) => {
    const workerSource = "(" + workerRuntime.toString() + ")();";
    const frameScript = [
      "let current = null;",
      "window.addEventListener('message', event => {",
      "  if (event.source !== parent || current) return;",
      "  const input = event.data;",
      "  current = {id: input.id, token: input.token};",
      "  const url = URL.createObjectURL(new Blob([" + JSON.stringify(workerSource) + "], {type:'application/javascript'}));",
      "  const worker = new Worker(url);",
      "  URL.revokeObjectURL(url);",
      "  worker.onmessage = event => {",
      "    if (!event.data || event.data.token !== current.token) return;",
      "    parent.postMessage({id:current.id,token:current.token,result:event.data.result},'*');",
      "    worker.terminate();",
      "  };",
      "  worker.onerror = () => {",
      "    parent.postMessage({id:current.id,token:current.token,result:{ok:false,timeout:false,logs:[],error:'Ошибка исполнения Worker'}},'*');",
      "    worker.terminate();",
      "  };",
      "  worker.postMessage(input);",
      "});",
    ].join("\n");

    const html = '<!doctype html><html lang="ru"><head>' +
      '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; ' +
      'script-src \'unsafe-inline\' \'unsafe-eval\' blob:; worker-src blob:; connect-src \'none\';">' +
      '</head><body><script>' + frameScript + '</script></body></html>';
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.setAttribute("title", "Изолированный исполнитель учебных заданий");
    iframe.style.display = "none";
    iframe.src = url;
    let done = false;

    const finish = (res: RunResult) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      window.removeEventListener("message", onMsg);
      iframe.remove();
      URL.revokeObjectURL(url);
      resolve(res);
    };
    const timer = window.setTimeout(
      () => finish({ ok: false, timeout: true, logs: [], error: "Превышено время выполнения (" + timeoutMs + " мс)" }),
      timeoutMs + 1500,
    );
    const onMsg = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      const data = event.data as { id?: number; token?: string; result?: RunResult };
      if (data?.id !== id || data.token !== token || !data.result) return;
      finish(data.result);
    };
    window.addEventListener("message", onMsg);
    iframe.addEventListener("load", () => {
      iframe.contentWindow?.postMessage({ id, token, code, tests, entrypoint: functionName }, "*");
    }, { once: true });
    document.body.appendChild(iframe);
  });
}
