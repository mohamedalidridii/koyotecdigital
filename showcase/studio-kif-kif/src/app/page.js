"use client";

import Preloader from "@/components/Preloader/Preloader";
import HeroSpotlight from "@/components/HeroSpotlight/HeroSpotlight";
import About from "@/components/About/About";
import FeaturedWork from "@/components/FeaturedWork/FeaturedWork";
import Testimonials from "@/components/Testimonials/Testimonials";

export default function Home() {
  return (
    <>
      <Preloader />
      <HeroSpotlight />
      <About />
      <FeaturedWork />
      <Testimonials />
    </>
  );
}
