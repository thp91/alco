import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../lib/smoothScroll';

const DURATION = 1800;

// Fait défiler un chiffre (« 25+ », « -40% », « 12k ») quand il entre dans l'écran.
function CountUp({ value, className }) {
  const match = String(value).match(/^(\D*)(\d+)(.*)$/);
  const [prefix, target, suffix] = match ? [match[1], Number(match[2]), match[3]] : ['', 0, ''];
  const [current, setCurrent] = useState(target);
  const ref = useRef(null);

  useEffect(() => {
    if (!match || target === 0 || prefersReducedMotion()) return undefined;

    setCurrent(0);
    let frame = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / DURATION, 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          setCurrent(Math.round(eased * target));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );

    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!match) return <span className={className}>{value}</span>;

  return (
    <span className={className} ref={ref} aria-label={value}>
      <span aria-hidden="true">
        {prefix}
        {current}
        {suffix}
      </span>
    </span>
  );
}

export default CountUp;
