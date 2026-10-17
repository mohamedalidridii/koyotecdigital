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

// dev only: map clean URLs (/blog, /en/services...) to their .html file, like vercel.json does in production
function cleanUrls() {
  return {
    name: "clean-urls",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [path, query = ""] = req.url.split("?");
        const clean = path.replace(/\/$/, "");
        if (clean && !/\.[a-z0-9]+$/i.test(clean)) {
          const target = [`${clean}.html`, `${clean}/index.html`].find((f) =>
            existsSync(resolve(__dirname, "." + f))
          );
          if (target) req.url = target + (query ? `?${query}` : "");
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [cleanUrls()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        collectHtml(__dirname).map((f) => [f.replace(/\.html$/, "").replace(/[\/]/g, "-"), resolve(__dirname, f)])
      ),
      server: {
    host: true, // or specify '0.0.0.0'
  },
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
