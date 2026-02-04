import { Entity } from "@caffeine/models";
import type { IPost } from "./types";
import { BuildPostDTO } from "./dtos/build-post.dto";
import type { EntityDTO } from "@caffeine/models/dtos";
import { InvalidDomainDataException } from "@caffeine/errors/domain";
import { makeEntityFactory } from "@caffeine/models/factories";
import { slugify } from "@caffeine/models/helpers";
import { Schema } from "@caffeine/models/schema";
import { StringDTO } from "@caffeine/models/dtos/primitives";
import {} from "@caffeine/errors/domain";

export class Post extends Entity implements IPost {
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

	rename(value: string): void {
		// if (!Schema.make(StringDTO).match(value))
		// 	throw new

		this.name = value;
		this.slug = slugify(value);
		this.update();
	}

	updateDescription(value: string): void {
		this.description = value;
		this.update();
	}

	updateCover(value: string): void {
		this.cover = value;
		this.update();
	}

	updateTags(values: string[]): void {
		this.tags = values;
		this.update();
	}

	public static make(
		initialProperties: BuildPostDTO,
		entityProps?: EntityDTO,
	): IPost {
		if (!Schema.make(BuildPostDTO).match(initialProperties))
			throw new InvalidDomainDataException("post@post");

		entityProps = entityProps ?? makeEntityFactory();

		return new Post(initialProperties, entityProps);
	}
}
