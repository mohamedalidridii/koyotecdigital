"use client";

import styles from "./contact.module.css";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import Btn from "@/components/Btn";
import Copy from "@/components/Copy";
import Logo from "@/components/Logo";
import ParallaxImage from "@/components/ParallaxImage";

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const calloutLogoRef = useRef(null);

  // scale callout logo in when heading enters the viewport
  useGSAP(() => {
    const trigger = document.getElementById("contact-callout-heading");
    if (!trigger || !calloutLogoRef.current) return;

    gsap.set(calloutLogoRef.current, {
      scale: 0,
      transformOrigin: "left center",
    });
    gsap.to(calloutLogoRef.current, {
      scale: 1,
      duration: 0.8,
      ease: "power4.out",
      delay: 0.1,
      scrollTrigger: {
        trigger,
        start: "top 80%",
        once: true,
      },
    });
  }, []);

  return (
    <>
      <section className={styles.contactHero} id="top">
        <div className={styles.contactHeroBg}>
          <ParallaxImage src="/images/img7.jpg" alt="" />
        </div>

        <div className={styles.contactHeroContent}>
          <div className={styles.intro}>
            <Copy animateOnScroll={false} delay={1.5}>
              <p>
                Looking to feature Ferrana's work? Every initiative page carries
                a downloadable field record at the bottom. Need something else?
                Write to us at&nbsp;
                <a href="mailto:press@ferrana.tn">press@ferrana.tn</a>.
              </p>
            </Copy>
            <Copy animateOnScroll={false} delay={1.65}>
              <p>
                For partnership inquiries, reach us at&nbsp;
                <a href="mailto:partners@ferrana.tn">partners@ferrana.tn</a>.
                For press or media inquiries, contact&nbsp;
                <a href="mailto:media@ferrana.tn">media@ferrana.tn</a>. If
                you're interested in a role at Ferrana, please view the current
                open positions.
              </p>
            </Copy>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.contactCol}>
              <Copy animateOnScroll={false} delay={1.8}>
                <p className="mono-sm">Contact</p>
              </Copy>
              <div className={styles.contactStack}>
                <div className={styles.inquiry}>
                  <Copy animateOnScroll={false} delay={1.9}>
                    <a href="tel:+3540000000">+354 000 0000</a>
                  </Copy>
                  <Copy animateOnScroll={false} delay={1.95}>
                    <a href="mailto:hello@ferrana.tn">hello@ferrana.tn</a>
                  </Copy>
                </div>
                <div className={styles.inquiry}>
                  <Copy animateOnScroll={false} delay={2}>
                    <p>Business inquiries:</p>
                  </Copy>
                  <Copy animateOnScroll={false} delay={2.05}>
                    <a href="mailto:partners@ferrana.tn">partners@ferrana.tn</a>
                  </Copy>
                </div>
                <div className={styles.inquiry}>
                  <Copy animateOnScroll={false} delay={2.1}>
                    <p>Press and media inquiries:</p>
                  </Copy>
                  <Copy animateOnScroll={false} delay={2.15}>
                    <a href="mailto:media@ferrana.tn">media@ferrana.tn</a>
                  </Copy>
                </div>
              </div>
            </div>

            <div className={styles.careersCol}>
              <Copy animateOnScroll={false} delay={1.8}>
                <p className="mono-sm">Careers</p>
              </Copy>
              <Copy animateOnScroll={false} delay={1.95}>
                <a href="mailto:careers@ferrana.tn">careers@ferrana.tn</a>
              </Copy>
            </div>
          </div>

          <Copy animateOnScroll={false} delay={2.25}>
            <p className={styles.closing}>
              Want to join Ferrana? We're always looking for people who take the
              long view. Field, research, remote, or on site. Please send
              portfolios to:&nbsp;
              <a href="mailto:careers@ferrana.tn">careers@ferrana.tn</a>.
            </p>
          </Copy>
        </div>
      </section>

      <section className={styles.contactCallout}>
        <div className={`container ${styles.calloutInner}`}>
          <Copy>
            <h2 id="contact-callout-heading">
              Ready to talk about the ground you're standing on?
            </h2>
          </Copy>

          <div className={styles.calloutPerson}>
            <span ref={calloutLogoRef} className={styles.calloutLogoWrap}>
              <Logo className={styles.calloutLogo} aria-hidden="true" />
            </span>
            <div className={styles.calloutMeta}>
              <Copy triggerPoint="#contact-callout-heading" delay={0.1}>
                <p>Ferrana Field Office</p>
              </Copy>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.infoSection}>
        <div className={`container ${styles.infoInner}`}>
          <div className={`cols ${styles.infoCols}`}>
            <div className={`col-3 ${styles.infoSpacer}`} aria-hidden="true" />

            <div className={`col-3 ${styles.infoCol}`}>
              <Copy>
                <p
                  id="contact-field-office"
                  className={`mono-sm ${styles.infoLabel}`}
                >
                  Field Office
                </p>
              </Copy>
              <div className={styles.infoBlock}>
                <Copy triggerPoint="#contact-field-office" delay={0.1}>
                  <p>Geirsgata 9</p>
                </Copy>
                <Copy triggerPoint="#contact-field-office" delay={0.15}>
                  <p>101 Reykjavik, Iceland</p>
                </Copy>
                <Copy triggerPoint="#contact-field-office" delay={0.2}>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in maps
                  </a>
                </Copy>
              </div>
              <div className={styles.infoBlock}>
                <Copy triggerPoint="#contact-field-office" delay={0.25}>
                  <p className={`mono-sm ${styles.infoLabel}`}>
                    Operating Hours
                  </p>
                </Copy>
                <Copy triggerPoint="#contact-field-office" delay={0.3}>
                  <p>Monday through Saturday</p>
                </Copy>
                <Copy triggerPoint="#contact-field-office" delay={0.35}>
                  <p>08:30 to 18:00 GMT</p>
                </Copy>
              </div>
            </div>

            <div className={`col-3 ${styles.infoCol}`}>
              <Copy>
                <p id="contact-reach" className={`mono-sm ${styles.infoLabel}`}>
                  Reach
                </p>
              </Copy>
              <div className={styles.infoBlock}>
                <Copy triggerPoint="#contact-reach" delay={0.1}>
                  <a href="tel:+3540000000">+354 000 0000</a>
                </Copy>
                <Copy triggerPoint="#contact-reach" delay={0.15}>
                  <a href="mailto:hello@ferrana.tn">hello@ferrana.tn</a>
                </Copy>
              </div>
            </div>

            <div className={`col-3 ${styles.infoCol}`}>
              <Copy>
                <p
                  id="contact-follow"
                  className={`mono-sm ${styles.infoLabel}`}
                >
                  Follow
                </p>
              </Copy>
              <div className={styles.infoBlock}>
                <Copy triggerPoint="#contact-follow" delay={0.1}>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Instagram
                  </a>
                </Copy>
                <Copy triggerPoint="#contact-follow" delay={0.15}>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    YouTube
                  </a>
                </Copy>
                <Copy triggerPoint="#contact-follow" delay={0.2}>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn
                  </a>
                </Copy>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.insightSection}>
        <div className={`container ${styles.insightInner}`}>
          <div className={`cols ${styles.insightCols}`}>
            <div className={`col-2 ${styles.insightAside}`}>
              <Copy>
                <p
                  id="contact-insight-recent"
                  className={`mono-sm ${styles.infoLabel}`}
                >
                  Recent
                </p>
              </Copy>
              <Btn
                href="/initiatives"
                label="Read the field notes"
                reveal
                triggerPoint="#contact-insight-recent"
                delay={0.15}
              />
            </div>

            <div className={`col-5 ${styles.insightCopy}`}>
              <Copy triggerPoint="#contact-insight-recent" delay={0.1}>
                <p className={`mono-sm ${styles.infoLabel}`}>Field Report</p>
              </Copy>
              <Copy triggerPoint="#contact-insight-recent" delay={0.2}>
                <h2>What a Site Owes When the Drilling Stops</h2>
              </Copy>
            </div>

            <div className={`col-5 ${styles.insightMedia}`}>
              <div className={styles.insightMediaFrame}>
                <ParallaxImage src="/images/img3.jpg" alt="" speed={0.15} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
