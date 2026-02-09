import { UuidDTO } from "@caffeine/models/dtos/primitives";
import { Schema } from "@caffeine/models/schema";

export const IdentifierService = {
	isUUID: (value: string): boolean => Schema.make(UuidDTO).match(value),
} as const;
