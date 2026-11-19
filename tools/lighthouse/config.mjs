/**
 * Default Lighthouse categories, plus the two installability audits that
 * Lighthouse 12 dropped from the built-in config. Mobile emulation stays the
 * default (Moto G Power); lighthouserc.json sets it again so the run is explicit.
 */
export default {
  extends: "lighthouse:default",
  artifacts: [
    {id: "InstallabilityErrors", gatherer: {path: "./gatherers/installability.mjs"}},
  ],
  audits: [
    {path: "./audits/installable-manifest.mjs"},
    {path: "./audits/service-worker.mjs"},
  ],
  categories: {
    pwa: {
      title: "PWA",
      description: "Installable checks for the hub shell. Lighthouse no longer scores a PWA category; these two audits are what CI asserts.",
      auditRefs: [
        {id: "installable-manifest", weight: 1},
        {id: "service-worker", weight: 1},
      ],
    },
  },
};
