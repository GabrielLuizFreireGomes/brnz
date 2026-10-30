// Um só conjunto de ícones em traço, 24px de grade, cor herdada.
import { raw } from '../core/dom';

const paths: Record<string, string> = {
  alert: '<path d="m10.3 4-8 14a2 2 0 0 0 1.7 3h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4M17.6 17.6 19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>',
  moon: '<path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z"/>',
  monitor: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="16" rx="3"/><path d="M7 3v4m10-4v4M4 10h16M8 14h2m4 0h2m-8 3h2"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
  palette: '<circle cx="12" cy="12" r="9"/><path d="M15 20c-4-4 4-5 1-8"/><path d="M7 10h.01M10 7h.01M15 7h.01M7 15h.01"/>',
  camera: '<path d="M8 6l2-3h4l2 3h4v14H4V6z"/><circle cx="12" cy="12" r="4"/>',
  sparkles: '<path d="m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3zM20 3v4m-2-2h4"/>',
  expand: '<path d="m8 8 4-4 4 4M8 16l4 4 4-4"/>',
  play: '<path d="m9 5 11 7-11 7z"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  home: '<path d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4z"/>',
  pen: '<path d="M14.5 5.5 18.5 9.5M4 20l1-4.5L15.5 5a1.4 1.4 0 0 1 2 0l1.5 1.5a1.4 1.4 0 0 1 0 2L8.5 19z"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
  browser: '<rect x="3" y="4.5" width="18" height="15" rx="3"/><path d="M3 9h18"/>',
  server: '<rect x="4" y="4" width="16" height="7" rx="2"/><rect x="4" y="13" width="16" height="7" rx="2"/><path d="M8 7.5h.01M8 16.5h.01"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
  chat: '<path d="M5 5h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-8l-5 3.5V17H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/>',
  card: '<rect x="3" y="5.5" width="18" height="13" rx="3"/><path d="M3 10h18M7 15h4"/>',
  users: '<circle cx="9" cy="9" r="3.5"/><path d="M3 19.5c.6-3 3-4.5 6-4.5s5.4 1.5 6 4.5"/><path d="M15.5 5.8a3.3 3.3 0 0 1 0 6.4M17.5 15.3c1.7.6 3 2 3.5 4.2"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 8.5-8.5M16 7l2.5 2.5M14 9l2 2"/>',
  user: '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20c.8-3.6 3.7-5.5 7.5-5.5s6.7 1.9 7.5 5.5"/>',
  more: '<circle cx="5.5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18.5" cy="12" r="1.2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  send: '<path d="M4 12 20 4l-4 16-4-6.5z"/><path d="m12 13.5 8-9.5"/>',
  upload: '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4.5 15v3.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V15"/>',
  download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M4.5 15v3.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V15"/>',
  logout: '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  back: '<path d="m15 6-6 6 6 6"/>',
  clip: '<path d="m19 11.5-7 7a4.5 4.5 0 0 1-6.4-6.4l7.6-7.6a3 3 0 0 1 4.3 4.3l-7.6 7.5a1.5 1.5 0 0 1-2.1-2.1l7-7"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
  refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4"/>',
  whatsapp: '<path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6z"/><path d="M9.2 8.6c.3-.5.8-.5 1-.1l.7 1.5c.1.3 0 .6-.3.8l-.4.4c.5 1 1.4 1.9 2.5 2.5l.4-.4c.2-.3.5-.4.8-.3l1.5.7c.4.2.4.7-.1 1-.9.6-2 .7-3 .2a8 8 0 0 1-3.3-3.3c-.5-1-.4-2.1.2-3z"/>',
};

export const icon = (name: string, cls = '') =>
  raw(`<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? ''}</svg>`);

// O logo da brnz em traço único, o mesmo desenho do site.
export const logo = (cls = '') =>
  raw(`<svg class="brnz-logo ${cls}" viewBox="-12 -12 444 174" fill="none" stroke="currentColor" stroke-width="20" role="img" aria-label="brnz"><path d="M10 0 V100 A45 45 0 1 0 100 100 A45 45 0 1 0 10 100"/><path d="M135 150 V100 A45 45 0 0 1 180 55"/><path d="M215 150 V100 A45 45 0 0 1 305 100 V150"/><path d="M335 55 H410 L340 145 H415"/></svg>`);
