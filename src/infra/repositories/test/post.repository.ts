import type { PostType } from "@caffeine-packages/post.post-type/domain";
import type { Post } from "../../../domain/post";
import type { IPostRepository } from "../../../domain/types/post-repository.interface";
import type { IUnmountedPost } from "../../../domain/types/unmounted-post.interface";

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
	async create(post: Post): Promise<void> {
		const unpacked = post.unpack();

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
	async findById(id: string): Promise<IUnmountedPost | null> {
		return this.posts.get(id) ?? null;
	}

	/**
	 * Busca um post por slug
	 * @param slug - Slug do post
	 * @returns Post encontrado ou null se não existir
	 */
	async findBySlug(slug: string): Promise<IUnmountedPost | null> {
		for (const post of this.posts.values()) {
			if (post.slug === slug) {
				return post;
			}
		}
		return null;
	}

	/**
	 * Lista posts com paginação
	 * @param page - Número da página (começa em 1)
	 * @returns Array de posts da página solicitada
	 */
	async findMany(page: number): Promise<IUnmountedPost[]> {
		const allPosts = Array.from(this.posts.values());
		return this.paginate(allPosts, page);
	}

	/**
	 * Lista posts de um tipo específico com paginação
	 * @param postType - Tipo de post para filtrar
	 * @param page - Número da página (começa em 1)
	 * @returns Array de posts do tipo especificado na página solicitada
	 */
	async findManyByPostType(
		postType: PostType,
		page: number,
	): Promise<IUnmountedPost[]> {
		const filteredPosts = Array.from(this.posts.values()).filter(
			(post) => post.postTypeId === postType.id,
		);
		return this.paginate(filteredPosts, page);
	}

	/**
	 * Atualiza um post existente
	 * @param post - Instância de Post com dados atualizados
	 * @throws Error se o post não existe
	 */
	async update(post: Post): Promise<void> {
		const unpacked = post.unpack();

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
	async delete(post: Post): Promise<void> {
		const unpacked = post.unpack();

		if (!this.posts.has(unpacked.id)) {
			throw new Error(`Post com ID ${unpacked.id} não encontrado`);
		}

		this.posts.delete(unpacked.id);
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
}
