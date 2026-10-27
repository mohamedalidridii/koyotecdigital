import { defineConfig } from "vite";
import { resolve } from "path";
import { readdirSync, existsSync } from "fs";
import { CASE_BASE } from "./cms/generate.mjs";

// every .html page in the root, en/, blog/, en/blog/ and the case study folders is a build entry
function collectHtml(root) {
  return ["", "en", "blog", "en/blog", ...CASE_BASE.map((b) => b.slice(1, -1))].filter((dir) => existsSync(resolve(root, dir))).flatMap((dir) =>
    readdirSync(resolve(root, dir))
      .filter((f) => f.endsWith(".html"))
      .map((f) => (dir ? `${dir}/${f}` : f))
  );
}

// map clean URLs (/blog, /en/services...) to their .html file in dev and preview, like vercel.json does in production
function cleanUrls() {
  const rewrite = (req, _res, next) => {
    const [path, query = ""] = req.url.split("?");
    const clean = path.replace(/\/$/, "");
    if (clean && !/\.[a-z0-9]+$/i.test(clean)) {
      const target = [`${clean}.html`, `${clean}/index.html`].find((f) =>
        existsSync(resolve(__dirname, "." + f))
      );
      // showcase pieces are static sites living in public/ (public/art-de-la-difference/<slug>/index.html)
      const piece = !target && existsSync(resolve(__dirname, "public" + clean, "index.html")) && `${clean}/index.html`;
      if (target || piece) req.url = (target || piece) + (query ? `?${query}` : "");
    }
    next();
  };
  return {
    name: "clean-urls",
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

export default defineConfig({
  plugins: [cleanUrls()],
  server: { host: true },
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        collectHtml(__dirname).map((f) => [f.replace(/\.html$/, "").replace(/[\/]/g, "-"), resolve(__dirname, f)])
      ),
    },
    assetsInclude: [
      "**/*.jpeg",
      "**/*.jpg",
      "**/*.png",
      "**/*.svg",
      "**/*.gif",
    ],
    copyPublicDir: true,
  },
});
