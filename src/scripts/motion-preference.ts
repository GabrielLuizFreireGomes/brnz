const root = document.documentElement;
const system = matchMedia('(prefers-reduced-motion: reduce)');
class ReducedMotionPreference extends EventTarget {
  get matches() { return root.dataset.motion !== 'on'; }
}
export const reducedMotion = new ReducedMotionPreference();
const apply = () => {
  root.dataset.motion = import.meta.env.DEV || !system.matches ? 'on' : 'off';
  reducedMotion.dispatchEvent(new Event('change'));
};
system.addEventListener('change', apply);
apply();
if (import.meta.hot) import.meta.hot.dispose(() => system.removeEventListener('change', apply));
