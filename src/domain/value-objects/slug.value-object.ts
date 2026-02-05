import { InvalidPropertyException } from "@caffeine/errors/domain";
import { StringDTO } from "@caffeine/models/dtos/primitives";
import { slugify } from "@caffeine/models/helpers";
import { Schema } from "@caffeine/models/schema";
import type { IValueObjectMetadata } from "@caffeine/models/types";
import { DefinedStringVO } from "@caffeine/models/value-objects";

export class SlugVO extends DefinedStringVO {
	private constructor(value: string) {
		super(value);
	}

	public static override make(data: IValueObjectMetadata<string>): SlugVO {
		const value = slugify(data.value);

		if (!Schema.make(StringDTO).match(value))
			throw new InvalidPropertyException(data.name, data.layer);

		return new SlugVO(value);
	}
}
