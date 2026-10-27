// O atalho fica disponível quando o CTA principal não está à vista.
const floating = document.querySelector<HTMLAnchorElement>('.floating-contact');
if (floating) {
  const targets = document.querySelectorAll('.opening .pill, .closing .btn, [data-send]');
  const visible = new Set<Element>();
  floating.inert = true;
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.2) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      const suppressed = visible.size > 0;
      floating.toggleAttribute('data-suppressed', suppressed);
      floating.inert = suppressed;
    }, { threshold: [0, 0.2, 1] });
    targets.forEach(target => observer.observe(target));
    if (import.meta.hot) import.meta.hot.dispose(() => observer.disconnect());
  } else {
    floating.removeAttribute('data-suppressed');
    floating.inert = false;
  }
}
