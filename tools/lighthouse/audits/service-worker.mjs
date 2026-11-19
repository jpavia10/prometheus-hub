/**
 * Passes when a service worker registered, or when Chrome reports no
 * installability errors at all (installability already requires the worker).
 */

const SW_ERROR = /service[-_ ]?worker|offline/i;

class ServiceWorkerAudit {
  static get meta() {
    return {
      id: "service-worker",
      title: "Registers a service worker",
      failureTitle: "Does not register a service worker",
      description: "An installable page registers a service worker whose scope covers the manifest start URL. The shell worker is sw.js at the site root.",
      requiredArtifacts: ["InstallabilityErrors"],
    };
  }

  static audit(artifacts) {
    const art = artifacts.InstallabilityErrors || {errors: [], registration: {}};
    const errors = art.errors || [];
    const swErrors = errors.filter((item) => SW_ERROR.test(item.errorId || ""));
    const registration = art.registration || {};
    const chromeInstallable = errors.length === 0;
    const registered = !!registration.has && swErrors.length === 0;
    const pass = chromeInstallable || registered;
    const headings = [
      {key: "field", valueType: "text", label: "Field"},
      {key: "value", valueType: "text", label: "Value"},
    ];
    const items = [
      {field: "registered", value: String(!!registration.has)},
      {field: "state", value: registration.state || ""},
      {field: "script", value: registration.script || ""},
      {field: "scope", value: registration.scope || ""},
      ...swErrors.map((item) => ({field: item.errorId || "error", value: (item.errorArguments || []).map((arg) => `${arg.name}=${arg.value}`).join(", ")})),
    ];
    return {
      score: pass ? 1 : 0,
      details: {type: "table", headings, items},
    };
  }
}

export default ServiceWorkerAudit;
