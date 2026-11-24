"use client";

import styles from "./Menu.module.css";

import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { useLenis } from "lenis/react";

import Logo from "@/components/Logo";

import { useLang } from "@/lib/useLang";
import { isHandoff } from "@/lib/handoff";
import { localize } from "@/lib/i18n";
import { CLOUD_PAGES } from "@/lib/cloudPages";
import { CLOUD_COSTS } from "@/content/cloudCosts";

import {
  HOME_COPY_BASE_DELAY,
  PRELOADER_COPY_BASE_DELAY,
  introWait,
  shouldShowPreloader,
} from "@/lib/preloader";

gsap.registerPlugin(useGSAP, SplitText);


const CONTENT_STAGGER_IN = 0.05;
const CONTENT_DURATION = 0.65;
const CONTENT_IN_DELAY = 0.15;
const OVERLAY_DURATION = 0.7;
const OVERLAY_EASE = "power3.out";
const HOVER_DURATION = 0.3;
const HOVER_STAGGER = 0.035;

// desktop bar: these routes are always visible; WIDE_ONLY ones move into "More" on medium screens;
// every other route lives in the "More" dropdown
const PRIMARY = ["/cloud", "/cloud-costs", "/nearshore", "/devops", "/medalydridi"];
const WIDE_ONLY = ["/devops"];

// what each desktop link previews on hover: the content of the page it leads to
function previewItems(r, t, lang) {
  switch (r) {
    case "/expertise":
      return t.areas.map((a) => ({ label: a.title, sub: a.description, to: "/expertise" }));
    case "/cloud":
      return CLOUD_PAGES.map((p) => ({ label: t.cloud.pages[p.key].title, sub: t.cloud.pages[p.key].subtitle, to: p.route }));
    case "/nearshore":
      return t.nearshoreAudit.map((step) => ({ label: step.title, sub: step.copy, to: "/nearshore" }));
    case "/cloud-costs":
      return CLOUD_COSTS[lang].scenarios.map((sc) => ({ label: sc.title, to: "/cloud-costs", hash: sc.id }));
    case "/devops":
      return t.devopsCases.cases.map((c) => ({ label: c.short, sub: c.sector, to: `/devops/${c.slug}` }));
    case "/ai":
      return t.aiCases.cases.map((c) => ({ label: c.short, sub: c.sector, to: `/ai/${c.slug}` }));
    case "/medalydridi":
      return [
        ...t.founderPage.roles.map((role) => ({ label: role, to: "/medalydridi" })),
        ...t.founderPage.talks.items.slice(0, 3).map((talk) => ({ label: talk.title, sub: talk.event, to: "/medalydridi" })),
      ];
    default:
      return null;
  }
}

// remount on language change: SplitText owns the menu's text nodes once it has split them
export default function Menu() {
  const { lang } = useLang();
  return <MenuPanel key={lang} />;
}

function MenuPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const timelineRef = useRef(null);
  const hasOpenedRef = useRef(false);
  const isOpenRef = useRef(false);
  const pathname = usePathname();
  const lenis = useLenis();
  const { t, lang, route, href, isHome } = useLang();
  const NAV_LINKS = t.nav.map((link) => ({ ...link, href: href(link.route) }));
  const other = lang === "en" ? "fr" : "en";
  const playIntro = isHome && shouldShowPreloader();
  const introDelay = playIntro ? introWait() + 0.75 : 0;

  isOpenRef.current = isOpen;

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    // arriving from the koyotec.digital panel: the menu slides in once the hero shows
    const fromHandoff = isHandoff();
    if (!playIntro && !fromHandoff) {
      gsap.set(menu, { clearProps: "transform,translate,rotate,scale,transition" });
      menu.removeAttribute("data-nav-intro");
      return;
    }

    gsap.set(menu, { y: -250, transition: "none" });
    menu.removeAttribute("data-nav-intro");
    gsap.to(menu, {
      y: 0,
      duration: fromHandoff ? 0.9 : 0.75,
      delay: fromHandoff ? 1.15 : introDelay,
      ease: "power3.out",
      onComplete: () => {
        gsap.set(menu, {
          clearProps: "transform,translate,rotate,scale,transition",
        });
      },
    });
  }, [playIntro, introDelay]);

  useGSAP(
    () => {
      const splitEls = gsap.utils.toArray(`.${styles.split}`);
      const splits = splitEls.map(
        (el) => new SplitText(el, { type: "lines", mask: "lines" }),
      );
      const lines = splits.flatMap((split) => split.lines);
      const reveals = gsap.utils.toArray(`.${styles.reveal}`);
      const panel = gsap.utils.toArray(`.${styles.panel}`)[0];
      const titleEl = gsap.utils.toArray(`.${styles.contactTitle}`)[0];
      const titleSplit = splits.find((split) =>
        split.lines.some((line) => titleEl?.contains(line)),
      );
      const titleAt =
        CONTENT_IN_DELAY +
        Math.max(0, lines.indexOf(titleSplit?.lines[0])) * CONTENT_STAGGER_IN;

      gsap.set(panel, { clipPath: "inset(0 0 100% 0)" });
      gsap.set(lines, { yPercent: 110 });
      gsap.set(reveals, { opacity: 0, y: 12 });

      const timeline = gsap.timeline({ paused: true });
      timeline.to(
        panel,
        {
          clipPath: "inset(0 0 0% 0)",
          duration: OVERLAY_DURATION,
          ease: OVERLAY_EASE,
        },
        0,
      );
      timeline.to(
        lines,
        {
          yPercent: 0,
          duration: CONTENT_DURATION,
          stagger: CONTENT_STAGGER_IN,
          ease: "power3.out",
        },
        CONTENT_IN_DELAY,
      );
      timeline.to(
        reveals,
        {
          opacity: 1,
          y: 0,
          duration: CONTENT_DURATION,
          ease: "power3.out",
        },
        titleAt,
      );

      timelineRef.current = timeline;

      const hoverCleanups = [];
      const desktopMq = window.matchMedia("(min-width: 769px)");

      const clearHover = () => {
        hoverCleanups.forEach((cleanup) => cleanup());
        hoverCleanups.length = 0;
      };

      const bindHover = () => {
        clearHover();
        if (!desktopMq.matches) return;

        gsap.utils.toArray(`.${styles.navItem}`).forEach((item) => {
          const label = item.querySelector(`.${styles.label}`);
          if (!label) return;

          const line =
            label.querySelector("div > div") ||
            label.querySelector("div") ||
            label;
          const wordSplit = new SplitText(line, {
            type: "words",
            mask: "words",
            wordsClass: styles.word,
          });
          const words = wordSplit.words;
          if (!words?.length) {
            wordSplit.revert();
            return;
          }

          const applyShift = () => {
            words.forEach((word) => {
              word.style.setProperty("--shift", `${word.offsetHeight}px`);
            });
          };
          applyShift();
          document.fonts?.ready.then(applyShift);

          const play = (enter) => {
            gsap.to(words, {
              y: (_index, word) => (enter ? word.offsetHeight : 0),
              duration: HOVER_DURATION,
              ease: "power1.inOut",
              stagger: HOVER_STAGGER,
              overwrite: "auto",
            });
          };

          const onEnter = () => play(true);
          const onLeave = () => play(false);
          item.addEventListener("mouseenter", onEnter);
          item.addEventListener("mouseleave", onLeave);

          hoverCleanups.push(() => {
            item.removeEventListener("mouseenter", onEnter);
            item.removeEventListener("mouseleave", onLeave);
            wordSplit.revert();
          });
        });
      };

      bindHover();
      desktopMq.addEventListener("change", bindHover);

      return () => {
        desktopMq.removeEventListener("change", bindHover);
        clearHover();
        timeline.kill();
        splits.forEach((split) => split.revert());
      };
    },
    { scope: menuRef },
  );

  useEffect(() => {
    const timeline = timelineRef.current;
    document.body.style.overflow = isOpen ? "hidden" : "";

    if (isOpen) {
      const wasStopped = Boolean(lenis?.isStopped);
      if (lenis && !wasStopped) lenis.stop();
      hasOpenedRef.current = true;
      timeline?.timeScale(1).play();
      return () => {
        if (lenis && !wasStopped) lenis.start();
        document.body.style.overflow = "";
      };
    }

    if (!timeline) return;
    if (!hasOpenedRef.current) return;
    if (timeline.progress() === 0) return;
    timeline.timeScale(1.5).reverse();
  }, [isOpen, lenis]);

  useEffect(() => {
    const closeNow = () => {
      timelineRef.current?.progress(0).pause();
      setIsOpen(false);
    };

    window.addEventListener("transition-cover", closeNow);
    return () => window.removeEventListener("transition-cover", closeNow);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    let lastScrollY = window.scrollY;
    let isVisible = true;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        if (isOpenRef.current) setIsOpen(false);
        if (isVisible) {
          menu.classList.add(styles.hidden);
          isVisible = false;
        }
      } else if (currentScrollY < lastScrollY && !isVisible) {
        menu.classList.remove(styles.hidden);
        isVisible = true;
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [moreOpen, setMoreOpen] = useState(false);
  // after a navigation the pointer is often still over the bar: keep the panels closed until it leaves
  const [quiet, setQuiet] = useState(false);
  const firstPathRef = useRef(true);
  useEffect(() => {
    setMoreOpen(false);
    if (firstPathRef.current) {
      firstPathRef.current = false;
      return;
    }
    setQuiet(true);
  }, [pathname]);
  const isActive = (r) => route === r || route.startsWith(`${r}/`);

  useEffect(() => {
    if (!moreOpen) return undefined;
    const close = (e) => {
      if (e.type === "keydown" && e.key !== "Escape") return;
      if (e.type === "pointerdown" && e.target.closest?.(`.${styles.more}`)) return;
      setMoreOpen(false);
    };
    window.addEventListener("keydown", close);
    window.addEventListener("pointerdown", close);
    return () => {
      window.removeEventListener("keydown", close);
      window.removeEventListener("pointerdown", close);
    };
  }, [moreOpen]);

  // a link clicked with the mouse keeps the focus: release it when the pointer leaves the bar
  const leaveBar = () => {
    setQuiet(false);
    setMoreOpen(false);
    const el = document.activeElement;
    if (el && menuRef.current?.contains(el) && !el.matches(":focus-visible")) el.blur();
  };

  const toggle = () => setIsOpen((prev) => !prev);
  const handleLinkClick = (to) => {
    if (to === route) setIsOpen(false);
  };

  return (
    <div
      className={styles.menu}
      ref={menuRef}
      data-site-menu
      data-open={isOpen}
      {...(playIntro ? { "data-nav-intro": "" } : {})}
    >
      <div className={styles.bar}>
        <div className={styles.brandGroup}>
          <div className={styles.logoCol}>
            <Link
              href={href("/")}
              className={styles.logo}
              aria-label={t.menu.home}
              onClick={() => handleLinkClick("/")}
            >
              <Logo />
            </Link>
            <p className={`mono ${styles.partner}`}>{t.brand.partner}</p>
          </div>
          <div className={styles.brandText}>
            <p className="mono sm">{t.brand.name}</p>
            <p className="mono sm">
              {t.brand.line[0]}
              <br />
              {t.brand.line[1]}
            </p>
          </div>
        </div>

        <span className={styles.divider} aria-hidden="true" />

        <nav className={styles.desktopNav} data-quiet={quiet} onClickCapture={(e) => e.target.closest("a") && setQuiet(true)} onMouseEnter={() => setQuiet(false)} onMouseLeave={leaveBar} onFocus={() => setQuiet(false)} aria-label={lang === "en" ? "Main navigation" : "Navigation principale"}>
          {NAV_LINKS.filter((l) => PRIMARY.includes(l.route)).map((link) => {
            const items = previewItems(link.route, t, lang);
            return (
              <div key={link.href} className={`${styles.deskItem}${WIDE_ONLY.includes(link.route) ? ` ${styles.wideOnly}` : ""}`}>
                <Link href={link.href} className={styles.deskLink} aria-current={isActive(link.route) ? "page" : undefined}>
                  {link.label}
                </Link>
                {items ? (
                  <div className={styles.mega} data-lenis-prevent>
                    <div className={styles.megaIntro}>
                      <p className={styles.megaPath}>{link.route}/</p>
                      <p className={styles.megaTitle}>{link.label}</p>
                      <p className={styles.megaDesc}>{t.meta.descriptions[link.route.slice(1)]}</p>
                      <Link href={link.href} className={styles.megaAll}>
                        {t.menu.viewPage} <FiArrowRight aria-hidden="true" />
                      </Link>
                    </div>
                    <ul className={styles.megaList}>
                      {items.map((it, i) => (
                        <li key={it.label}>
                          <Link href={it.hash ? `${href(it.to)}/#${it.hash}` : href(it.to)}>
                            <span className={styles.megaNo}>{String(i + 1).padStart(2, "0")}</span>
                            <span className={styles.megaLabel}>{it.label}</span>
                            {it.sub ? <span className={styles.megaSub}>{it.sub}</span> : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            );
          })}
          <div className={styles.more} data-open={moreOpen} onMouseLeave={() => setMoreOpen(false)}>
            <button
              type="button"
              className={styles.deskLink}
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((v) => !v)}
            >
              {t.menu.more} <span aria-hidden="true">▾</span>
            </button>
            <div className={styles.moreList}>
              {NAV_LINKS.filter((l) => WIDE_ONLY.includes(l.route)).map((link) => (
                <Link key={link.href} href={link.href} className={styles.narrowOnly} aria-current={isActive(link.route) ? "page" : undefined}>
                  {link.label}
                </Link>
              ))}
              {NAV_LINKS.filter((l) => l.route !== "/" && !PRIMARY.includes(l.route)).map((link) => (
                <Link key={link.href} href={link.href} aria-current={isActive(link.route) ? "page" : undefined}>
                  {link.label}
                </Link>
              ))}
              <a href={t.menu.backHref}>{t.menu.back}</a>
            </div>
          </div>
          <Link
            href={localize(other, route)}
            hrefLang={other}
            lang={other}
            data-track="lang-switch"
            data-track-to={other}
            aria-label={t.menu.switchName}
            className={`${styles.deskLink} ${styles.lang}`}
          >
            {t.menu.switchLabel}
          </Link>
          <Link href={href("/contact")} className={styles.deskCta} data-track="nav-contact">
            {t.navContact.title} <FiArrowRight aria-hidden="true" />
          </Link>
        </nav>

        <button
          type="button"
          className={styles.toggle}
          onClick={toggle}
          aria-expanded={isOpen}
          aria-label={isOpen ? t.menu.close : t.menu.open}
        >
          <span className={styles.toggleIcon}>
            <span />
            <span />
          </span>
        </button>
      </div>
      <div className={styles.panel} data-lenis-prevent>
        <nav className={styles.nav}>
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.navItem}
              onClick={() => handleLinkClick(link.route)}
            >
              <p className={`mono sm ${styles.index} ${styles.split}`}>
                {String(i + 1).padStart(2, "0")}
              </p>
              <h6 className={`${styles.label} ${styles.split}`}>
                {link.label}
              </h6>
            </Link>
          ))}
        </nav>

        <div className={styles.extra}>
          <a href={t.menu.backHref} className={`mono sm ${styles.reveal}`}>
            {t.menu.back}
          </a>
          <Link
            href={localize(other, route)}
            hrefLang={other}
            lang={other}
            data-track="lang-switch"
            data-track-to={other}
            aria-label={t.menu.switchName}
            className={`mono sm ${styles.reveal}`}
          >
            {t.menu.switchLabel}
          </Link>
        </div>

        <Link href={href("/contact")} className={styles.contact}>
          <p className={`mono sm ${styles.contactIndex} ${styles.split}`}>
            {String(NAV_LINKS.length + 1).padStart(2, "0")}
          </p>
          <div className={styles.contactBody}>
            <h4 className={`${styles.contactTitle} ${styles.split}`}>
              {t.navContact.title}
            </h4>
            <p className={`mono sm ${styles.contactCode} ${styles.split}`}>
              {t.navContact.code}
            </p>
          </div>
          <span className={styles.contactArrow} aria-hidden="true">
            <span className={styles.reveal}>
              <FiArrowRight />
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
}
