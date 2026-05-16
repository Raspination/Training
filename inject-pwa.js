#!/usr/bin/env node
/**
 * Add manifest link + service-worker registration to www/index.html.
 * Run once after copying a new Roman_Plan_App.html into www/.
 */
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "www", "index.html");
let html = fs.readFileSync(file, "utf8");

// Add manifest link if missing
if (!/<link rel="manifest"/.test(html)) {
  html = html.replace(
    /<\/head>/i,
    '  <link rel="manifest" href="./manifest.webmanifest" />\n</head>'
  );
}

// Add service worker registration if missing
if (!/serviceWorker\.register/.test(html)) {
  html = html.replace(
    /<\/body>/i,
    `<script>
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then((reg) => console.log("SW registered:", reg.scope))
      .catch((err) => console.warn("SW registration failed:", err));
  });
}
</script>
</body>`
  );
}

fs.writeFileSync(file, html);
console.log("✓ Injected manifest link and service-worker registration into www/index.html");
console.log("  File size:", (fs.statSync(file).size / 1024).toFixed(0), "KB");
