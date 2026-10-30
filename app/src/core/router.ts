// Roteador por hash: funciona servido de qualquer pasta, num subdomínio ou dentro do APK, sem configurar o servidor.
export type Route = { name: string; param?: string };

export function current(): Route {
  const [name = '', param] = location.hash.replace(/^#\/?/, '').split('/');
  return { name: name || 'inicio', param: param ? decodeURIComponent(param) : undefined };
}

export const go = (name: string, param?: string) => {
  location.hash = `#/${name}${param ? `/${encodeURIComponent(param)}` : ''}`;
};

export const href = (name: string, param?: string) => `#/${name}${param ? `/${encodeURIComponent(param)}` : ''}`;
