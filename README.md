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

| Verbo | Rota | O que faz | Query Params Suportados |
| :--- | :--- | :--- | :--- |
| **Coleção (Lista)** | | | |
| `GET` | `/post` | Lista paginada | `?page=1`, `?type=uuid` |
| `HEAD` | `/post` | Metadados (Total/Páginas) | `?type=uuid` (para contar filtrado) |
| `POST` | `/post` | Cria novo post | - |
| **Recurso (Item)** | | | |
| `GET` | `/post/:key`| Busca **um** (ID ou Slug) | - |
| `PATCH` | `/post/:key`| Atualiza **um** | - |
| `DELETE` | `/post/:key`| Deleta **um** | - |
