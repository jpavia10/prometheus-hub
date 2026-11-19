/* A new shell waits. The chip uses the kit's pearl, glass and cyan tokens; a tap reloads into it. */
const SW_URL = new URL("../sw.js", import.meta.url);

export function startShellUpdates() {
  if (globalThis.__prometheusShellUpdates) return;
  const host = location.hostname;
  const secure = location.protocol === "https:" || host === "localhost" || host === "127.0.0.1";
  if (!("serviceWorker" in navigator) || !secure) return;
  globalThis.__prometheusShellUpdates = true;

  let had = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!had) { had = true; return; }
    if (reloading) return;
    reloading = true;
    location.reload();
  });

  const offer = (reg) => {
    const waiting = reg.waiting;
    if (!waiting || !navigator.serviceWorker.controller) return;
    if (document.querySelector("button.update-ready")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "update-ready";
    btn.textContent = "Update ready";
    btn.addEventListener("click", () => {
      const worker = reg.waiting || waiting;
      if (worker) worker.postMessage({ type: "SKIP_WAITING" });
    });
    document.body.append(btn);
  };

  const arm = (reg) => {
    if (reg.waiting) offer(reg);
    reg.addEventListener("updatefound", () => {
      const worker = reg.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed") offer(reg);
      });
    });
  };

  navigator.serviceWorker.register(SW_URL, { updateViaCache: "none" }).then(arm).catch(() => {});
}

if (document.body && document.body.dataset && document.body.dataset.pillar) startShellUpdates();
