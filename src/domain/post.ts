import { Entity, Schema } from "@caffeine/models";
import type { IPost, IUnmountedPost } from "./types";
import { BuildPostDTO } from "./dtos/build-post.dto";
import type { EntityDTO } from "@caffeine/models/dtos";
import { InvalidDomainDataException } from "@caffeine/errors/domain";
import { makeEntityFactory } from "@caffeine/models/factories";

export class Post extends Entity<IUnmountedPost> implements IPost {
	public postTypeId: string;
	public name: string;
	public slug: string;
	public description: string;
	public cover: string;
	public tags: string[];

	private constructor(
		{ postTypeId, cover, description, name, slug, tags }: BuildPostDTO,
		entityProps: EntityDTO,
	) {
		super(entityProps);

		this.cover = cover;
		this.postTypeId = postTypeId;
		this.description = description;
		this.name = name;
		this.slug = slug;
		this.tags = tags;
	}

	public static make(
		initialProperties: BuildPostDTO,
		entityProps?: EntityDTO,
	): Post {
		if (!Schema.make(BuildPostDTO).match(initialProperties))
			throw new InvalidDomainDataException("post@post");

		entityProps = entityProps ?? makeEntityFactory();

		return new Post(initialProperties, entityProps);
	}

	public override unpack(): IUnmountedPost {
		const { unpack: _, ...properties } = this;

		return properties;
	}
}
