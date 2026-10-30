import './motion';
import './floating-contact';
import './sectors';
import './cta-tilt';

// Entradas ao rolar: títulos, imagens e textos têm ritmos diferentes.
const reveals = document.querySelectorAll<HTMLElement>('[data-reveal], [data-rise]');
document.documentElement.classList.add('motion-ready');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -4% 0px' },
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('is-in'));
}
