import { describe, it, expect } from "vitest";
import { faker } from "@faker-js/faker";
import { Post } from "./post";
import { InvalidDomainDataException } from "@caffeine/errors/domain";
import { makeEntityFactory } from "@caffeine/models/factories";
import type { BuildPostDTO } from "./dtos/build-post.dto";

describe("Post", () => {
	/**
	 * Factory para criar dados válidos de Post
	 * Facilita a reutilização e customização de dados de teste
	 */
	const makeValidPostData = (
		overrides: Partial<BuildPostDTO> = {},
	): BuildPostDTO => ({
		postTypeId: faker.string.uuid(),
		name: faker.lorem.sentence(),
		slug: faker.helpers.slugify(faker.lorem.words(3)),
		description: faker.lorem.paragraph(),
		cover: faker.image.url(),
		tags: [faker.string.uuid(), faker.string.uuid()],
		...overrides,
	});

	describe("make()", () => {
		it("deve criar uma instância de Post com dados válidos", () => {
			// Arrange
			const validPostData = makeValidPostData();

			// Act
			const post = Post.make(validPostData);

			// Assert
			expect(post).toBeInstanceOf(Post);
			expect(post.postTypeId).toBe(validPostData.postTypeId);
			expect(post.name).toBe(validPostData.name);
			expect(post.slug).toBe(validPostData.slug);
			expect(post.description).toBe(validPostData.description);
			expect(post.cover).toBe(validPostData.cover);
			expect(post.tags).toEqual(validPostData.tags);
		});

		it("deve criar Post com entityProps customizadas", () => {
			// Arrange
			const validPostData = makeValidPostData();
			const customEntityProps = makeEntityFactory();

			// Act
			const post = Post.make(validPostData, customEntityProps);

			// Assert
			expect(post).toBeInstanceOf(Post);
			expect(post.id).toBe(customEntityProps.id);
			expect(post.createdAt).toBe(customEntityProps.createdAt);
			expect(post.name).toBe(validPostData.name);
		});

		it("deve gerar entityProps automaticamente quando não fornecidas", () => {
			// Arrange
			const validPostData = makeValidPostData();

			// Act
			const post = Post.make(validPostData);

			// Assert
			expect(post.id).toBeDefined();
			expect(post.createdAt).toBeDefined();
			expect(typeof post.id).toBe("string");
			expect(typeof post.createdAt).toBe("string");
		});

		it("deve aceitar array de tags vazio", () => {
			// Arrange
			const validPostData = makeValidPostData({ tags: [] });

			// Act
			const post = Post.make(validPostData);

			// Assert
			expect(post).toBeInstanceOf(Post);
			expect(post.tags).toEqual([]);
		});

		it("deve lançar InvalidDomainDataException quando postTypeId não é UUID válido", () => {
			// Arrange
			const invalidData = makeValidPostData({
				postTypeId: "id-invalido-nao-uuid",
			});

			// Act & Assert
			expect(() => Post.make(invalidData)).toThrow(InvalidDomainDataException);
			expect(() => Post.make(invalidData)).toThrow("post@post");
		});

		it("deve lançar InvalidDomainDataException quando name está vazio", () => {
			// Arrange
			const invalidData = makeValidPostData({ name: "" });

			// Act & Assert
			expect(() => Post.make(invalidData)).toThrow(InvalidDomainDataException);
			expect(() => Post.make(invalidData)).toThrow("post@post");
		});

		it("deve lançar InvalidDomainDataException quando slug está ausente", () => {
			// Arrange
			const invalidData = makeValidPostData();
			delete (invalidData as Partial<BuildPostDTO>).slug;

			// Act & Assert
			expect(() => Post.make(invalidData as BuildPostDTO)).toThrow(
				InvalidDomainDataException,
			);
		});

		it("deve lançar InvalidDomainDataException quando description está ausente", () => {
			// Arrange
			const invalidData = makeValidPostData();
			delete (invalidData as Partial<BuildPostDTO>).description;

			// Act & Assert
			expect(() => Post.make(invalidData as BuildPostDTO)).toThrow(
				InvalidDomainDataException,
			);
		});

		it("deve lançar InvalidDomainDataException quando cover está ausente", () => {
			// Arrange
			const invalidData = makeValidPostData();
			delete (invalidData as Partial<BuildPostDTO>).cover;

			// Act & Assert
			expect(() => Post.make(invalidData as BuildPostDTO)).toThrow(
				InvalidDomainDataException,
			);
		});

		it("deve lançar InvalidDomainDataException quando tags contém UUID inválido", () => {
			// Arrange
			const invalidData = makeValidPostData({
				tags: ["uuid-valido", "uuid-invalido"],
			});

			// Act & Assert
			expect(() => Post.make(invalidData)).toThrow(InvalidDomainDataException);
		});

		it("deve lançar InvalidDomainDataException quando tags não é um array", () => {
			// Arrange
			const invalidData = makeValidPostData({
				tags: "not-an-array" as unknown as string[],
			});

			// Act & Assert
			expect(() => Post.make(invalidData)).toThrow(InvalidDomainDataException);
		});
	});

	describe("unpack()", () => {
		it("deve retornar IUnmountedPost com todas as propriedades do domínio", () => {
			// Arrange
			const validPostData = makeValidPostData();
			const post = Post.make(validPostData);

			// Act
			const unpacked = post.unpack();

			// Assert
			expect(unpacked).toHaveProperty("postTypeId", validPostData.postTypeId);
			expect(unpacked).toHaveProperty("name", validPostData.name);
			expect(unpacked).toHaveProperty("slug", validPostData.slug);
			expect(unpacked).toHaveProperty("description", validPostData.description);
			expect(unpacked).toHaveProperty("cover", validPostData.cover);
			expect(unpacked).toHaveProperty("tags");
			expect(unpacked.tags).toEqual(validPostData.tags);
		});

		it("deve retornar IUnmountedPost com propriedades de Entity", () => {
			// Arrange
			const validPostData = makeValidPostData();
			const post = Post.make(validPostData);

			// Act
			const unpacked = post.unpack();

			// Assert
			expect(unpacked).toHaveProperty("id");
			expect(unpacked).toHaveProperty("createdAt");
			expect(typeof unpacked.id).toBe("string");
			// createdAt e updatedAt são serializados como strings ISO no unpack
			expect(typeof unpacked.createdAt).toBe("string");
		});

		it("não deve incluir o método unpack no objeto retornado", () => {
			// Arrange
			const validPostData = makeValidPostData();
			const post = Post.make(validPostData);

			// Act
			const unpacked = post.unpack();

			// Assert
			expect(unpacked).not.toHaveProperty("unpack");
			expect(typeof (unpacked as unknown as { unpack?: unknown }).unpack).toBe(
				"undefined",
			);
		});

		it("deve retornar um objeto com os mesmos valores da instância", () => {
			// Arrange
			const validPostData = makeValidPostData();
			const customEntityProps = makeEntityFactory();
			const post = Post.make(validPostData, customEntityProps);

			// Act
			const unpacked = post.unpack();

			// Assert
			expect(unpacked.id).toBe(post.id);
			expect(unpacked.postTypeId).toBe(post.postTypeId);
			expect(unpacked.name).toBe(post.name);
			expect(unpacked.slug).toBe(post.slug);
			expect(unpacked.description).toBe(post.description);
			expect(unpacked.cover).toBe(post.cover);
			expect(unpacked.tags).toBe(post.tags);
			expect(unpacked.createdAt).toBe(post.createdAt);
		});

		it("deve manter a referência do array de tags", () => {
			// Arrange
			const validPostData = makeValidPostData();
			const post = Post.make(validPostData);

			// Act
			const unpacked = post.unpack();

			// Assert
			expect(unpacked.tags).toBe(post.tags);
		});
	});

	describe("Integração entre make() e unpack()", () => {
		it("deve ser possível recriar um Post a partir de dados unpacked", () => {
			// Arrange
			const originalData = makeValidPostData();
			const originalPost = Post.make(originalData);
			const unpacked = originalPost.unpack();

			// Act
			const recreatedPost = Post.make(
				{
					postTypeId: unpacked.postTypeId,
					name: unpacked.name,
					slug: unpacked.slug,
					description: unpacked.description,
					cover: unpacked.cover,
					tags: unpacked.tags,
				},
				{
					id: unpacked.id,
					createdAt: unpacked.createdAt,
				},
			);

			// Assert
			expect(recreatedPost.id).toBe(originalPost.id);
			expect(recreatedPost.postTypeId).toBe(originalPost.postTypeId);
			expect(recreatedPost.name).toBe(originalPost.name);
			expect(recreatedPost.slug).toBe(originalPost.slug);
			expect(recreatedPost.description).toBe(originalPost.description);
			expect(recreatedPost.cover).toBe(originalPost.cover);
			expect(recreatedPost.tags).toEqual(originalPost.tags);
		});
	});
});
