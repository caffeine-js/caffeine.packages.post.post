import { generateUUID } from "@caffeine/models/helpers";
import { IdentifierService } from "./identifier.service";
import { describe, it, expect } from "vitest";

describe("IdentifierService", () => {
	it("should return true for a valid UUID", () => {
		const validUuid = generateUUID();
		expect(IdentifierService.isUUID(validUuid)).toBe(true);
	});

	it("should return false for an invalid UUID", () => {
		const invalidUuid = "invalid-uuid";
		expect(IdentifierService.isUUID(invalidUuid)).toBe(false);
	});

	it("should return false for an empty string", () => {
		expect(IdentifierService.isUUID("")).toBe(false);
	});
});
