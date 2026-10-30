// Template strings com escape automático: html`<p>${texto}</p>` escapa, raw(...) não.
const RAW = Symbol('raw');
type Raw = { [RAW]: string };

export const raw = (s: string): Raw => ({ [RAW]: s });

const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function part(v: unknown): string {
  if (v === null || v === undefined || v === false) return '';
  if (Array.isArray(v)) return v.map(part).join('');
  if (typeof v === 'object' && RAW in (v as object)) return (v as Raw)[RAW];
  return esc(v);
}

export function html(strings: TemplateStringsArray, ...values: unknown[]): Raw {
  return raw(strings.reduce((out, s, i) => out + s + (i < values.length ? part(values[i]) : ''), ''));
}

export const render = (el: Element, view: Raw) => { el.innerHTML = view[RAW]; };
export const toString = (view: Raw) => view[RAW];
export type View = Raw;

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

/** Um listener delegado por evento e seletor, que sobrevive às trocas de innerHTML. */
export function on<E extends Event = Event>(root: Element, type: string, sel: string, fn: (el: HTMLElement, e: E) => void | Promise<void>) {
  root.addEventListener(type, (e) => {
    const el = (e.target as Element).closest<HTMLElement>(sel);
    if (el && root.contains(el)) {
      const report = (error: unknown) => window.dispatchEvent(new CustomEvent('brnz:error', { detail: error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.' }));
      try { Promise.resolve(fn(el, e as E)).catch(report); } catch (error) { report(error); }
    }
  });
}
