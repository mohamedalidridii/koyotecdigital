import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        work: resolve(__dirname, "work.html"),
        services: resolve(__dirname, "services.html"),
        enHome: resolve(__dirname, "en/index.html"),
        enServices: resolve(__dirname, "en/services.html"),
        enContact: resolve(__dirname, "en/contact.html"),
        directors: resolve(__dirname, "directors.html"),
        contact: resolve(__dirname, "contact.html"),
        film: resolve(__dirname, "film.html"),
      },
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
