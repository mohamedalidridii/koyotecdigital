import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

if (!CustomEase.get("hop")) {
  CustomEase.create("hop", "M0,0 C0.75,0 0.1,1 1,1");
}

export const hop = "hop";
export const easeOut = "power3.out";
