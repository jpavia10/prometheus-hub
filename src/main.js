import { startField } from "./particles.js";

const canvas = document.getElementById("field");

if (canvas) {
  try {
    startField(canvas);
    document.documentElement.classList.add("has-gl");
  } catch (error) {
    document.documentElement.classList.add("no-gl");
    console.warn("Particle field unavailable", error);
  }
}

const links = document.querySelectorAll(".topnav a");
const panels = document.querySelectorAll(".panel");

if ("IntersectionObserver" in window && panels.length) {
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        links.forEach(function (link) {
          const on = link.getAttribute("href") === "#" + id;
          if (on) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { threshold: 0.55 }
  );
  panels.forEach(function (panel) { observer.observe(panel); });
}

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./sw.js").catch(function () {});
  });
}
