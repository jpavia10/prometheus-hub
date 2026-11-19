/**
 * Chrome's own installability errors, plus whether a service worker registered.
 * Lighthouse 12 removed the PWA category; CI still asserts these two checks.
 * The gatherer polls briefly because the shell worker installs after first paint.
 */

const SW_WAIT_MS = 15000;
const SW_POLL_MS = 400;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class InstallabilityErrors {
  meta = {supportedModes: ["navigation"]};

  startInstrumentation() {}
  startSensitiveInstrumentation() {}
  stopSensitiveInstrumentation() {}
  stopInstrumentation() {}

  async getArtifact(context) {
    const session = context.driver.defaultSession;
    const started = Date.now();
    let errors = [];
    let registration = {has: false, scope: "", script: "", state: ""};
    let lastError = "";
    while (Date.now() - started < SW_WAIT_MS) {
      try {
        const result = await session.sendCommand("Page.getInstallabilityErrors");
        errors = result.installabilityErrors || [];
      } catch (err) {
        lastError = String(err && err.message || err);
        errors = [{errorId: "getInstallabilityErrors-failed", errorArguments: [{name: "message", value: lastError}]}];
      }
      try {
        const evaluated = await session.sendCommand("Runtime.evaluate", {
          expression: `navigator.serviceWorker.getRegistration().then((reg) => {
            if (!reg) return {has: false, scope: "", script: "", state: ""};
            const worker = reg.active || reg.waiting || reg.installing;
            return {has: true, scope: reg.scope || "", script: worker ? worker.scriptURL : "", state: worker ? worker.state : ""};
          })`,
          awaitPromise: true,
          returnByValue: true,
        });
        if (evaluated.result && evaluated.result.value) registration = evaluated.result.value;
      } catch (err) {
        lastError = lastError || String(err && err.message || err);
      }
      const swMissing = errors.some((item) => /service[-_ ]?worker|offline/i.test(item.errorId || ""));
      if (!errors.length || (registration.has && registration.state === "activated" && !swMissing)) break;
      if (errors.length && !swMissing && !/getInstallabilityErrors-failed/.test(errors[0].errorId || "")) break;
      await sleep(SW_POLL_MS);
    }
    return {errors, registration, waitedMs: Date.now() - started, lastError};
  }
}

export default InstallabilityErrors;
