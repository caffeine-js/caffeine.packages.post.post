import { t } from "@caffeine/models";
import { UuidDTO } from "@caffeine/models/dtos/primitives";

export const TypeAndPageObjectDTO = t.Object({
	type: t.Optional(
		t.String({
			...UuidDTO,
			description: "The UUID of the post type to filter by.",
			examples: ["123e4567-e89b-12d3-a456-426614174000"],
		}),
	),
	page: t.Optional(
		t.Number({
			description: "The page number to retrieve.",
			minimum: 1,
			default: 1,
			examples: [1],
		}),
	),
});

export type TypeAndPageObjectDTO = typeof TypeAndPageObjectDTO.static;
