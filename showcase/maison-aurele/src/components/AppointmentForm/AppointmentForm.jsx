"use client";
import "./AppointmentForm.css";
import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { useSelectionStore } from "@/store/selectionStore";
import { getPiece } from "@/data/pieces";
import { site } from "@/data/site";
import { useDict, useT } from "@/i18n/DictProvider";

gsap.registerPlugin(ScrollTrigger);

// Private-fitting request. There is no backend yet: the request opens the
// visitor's mail client, pre-filled (and lists the pieces in their selection).
export default function AppointmentForm() {
  const dict = useDict();
  const t = useT();
  const f = dict.contact.form;
  const ref = useRef(null);
  const [sent, setSent] = useState(false);
  const slugs = useSelectionStore((s) => s.slugs);

  useGSAP(
    () => {
      gsap.from(".af-field, .af-submit", {
        y: 40,
        opacity: 0,
        stagger: 0.08,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });
    },
    { scope: ref }
  );

  const onSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const pieces = slugs.map(getPiece).filter(Boolean).map((p) => `— ${t(p.name)}`);
    const body = [
      `${f.name}: ${data.get("name")}`,
      `${f.email}: ${data.get("email")}`,
      `${f.date}: ${data.get("date") || "—"}`,
      "",
      data.get("message"),
      ...(pieces.length ? ["", dict.selection.title, ...pieces] : []),
    ].join("\n");
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(dict.selection.subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  if (sent) {
    return (
      <div className="af-sent">
        <h3>{f.sent}</h3>
      </div>
    );
  }

  return (
    <form className="appointment-form" ref={ref} onSubmit={onSubmit}>
      <label className="af-field">
        <span className="label">{f.name}</span>
        <input name="name" required autoComplete="name" suppressHydrationWarning />
      </label>
      <label className="af-field">
        <span className="label">{f.email}</span>
        <input name="email" type="email" required autoComplete="email" suppressHydrationWarning />
      </label>
      <label className="af-field">
        <span className="label">{f.date}</span>
        <input name="date" type="date" suppressHydrationWarning />
      </label>
      <label className="af-field">
        <span className="label">{f.message}</span>
        <textarea name="message" rows={4} />
      </label>
      <button type="submit" className="pill solid af-submit">
        {f.submit}
      </button>
    </form>
  );
}
