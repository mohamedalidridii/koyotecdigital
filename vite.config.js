import { defineConfig } from "vite";
import { resolve } from "path";
import { readdirSync, existsSync } from "fs";

// every .html page in the root, en/, blog/ and en/blog/ is a build entry
function collectHtml(root) {
  return ["", "en", "blog", "en/blog"].flatMap((dir) =>
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
      if (target) req.url = target + (query ? `?${query}` : "");
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
