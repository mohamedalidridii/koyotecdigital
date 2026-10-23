"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./Projects.module.css";

const PROJECTS_PER_ROW = 9;
const TOTAL_ROWS = 10;
const MOBILE_BREAKPOINT = 1000;

const PROJECTS = [
  { name: "Ghost Signal", year: 2024, img: "/images/projects/project_img_1.jpg" },
  { name: "Wet Brain", year: 2023, img: "/images/projects/project_img_2.jpg" },
  { name: "Checkout Dream", year: 2025, img: "/images/projects/project_img_3.jpg" },
  { name: "Deep Space Wave", year: 2022, img: "/images/projects/project_img_4.jpg" },
  { name: "Skull Fog", year: 2021, img: "/images/projects/project_img_5.jpg" },
  { name: "Stack House", year: 2024, img: "/images/projects/project_img_6.jpg" },
  { name: "Feather Static", year: 2023, img: "/images/projects/project_img_7.jpg" },
  { name: "Slow Burn", year: 2020, img: "/images/projects/project_img_8.jpg" },
  { name: "Pumpkin Hour", year: 2022, img: "/images/projects/project_img_9.jpg" },
  { name: "Kaleido Beast", year: 2021, img: "/images/projects/project_img_10.jpg" },
];

function ProjectCard({ project }) {
  return (
    <Link href="/sample-project" className={styles.project}>
      <div className={styles.image}>
        <img src={project.img} alt={project.name} />
      </div>
      <div className={styles.info}>
        <p className="mono sm">{project.name}</p>
        <p className="mono sm">{project.year}</p>
      </div>
    </Link>
  );
}

export default function Projects() {
  const sectionRef = useRef(null);
  const rowsRef = useRef([]);
  const rowStartWidth = useRef(125);
  const rowEndWidth = useRef(500);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMode = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    updateMode();
    window.addEventListener("resize", updateMode);
    return () => window.removeEventListener("resize", updateMode);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const section = sectionRef.current;
    if (!section) return;

    const rows = rowsRef.current.filter(Boolean);
    const firstRow = rows[0];
    if (!firstRow) return;

    rowStartWidth.current = 125;
    rowEndWidth.current = 500;

    firstRow.style.width = `${rowEndWidth.current}%`;
    const expandedRowHeight = firstRow.offsetHeight;
    firstRow.style.width = "";

    const sectionGap = parseFloat(getComputedStyle(section).gap) || 0;
    const sectionPadding =
      parseFloat(getComputedStyle(section).paddingTop) || 0;

    const expandedSectionHeight =
      expandedRowHeight * rows.length +
      sectionGap * (rows.length - 1) +
      sectionPadding * 2;

    section.style.height = `${expandedSectionHeight}px`;

    function onScrollUpdate() {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      rows.forEach((row) => {
        if (!row) return;

        const rect = row.getBoundingClientRect();
        const rowTop = rect.top + scrollY;
        const rowBottom = rowTop + rect.height;

        const scrollStart = rowTop - viewportHeight;
        const scrollEnd = rowBottom;

        let progress = (scrollY - scrollStart) / (scrollEnd - scrollStart);
        progress = Math.max(0, Math.min(1, progress));

        const width =
          rowStartWidth.current +
          (rowEndWidth.current - rowStartWidth.current) * progress;
        row.style.width = `${width}%`;
      });
    }

    gsap.ticker.add(onScrollUpdate);

    const handleResize = () => {
      if (window.innerWidth < MOBILE_BREAKPOINT) return;

      firstRow.style.width = `${rowEndWidth.current}%`;
      const newRowHeight = firstRow.offsetHeight;
      firstRow.style.width = "";

      const newSectionHeight =
        newRowHeight * rows.length +
        sectionGap * (rows.length - 1) +
        sectionPadding * 2;

      section.style.height = `${newSectionHeight}px`;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      gsap.ticker.remove(onScrollUpdate);
      window.removeEventListener("resize", handleResize);
      section.style.height = "";
      rows.forEach((row) => {
        if (row) row.style.width = "";
      });
    };
  }, [isMobile]);

  const rowsData = [];
  let currentProjectIndex = 0;

  for (let r = 0; r < TOTAL_ROWS; r++) {
    const projects = [];
    for (let c = 0; c < PROJECTS_PER_ROW; c++) {
      projects.push(PROJECTS[currentProjectIndex % PROJECTS.length]);
      currentProjectIndex++;
    }
    rowsData.push(projects);
  }

  if (isMobile) {
    return (
      <section className={`${styles.projects} ${styles.projectsMobile}`}>
        {PROJECTS.map((project) => (
          <ProjectCard key={`${project.name}-${project.year}`} project={project} />
        ))}
      </section>
    );
  }

  return (
    <section ref={sectionRef} className={styles.projects}>
      {rowsData.map((rowProjects, rowIndex) => (
        <div
          key={rowIndex}
          className={styles.row}
          ref={(el) => {
            if (el) rowsRef.current[rowIndex] = el;
          }}
        >
          {rowProjects.map((project, colIndex) => (
            <ProjectCard
              key={`${rowIndex}-${colIndex}`}
              project={project}
            />
          ))}
        </div>
      ))}
    </section>
  );
}
