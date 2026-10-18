import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { estModeEdition } from '../cms/mode';

let lenis = null;
let rafId = null;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function headerOffset() {
  const header = document.querySelector('.header');
  return header ? -header.offsetHeight : 0;
}

// Défilement fluide (inertie) de toute la page. Désactivé si l'utilisateur réduit les animations.
export function initSmoothScroll() {
  // Pas d'inertie dans l'aperçu du back-office : la page y défile vers la zone choisie.
  if (lenis || prefersReducedMotion() || estModeEdition()) return lenis;

  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    anchors: { offset: headerOffset() },
  });

  const raf = (time) => {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  };
  rafId = requestAnimationFrame(raf);

  return lenis;
}

export function destroySmoothScroll() {
  cancelAnimationFrame(rafId);
  lenis?.destroy();
  lenis = null;
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}

export function scrollToElement(element, { immediate = false } = {}) {
  if (lenis) {
    lenis.scrollTo(element, { offset: headerOffset(), immediate, force: true });
  } else {
    element.scrollIntoView({ behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth' });
  }
}

// Bloque le défilement (menu mobile ouvert).
export function lockScroll(locked) {
  document.body.style.overflow = locked ? 'hidden' : '';
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}
