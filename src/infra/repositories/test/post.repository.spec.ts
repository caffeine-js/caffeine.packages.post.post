import { describe, it, expect, beforeEach } from "vitest";
import { faker } from "@faker-js/faker";
import { PostRepository } from "./post.repository";
import { Post } from "../../../domain/post";
import type { BuildPostDTO } from "../../../domain/dtos/build-post.dto";
import { makeEntityFactory } from "@caffeine/models/factories";

describe("PostRepository", () => {
	let repository: PostRepository;

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
	 * Reinicia o repositório antes de cada teste
	 */
	beforeEach(() => {
		repository = new PostRepository();
	});

	describe("create()", () => {
		it("deve criar um post no repositório", async () => {
			// Arrange
			const postData = makeValidPostData();
			const post = Post.make(postData);

			// Act
			await repository.create(post);

			// Assert
			const found = await repository.findById(post.id);
			expect(found).not.toBeNull();
			expect(found?.id).toBe(post.id);
			expect(found?.name).toBe(postData.name);
		});

		it("deve incrementar o tamanho do repositório", async () => {
			// Arrange
			const post = Post.make(makeValidPostData());

			// Act
			await repository.create(post);

			// Assert
			const length = await repository.length();
			expect(length).toBe(1);
		});

		it("deve lançar erro ao criar post com ID duplicado", async () => {
			// Arrange
			const entityProps = makeEntityFactory();
			const post1 = Post.make(makeValidPostData(), entityProps);
			const post2 = Post.make(makeValidPostData(), entityProps);

			// Act
			await repository.create(post1);

			// Assert
			await expect(repository.create(post2)).rejects.toThrow(
				`Post com ID ${post1.id} já existe`,
			);
		});
	});

	describe("findById()", () => {
		it("deve encontrar um post por ID", async () => {
			// Arrange
			const post = Post.make(makeValidPostData());
			await repository.create(post);

			// Act
			const found = await repository.findById(post.id);

			// Assert
			expect(found).not.toBeNull();
			expect(found?.id).toBe(post.id);
		});

		it("deve retornar null quando post não existe", async () => {
			// Arrange
			const nonExistentId = faker.string.uuid();

			// Act
			const found = await repository.findById(nonExistentId);

			// Assert
			expect(found).toBeNull();
		});

		it("deve retornar o post com todas as propriedades", async () => {
			// Arrange
			const postData = makeValidPostData();
			const post = Post.make(postData);
			await repository.create(post);

			// Act
			const found = await repository.findById(post.id);

			// Assert
			expect(found).toMatchObject({
				id: post.id,
				postTypeId: postData.postTypeId,
				name: postData.name,
				slug: postData.slug,
				description: postData.description,
				cover: postData.cover,
				tags: postData.tags,
			});
		});
	});

	describe("findBySlug()", () => {
		it("deve encontrar um post por slug", async () => {
			// Arrange
			const slug = "meu-post-unico";
			const post = Post.make(makeValidPostData({ slug }));
			await repository.create(post);

			// Act
			const found = await repository.findBySlug(slug);

			// Assert
			expect(found).not.toBeNull();
			expect(found?.slug).toBe(slug);
			expect(found?.id).toBe(post.id);
		});

		it("deve retornar null quando slug não existe", async () => {
			// Arrange
			const nonExistentSlug = "slug-inexistente";

			// Act
			const found = await repository.findBySlug(nonExistentSlug);

			// Assert
			expect(found).toBeNull();
		});

		it("deve retornar o primeiro post quando há slugs duplicados", async () => {
			// Arrange
			const slug = "slug-duplicado";
			const post1 = Post.make(makeValidPostData({ slug }));
			const post2 = Post.make(makeValidPostData({ slug }));

			await repository.create(post1);
			await repository.create(post2);

			// Act
			const found = await repository.findBySlug(slug);

			// Assert
			expect(found).not.toBeNull();
			// Deve retornar um dos posts (o primeiro encontrado)
			expect([post1.id, post2.id]).toContain(found?.id);
		});
	});

	describe("findMany()", () => {
		it("deve retornar array vazio quando não há posts", async () => {
			// Act
			const posts = await repository.findMany(1);

			// Assert
			expect(posts).toEqual([]);
		});

		it("deve retornar todos os posts quando há menos que o tamanho da página", async () => {
			// Arrange
			const post1 = Post.make(makeValidPostData());
			const post2 = Post.make(makeValidPostData());
			await repository.create(post1);
			await repository.create(post2);

			// Act
			const posts = await repository.findMany(1);

			// Assert
			expect(posts).toHaveLength(2);
		});

		it("deve paginar corretamente quando há mais posts que o tamanho da página", async () => {
			// Arrange - Criar 15 posts (tamanho da página é 10)
			const createdPosts = [];
			for (let i = 0; i < 15; i++) {
				const post = Post.make(makeValidPostData());
				await repository.create(post);
				createdPosts.push(post);
			}

			// Act
			const page1 = await repository.findMany(1);
			const page2 = await repository.findMany(2);

			// Assert
			expect(page1).toHaveLength(10);
			expect(page2).toHaveLength(5);
		});

		it("deve retornar array vazio para página além do total", async () => {
			// Arrange
			const post = Post.make(makeValidPostData());
			await repository.create(post);

			// Act
			const posts = await repository.findMany(10);

			// Assert
			expect(posts).toEqual([]);
		});
	});

	describe("findManyByPostType()", () => {
		it("deve retornar apenas posts do tipo especificado", async () => {
			// Arrange
			const postTypeId1 = faker.string.uuid();
			const postTypeId2 = faker.string.uuid();

			const post1 = Post.make(makeValidPostData({ postTypeId: postTypeId1 }));
			const post2 = Post.make(makeValidPostData({ postTypeId: postTypeId1 }));
			const post3 = Post.make(makeValidPostData({ postTypeId: postTypeId2 }));

			await repository.create(post1);
			await repository.create(post2);
			await repository.create(post3);

			// Mock do PostType (apenas com a propriedade id necessária)
			const postType = { id: postTypeId1 } as never;

			// Act
			const posts = await repository.findManyByPostType(postType, 1);

			// Assert
			expect(posts).toHaveLength(2);
			expect(posts.every((p) => p.postTypeId === postTypeId1)).toBe(true);
		});

		it("deve retornar array vazio quando não há posts do tipo", async () => {
			// Arrange
			const post = Post.make(makeValidPostData());
			await repository.create(post);

			const differentPostType = { id: faker.string.uuid() } as never;

			// Act
			const posts = await repository.findManyByPostType(differentPostType, 1);

			// Assert
			expect(posts).toEqual([]);
		});

		it("deve paginar corretamente posts por tipo", async () => {
			// Arrange
			const postTypeId = faker.string.uuid();

			// Criar 15 posts do mesmo tipo
			for (let i = 0; i < 15; i++) {
				const post = Post.make(makeValidPostData({ postTypeId }));
				await repository.create(post);
			}

			const postType = { id: postTypeId } as never;

			// Act
			const page1 = await repository.findManyByPostType(postType, 1);
			const page2 = await repository.findManyByPostType(postType, 2);

			// Assert
			expect(page1).toHaveLength(10);
			expect(page2).toHaveLength(5);
		});
	});

	describe("update()", () => {
		it("deve atualizar um post existente", async () => {
			// Arrange
			const originalData = makeValidPostData({ name: "Nome Original" });
			const post = Post.make(originalData);
			await repository.create(post);

			// Criar versão atualizada com mesmo ID
			const updatedData = makeValidPostData({ name: "Nome Atualizado" });
			const updatedPost = Post.make(updatedData, {
				id: post.id,
				createdAt: post.createdAt,
			});

			// Act
			await repository.update(updatedPost);

			// Assert
			const found = await repository.findById(post.id);
			expect(found?.name).toBe("Nome Atualizado");
		});

		it("deve lançar erro ao atualizar post inexistente", async () => {
			// Arrange
			const post = Post.make(makeValidPostData());

			// Act & Assert
			await expect(repository.update(post)).rejects.toThrow(
				`Post com ID ${post.id} não encontrado`,
			);
		});

		it("não deve alterar o tamanho do repositório", async () => {
			// Arrange
			const post = Post.make(makeValidPostData());
			await repository.create(post);

			const updatedPost = Post.make(makeValidPostData(), {
				id: post.id,
				createdAt: post.createdAt,
			});

			// Act
			await repository.update(updatedPost);

			// Assert
			const length = await repository.length();
			expect(length).toBe(1);
		});
	});

	describe("delete()", () => {
		it("deve remover um post do repositório", async () => {
			// Arrange
			const post = Post.make(makeValidPostData());
			await repository.create(post);

			// Act
			await repository.delete(post);

			// Assert
			const found = await repository.findById(post.id);
			expect(found).toBeNull();
		});

		it("deve decrementar o tamanho do repositório", async () => {
			// Arrange
			const post = Post.make(makeValidPostData());
			await repository.create(post);

			// Act
			await repository.delete(post);

			// Assert
			const length = await repository.length();
			expect(length).toBe(0);
		});

		it("deve lançar erro ao deletar post inexistente", async () => {
			// Arrange
			const post = Post.make(makeValidPostData());

			// Act & Assert
			await expect(repository.delete(post)).rejects.toThrow(
				`Post com ID ${post.id} não encontrado`,
			);
		});
	});

	describe("length()", () => {
		it("deve retornar 0 para repositório vazio", async () => {
			// Act
			const length = await repository.length();

			// Assert
			expect(length).toBe(0);
		});

		it("deve retornar a quantidade correta de posts", async () => {
			// Arrange
			const post1 = Post.make(makeValidPostData());
			const post2 = Post.make(makeValidPostData());
			const post3 = Post.make(makeValidPostData());

			await repository.create(post1);
			await repository.create(post2);
			await repository.create(post3);

			// Act
			const length = await repository.length();

			// Assert
			expect(length).toBe(3);
		});

		it("deve refletir mudanças após operações", async () => {
			// Arrange
			const post1 = Post.make(makeValidPostData());
			const post2 = Post.make(makeValidPostData());

			// Act & Assert
			expect(await repository.length()).toBe(0);

			await repository.create(post1);
			expect(await repository.length()).toBe(1);

			await repository.create(post2);
			expect(await repository.length()).toBe(2);

			await repository.delete(post1);
			expect(await repository.length()).toBe(1);
		});
	});

	describe("Métodos auxiliares", () => {
		describe("clear()", () => {
			it("deve limpar todos os posts do repositório", async () => {
				// Arrange
				const post1 = Post.make(makeValidPostData());
				const post2 = Post.make(makeValidPostData());
				await repository.create(post1);
				await repository.create(post2);

				// Act
				repository.clear();

				// Assert
				const length = await repository.length();
				expect(length).toBe(0);
			});
		});

		describe("getAll()", () => {
			it("deve retornar todos os posts sem paginação", async () => {
				// Arrange
				const posts = [];
				for (let i = 0; i < 15; i++) {
					const post = Post.make(makeValidPostData());
					await repository.create(post);
					posts.push(post);
				}

				// Act
				const allPosts = repository.getAll();

				// Assert
				expect(allPosts).toHaveLength(15);
			});

			it("deve retornar array vazio quando repositório está vazio", () => {
				// Act
				const allPosts = repository.getAll();

				// Assert
				expect(allPosts).toEqual([]);
			});
		});
	});
});
