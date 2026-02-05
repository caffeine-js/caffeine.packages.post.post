import { Post } from "@/domain";
import type { IPost, IUnmountedPost } from "@/domain/types";
import type { IPostRepository } from "@/domain/types/post-repository.interface";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";

/**
 * Repositório InMemory para testes da entidade Post.
 * Armazena posts em memória usando um Map para acesso eficiente.
 */
export class PostRepository implements IPostRepository {
	/**
	 * Armazena os posts em memória, indexados por ID para busca O(1)
	 */
	private posts: Map<string, IUnmountedPost> = new Map();

	/**
	 * Tamanho padrão de página para paginação
	 */
	private readonly PAGE_SIZE = 10;

	/**
	 * Cria um novo post no repositório
	 * @param post - Instância de Post a ser criada
	 * @throws Error se já existe um post com o mesmo ID
	 */
	async create(post: IPost): Promise<void> {
		const unpacked: IUnmountedPost = {
			id: post.id,
			createdAt: post.createdAt,
			updatedAt: post.updatedAt,
			postTypeId: post.postTypeId,
			name: post.name,
			slug: post.slug,
			description: post.description,
			cover: post.cover,
			tags: post.tags,
		};

		if (this.posts.has(unpacked.id)) {
			throw new Error(`Post com ID ${unpacked.id} já existe`);
		}

		this.posts.set(unpacked.id, unpacked);
	}

	/**
	 * Busca um post por ID
	 * @param id - ID do post
	 * @returns Post encontrado ou null se não existir
	 */
	async findById(id: string): Promise<IPost | null> {
		const raw = this.posts.get(id);
		if (!raw) return null;
		return this.hydrate(raw);
	}

	/**
	 * Busca um post por slug
	 * @param slug - Slug do post
	 * @returns Post encontrado ou null se não existir
	 */
	async findBySlug(slug: string): Promise<IPost | null> {
		for (const post of this.posts.values()) {
			if (post.slug === slug) {
				return this.hydrate(post);
			}
		}
		return null;
	}

	/**
	 * Lista posts com paginação
	 * @param page - Número da página (começa em 1)
	 * @returns Array de posts da página solicitada
	 */
	async findMany(page: number): Promise<IPost[]> {
		const allPosts = Array.from(this.posts.values());
		const paginatedCalls = this.paginate(allPosts, page);
		return paginatedCalls.map((p) => this.hydrate(p));
	}

	/**
	 * Lista posts de um tipo específico com paginação
	 * @param postType - Tipo de post para filtrar
	 * @param page - Número da página (começa em 1)
	 * @returns Array de posts do tipo especificado na página solicitada
	 */
	async findManyByPostType(
		postType: IUnmountedPostType,
		page: number,
	): Promise<IPost[]> {
		const filteredPosts = Array.from(this.posts.values()).filter(
			(post) => post.postTypeId === postType.id,
		);
		const paginated = this.paginate(filteredPosts, page);
		return paginated.map((p) => this.hydrate(p));
	}

	/**
	 * Atualiza um post existente
	 * @param post - Instância de Post com dados atualizados
	 * @throws Error se o post não existe
	 */
	async update(post: IPost): Promise<void> {
		const unpacked: IUnmountedPost = {
			id: post.id,
			createdAt: post.createdAt,
			updatedAt: post.updatedAt,
			postTypeId: post.postTypeId,
			name: post.name,
			slug: post.slug,
			description: post.description,
			cover: post.cover,
			tags: post.tags,
		};

		if (!this.posts.has(unpacked.id)) {
			throw new Error(`Post com ID ${unpacked.id} não encontrado`);
		}

		this.posts.set(unpacked.id, unpacked);
	}

	/**
	 * Remove um post do repositório
	 * @param post - Instância de Post a ser removida
	 * @throws Error se o post não existe
	 */
	async delete(post: IPost): Promise<void> {
		if (!this.posts.has(post.id)) {
			throw new Error(`Post com ID ${post.id} não encontrado`);
		}

		this.posts.delete(post.id);
	}

	/**
	 * Retorna o número total de posts no repositório
	 * @returns Quantidade de posts armazenados
	 */
	async length(): Promise<number> {
		return this.posts.size;
	}

	/**
	 * Método auxiliar para paginação
	 * @param items - Array de items a paginar
	 * @param page - Número da página (começa em 1)
	 * @returns Array de items da página solicitada
	 */
	private paginate(items: IUnmountedPost[], page: number): IUnmountedPost[] {
		const startIndex = (page - 1) * this.PAGE_SIZE;
		const endIndex = startIndex + this.PAGE_SIZE;
		return items.slice(startIndex, endIndex);
	}

	/**
	 * Método auxiliar para limpar o repositório (útil para testes)
	 * Não faz parte da interface IPostRepository
	 */
	clear(): void {
		this.posts.clear();
	}

	/**
	 * Método auxiliar para obter todos os posts (útil para testes)
	 * Não faz parte da interface IPostRepository
	 * @returns Array com todos os posts armazenados
	 */
	getAll(): IUnmountedPost[] {
		return Array.from(this.posts.values());
	}

	private hydrate(raw: IUnmountedPost): IPost {
		return Post.make(
			{
				name: raw.name,
				description: raw.description,
				slug: raw.slug,
				cover: raw.cover,
				postTypeId: raw.postTypeId,
				tags: raw.tags,
			},
			{
				id: raw.id,
				createdAt: raw.createdAt,
				updatedAt: raw.updatedAt,
			},
		);
	}
}
