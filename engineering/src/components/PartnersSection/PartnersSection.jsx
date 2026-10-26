"use client";

import styles from "./PartnersSection.module.css";

import Copy from "@/components/Copy";
import SectionHeader from "@/components/SectionHeader";
import PartnerList from "@/components/PartnerList";
import SectionFooter from "@/components/SectionFooter";

import { useLang } from "@/lib/useLang";

export default function PartnersSection() {
  const { partners: c } = useLang().t;
  return (
    <section className={styles.partnersSection}>
      <Copy variant="flicker">
        <SectionHeader bullet left={c.header[0]} right={c.header[1]} />
      </Copy>
      <div className={`container ${styles.cols}`}>
        <div className={styles.spacer} />
        <div className={styles.copy}>
          <Copy>
            <h2>{c.copy}</h2>
          </Copy>
        </div>
      </div>
      <PartnerList />
      <SectionFooter bullet left={c.footer[0]} right={c.footer[1]} />
    </section>
  );
}
