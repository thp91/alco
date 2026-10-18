import { useEffect, useLayoutEffect } from 'react';
import { estModeEdition } from '../cms/mode';
import { prefersReducedMotion } from '../lib/smoothScroll';

// Éléments animés à l'apparition, avec leur type d'animation.
const REVEAL_TARGETS = [
  ['.section-heading', 'up'],
  ['.services__intro', 'up'],
  ['.services__card', 'up'],
  ['.expertise__visual', 'left'],
  ['.expertise__content > *', 'up'],
  ['.reasons__card', 'up'],
  ['.intervention-zone__visual', 'left'],
  ['.intervention-zone__title', 'up'],
  ['.intervention-zone__item', 'right'],
  ['.testimonials__card', 'up'],
  ['.faq__item', 'up'],
  ['.cta-banner__card', 'zoom'],
  ['.strengths__item', 'up'],
  ['.approach__intro', 'up'],
  ['.approach__step', 'left'],
  ['.approach__visual', 'right'],
  ['.projects__filters', 'fade'],
  ['.project-card', 'up'],
  ['.story-card', 'up'],
  ['.project-gallery__header', 'up'],
  ['.project-gallery__item', 'zoom'],
  ['.project-results', 'up'],
  ['.project-sheet', 'right'],
  ['.similar__header', 'up'],
  ['.similar__item', 'up'],
  ['.contact-form', 'up'],
  ['.contact-info__map', 'right'],
  ['.contact-info__card', 'up'],
  ['.footer__main > *', 'up'],
];

// Images d'en-tête qui défilent plus lentement que la page.
const PARALLAX_TARGETS = [
  ['.home-hero__image', 0.35],
  ['.page-hero__image', 0.35],
  ['.project-hero__image', 0.35],
];

const STAGGER_MS = 90;
const MAX_STAGGER_STEPS = 5;

function setupReveal(root) {
  const elements = [];

  REVEAL_TARGETS.forEach(([selector, type]) => {
    root.querySelectorAll(selector).forEach((element) => {
      if (element.dataset.reveal) return;
      element.dataset.reveal = type;
      elements.push(element);
    });
  });

  // Décalage en cascade entre éléments frères animés
  elements.forEach((element) => {
    const siblings = [...element.parentElement.children].filter((child) => child.dataset.reveal);
    const index = Math.min(siblings.indexOf(element), MAX_STAGGER_STEPS);
    element.style.setProperty('--reveal-delay', `${index * STAGGER_MS}ms`);
  });

  const timers = [];

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        element.dataset.revealed = 'true';
        observer.unobserve(element);

        // Une fois l'animation finie, l'élément retrouve ses propres transitions (survol…)
        const delay = parseInt(element.style.getPropertyValue('--reveal-delay'), 10) || 0;
        timers.push(
          setTimeout(() => {
            delete element.dataset.reveal;
            delete element.dataset.revealed;
            element.style.removeProperty('--reveal-delay');
          }, delay + 1000),
        );
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
  );

  elements.forEach((element) => observer.observe(element));
  return () => {
    observer.disconnect();
    timers.forEach(clearTimeout);
    elements.forEach((element) => {
      delete element.dataset.reveal;
      delete element.dataset.revealed;
      element.style.removeProperty('--reveal-delay');
    });
  };
}

function setupParallax(root) {
  const items = PARALLAX_TARGETS.flatMap(([selector, speed]) =>
    [...root.querySelectorAll(selector)].map((element) => ({ element, speed })),
  );
  if (!items.length) return () => {};

  let frame = null;

  const update = () => {
    frame = null;
    const scrolled = window.scrollY;
    items.forEach(({ element, speed }) => {
      const height = element.parentElement.offsetHeight;
      if (scrolled > height + 200) return;
      // Les visuels d'en-tête descendent moins vite que la page (0 au chargement)
      element.style.translate = `0 ${(Math.min(scrolled, height) * speed).toFixed(1)}px`;
    });
  };

  const onScroll = () => {
    if (frame === null) frame = requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    items.forEach(({ element }) => {
      element.style.translate = '';
    });
  };
}

// Animations au défilement : apparition des blocs et parallaxe des images.
export function useScrollEffects(pathname) {
  useLayoutEffect(() => {
    // Dans l'aperçu du back-office, tout reste visible.
    if (prefersReducedMotion() || estModeEdition()) return undefined;
    return setupReveal(document.body);
  }, [pathname]);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    return setupParallax(document.body);
  }, [pathname]);
}
