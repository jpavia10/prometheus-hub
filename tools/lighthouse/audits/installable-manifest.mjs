/**
 * Fails when Chrome reports an installability error that is not only
 * "no service worker yet". The service-worker audit covers that half.
 */

const SW_ERROR = /service[-_ ]?worker|offline/i;

function rows(errors) {
  return errors.map((item) => ({
    errorId: item.errorId || "",
    args: (item.errorArguments || []).map((arg) => `${arg.name}=${arg.value}`).join(", "),
  }));
}

class InstallableManifest {
  static get meta() {
    return {
      id: "installable-manifest",
      title: "Manifest meets the installability requirements",
      failureTitle: "Manifest does not meet the installability requirements",
      description: "Chrome installs a page when the linked manifest has a name, a standalone display, and 192 and 512 icons, on a secure origin. Service-worker errors are reported by the service-worker audit.",
      requiredArtifacts: ["InstallabilityErrors"],
    };
  }

  static audit(artifacts) {
    const found = (artifacts.InstallabilityErrors && artifacts.InstallabilityErrors.errors) || [];
    const manifestErrors = found.filter((item) => !SW_ERROR.test(item.errorId || ""));
    const headings = [
      {key: "errorId", valueType: "text", label: "Error"},
      {key: "args", valueType: "text", label: "Arguments"},
    ];
    return {
      score: manifestErrors.length ? 0 : 1,
      details: {type: "table", headings, items: rows(manifestErrors)},
    };
  }
}

export default InstallableManifest;
