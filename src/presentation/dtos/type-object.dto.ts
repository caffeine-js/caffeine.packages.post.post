import { UuidDTO } from "@caffeine/models/dtos/primitives";
import { t } from "elysia";

export const TypeObjectDTO = t.Object({
	type: t.Optional(
		t.String({
			...UuidDTO,
			description: "The UUID of the post type.",
			examples: ["123e4567-e89b-12d3-a456-426614174000"],
		}),
	),
});

export type TypeObjectDTO = typeof TypeObjectDTO.static;
