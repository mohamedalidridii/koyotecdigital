"use client";

import SmudgeRevealer from "@/components/SmudgeRevealer/SmudgeRevealer";
import AboutCopy from "@/components/AboutCopy/AboutCopy";
import Stats from "@/components/Stats/Stats";
import Spotlight from "@/components/Spotlight/Spotlight";
import Team from "@/components/Team/Team";
import styles from "./about.module.css";

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <SmudgeRevealer
        lineOne="Rub Here"
        lineTwo="To See Us"
        copy="We keep the good stuff under the surface. Drag around and the real studio starts to show through."
      />
      <Spotlight />
      <AboutCopy />
      <Stats />
      <Team />
    </main>
  );
}
