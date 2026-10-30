import type { Piece } from "../data/db";
import bread from "../assets/demo/dona-lu-pao.svg?url";
import oven from "../assets/demo/dona-lu-fornada.svg?url";
import smile from "../assets/demo/sorriso-leve.svg?url";
import mare from "../assets/demo/atelie-mare.svg?url";

function cover(p: Piece, name: string, paper: string, ink: string) {
  const esc = (text: string) =>
    text.replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&apos;",
        })[c]!,
    );
  const lines: string[] = [];
  for (const word of p.title.split(/\s+/)) {
    const last = lines.at(-1);
    if (!last || last.length + word.length > 23) lines.push(word);
    else lines[lines.length - 1] += ` ${word}`;
  }
  const title = lines
    .slice(0, 5)
    .map(
      (line, i) =>
        `<text x="54" y="${278 + i * 68}" fill="${ink}" font-family="Georgia,serif" font-size="55">${esc(line)}</text>`,
    )
    .join("");
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="900" viewBox="0 0 720 900"><rect width="720" height="900" fill="${paper}"/><path d="M50 120h620M50 803h620" stroke="${ink}" stroke-opacity=".3"/><text x="54" y="80" fill="${ink}" font-family="Georgia,serif" font-size="35">${esc(name)}</text>${title}<circle cx="550" cy="676" r="95" fill="none" stroke="${ink}" stroke-width="2"/><path d="M470 676h160m-80-80v160" stroke="${ink}" stroke-width="2"/><text x="54" y="854" fill="${ink}" font-family="Arial,sans-serif" font-size="18">${esc(name)} • Feito para você.</text></svg>`)}`;
}

/** Local mock covers. A real uploaded image always takes precedence. */
export function artworkFor(p: Piece): string | undefined {
  const previousDemo =
    p.image &&
    /story-(criacao-de-posts|identidade-visual)[^/]*\.jpg/.test(p.image);
  if (p.image && !previousDemo) return p.image;
  if (p.clientId === "dona-lu" && p.area === "post")
    return /fermentação natural|cinco pães/i.test(p.title)
      ? bread
      : /fornada/i.test(p.title)
        ? oven
        : cover(p, "Dona Lu", "#efe5d2", "#443b28");
  if (p.clientId === "sorriso-leve" && p.area === "post")
    return /clareamento/i.test(p.title)
      ? smile
      : cover(p, "sorriso leve", "#dcebe7", "#25564a");
  if (p.clientId === "atelie-mare" && p.area === "design") return mare;
  if (p.clientId === "brasa-12" && p.area === "post")
    return cover(p, "BRASA 12", "#efc783", "#542b1e");
  return p.image;
}
