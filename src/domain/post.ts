import { Entity } from "@caffeine/models";
import type { EntityDTO } from "@caffeine/models/dtos";
import { InvalidDomainDataException } from "@caffeine/errors/domain";
import { makeEntityFactory } from "@caffeine/models/factories";
import { slugify } from "@caffeine/models/helpers";
import { Schema } from "@caffeine/models/schema";
import { BuildPostDTO } from "./dtos/build-post.dto";
import type { IPost } from "./types";
import {
	DefinedStringVO,
	UrlVO,
	UuidArrayVO,
} from "@caffeine/models/value-objects";
import { SlugVO } from "./value-objects/slug.value-object";

export class Post extends Entity implements IPost {
	public readonly postTypeId: string;
	private _name: DefinedStringVO;
	private _slug: SlugVO;
	private _description: DefinedStringVO;
	private _cover: UrlVO;
	private _tags: UuidArrayVO;

	public get name(): string {
		return this._name.value;
	}

	public get slug(): string {
		return this._slug.value;
	}

	public get description(): string {
		return this._description.value;
	}

	public get cover(): string {
		return this._cover.value;
	}

	public get tags(): string[] {
		return this._tags.value;
	}

	private constructor(
		{ postTypeId, cover, description, name, slug, tags }: BuildPostDTO,
		entityProps: EntityDTO,
	) {
		super(entityProps);

		this.postTypeId = postTypeId;

		this._cover = UrlVO.make({
			value: cover,
			name: "cover",
			layer: "post@post",
		});

		this._description = DefinedStringVO.make({
			value: description,
			name: "description",
			layer: "post@post",
		});

		this._name = DefinedStringVO.make({
			value: name,
			name: "name",
			layer: "post@post",
		});

		this._slug = SlugVO.make({
			value: slug,
			name: "slug",
			layer: "post@post",
		});

		this._tags = UuidArrayVO.make({
			value: tags,
			name: "tags",
			layer: "post@post",
		});
	}

	rename(value: string): void {
		this._name = DefinedStringVO.make({
			value: value,
			name: "name",
			layer: "post@post",
		});

		this._slug = SlugVO.make({
			value: slugify(value),
			name: "slug",
			layer: "post@post",
		});

		this.update();
	}

	updateDescription(value: string): void {
		this._description = DefinedStringVO.make({
			value: value,
			name: "description",
			layer: "post@post",
		});

		this.update();
	}

	updateCover(value: string): void {
		this._cover = UrlVO.make({
			value: value,
			name: "cover",
			layer: "post@post",
		});

		this.update();
	}

	updateTags(values: string[]): void {
		this._tags = UuidArrayVO.make({
			value: values,
			name: "tags",
			layer: "post@post",
		});

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
