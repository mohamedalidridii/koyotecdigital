// One place that registers every GSAP plugin and the house easing curves.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

// "koy": long, soft landing used almost everywhere; "koy.io": symmetric for wipes and curtains
CustomEase.create("koy", "0.16,1,0.3,1");
CustomEase.create("koy.io", "0.76,0,0.24,1");
gsap.defaults({ ease: "koy", duration: 1.1 });
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText };
