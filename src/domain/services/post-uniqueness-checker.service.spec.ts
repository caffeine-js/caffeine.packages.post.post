import { describe, it, expect, beforeEach } from "vitest";
import { faker } from "@faker-js/faker";
import { PostUniquenessChecker } from "./post-uniqueness-checker.service";
import { PostRepository } from "../../infra/repositories/test/post.repository";
import { Post } from "../post";
import type { BuildPostDTO } from "../dtos/build-post.dto";

describe("PostUniquenessChecker", () => {
	let repository: PostRepository;
	let checker: PostUniquenessChecker;

	/**
	 * Factory para criar dados válidos de Post
	 */
	const makeValidPostData = (
		overrides: Partial<BuildPostDTO> = {},
	): BuildPostDTO => ({
		postTypeId: faker.string.uuid(),
		name: faker.lorem.sentence(),
		slug: faker.helpers.slugify(faker.lorem.words(3)),
		description: faker.lorem.paragraph(),
		cover: faker.image.url(),
		tags: [faker.string.uuid()],
		...overrides,
	});

	/**
	 * Reinicia o repositório e o checker antes de cada teste
	 */
	beforeEach(() => {
		repository = new PostRepository();
		checker = new PostUniquenessChecker(repository);
	});

	describe("run()", () => {
		it("deve retornar true quando o slug já existe no repositório", async () => {
			// Arrange
			const slug = "meu-slug-unico";
			const post = Post.make(makeValidPostData({ slug }));
			await repository.create(post);

			// Act
			const exists = await checker.run(slug);

			// Assert
			expect(exists).toBe(true);
		});

		it("deve retornar false quando o slug não existe no repositório", async () => {
			// Arrange
			const existingSlug = "slug-existente";
			const nonExistentSlug = "slug-inexistente";

			const post = Post.make(makeValidPostData({ slug: existingSlug }));
			await repository.create(post);

			// Act
			const exists = await checker.run(nonExistentSlug);

			// Assert
			expect(exists).toBe(false);
		});

		it("deve retornar false quando o repositório está vazio", async () => {
			// Arrange
			const slug = "qualquer-slug";

			// Act
			const exists = await checker.run(slug);

			// Assert
			expect(exists).toBe(false);
		});

		it("deve retornar true para o primeiro slug quando há múltiplos posts", async () => {
			// Arrange
			const slug1 = "primeiro-slug";
			const slug2 = "segundo-slug";
			const slug3 = "terceiro-slug";

			const post1 = Post.make(makeValidPostData({ slug: slug1 }));
			const post2 = Post.make(makeValidPostData({ slug: slug2 }));
			const post3 = Post.make(makeValidPostData({ slug: slug3 }));

			await repository.create(post1);
			await repository.create(post2);
			await repository.create(post3);

			// Act
			const exists = await checker.run(slug1);

			// Assert
			expect(exists).toBe(true);
		});

		it("deve retornar true para o último slug quando há múltiplos posts", async () => {
			// Arrange
			const slug1 = "primeiro-slug";
			const slug2 = "segundo-slug";
			const slug3 = "terceiro-slug";

			const post1 = Post.make(makeValidPostData({ slug: slug1 }));
			const post2 = Post.make(makeValidPostData({ slug: slug2 }));
			const post3 = Post.make(makeValidPostData({ slug: slug3 }));

			await repository.create(post1);
			await repository.create(post2);
			await repository.create(post3);

			// Act
			const exists = await checker.run(slug3);

			// Assert
			expect(exists).toBe(true);
		});

		it("deve retornar true quando há slugs duplicados", async () => {
			// Arrange
			const duplicatedSlug = "slug-duplicado";

			const post1 = Post.make(makeValidPostData({ slug: duplicatedSlug }));
			const post2 = Post.make(makeValidPostData({ slug: duplicatedSlug }));

			await repository.create(post1);
			await repository.create(post2);

			// Act
			const exists = await checker.run(duplicatedSlug);

			// Assert
			expect(exists).toBe(true);
		});

		it("deve ser case-sensitive ao verificar slugs", async () => {
			// Arrange
			const slug = "meu-slug";
			const post = Post.make(makeValidPostData({ slug }));
			await repository.create(post);

			// Act
			const existsLowerCase = await checker.run("meu-slug");
			const existsUpperCase = await checker.run("MEU-SLUG");

			// Assert
			expect(existsLowerCase).toBe(true);
			expect(existsUpperCase).toBe(false);
		});

		it("deve verificar slugs com caracteres especiais", async () => {
			// Arrange
			const slug = "slug-com-números-123-e-traços";
			const post = Post.make(makeValidPostData({ slug }));
			await repository.create(post);

			// Act
			const exists = await checker.run(slug);

			// Assert
			expect(exists).toBe(true);
		});

		it("deve funcionar corretamente após deletar um post", async () => {
			// Arrange
			const slug = "slug-temporario";
			const post = Post.make(makeValidPostData({ slug }));
			await repository.create(post);
			await repository.delete(post);

			// Act
			const exists = await checker.run(slug);

			// Assert
			expect(exists).toBe(false);
		});

		it("deve funcionar corretamente após atualizar um post com novo slug", async () => {
			// Arrange
			const oldSlug = "slug-antigo";
			const newSlug = "slug-novo";

			const post = Post.make(makeValidPostData({ slug: oldSlug }));
			await repository.create(post);

			const updatedPost = Post.make(makeValidPostData({ slug: newSlug }), {
				id: post.id,
				createdAt: post.createdAt,
			});
			await repository.update(updatedPost);

			// Act
			const oldExists = await checker.run(oldSlug);
			const newExists = await checker.run(newSlug);

			// Assert
			expect(oldExists).toBe(false);
			expect(newExists).toBe(true);
		});
	});
});
