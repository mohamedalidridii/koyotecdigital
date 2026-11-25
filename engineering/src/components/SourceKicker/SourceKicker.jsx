"use client";

import { useEffect, useState } from "react";
import { FaInstagram, FaLinkedin, FaFacebook } from "react-icons/fa";
import { FiMail } from "react-icons/fi";

import { useLang } from "@/lib/useLang";

// LIFT relevance: the landing page confirms where the visitor came from (the LIFT page's example is a
// Facebook icon for Facebook visitors). Only on the page the visit landed on, only on the client, so the
// static HTML that search engines read never changes.
const KEY = "koy-src";
const LABELS = {
  instagram: { fr: "Vu sur Instagram", en: "Seen on Instagram", Icon: FaInstagram },
  linkedin: { fr: "Vu sur LinkedIn", en: "Seen on LinkedIn", Icon: FaLinkedin },
  facebook: { fr: "Vu sur Facebook", en: "Seen on Facebook", Icon: FaFacebook },
  email: { fr: "Suite à notre e-mail", en: "Following our e-mail", Icon: FiMail },
};

function detect() {
  const q = new URLSearchParams(window.location.search);
  const s = (q.get("utm_source") || "").toLowerCase();
  const m = (q.get("utm_medium") || "").toLowerCase();
  const c = (q.get("utm_campaign") || "").toLowerCase();
  const ref = document.referrer || "";
  if (/insta|^ig$/.test(s) || q.has("igshid") || /instagram\.com/.test(ref)) return "instagram";
  if (/linkedin/.test(s) || /linkedin\.(com|android)/.test(ref)) return "linkedin";
  if (/facebook|^fb$/.test(s) || q.has("fbclid") || /facebook\.com/.test(ref)) return "facebook";
  if (/outreach/.test(c) || /e-?mail/.test(m) || s === "email") return "email";
  return null;
}

export default function SourceKicker({ className = "" }) {
  const { lang } = useLang();
  const [src, setSrc] = useState(null);

  useEffect(() => {
    const path = window.location.pathname;
    let stored = null;
    try {
      stored = JSON.parse(window.sessionStorage.getItem(KEY) || "null");
    } catch {
      /* storage blocked */
    }
    if (!stored) {
      const found = detect();
      stored = { src: found, path };
      try {
        window.sessionStorage.setItem(KEY, JSON.stringify(stored));
      } catch {
        /* ignore */
      }
    }
    setSrc(stored.src && stored.path === path ? stored.src : null);
  }, []);

  const label = src && LABELS[src];
  if (!label) return null;
  const { Icon } = label;
  return (
    <p className={className}>
      <Icon aria-hidden="true" />
      {label[lang] || label.fr}
    </p>
  );
}
