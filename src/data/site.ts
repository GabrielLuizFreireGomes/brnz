// Conteúdo da página. Itens marcados com "AMOSTRA" precisam ser confirmados pela BRNZ antes de publicar.

// O link da bio (wa.me/12988137795) está sem o código do país; o WhatsApp exige o 55.
export const whatsappNumber = '5512988137795';
export const whatsappDisplay = '(12) 98813-7795';
export const wa = (text: string) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
export const whatsappUrl = wa('Olá, brnz! Quero um orçamento.');
export const instagramUrl = 'https://www.instagram.com/madebybrnz/';
export const instagramHandle = '@madebybrnz';

// Abertura: quem é, para quem, o que resolve.
export const intro = {
  lead: 'Um designer pro logo, um editor pros vídeos, um fotógrafo, outra pessoa pro site. Cada um com seu prazo, seu preço e seu estilo, e a marca termina com quatro caras. A brnz junta esse trabalho num time só.',
  columns: [
    { run: 'Quem somos.', text: 'Um estúdio criativo de três pessoas: design e edição, foto e filmagem, sites e automação. O mesmo time cuida da sua marca do primeiro briefing à última entrega.' },
    { run: 'O que entregamos.', text: 'Identidade visual, posts, vídeos, fotos, landing pages e automações de atendimento, todos com a mesma linguagem visual, para a marca parecer uma só em qualquer tela.' },
    { run: 'Para quem.', text: 'Lojas, restaurantes, consultórios, criadores de conteúdo e pequenas empresas que querem uma presença profissional sem montar um departamento de marketing.' },
    { run: 'Como começa.', text: 'Com uma mensagem no WhatsApp. Você conta o que precisa e recebe escopo, prazo e valor numa resposta só, com um contato para o projeto inteiro.' },
  ],
};

export type Service = { id: string; name: string; text: string; terms: string[] };

// AMOSTRA: entregas por frente
export const services: Service[] = [
  { id: 'identidade', name: 'Identidade visual', text: 'O logo, as cores e as fontes que fazem a marca ser reconhecida em qualquer lugar.', terms: ['Logotipo', 'Paleta e tipografia', 'Manual de uso'] },
  { id: 'posts', name: 'Posts e redes', text: 'Feed, carrosséis e stories com constância, no padrão da identidade, prontos para publicar.', terms: ['Posts e carrosséis', 'Stories e destaques', 'Anúncios'] },
  { id: 'video', name: 'Vídeo e edição', text: 'Do bruto ao vídeo pronto para cada tela, com ritmo, legenda e som no lugar.', terms: ['Reels e TikTok', 'YouTube', 'Legendas dinâmicas'] },
  { id: 'captacao', name: 'Foto e filmagem', text: 'Captação no seu espaço: produto, equipe e bastidores, já pensando em como vai virar post.', terms: ['Fotos de produto', 'Filmagem', 'Bastidores'] },
  { id: 'digital', name: 'Sites e automação', text: 'Landing pages rápidas e automações que respondem clientes e organizam pedidos sozinhas.', terms: ['Landing pages', 'Atendimento no WhatsApp', 'E-commerce'] },
];

export type Stage = { line: string; text: string };

// AMOSTRA: etapas e política de ajustes
export const stages: Stage[] = [
  { line: 'Primeiro, você chama.', text: 'Conta no WhatsApp o que precisa, para quando e onde vai publicar. A resposta vem com escopo, prazo e valor.' },
  { line: 'Depois, montamos o time.', text: 'Design, vídeo, foto e site entram juntos no planejamento, a partir de uma referência visual só.' },
  { line: 'Você aprova cada peça.', text: 'Nada vai para o ar sem o seu ok. Os ajustes de cada entrega são combinados antes de começar.' },
  { line: 'No fim, tudo combina.', text: 'Post, vídeo e site saem prontos para publicar, com a mesma cara e no tamanho certo de cada plataforma.' },
];

export type Plan = { id: string; name: string; price: string; period: string; note?: string; cells: string[]; featured?: boolean };

