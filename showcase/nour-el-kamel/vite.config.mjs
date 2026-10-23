import { resolve } from "node:path";
import { defineConfig } from "vite";

const pages = [
  "index.html",
  "about.html",
  "speaking.html",
  "contact.html",
  "work/sawt-al-medina.html",
  "work/next-mayors.html",
  "work/little-lanterns.html",
  "work/open-voices.html",
];

export default defineConfig({
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((page) => [page.replace(".html", ""), resolve(import.meta.dirname, page)]),
      ),
    },
  },
});
