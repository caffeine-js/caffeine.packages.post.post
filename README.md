# @caffeine-packages/post.post

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.8. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

- [x] [x] [POST]* /post
- [x] [x] [GET] /post/:id
- [x] [x] [GET] /post/by-slug/:slug
- [x] [x] [GET] /post/by-post-type/:post-type?page=NUMBER
- [x] [x] [GET] /post?page=NUMBER
- [x] [x] [PATCH]* /post/by-slug/:slug
- [x] [x] [DELETE]* /post/by-slug/:slug
- [x] [x] [GET] /post/number-of-pages
- [x] [x] [GET] /post/length

```
Faça uma análise EXAUSTIVA e CRÍTICA, arquivo por arquivo, da camada de DOMÍNIO (src/domain) deste projeto. Não resuma. Quero que você valide a pureza do domínio:
1.  **Entidades e Value Objects**: Verifique se há vazamento de lógica de infraestrutura ou frameworks. O encapsulamento está correto? Os tipos estão ricos e expressivos?
2.  **Interfaces/Contratos**: As interfaces dos repositórios respeitam o princípio SOLID (especialmente ISP e DIP)? Estão agnósticas ao banco de dados?
3.  **Regras de Negócio**: Identifique se todas as regras de negócio essenciais estão aqui ou se foram delegadas incorretamente para outras camadas.
Levante TODOS os pontos fortes e FRACOS com exemplos de código. Estime o nível de senioridade demonstrado APENAS nesta camada. Salve o output no arquivo ./.reviews/REVIEW_DOMAIN_DDMMYYYY_HH:mm.md, consultando os reviews anteriores para contexto.
```

```
Faça uma análise CIRÚRGICA da camada de APLICAÇÃO (src/application). Não quero generalizações, analise cada Caso de Uso (Use Case):

1.  **Responsabilidade Única**: Cada Use Case faz apenas uma coisa? A orquestração está clara?
2.  **Dependências**: A injeção de dependência está correta? Existem acoplamentos indevidos com implementações concretas em vez de interfaces?
3.  **DTOs**: Os DTOs estão sendo usados corretamente para blindar o domínio? Existem vazamentos de tipos do ORM para esta camada?
4.  **Tratamento de Erros**: Como as exceções de domínio são tratadas e convertidas aqui?

Liste cada violação encontrada. Para o cálculo da senioridade, avalie a clareza do fluxo de dados e a desacoplagem. Salve a análise exaustiva em ./.reviews/REVIEW_APPLICATION_DDMMYYYY_HH:mm.md.
```

```
Faça uma auditoria TÉCNICA detalhada da camada de INFRAESTRUTURA (src/infra). Vá fundo na implementação:

1.  **Repositórios**: Analise a implementação dos métodos. O uso do ORM/Database (ex: Prisma) está otimizado? Existem problemas de N+1 ou queries ineficientes visíveis?
2.  **Mappers**: A conversão entre o modelo de persistência e a entidade de domínio está isolada e correta?
3.  **Testes**: Verifique se há mocks ou implementações em memória (test repositories) e se eles refletem fielmente o comportamento esperado.
4.  **Dependências Externas**: Como as libs de terceiros são gerenciadas aqui?

Não poupe críticas técnicas. Quero cada "code smell" listado. Baseie a estimativa de senioridade no domínio das ferramentas e padrões de persistência. Salve em ./.reviews/REVIEW_INFRA_DDMMYYYY_HH:mm.md.
```

```
Analise linha a linha a camada de APRESENTAÇÃO (src/presentation). Foco total na interface HTTP/API:

1.  **Controllers**: Estão "magros"? Eles apenas recebem requisições, chamam o Use Case e retornam respostas, ou estão contendo regras de negócio (o que seria um erro grave)?
2.  **Validação e DTOs**: A validação dos dados de entrada está robusta? Os erros são retornados com status codes HTTP semanticamente corretos (400, 401, 404, 500)?
3.  **Framework (Elysia)**: O uso do framework está seguindo as melhores práticas ou há "hacks"?
4.  **Rotas**: A definição das rotas está organizada e RESTful?

Aponte cada inconsistência na API. A senioridade aqui deve ser medida pelo conhecimento dos padrões Web/HTTP e limpeza do código de entrada. Salve o relatório detalhado em ./.reviews/REVIEW_PRESENTATION_DDMMYYYY_HH:mm.md.
```
