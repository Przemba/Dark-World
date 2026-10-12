/* Buduje jeden plik dist/dark-world.html (do grania bez serwera, np. z pliku w telefonie). Użycie: node tools/build-single.js */
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
let html = fs.readFileSync(path.join(root, "index.html"), "utf8");
html = html.replace(/<link rel="manifest"[^>]*>\n?/, "").replace(/<link rel="(icon|apple-touch-icon)"[^>]*>\n?/g, "");
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/, (_, f) => "<style>\n" + fs.readFileSync(path.join(root, f), "utf8") + "\n</style>");
html = html.replace(/<script src="([^"]+)"><\/script>/g, (_, f) => "<script>\n" + fs.readFileSync(path.join(root, f), "utf8").replace(/<\/script>/g, "<\\/script>") + "\n</script>");
fs.mkdirSync(path.join(root, "dist"), { recursive: true });
fs.writeFileSync(path.join(root, "dist/dark-world.html"), html);
console.log("dist/dark-world.html", Math.round(html.length / 1024) + " KB");
