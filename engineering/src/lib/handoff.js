// Arriving from the "Découvrir Engineering" panel of koyotec.digital: the main site saved its
// last frame, and an inline script (app/layout.js) shows it over the page before first paint.
// The home page then skips its preloader and calls endHandoff() once its hero is in place.

export const HANDOFF_KEY = "koy-handoff";

// runs before React, as a plain inline script; only the Engineering home pages take the frame
export const HANDOFF_SCRIPT = `(function(){try{var raw=sessionStorage.getItem("${HANDOFF_KEY}");if(!raw)return;sessionStorage.removeItem("${HANDOFF_KEY}");var o=JSON.parse(raw);if(!o||!o.img||Date.now()-o.t>20000)return;var p=location.pathname.replace(/\\/+$/,"");if(p!=="/engineering"&&p!=="/engineering/en")return;var d=document.documentElement;d.classList.add("koy-handoff");d.style.setProperty("--koy-handoff","url("+o.img+")");}catch(e){}})();`;

export const isHandoff = () =>
  typeof document !== "undefined" && document.documentElement.classList.contains("koy-handoff");

// fade the borrowed frame out, revealing the real hero underneath
export function endHandoff(delay = 0.7) {
  const root = document.documentElement;
  const t = setTimeout(() => {
    root.classList.add("koy-handoff-out");
    setTimeout(() => {
      root.classList.remove("koy-handoff", "koy-handoff-out");
      root.style.removeProperty("--koy-handoff");
    }, 1000);
  }, delay * 1000);
  return () => clearTimeout(t);
}
