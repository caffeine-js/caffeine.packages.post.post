import { describe, expect, it } from "vitest";
import { SlugVO } from "./slug.value-object";
import { InvalidPropertyException } from "@caffeine/errors/domain";

describe("SlugVO", () => {
	it("should create a valid slug from a string", () => {
		const slug = SlugVO.make({
			value: "My Title",
			name: "slug",
			layer: "domain",
		});
		expect(slug.value).toBe("my-title");
	});

	it("should keep an already valid slug", () => {
		const slug = SlugVO.make({
			value: "my-title",
			name: "slug",
			layer: "domain",
		});
		expect(slug.value).toBe("my-title");
	});

	it("should throw InvalidPropertyException for invalid value", () => {
		expect(() =>
			SlugVO.make({ value: "", name: "slug", layer: "domain" }),
		).toThrow(InvalidPropertyException);
	});
});
