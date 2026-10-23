"use client";
import "./Menu.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { useLenis } from "lenis/react";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

import { Emblem, Wordmark } from "../BrandIcon/BrandIcon";
import LangSwitch from "../LangSwitch/LangSwitch";
import { useDict, useHref } from "@/i18n/DictProvider";
import { useSelectionStore, useSelectionCount } from "@/store/selectionStore";
import { site } from "@/data/site";
import { img } from "@/data/media";

gsap.registerPlugin(SplitText);

const links = [
  { key: "home", path: "/", image: img.hero },
  { key: "maison", path: "/maison", image: img.atelierDoor },
  { key: "ss27", path: "/ss27", image: img.goldGown },
  { key: "collections", path: "/collections", image: img.goldFlowers },
  { key: "lookbook", path: "/lookbook", image: img.bellSleeves },
  { key: "event", path: "/defile", image: img.salon },
  { key: "contact", path: "/contact", image: img.ivoryGown },
];

const Menu = () => {
  const dict = useDict();
  const href = useHref();
  const pathname = usePathname();
  const lenis = useLenis();

  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState(0);
  const count = useSelectionCount();
  const openSelection = useSelectionStore((s) => s.open);

  const barRef = useRef(null);
  const overlayRef = useRef(null);
  const tlRef = useRef(null);
  const lastY = useRef(0);

  // Build the open/close timeline once, then play/reverse it
  useGSAP(
    () => {
      const overlay = overlayRef.current;
      const split = SplitText.create(overlay.querySelectorAll(".menu-link-text"), {
        type: "chars",
        mask: "chars",
      });

      gsap.set(overlay, { clipPath: "inset(0% 0% 100% 0%)" });
      gsap.set(split.chars, { yPercent: 110 });
      gsap.set(overlay.querySelectorAll(".menu-fade"), { opacity: 0, y: 20 });

      tlRef.current = gsap
        .timeline({ paused: true })
        .set(overlay, { visibility: "visible" })
        .to(overlay, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power4.inOut" })
        .fromTo(
          overlay.querySelector(".menu-preview"),
          { scale: 1.3, clipPath: "inset(100% 0% 0% 0%)" },
          { scale: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power4.out" },
          "-=0.4"
        )
        .to(split.chars, { yPercent: 0, duration: 0.8, stagger: 0.012, ease: "power4.out" }, "<")
        .to(
          overlay.querySelectorAll(".menu-fade"),
          { opacity: 1, y: 0, stagger: 0.05, duration: 0.6, ease: "power3.out" },
          "-=0.6"
        );

      return () => split.revert();
    },
    { scope: overlayRef, dependencies: [dict] }
  );

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    if (isOpen) {
      lenis?.stop();
      tl.timeScale(1).play();
    } else {
      lenis?.start();
      tl.timeScale(1.6).reverse();
    }
  }, [isOpen, lenis]);

  // Close when the route changes
  useEffect(() => {
    setIsOpen(false);
    const index = links.findIndex((l) => href(l.path) === pathname);
    if (index >= 0) setActive(index);
  }, [pathname, href]);

  // Hide the bar while scrolling down, reveal it on the way up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const hide = y > lastY.current && y > 160 && !isOpen;
      barRef.current?.classList.toggle("is-hidden", hide);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isOpen]);

  return (
    <>
      <header className={`menu-bar ${isOpen ? "is-open" : ""}`} ref={barRef}>
        <Link href={href("/")} className="menu-brand" aria-label={site.name}>
          <span className="menu-emblem">
            <Emblem />
          </span>
          <span className="menu-wordmark">
            <Wordmark />
          </span>
        </Link>

        <div className="menu-actions">
          <LangSwitch className="menu-lang" />
          <button className="label menu-selection" onClick={openSelection}>
            {dict.selection.button}
            <span className="menu-count">{String(count).padStart(2, "0")}</span>
          </button>
          <button
            className="label menu-toggle"
            onClick={() => setIsOpen((v) => !v)}
            aria-expanded={isOpen}
            aria-controls="menu-overlay"
          >
            <span className="menu-toggle-text">{isOpen ? dict.nav.close : dict.nav.menu}</span>
            <span className={`menu-burger ${isOpen ? "open" : ""}`}>
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>

      <div className="menu-overlay" id="menu-overlay" ref={overlayRef} aria-hidden={!isOpen}>
        <div className="menu-overlay-inner">
          <nav className="menu-links">
            {links.map((link, i) => (
              <Link
                key={link.key}
                href={href(link.path)}
                className={`menu-link ${active === i ? "is-active" : ""}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
              >
                <span className="label menu-link-index menu-fade">{String(i + 1).padStart(2, "0")}</span>
                <span className="menu-link-text">{dict.nav[link.key]}</span>
              </Link>
            ))}
          </nav>

          <div className="menu-preview media">
            {links.map((link, i) => (
              <img
                key={link.key}
                src={link.image}
                alt=""
                className={active === i ? "is-active" : ""}
              />
            ))}
          </div>
        </div>

        <div className="menu-overlay-footer">
          <div className="menu-fade">
            <p className="label gold">{dict.nav.follow}</p>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="label link-line">
              Instagram
            </a>
          </div>
          <div className="menu-fade">
            <p className="label gold">{dict.nav.contact}</p>
            <a href={`mailto:${site.email}`} className="label link-line">
              {site.email}
            </a>
          </div>
          <div className="menu-fade">
            <LangSwitch />
          </div>
        </div>
      </div>
    </>
  );
};

export default Menu;
