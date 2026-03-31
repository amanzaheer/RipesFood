import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

// Register only in the browser (prevents SSR from touching `window`).
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { ScrollTrigger };
export default gsap;

