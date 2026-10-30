// Catálogo do workspace. Independente do deploy da landing page.
export type Plan = { id: string; name: string; price: string; period: string; note?: string; cells: string[]; featured?: boolean };

export const planRows = ['Indicado para', 'Formato', 'Identidade visual', 'Posts', 'Vídeos curtos', 'Foto e filmagem', 'Site', 'Automação', 'BRNZ Workspace'];
export const plans: Plan[] = [
  {
    id: 'largada', name: 'Largada', price: 'R$ 1.490', period: 'projeto único',
    cells: ['Quem está abrindo o negócio', 'Projeto único', 'Logo, cores e fontes', 'Kit com 6 modelos editáveis', 'Não incluso', 'Não incluso', 'Não incluso', 'Não incluso', 'Não incluso'],
  },
  {
    id: 'presenca', name: 'Presença', price: 'R$ 2.290', period: 'por mês', note: 'Contrato mínimo de 3 meses', featured: true,
    cells: ['Quem já vende e quer constância', 'Mensal', 'Ajustes na que você já tem', '12 por mês', '4 por mês', '1 sessão por mês', 'Não incluso', 'Não incluso', 'Acesso incluído'],
  },
  {
    id: 'completo', name: 'Completo', price: 'R$ 3.990', period: 'por mês', note: '+ R$ 1.990 de implantação do site e da automação',
    cells: ['Quem quer tudo rodando junto', 'Mensal', 'Completa ou revisão', '16 por mês', '8 por mês', '1 sessão por mês', 'Landing page de até 3 páginas', 'Atendimento no WhatsApp', 'Acesso incluído'],
  },
];
