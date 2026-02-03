import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";

/**
 * Repositório InMemory para testes da entidade PostType.
 * Armazena tipos de post em memória usando um Map para acesso eficiente.
 */
export class PostTypeRepository implements IPostTypeRepository {
	/**
	 * Armazena os tipos em memória, indexados por ID para busca O(1)
	 */
	private types: Map<string, IUnmountedPostType> = new Map();

	/**
	 * Busca um tipo por ID
	 * @param id - ID do tipo
	 * @returns Tipo encontrado ou null se não existir
	 */
	async findById(id: string): Promise<IUnmountedPostType | null> {
		return this.types.get(id) ?? null;
	}

	async findBySlug(slug: string): Promise<IUnmountedPostType | null> {
		for (const type of this.types.values()) {
			if (type.slug === slug) {
				return type;
			}
		}
		return null;
	}

	/**
	 * Popula o repositório com dados de teste
	 * @param types - Array de tipos para adicionar
	 */
	seed(types: IUnmountedPostType[]): void {
		for (const type of types) {
			this.types.set(type.id, type);
		}
	}

	/**
	 * Limpa todos os dados do repositório (útil para testes)
	 */
	clear(): void {
		this.types.clear();
	}

	/**
	 * Retorna todos os tipos armazenados (útil para testes)
	 * @returns Array com todos os tipos
	 */
	getAll(): IUnmountedPostType[] {
		return Array.from(this.types.values());
	}

	/**
	 * Retorna o número total de tipos no repositório
	 * @returns Quantidade de tipos armazenados
	 */
	length(): number {
		return this.types.size;
	}
}
