"use client";
import "./Footer.css";
import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { Wordmark } from "../BrandIcon/BrandIcon";
import { useDict, useHref } from "@/i18n/DictProvider";
import { site } from "@/data/site";

gsap.registerPlugin(ScrollTrigger);

const NAV = ["maison", "ss27", "collections", "lookbook", "event", "contact"];
const PATHS = {
  maison: "/maison",
  ss27: "/ss27",
  collections: "/collections",
  lookbook: "/lookbook",
  event: "/defile",
  contact: "/contact",
};

// The page lifts away to reveal the footer fixed beneath it.
export default function Footer() {
  const dict = useDict();
  const href = useHref();
  const ref = useRef(null);
  const [subscribed, setSubscribed] = useState(false);

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);
      gsap.fromTo(
        q(".ft-wordmark"),
        { yPercent: 60, opacity: 0.2 },
        {
          yPercent: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom bottom", scrub: true },
        }
      );
      gsap.fromTo(
        q(".ft-inner"),
        { yPercent: -25 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom bottom", scrub: true },
        }
      );
    },
    { scope: ref }
  );

  const onSubmit = (e) => {
    e.preventDefault();
    setSubscribed(true);
  };

  return (
    <footer className="footer" ref={ref}>
      <div className="ft-inner">
        <div className="container ft-top">
          <div className="ft-newsletter">
            <h3>{dict.footer.newsletterTitle}</h3>
            <p>{dict.footer.newsletterCopy}</p>
            {subscribed ? (
              <p className="label gold">{dict.footer.subscribed}</p>
            ) : (
              <form className="ft-form" onSubmit={onSubmit}>
                <label className="sr-only" htmlFor="ft-email">
                  {dict.footer.placeholder}
                </label>
                <input id="ft-email" type="email" required placeholder={dict.footer.placeholder} suppressHydrationWarning />
                <button type="submit" aria-label="OK">
                  →
                </button>
              </form>
            )}
          </div>

          <div className="ft-cols">
            <div className="ft-col">
              <span className="label gold">{dict.footer.navigate}</span>
              {NAV.map((key) => (
                <Link key={key} href={href(PATHS[key])} className="link-line">
                  {dict.nav[key]}
                </Link>
              ))}
            </div>
            <div className="ft-col">
              <span className="label gold">{dict.footer.connect}</span>
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="link-line">
                Instagram
              </a>
              <a href={`mailto:${site.email}`} className="link-line">
                {site.email}
              </a>
            </div>
            <div className="ft-col">
              <span className="label gold">{dict.footer.visit}</span>
              {dict.footer.visitLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="container ft-bottom">
          <div className="ft-meta label">
            <span>© {new Date().getFullYear()} {site.name}. {dict.footer.rights}</span>
            <span>
              {dict.footer.credits} :{" "}
              <a href={site.photoSourceUrl} target="_blank" rel="noopener noreferrer" className="link-line">
                {site.photoCredit} / {site.photoSource}
              </a>
            </span>
          </div>
          <div className="ft-wordmark">
            <Wordmark />
          </div>
        </div>
      </div>
    </footer>
  );
}
