import { resolve } from 'node:path';
import { createServer, defineConfig, type Plugin, type ViteDevServer } from 'vite';
import glsl from 'vite-plugin-glsl';

const page = (p: string) => resolve(import.meta.dirname, p);

type Seo = Record<string, { path: string; title: string; description: string }>;
type Site = { SITE: string; seo: Seo };

const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function head(c: Site, page: string) {
  const s = c.seo[page];
  const url = `${c.SITE}/${s.path}`;
  const img = `${c.SITE}/og.jpg`;
  return `<title>${attr(s.title)}</title>
    <meta name="description" content="${attr(s.description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:site_name" content="Ligne Inox — Concept KOYOTEC" />
    <meta property="og:title" content="${attr(s.title)}" />
    <meta property="og:description" content="${attr(s.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${attr(s.title)}" />
    <meta name="twitter:description" content="${attr(s.description)}" />
    <meta name="twitter:image" content="${img}" />`;
}

/**
 * Writes each page's real content into its HTML (crawlers and link previews get the text without JS),
 * plus title, description and social cards. The page modules are plain string functions, loaded through
 * a throwaway SSR server that uses the same base path as the build.
 */
const seoPlugin = (): Plugin => {
  let site: Site | null = null;
  let renders: Record<string, () => string> = {};
  let build = false;
  let base = '/';
  const load = async (vs: ViteDevServer) => {
    site = (await vs.ssrLoadModule('/src/content.ts')) as unknown as Site;
    renders = ((await vs.ssrLoadModule('/src/pages/index.ts')) as { renders: typeof renders }).renders;
  };
  return {
    name: 'li-seo',
    configResolved(c) {
      build = c.command === 'build';
      base = c.base;
    },
    async buildStart() {
      if (!build) return;
      const vs = await createServer({ configFile: false, root: import.meta.dirname, base, logLevel: 'silent', server: { middlewareMode: true }, appType: 'custom' });
      try {
        await load(vs);
      } finally {
        await vs.close();
      }
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html, ctx) {
        if (ctx.server) await load(ctx.server);
        const page = html.match(/<main id="main" data-page="(\w+)">/)?.[1];
        if (!site || !page || !renders[page]) return html;
        return html
          .replace('<!--seo-->', head(site, page))
          .replace(`<main id="main" data-page="${page}"></main>`, `<main id="main" data-page="${page}">${renders[page]()}</main>`);
      },
    },
  };
};

export default defineConfig({
  plugins: [glsl({ compress: true }), seoPlugin()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    // three's WebGLRenderer alone is most of the bundle; ~200 kB gzip is expected here.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      input: {
        home: page('index.html'),
        about: page('a-propos/index.html'),
        services: page('services/index.html'),
        contact: page('contact/index.html'),
      },
    },
  },
});
