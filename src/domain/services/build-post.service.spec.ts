import { describe, it, expect } from "vitest";
import { faker } from "@faker-js/faker";
import { BuildPost } from "./build-post.service";
import { Post } from "../post";
import { InvalidDomainDataException } from "@caffeine/errors/domain";
import { makeEntityFactory } from "@caffeine/models/factories";
import type { IUnmountedPost } from "../types";

describe("BuildPost", () => {
	/**
	 * Factory para criar dados válidos de IUnmountedPost
	 */
	const makeValidUnmountedPost = (
		overrides: Partial<IUnmountedPost> = {},
	): IUnmountedPost => {
		const entityProps = makeEntityFactory();
		return {
			id: entityProps.id,
			createdAt: entityProps.createdAt,
			updatedAt: entityProps.updatedAt,
			postTypeId: faker.string.uuid(),
			name: faker.lorem.sentence(),
			slug: faker.helpers.slugify(faker.lorem.words(3)),
			description: faker.lorem.paragraph(),
			cover: faker.image.url(),
			tags: [faker.string.uuid()],
			...overrides,
		};
	};

	describe("run()", () => {
		it("deve criar uma instância de Post com dados válidos", () => {
			// Arrange
			const unmountedPost = makeValidUnmountedPost();

			// Act
			const post = BuildPost.run(unmountedPost);

			// Assert
			expect(post).toBeInstanceOf(Post);
			expect(post.id).toBe(unmountedPost.id);
			expect(post.postTypeId).toBe(unmountedPost.postTypeId);
			expect(post.name).toBe(unmountedPost.name);
			expect(post.slug).toBe(unmountedPost.slug);
			expect(post.description).toBe(unmountedPost.description);
			expect(post.cover).toBe(unmountedPost.cover);
			expect(post.tags).toEqual(unmountedPost.tags);
			expect(post.createdAt).toBe(unmountedPost.createdAt);
		});

		it("deve preservar as propriedades de entidade (id, createdAt, updatedAt)", () => {
			// Arrange
			const customEntityProps = makeEntityFactory();
			const unmountedPost = makeValidUnmountedPost({
				id: customEntityProps.id,
				createdAt: customEntityProps.createdAt,
				updatedAt: customEntityProps.updatedAt,
			});

			// Act
			const post = BuildPost.run(unmountedPost);

			// Assert
			expect(post.id).toBe(customEntityProps.id);
			expect(post.createdAt).toBe(customEntityProps.createdAt);
		});

		it("deve criar Post com array de tags vazio", () => {
			// Arrange
			const unmountedPost = makeValidUnmountedPost({ tags: [] });

			// Act
			const post = BuildPost.run(unmountedPost);

			// Assert
			expect(post).toBeInstanceOf(Post);
			expect(post.tags).toEqual([]);
		});

		it("deve criar Post com múltiplas tags", () => {
			// Arrange
			const tags = [
				faker.string.uuid(),
				faker.string.uuid(),
				faker.string.uuid(),
			];
			const unmountedPost = makeValidUnmountedPost({ tags });

			// Act
			const post = BuildPost.run(unmountedPost);

			// Assert
			expect(post.tags).toEqual(tags);
			expect(post.tags).toHaveLength(3);
		});

		it("deve lançar InvalidDomainDataException quando postTypeId não é UUID válido", () => {
			// Arrange
			const invalidUnmountedPost = makeValidUnmountedPost({
				postTypeId: "id-invalido-nao-uuid",
			});

			// Act & Assert
			expect(() => BuildPost.run(invalidUnmountedPost)).toThrow(
				InvalidDomainDataException,
			);
			expect(() => BuildPost.run(invalidUnmountedPost)).toThrow(
				"post@post::unmount",
			);
		});

		it("deve lançar InvalidDomainDataException quando name está vazio", () => {
			// Arrange
			const invalidUnmountedPost = makeValidUnmountedPost({ name: "" });

			// Act & Assert
			expect(() => BuildPost.run(invalidUnmountedPost)).toThrow(
				InvalidDomainDataException,
			);
			expect(() => BuildPost.run(invalidUnmountedPost)).toThrow(
				"post@post::unmount",
			);
		});

		it("deve lançar InvalidDomainDataException quando slug está ausente", () => {
			// Arrange
			const invalidUnmountedPost = makeValidUnmountedPost();
			delete (invalidUnmountedPost as Partial<IUnmountedPost>).slug;

			// Act & Assert
			expect(() =>
				BuildPost.run(invalidUnmountedPost as IUnmountedPost),
			).toThrow(InvalidDomainDataException);
		});

		it("deve lançar InvalidDomainDataException quando description está ausente", () => {
			// Arrange
			const invalidUnmountedPost = makeValidUnmountedPost();
			delete (invalidUnmountedPost as Partial<IUnmountedPost>).description;

			// Act & Assert
			expect(() =>
				BuildPost.run(invalidUnmountedPost as IUnmountedPost),
			).toThrow(InvalidDomainDataException);
		});

		it("deve lançar InvalidDomainDataException quando cover está ausente", () => {
			// Arrange
			const invalidUnmountedPost = makeValidUnmountedPost();
			delete (invalidUnmountedPost as Partial<IUnmountedPost>).cover;

			// Act & Assert
			expect(() =>
				BuildPost.run(invalidUnmountedPost as IUnmountedPost),
			).toThrow(InvalidDomainDataException);
		});

		it("deve lançar InvalidDomainDataException quando tags contém UUID inválido", () => {
			// Arrange
			const invalidUnmountedPost = makeValidUnmountedPost({
				tags: [faker.string.uuid(), "uuid-invalido"],
			});

			// Act & Assert
			expect(() => BuildPost.run(invalidUnmountedPost)).toThrow(
				InvalidDomainDataException,
			);
		});

		it("deve lançar InvalidDomainDataException quando tags não é um array", () => {
			// Arrange
			const invalidUnmountedPost = makeValidUnmountedPost({
				tags: "not-an-array" as unknown as string[],
			});

			// Act & Assert
			expect(() => BuildPost.run(invalidUnmountedPost)).toThrow(
				InvalidDomainDataException,
			);
		});

		it("deve lançar InvalidDomainDataException quando id está ausente", () => {
			// Arrange
			const invalidUnmountedPost = makeValidUnmountedPost();
			delete (invalidUnmountedPost as Partial<IUnmountedPost>).id;

			// Act & Assert
			expect(() =>
				BuildPost.run(invalidUnmountedPost as IUnmountedPost),
			).toThrow(InvalidDomainDataException);
		});

		it("deve lançar InvalidDomainDataException quando createdAt está ausente", () => {
			// Arrange
			const invalidUnmountedPost = makeValidUnmountedPost();
			delete (invalidUnmountedPost as Partial<IUnmountedPost>).createdAt;

			// Act & Assert
			expect(() =>
				BuildPost.run(invalidUnmountedPost as IUnmountedPost),
			).toThrow(InvalidDomainDataException);
		});

		it("deve lançar InvalidDomainDataException quando id não é UUID válido", () => {
			// Arrange
			const invalidUnmountedPost = makeValidUnmountedPost({
				id: "id-invalido",
			});

			// Act & Assert
			expect(() => BuildPost.run(invalidUnmountedPost)).toThrow(
				InvalidDomainDataException,
			);
		});
	});

	describe("Integração com Post.unpack()", () => {
		it("deve ser possível reconstruir um Post a partir de dados unpacked", () => {
			// Arrange
			const originalPost = Post.make({
				postTypeId: faker.string.uuid(),
				name: faker.lorem.sentence(),
				slug: faker.helpers.slugify(faker.lorem.words(3)),
				description: faker.lorem.paragraph(),
				cover: faker.image.url(),
				tags: [faker.string.uuid()],
			});

			const unpacked = originalPost.unpack();

			// Act
			const rebuiltPost = BuildPost.run(unpacked);

			// Assert
			expect(rebuiltPost.id).toBe(originalPost.id);
			expect(rebuiltPost.postTypeId).toBe(originalPost.postTypeId);
			expect(rebuiltPost.name).toBe(originalPost.name);
			expect(rebuiltPost.slug).toBe(originalPost.slug);
			expect(rebuiltPost.description).toBe(originalPost.description);
			expect(rebuiltPost.cover).toBe(originalPost.cover);
			expect(rebuiltPost.tags).toEqual(originalPost.tags);
			expect(rebuiltPost.createdAt).toBe(originalPost.createdAt);
		});

		it("deve manter a consistência em múltiplos ciclos de unpack/rebuild", () => {
			// Arrange
			const originalPost = Post.make({
				postTypeId: faker.string.uuid(),
				name: faker.lorem.sentence(),
				slug: faker.helpers.slugify(faker.lorem.words(3)),
				description: faker.lorem.paragraph(),
				cover: faker.image.url(),
				tags: [faker.string.uuid()],
			});

			// Act - Ciclo 1
			const unpacked1 = originalPost.unpack();
			const rebuilt1 = BuildPost.run(unpacked1);

			// Act - Ciclo 2
			const unpacked2 = rebuilt1.unpack();
			const rebuilt2 = BuildPost.run(unpacked2);

			// Assert
			expect(rebuilt2.id).toBe(originalPost.id);
			expect(rebuilt2.name).toBe(originalPost.name);
			expect(rebuilt2.slug).toBe(originalPost.slug);
			expect(rebuilt2.createdAt).toBe(originalPost.createdAt);
		});
	});

	describe("Imutabilidade", () => {
		it("não deve modificar o objeto de entrada", () => {
			// Arrange
			const unmountedPost = makeValidUnmountedPost();
			const originalData = { ...unmountedPost };

			// Act
			BuildPost.run(unmountedPost);

			// Assert
			expect(unmountedPost).toEqual(originalData);
		});
	});
});