// PREÇOS FICTÍCIOS para ter uma ideia, baseados em pesquisa de mercado (out/2026, freelancers e pequenas agências no Brasil):
// - identidade visual: logo simples R$ 800–1.500; identidade completa R$ 2.500–8.000
// - social media pequena empresa: R$ 1.500–3.500/mês (12–16 posts, stories, 4–8 reels)
// - edição de reels (material fornecido): R$ 100–350 por vídeo
// - landing page com freelancer: R$ 300 a R$ 3.000+; agência acima de R$ 5.000
// - chatbot de WhatsApp: plataforma ~US$ 100+/mês, mais implantação
// Os valores ficam abaixo da soma dos profissionais separados: esse é o argumento do pacote.
export const planRows = ['Indicado para', 'Formato', 'Identidade visual', 'Posts', 'Vídeos curtos', 'Foto e filmagem', 'Site', 'Automação'];
export const plans: Plan[] = [
  {
    id: 'largada', name: 'Largada', price: 'R$ 1.490', period: 'projeto único',
    cells: ['Quem está abrindo o negócio', 'Projeto único', 'Logo, cores e fontes', 'Kit com 6 modelos editáveis', 'Não incluso', 'Não incluso', 'Não incluso', 'Não incluso'],
  },
  {
    id: 'presenca', name: 'Presença', price: 'R$ 2.290', period: 'por mês', note: 'Contrato mínimo de 3 meses', featured: true,
    cells: ['Quem já vende e quer constância', 'Mensal', 'Ajustes na que você já tem', '12 por mês', '4 por mês', '1 sessão por mês', 'Não incluso', 'Não incluso'],
  },
  {
    id: 'completo', name: 'Completo', price: 'R$ 3.990', period: 'por mês', note: '+ R$ 1.990 de implantação do site e da automação',
    cells: ['Quem quer tudo rodando junto', 'Mensal', 'Completa ou revisão', '16 por mês', '8 por mês', '1 sessão por mês', 'Landing page de até 3 páginas', 'Atendimento no WhatsApp'],
  },
];

// Separado, o mesmo escopo do Completo sairia por volta de R$ 6.000/mês (social media + 8 reels + sessão de fotos + manutenção de site e bot).
export const separateEstimate = 'R$ 6.000';

// Monte seu time: cada item é um profissional que o cliente contrataria separado.
export const builderOptions = [
  { id: 'identidade', label: 'Identidade visual', role: 'designer de marca' },
  { id: 'posts', label: 'Posts e redes', role: 'social media' },
  { id: 'video', label: 'Edição de vídeo', role: 'editor de vídeo' },
  { id: 'captacao', label: 'Foto e filmagem', role: 'fotógrafo' },
  { id: 'site', label: 'Site ou landing page', role: 'desenvolvedor' },
  { id: 'automacao', label: 'Automação', role: 'especialista em automação' },
];

export type Person = { name: string; role: string; bio: string; initials: string; portfolio?: string };

// AMOSTRA: nomes, bios e créditos. A ideia do Arthur: retratos com fundo na cor da marca (#2f3b90);
// enquanto as fotos não chegam, o retrato mostra as iniciais.
// O crédito do Buguei Meu Cérebro precisa de autorização do canal antes de ir ao ar.
export const team: Person[] = [
  { name: 'Arthur Branze', initials: 'AB', role: 'Design e edição de vídeo', bio: 'Cuida da identidade, dos posts e da edição. Edita os vídeos do Buguei Meu Cérebro, canal com mais de 11 milhões de seguidores no TikTok.' },
  { name: 'Gabriel Gomes', initials: 'GG', role: 'Sites e automação', bio: 'Desenvolve landing pages, lojas e automações de atendimento que tiram trabalho repetitivo do seu dia.' },
  { name: 'Foto e filmagem', initials: 'FF', role: 'Captação', bio: 'Fotografa e filma no seu espaço, já pensando no corte do vídeo e no formato do post.' },
];

// AMOSTRA: região de captação presencial (DDD 12)
export const facts = [
  { label: 'Atendimento', value: 'Online, todo o Brasil' },
  { label: 'Captação', value: 'Vale do Paraíba, SP' },
  { label: 'WhatsApp', value: whatsappDisplay },
  { label: 'Instagram', value: instagramHandle },
];

export type Faq = { q: string; a: string };

// AMOSTRA: prazos, ajustes e atendimento precisam ser confirmados
export const faqs: Faq[] = [
  { q: 'Já tenho alguém de marketing. Faz sentido?', a: 'Faz. A gente executa o que a estratégia pede: identidade, posts, vídeo, site. Quem cuida do marketing passa a ter um time inteiro para produzir, em vez de vários fornecedores.' },
  { q: 'Preciso contratar tudo de uma vez?', a: 'Não. Dá para começar só com posts, só com o site ou só com a identidade, e somar o resto quando fizer sentido. O time continua o mesmo.' },
  { q: 'Quanto custa?', a: 'Os pacotes começam em R$ 1.490 (projeto único) e R$ 2.290 por mês. O valor final depende do tamanho do negócio e do que entra no escopo; pelo WhatsApp você recebe o do seu caso.' },
  { q: 'Quanto tempo leva?', a: 'Posts e edições curtas costumam sair em poucos dias; identidade e site levam algumas semanas. O prazo é combinado antes de começar.' },
  { q: 'Posso pedir ajustes?', a: 'Pode. Cada entrega inclui as rodadas de ajuste combinadas no início, para a peça chegar onde você imaginou.' },
  { q: 'Vocês atendem fora da região?', a: 'Sim. Conversa, aprovação e entrega acontecem online. Só a captação de foto e vídeo é presencial, combinada caso a caso.' },
];
