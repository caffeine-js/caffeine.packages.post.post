import type { IPostTagRepository } from "@/domain/types/repositories/post-tag-repository.interface";
import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";

/**
 * Repositório InMemory para testes da entidade PostTag.
 * Armazena tags em memória usando um Map para acesso eficiente.
 */
export class PostTagRepository implements IPostTagRepository {
	/**
	 * Armazena as tags em memória, indexadas por ID para busca O(1)
	 */
	private tags: Map<string, IUnmountedPostTag> = new Map();

	/**
	 * Busca uma tag por ID
	 * @param id - ID da tag
	 * @returns Tag encontrada ou null se não existir
	 */
	async findById(id: string): Promise<IUnmountedPostTag | null> {
		return this.tags.get(id) ?? null;
	}

	/**
	 * Popula o repositório com dados de teste
	 * @param tags - Array de tags para adicionar
	 */
	seed(tags: IUnmountedPostTag[]): void {
		for (const tag of tags) {
			this.tags.set(tag.id, tag);
		}
	}

	/**
	 * Limpa todos os dados do repositório (útil para testes)
	 */
	clear(): void {
		this.tags.clear();
	}

	/**
	 * Retorna todas as tags armazenadas (útil para testes)
	 * @returns Array com todas as tags
	 */
	getAll(): IUnmountedPostTag[] {
		return Array.from(this.tags.values());
	}

	/**
	 * Retorna o número total de tags no repositório
	 * @returns Quantidade de tags armazenadas
	 */
	count(): number {
		return this.tags.size;
	}
}
