const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const int = new Intl.NumberFormat('pt-BR');
const dec = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const money = (v: number) => brl.format(v);
export const num = (v: number) => int.format(v);
export const one = (v: number) => dec.format(v);
export const two = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const compact = (v: number) => (v >= 10_000 ? `${dec.format(v / 1000)} mil` : int.format(v));

const DAY = 86_400_000;
const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "hoje", "amanhã", "em 4 dias", "há 2 dias", ou a data. */
export function relDay(iso: string) {
  const diff = Math.round((startOf(new Date(iso)) - startOf(new Date())) / DAY);
  if (diff === 0) return 'hoje';
  if (diff === 1) return 'amanhã';
  if (diff === -1) return 'ontem';
  if (diff > 1 && diff < 7) return `em ${diff} dias`;
  if (diff < -1 && diff > -7) return `há ${-diff} dias`;
  return shortDate(iso);
}
export const shortDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '');
export const time = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
export const when = (iso: string) => {
  const r = relDay(iso);
  return r === 'hoje' || r === 'ontem' ? `${r}, ${time(iso)}` : r;
};
export const isPast = (iso: string) => startOf(new Date(iso)) < startOf(new Date());
