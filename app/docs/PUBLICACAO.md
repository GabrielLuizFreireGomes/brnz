# Publicação independente no GitHub Pages

Workspace: `https://gabrielluizfreiregomes.github.io/brnz/app/`.

A landing permanece em `https://gabrielluizfreiregomes.github.io/brnz/`. O Pages aceita uma publicação por repositório; para atualizar somente uma aplicação, o pipeline preserva os arquivos publicados da outra, sem reconstruí-los.

- `Publish workspace` (`workspace-pages.yml`): instala e valida apenas `app/`, constrói o workspace e substitui somente `app/` no último artefato publicado com sucesso.
- `Deploy` (`deploy.yml`): constrói somente a landing e preserva o workspace publicado.
- Os dois usam o grupo de concorrência `pages`, evitando publicações simultâneas.
- `pages_artifact.py` compara hashes e recusa a publicação se os arquivos preservados mudarem. Também recusa publicar se não houver artefato anterior válido. Artefatos novos têm retenção de 90 dias; depois da expiração, será necessário recuperar um artefato de publicação antes de um deploy independente.

O workspace não importa mais código ou arquivos do projeto da landing. Catálogo em `src/data/catalog.ts`, fonte em `src/assets/fonts/` e imagens herdadas de demonstração em `src/assets/work/`. A atualização desses conteúdos é independente da landing.

Dados locais, preferências e sessões não são enviados no deploy. O workspace publicado continua usando dados mockados.
