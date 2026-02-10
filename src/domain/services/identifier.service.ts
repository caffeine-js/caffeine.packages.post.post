import { UuidSchema } from "@caffeine/models/schemas/primitives";

export const IdentifierService = {
	isUUID: (value: string): boolean => UuidSchema.match(value),
} as const;
